"""Chat API Routes."""
import json
from flask import Blueprint, request, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.ai.rag_engine import RAGEngine
from app.utils.responses import success_response, error_response
from app.middlewares.rate_limiter import limiter

bp = Blueprint("chat", __name__, url_prefix="/api/v1/chat")
rag_engine = RAGEngine()

@bp.route("", methods=["POST"])
@jwt_required()
@limiter.limit("20 per minute")
def chat():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    message = data.get("message")
    subject_id = data.get("subject_id")
    session_id = data.get("session_id", "default")

    if not message:
        return error_response("Message is required")

    result = rag_engine.chat(message, subject_id, session_id, user_id)
    return success_response(result)

@bp.route("/stream", methods=["POST"])
@jwt_required()
@limiter.limit("20 per minute")
def chat_stream():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    message = data.get("message")
    subject_id = data.get("subject_id")
    session_id = data.get("session_id", "default")

    if not message:
        return error_response("Message is required")

    def generate():
        for token in rag_engine.chat_stream(message, subject_id, session_id, user_id):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")

@bp.route("/session/<session_id>", methods=["DELETE"])
@jwt_required()
def clear_session(session_id):
    rag_engine.clear_session(session_id)
    return success_response(None, "Session cleared")
