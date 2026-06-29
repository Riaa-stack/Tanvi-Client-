"""Syllabus API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt
from app.services.syllabus_service import SyllabusService
from app.utils.responses import success_response, error_response
from app.constants import UserRole

bp = Blueprint("syllabus", __name__, url_prefix="/api/v1/syllabus")
syllabus_service = SyllabusService()

def require_admin():
    if get_jwt().get("role") != UserRole.ADMIN.value:
        raise ValueError("Admin access required")

# -- Semesters --
@bp.route("/semesters", methods=["GET"])
def get_semesters():
    return success_response(syllabus_service.get_semesters())

@bp.route("/semesters", methods=["POST"])
@jwt_required()
def create_semester():
    try:
        require_admin()
        data = request.get_json()
        return success_response(syllabus_service.create_semester(data["name"], data["number"], data.get("academic_year")), status_code=201)
    except Exception as e:
        return error_response(str(e))

# -- Subjects --
@bp.route("/subjects", methods=["GET"])
def get_subjects():
    sem_id = request.args.get("semester_id")
    return success_response(syllabus_service.get_subjects(sem_id))

@bp.route("/subjects", methods=["POST"])
@jwt_required()
def create_subject():
    try:
        require_admin()
        data = request.get_json()
        return success_response(syllabus_service.create_subject(data["name"], data["code"], data.get("semester_id"), data.get("description")), status_code=201)
    except Exception as e:
        return error_response(str(e))

# -- Units --
@bp.route("/subjects/<subject_id>/units", methods=["GET"])
def get_units(subject_id):
    return success_response(syllabus_service.get_units(subject_id))

# -- Topics --
@bp.route("/units/<unit_id>/topics", methods=["GET"])
def get_topics(unit_id):
    return success_response(syllabus_service.get_topics(unit_id))
