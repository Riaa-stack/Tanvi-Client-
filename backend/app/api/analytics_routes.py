"""Analytics API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt
from app.services.analytics_service import AnalyticsService
from app.utils.responses import success_response, error_response
from app.constants import UserRole

bp = Blueprint("analytics", __name__, url_prefix="/api/v1/analytics")
analytics_service = AnalyticsService()

@bp.route("/subjects/<subject_id>/weightage", methods=["GET"])
@jwt_required()
def get_weightage(subject_id):
    return success_response(analytics_service.get_unit_weightage(subject_id))

@bp.route("/subjects/<subject_id>/trends", methods=["GET"])
@jwt_required()
def get_trends(subject_id):
    years = request.args.get("years", 5, type=int)
    return success_response(analytics_service.get_exam_trends(subject_id, years))

@bp.route("/subjects/<subject_id>/predictions", methods=["GET"])
@jwt_required()
def get_predictions(subject_id):
    return success_response(analytics_service.get_probability_scores(subject_id))

@bp.route("/subjects/<subject_id>/difficulty", methods=["GET"])
@jwt_required()
def get_difficulty(subject_id):
    return success_response(analytics_service.get_difficulty_distribution(subject_id))

@bp.route("/subjects/<subject_id>/clusters", methods=["GET"])
@jwt_required()
def get_clusters(subject_id):
    return success_response(analytics_service.get_clusters(subject_id))

@bp.route("/admin/dashboard", methods=["GET"])
@jwt_required()
def get_admin_dashboard():
    if get_jwt().get("role") != UserRole.ADMIN.value:
        return error_response("Admin access required", 403)
    return success_response(analytics_service.get_admin_dashboard())
