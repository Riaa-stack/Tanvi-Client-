"""Search API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.search_service import SearchService
from app.utils.responses import success_response, error_response
from app.middlewares.rate_limiter import limiter

bp = Blueprint("search", __name__, url_prefix="/api/v1/search")
search_service = SearchService()

@bp.route("", methods=["GET"])
@jwt_required()
@limiter.limit("50 per minute")
def search():
    query = request.args.get("q")
    if not query:
        return error_response("Query parameter 'q' is required")
    
    subject_id = request.args.get("subject_id")
    search_type = request.args.get("type", "semantic")
    top_k = request.args.get("top_k", 20, type=int)
    user_id = get_jwt_identity()

    result = search_service.search(query, subject_id, search_type, top_k, user_id)
    return success_response(result)
