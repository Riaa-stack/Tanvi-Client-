"""
app/api/chat_routes.py — RAG-powered AI chat endpoints.

POST /api/v1/chat/sessions
GET  /api/v1/chat/sessions
GET  /api/v1/chat/sessions/{id}
POST /api/v1/chat/sessions/{id}/messages
POST /api/v1/chat/ask
"""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from app.errors import ValidationError
from app.services.chat_service import ChatService
from app.services.embedding_service import EmbeddingService
from app.services.gemini_service import GeminiService
from app.services.rag_service import RAGDecisionService, RAGService
from app.services.vector_store_service import VectorStoreService
from app.utils.decorators import any_role_required
from app.utils.pagination import get_pagination_params
from app.utils.response import created_response, success_response

chat_bp = Blueprint("chat", __name__)


def _get_chat_service() -> ChatService:
    """Create RAGService and ChatService instances per request."""
    gemini = GeminiService.get_instance()
    embedding = EmbeddingService()
    vector = VectorStoreService()
    rag = RAGService(embedding_svc=embedding, vector_svc=vector, gemini_svc=gemini)
    return ChatService(rag_service=rag)


@chat_bp.route("/sessions", methods=["POST"])
@any_role_required
def create_session():
    """Create a new chat session with optional scope context."""
    user_id = get_jwt_identity()
    body = request.get_json() or {}

    svc = _get_chat_service()
    session = svc.create_session(
        user_id=user_id,
        title=body.get("title"),
        paper_id=body.get("paper_id"),
        subject_id=body.get("subject_id"),
        academic_scope_id=body.get("academic_scope_id"),
    )
    return created_response(data=session, message="Chat session created.")


@chat_bp.route("/sessions", methods=["GET"])
@any_role_required
def list_sessions():
    """List all chat sessions for the current user."""
    user_id = get_jwt_identity()
    page, page_size = get_pagination_params(request.args)
    svc = _get_chat_service()
    result = svc.list_sessions(user_id=user_id, page=page, page_size=page_size)
    return success_response(data=result)


@chat_bp.route("/sessions/<session_id>", methods=["GET"])
@any_role_required
def get_session(session_id: str):
    """Get a chat session with full message history."""
    user_id = get_jwt_identity()
    svc = _get_chat_service()
    session = svc.get_session(session_id=session_id, user_id=user_id)
    return success_response(data=session)


@chat_bp.route("/sessions/<session_id>/messages", methods=["POST"])
@any_role_required
def send_message(session_id: str):
    """
    Send a message in a chat session.
    Response is grounded using RAG pipeline.
    """
    user_id = get_jwt_identity()
    body = request.get_json() or {}
    content = body.get("content", "").strip()

    if not content:
        raise ValidationError("Message content cannot be empty.")
    if len(content) > 5000:
        raise ValidationError("Message too long. Maximum 5000 characters.")

    svc = _get_chat_service()
    result = svc.send_message(
        session_id=session_id,
        user_id=user_id,
        content=content,
    )
    return success_response(data=result)


@chat_bp.route("/ask", methods=["POST"])
@any_role_required
def ask():
    """
    One-shot RAG question without a persistent session.
    Useful for quick queries without chat history.
    """
    body = request.get_json() or {}
    question = body.get("question", "").strip()

    if not question:
        raise ValidationError("Question cannot be empty.")
    if len(question) > 2000:
        raise ValidationError("Question too long. Maximum 2000 characters.")

    scope = {}
    nested_scope = body.get("scope") if isinstance(body.get("scope"), dict) else {}
    for key in ["paper_id", "subject_id", "branch_id", "semester_id", "academic_scope_id", "year"]:
        if body.get(key) is not None:
            scope[key] = body[key]
        elif nested_scope.get(key) is not None:
            scope[key] = nested_scope[key]

    gemini = GeminiService.get_instance()
    embedding = EmbeddingService()
    vector = VectorStoreService()
    rag = RAGService(embedding_svc=embedding, vector_svc=vector, gemini_svc=gemini)

    result = rag.query(
        question=question,
        scope=scope if scope else None,
    )
    return success_response(data=result)
