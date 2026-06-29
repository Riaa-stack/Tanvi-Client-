"""Question API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.question_service import QuestionService
from app.utils.responses import success_response, error_response

bp = Blueprint("questions", __name__, url_prefix="/api/v1/questions")
question_service = QuestionService()

@bp.route("/paper/<paper_id>", methods=["GET"])
@jwt_required()
def get_questions(paper_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    result = question_service.get_questions(paper_id, page=page, per_page=per_page)
    return success_response(result)

@bp.route("/<question_id>", methods=["GET"])
@jwt_required()
def get_question(question_id):
    result = question_service.get_question(question_id)
    if not result:
        return error_response("Question not found", 404)
    return success_response(result)

@bp.route("/<question_id>/bookmark", methods=["POST"])
@jwt_required()
def toggle_bookmark(question_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    result = question_service.bookmark(user_id, "question", question_id, note=data.get("note"))
    return success_response(result)
