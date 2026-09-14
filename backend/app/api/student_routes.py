"""
app/api/student_routes.py — Student-only endpoints.

GET  /api/v1/student/papers
GET  /api/v1/student/papers/{id}
GET  /api/v1/student/papers/{id}/status
GET  /api/v1/student/papers/{id}/analysis
GET  /api/v1/student/papers/{id}/questions
GET  /api/v1/student/papers/{id}/study-guide
GET  /api/v1/student/subjects
GET  /api/v1/student/historical/{academic_scope_id}
POST /api/v1/student/search
GET  /api/v1/student/questions/search
"""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from app.errors import NotFoundError, PaperNotFoundError, ValidationError
from app.repositories.academic_repository import AcademicRepository
from app.repositories.historical_repository import HistoricalRepository
from app.repositories.paper_repository import PaperRepository
from app.repositories.question_repository import QuestionRepository
from app.services.gemini_service import GeminiService
from app.services.historical_service import HistoricalService
from app.utils.decorators import any_role_required, student_required
from app.utils.pagination import get_pagination_params
from app.utils.response import paginated_response, success_response

student_bp = Blueprint("student", __name__)


@student_bp.route("/papers", methods=["GET"])
@any_role_required
def list_papers():
    """List all READY papers with optional filters."""
    page, page_size = get_pagination_params(request.args)
    args = request.args

    papers, total = PaperRepository.list_ready_papers(
        page=page,
        page_size=page_size,
        year=int(args["year"]) if args.get("year") and args["year"].isdigit() else None,
        subject_id=args.get("subject_id"),
        branch_id=args.get("branch_id"),
        semester_id=args.get("semester_id"),
        college=args.get("college"),
        university=args.get("university"),
        academic_scope_id=args.get("academic_scope_id"),
    )
    return paginated_response(
        items=[p.to_dict() for p in papers],
        page=page,
        page_size=page_size,
        total=total,
        data_key="papers",
    )


@student_bp.route("/papers/<paper_id>", methods=["GET"])
@any_role_required
def get_paper(paper_id: str):
    """Get a READY paper's full details including questions."""
    paper = PaperRepository.get_ready_paper_for_student(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    data = paper.to_dict()
    data["questions"] = [q.to_dict() for q in paper.questions]
    return success_response(data=data)


@student_bp.route("/papers/<paper_id>/status", methods=["GET"])
@any_role_required
def get_paper_status(paper_id: str):
    """Get processing status of a paper (polls until READY)."""
    paper = PaperRepository.get_by_id(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    return success_response(data=paper.to_status_dict())


@student_bp.route("/papers/<paper_id>/analysis", methods=["GET"])
@any_role_required
def get_paper_analysis(paper_id: str):
    """Get AI analysis for a READY paper."""
    paper = PaperRepository.get_by_id(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    from app.models.paper import PaperStatus
    if paper.status != PaperStatus.READY:
        raise NotFoundError("Paper is not yet ready for analysis.")
    analysis = PaperRepository.get_analysis(paper_id)
    if not analysis:
        raise NotFoundError("Analysis not yet available for this paper.")
    return success_response(data=analysis.to_dict())


@student_bp.route("/papers/<paper_id>/questions", methods=["GET"])
@any_role_required
def get_paper_questions(paper_id: str):
    """Get all extracted questions for a READY paper with optional filters."""
    paper = PaperRepository.get_by_id(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    from app.models.paper import PaperStatus
    if paper.status != PaperStatus.READY:
        raise NotFoundError("Paper is not yet ready.")

    questions = QuestionRepository.get_by_paper(paper_id)
    args = request.args
    if args.get("difficulty"):
        questions = [q for q in questions if q.difficulty == args["difficulty"].upper()]
    if args.get("question_type"):
        questions = [q for q in questions if q.question_type == args["question_type"].upper()]
    if args.get("unit"):
        questions = [q for q in questions if q.unit == args.get("unit")]

    return success_response(
        data={
            "paper_id": paper_id,
            "questions": [q.to_dict() for q in questions],
            "total": len(questions),
        }
    )


@student_bp.route("/papers/<paper_id>/study-guide", methods=["GET"])
@any_role_required
def get_study_guide(paper_id: str):
    """
    Get a study guide for a paper:
    - From analysis if available (grounded)
    - Gemini fallback with appropriate disclaimers if not
    """
    paper = PaperRepository.get_by_id(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    from app.models.paper import PaperStatus
    if paper.status != PaperStatus.READY:
        raise NotFoundError("Paper is not yet ready.")

    analysis = PaperRepository.get_analysis(paper_id)
    scope_id = paper.academic_scope_id
    historical_data = None
    if scope_id:
        historical_svc = HistoricalService()
        historical_data = historical_svc.get_subject_intelligence(scope_id)

    return success_response(
        data={
            "paper_id": paper_id,
            "analysis": analysis.to_dict() if analysis else None,
            "historical": historical_data,
            "study_recommendations": (
                analysis.study_recommendations if analysis else []
            ),
            "potential_questions": (
                analysis.potential_questions if analysis else []
            ),
        }
    )


@student_bp.route("/subjects", methods=["GET"])
@any_role_required
def list_subjects():
    """List all subjects with optional university filter."""
    university = request.args.get("university")
    subjects = AcademicRepository.list_subjects(university=university)
    return success_response(
        data={"subjects": [s.to_dict() for s in subjects]}
    )


@student_bp.route("/historical/<academic_scope_id>", methods=["GET"])
@any_role_required
def get_historical(academic_scope_id: str):
    """
    Get historical intelligence for an academic scope.
    Returns data if >=2 papers analyzed, fallback guidance otherwise.
    """
    scope = AcademicRepository.get_scope_by_id(academic_scope_id)
    if not scope:
        raise NotFoundError("Academic scope not found.")

    historical_svc = HistoricalService()
    result = historical_svc.get_subject_intelligence(academic_scope_id)

    if not result.get("available", False):
        # Provide fallback with appropriate disclaimers
        gemini = GeminiService.get_instance()
        fallback = historical_svc.get_fallback_study_intelligence(
            branch=scope.branch.name if scope.branch else "Unknown",
            semester=scope.semester.name if scope.semester else "Unknown",
            subject=scope.subject.name if scope.subject else "Unknown",
            year=2024,
            gemini_svc=gemini,
        )
        return success_response(
            data={
                "available": False,
                "fallback": fallback,
                "message": result.get("message"),
            }
        )

    return success_response(data=result)


@student_bp.route("/questions/search", methods=["GET"])
@any_role_required
def search_questions():
    """Search for questions across all READY papers."""
    page, page_size = get_pagination_params(request.args)
    args = request.args

    marks = None
    if args.get("marks"):
        try:
            marks = float(args["marks"])
        except ValueError:
            pass

    year = None
    if args.get("year"):
        try:
            year = int(args["year"])
        except ValueError:
            pass

    questions, total = QuestionRepository.search(
        query=args.get("q", "").strip(),
        subject_id=args.get("subject_id"),
        branch_id=args.get("branch_id"),
        semester_id=args.get("semester_id"),
        difficulty=args.get("difficulty"),
        question_type=args.get("question_type"),
        marks=marks,
        year=year,
        page=page,
        page_size=page_size,
    )
    return paginated_response(
        items=[q.to_dict() for q in questions],
        page=page,
        page_size=page_size,
        total=total,
        data_key="questions",
    )


@student_bp.route("/papers/<paper_id>/file", methods=["GET"])
def get_paper_file(paper_id: str):
    """Serve the raw PDF file for a paper."""
    import os
    from flask import send_file
    paper = PaperRepository.get_by_id(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    if not os.path.exists(paper.file_path):
        raise NotFoundError("Physical PDF file not found on server.")
    return send_file(
        paper.file_path,
        mimetype="application/pdf",
        as_attachment=False,
        download_name=paper.original_filename,
    )


@student_bp.route("/papers/<paper_id>/flashcards", methods=["GET"])
@any_role_required
def get_paper_flashcards(paper_id: str):
    """Generate active recall flashcards for a specific question paper."""
    paper = PaperRepository.get_ready_paper_for_student(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    count = int(request.args.get("count", 10))
    from app.services.study_tools_service import StudyToolsService
    svc = StudyToolsService()
    result = svc.generate_paper_flashcards(paper=paper, count=count)
    return success_response(data=result)


@student_bp.route("/papers/<paper_id>/quiz", methods=["GET"])
@any_role_required
def get_paper_quiz(paper_id: str):
    """Generate practice quiz questions for a specific question paper."""
    paper = PaperRepository.get_ready_paper_for_student(paper_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    count = int(request.args.get("count", 10))
    from app.services.study_tools_service import StudyToolsService
    svc = StudyToolsService()
    result = svc.generate_paper_quiz(paper=paper, count=count)
    return success_response(data=result)


@student_bp.route("/subjects/<subject_id>/flashcards", methods=["GET"])
@any_role_required
def get_subject_flashcards(subject_id: str):
    """Generate active recall flashcards across a subject curriculum."""
    subject = AcademicRepository.get_subject_by_id(subject_id)
    if not subject:
        raise NotFoundError("Subject not found.")
    count = int(request.args.get("count", 10))
    from app.services.study_tools_service import StudyToolsService
    svc = StudyToolsService()
    result = svc.generate_subject_flashcards(subject=subject, count=count)
    return success_response(data=result)


@student_bp.route("/subjects/<subject_id>/quiz", methods=["GET"])
@any_role_required
def get_subject_quiz(subject_id: str):
    """Generate practice quiz questions across a subject curriculum."""
    subject = AcademicRepository.get_subject_by_id(subject_id)
    if not subject:
        raise NotFoundError("Subject not found.")
    count = int(request.args.get("count", 10))
    from app.services.study_tools_service import StudyToolsService
    svc = StudyToolsService()
    result = svc.generate_subject_quiz(subject=subject, count=count)
    return success_response(data=result)


