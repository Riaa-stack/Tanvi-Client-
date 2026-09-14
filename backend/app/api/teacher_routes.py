"""
app/api/teacher_routes.py — Teacher-only endpoints.

POST   /api/v1/teacher/papers
GET    /api/v1/teacher/papers
GET    /api/v1/teacher/papers/{id}
GET    /api/v1/teacher/papers/{id}/analysis
DELETE /api/v1/teacher/papers/{id}
POST   /api/v1/teacher/papers/{id}/retry-processing
GET    /api/v1/teacher/dashboard
"""
from __future__ import annotations

from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt_identity

from app.errors import PaperNotFoundError, ValidationError
from app.extensions import db
from app.models.paper import Paper, PaperStatus
from app.repositories.academic_repository import AcademicRepository
from app.repositories.paper_repository import PaperRepository
from app.services.paper_processing_service import PaperProcessingService
from app.services.storage_service import StorageService
from app.utils.decorators import teacher_required
from app.utils.pagination import get_pagination_params
from app.utils.response import created_response, paginated_response, success_response

teacher_bp = Blueprint("teacher", __name__)
_storage = StorageService()

CURRENT_YEAR_MIN = 2000
CURRENT_YEAR_MAX = 2030
VALID_SEMESTER_NUMBERS = list(range(1, 9))  # 1–8


@teacher_bp.route("/papers", methods=["POST"])
@teacher_required
def upload_paper():
    """
    Upload a new question paper PDF with metadata.
    Validates file and metadata, stores securely, and initiates processing.
    """
    teacher_id = get_jwt_identity()

    # ── File validation ───────────────────────────────────────────────────────
    if "file" not in request.files:
        raise ValidationError("No file provided. Include 'file' in multipart form.")

    file = request.files["file"]
    if not file.filename:
        raise ValidationError("File has no filename.")

    original_filename = file.filename
    content_length = request.content_length

    _storage.validate_file(file.stream, original_filename, content_length)
    file.stream.seek(0)  # Reset after validation

    # ── Metadata validation ───────────────────────────────────────────────────
    form = request.form

    required_fields = ["title", "year", "semester", "subject", "branch", "college", "university"]
    missing = [f for f in required_fields if not form.get(f)]
    if missing:
        raise ValidationError(f"Missing required fields: {', '.join(missing)}")

    title = form["title"].strip()
    if not title:
        raise ValidationError("Title cannot be empty.")

    try:
        year = int(form["year"])
        if not (CURRENT_YEAR_MIN <= year <= CURRENT_YEAR_MAX):
            raise ValidationError(f"Year must be between {CURRENT_YEAR_MIN} and {CURRENT_YEAR_MAX}.")
    except ValueError:
        raise ValidationError("Year must be a valid integer.")

    try:
        semester_number = int(form["semester"])
        if semester_number not in VALID_SEMESTER_NUMBERS:
            raise ValidationError(f"Semester must be between 1 and 8.")
    except ValueError:
        raise ValidationError("Semester must be a valid integer.")

    subject_name = form["subject"].strip()
    branch_name = form["branch"].strip()
    college = form["college"].strip()
    university = form["university"].strip()

    if not all([subject_name, branch_name, college, university]):
        raise ValidationError("Subject, branch, college, and university cannot be empty.")

    # ── Store file ────────────────────────────────────────────────────────────
    stored_filename, file_path, file_size, checksum = _storage.store_paper(
        file.stream, original_filename
    )

    # ── Duplicate check ───────────────────────────────────────────────────────
    existing = PaperRepository.get_by_checksum(checksum)
    if existing and existing.status == PaperStatus.READY:
        # Clean up the just-stored duplicate
        _storage.delete_paper(stored_filename)
        raise ValidationError(
            "A paper with identical content already exists in the system.",
            error_code="CONFLICT",
        )

    # ── Create academic scope ─────────────────────────────────────────────────
    subject = AcademicRepository.get_or_create_subject(subject_name, university)
    branch = AcademicRepository.get_or_create_branch(branch_name)
    semester = AcademicRepository.get_or_create_semester(semester_number)
    scope = AcademicRepository.get_or_create_scope(university, college, branch, semester, subject)

    # ── Create Paper record ───────────────────────────────────────────────────
    paper = Paper(
        teacher_id=teacher_id,
        title=title,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type="application/pdf",
        checksum=checksum,
        year=year,
        semester_id=semester.id,
        branch_id=branch.id,
        subject_id=subject.id,
        academic_scope_id=scope.id,
        status=PaperStatus.UPLOADED,
        processing_progress=0,
        processing_message="Uploaded. Queued for processing.",
    )
    db.session.add(paper)
    db.session.commit()

    # ── Start async processing ────────────────────────────────────────────────
    processing_svc = PaperProcessingService(current_app._get_current_object())
    processing_svc.process_async(paper.id)

    return created_response(
        data={
            "paper_id": paper.id,
            "status": paper.status,
            "processing_progress": paper.processing_progress,
            "message": "Paper uploaded and processing initiated.",
        },
        message="Paper uploaded successfully.",
    )


@teacher_bp.route("/papers", methods=["GET"])
@teacher_required
def list_papers():
    """List all papers uploaded by this teacher."""
    teacher_id = get_jwt_identity()
    page, page_size = get_pagination_params(request.args)
    papers, total = PaperRepository.list_teacher_papers(
        teacher_id=teacher_id, page=page, page_size=page_size
    )
    return paginated_response(
        items=[p.to_dict(include_internal=True) for p in papers],
        page=page,
        page_size=page_size,
        total=total,
        data_key="papers",
    )


@teacher_bp.route("/papers/<paper_id>", methods=["GET"])
@teacher_required
def get_paper(paper_id: str):
    """Get details of a specific paper owned by this teacher."""
    teacher_id = get_jwt_identity()
    paper = PaperRepository.get_by_id_and_teacher(paper_id, teacher_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    return success_response(data=paper.to_dict(include_internal=True))


@teacher_bp.route("/papers/<paper_id>/analysis", methods=["GET"])
@teacher_required
def get_paper_analysis(paper_id: str):
    """Get AI analysis for a paper."""
    teacher_id = get_jwt_identity()
    paper = PaperRepository.get_by_id_and_teacher(paper_id, teacher_id)
    if not paper:
        raise PaperNotFoundError(paper_id)
    analysis = PaperRepository.get_analysis(paper_id)
    if not analysis:
        from app.errors import NotFoundError
        raise NotFoundError("Analysis not yet available for this paper.")
    return success_response(data=analysis.to_dict())


@teacher_bp.route("/papers/<paper_id>", methods=["DELETE"])
@teacher_required
def delete_paper(paper_id: str):
    """Delete a paper and all associated data."""
    teacher_id = get_jwt_identity()
    paper = PaperRepository.get_by_id_and_teacher(paper_id, teacher_id)
    if not paper:
        raise PaperNotFoundError(paper_id)

    # 1. Delete vectors
    from app.services.vector_store_service import VectorStoreService
    vector_svc = VectorStoreService()
    try:
        vector_svc.delete_paper_vectors(paper_id)
    except Exception as e:
        from app.logging_config import get_logger
        get_logger(__name__).warning("vector_delete_on_paper_delete_failed", error=str(e))

    # 2. Delete physical file
    stored_filename = paper.stored_filename
    _storage.delete_paper(stored_filename)

    # 3. Delete DB records (cascade deletes questions, analysis, etc.)
    PaperRepository.delete(paper)
    db.session.commit()

    return success_response(message="Paper deleted successfully.")


@teacher_bp.route("/papers/<paper_id>/retry-processing", methods=["POST"])
@teacher_required
def retry_processing(paper_id: str):
    """Retry processing a FAILED paper."""
    teacher_id = get_jwt_identity()
    paper = PaperRepository.get_by_id_and_teacher(paper_id, teacher_id)
    if not paper:
        raise PaperNotFoundError(paper_id)

    processing_svc = PaperProcessingService(current_app._get_current_object())
    processing_svc.retry_processing(paper_id=paper_id, user_id=teacher_id)
    return success_response(
        data={"paper_id": paper_id, "status": "QUEUED"},
        message="Processing retry initiated.",
    )


@teacher_bp.route("/dashboard", methods=["GET"])
@teacher_required
def dashboard():
    """Teacher dashboard statistics."""
    teacher_id = get_jwt_identity()
    stats = PaperRepository.teacher_stats(teacher_id)

    # Recent uploads
    recent_papers, _ = PaperRepository.list_teacher_papers(
        teacher_id=teacher_id, page=1, page_size=5
    )
    return success_response(
        data={
            "statistics": stats,
            "recent_papers": [p.to_dict(include_internal=False) for p in recent_papers],
        }
    )
