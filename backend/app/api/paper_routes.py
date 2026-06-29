"""Paper API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.paper_service import PaperService
from app.utils.responses import success_response, error_response
from app.constants import UserRole

bp = Blueprint("papers", __name__, url_prefix="/api/v1/papers")
paper_service = PaperService()

def require_admin():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        raise ValueError("Admin access required")

@bp.route("", methods=["POST"])
@jwt_required()
def upload_paper():
    try:
        require_admin()
        if "file" not in request.files:
            return error_response("No file provided")
        
        file = request.files["file"]
        if file.filename == "":
            return error_response("No file selected")
        
        data = request.form
        result = paper_service.upload_paper(
            file_bytes=file.read(),
            filename=file.filename,
            subject_id=data.get("subject_id"),
            exam_year=int(data.get("exam_year", 0)),
            exam_type=data.get("exam_type", "ESE"),
            total_marks=int(data.get("total_marks")) if data.get("total_marks") else None,
            duration_minutes=int(data.get("duration_minutes")) if data.get("duration_minutes") else None,
            exam_month=data.get("exam_month"),
            uploaded_by=get_jwt_identity()
        )
        return success_response(result, "Paper uploaded and queued", 202)
    except Exception as e:
        return error_response(str(e))

@bp.route("/<subject_id>", methods=["GET"])
@jwt_required()
def get_papers(subject_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    result = paper_service.get_papers(subject_id, page=page, per_page=per_page)
    return success_response(result)

@bp.route("/detail/<paper_id>", methods=["GET"])
@jwt_required()
def get_paper(paper_id):
    result = paper_service.get_paper(paper_id)
    if not result:
        return error_response("Paper not found", 404)
    return success_response(result)

@bp.route("/jobs/<job_id>", methods=["GET"])
@jwt_required()
def get_job_status(job_id):
    result = paper_service.get_job_status(job_id)
    if not result:
        return error_response("Job not found", 404)
    return success_response(result)
