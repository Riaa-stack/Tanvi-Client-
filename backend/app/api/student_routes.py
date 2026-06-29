"""Student Activity & Recommendation API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.student_service import StudentService
from app.services.recommendation_service import RecommendationService
from app.utils.responses import success_response, error_response

bp = Blueprint("student", __name__, url_prefix="/api/v1/student")
student_service = StudentService()
rec_service = RecommendationService()

@bp.route("/activity", methods=["POST"])
@jwt_required()
def log_activity():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    student_service.log_activity(
        user_id=user_id,
        activity_type=data.get("activity_type"),
        entity_type=data.get("entity_type"),
        entity_id=data.get("entity_id"),
        metadata=data.get("metadata")
    )
    return success_response(None, "Activity logged")

@bp.route("/activity", methods=["GET"])
@jwt_required()
def get_activity():
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 20, type=int)
    return success_response(student_service.get_recent_activity(user_id, limit))

@bp.route("/recommendations", methods=["GET"])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    return success_response(rec_service.get_recommendations(user_id))

@bp.route("/recommendations/<rec_id>/dismiss", methods=["POST"])
@jwt_required()
def dismiss_recommendation(rec_id):
    user_id = get_jwt_identity()
    if rec_service.dismiss_recommendation(rec_id, user_id):
        return success_response(None, "Recommendation dismissed")
    return error_response("Recommendation not found", 404)
