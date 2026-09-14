"""
app/api/rag_routes.py — Direct RAG query endpoints.

POST /api/v1/rag/query — RAG search against paper corpus
"""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from app.errors import ValidationError
from app.services.embedding_service import EmbeddingService
from app.services.gemini_service import GeminiService
from app.services.rag_service import RAGService
from app.services.vector_store_service import VectorStoreService
from app.utils.decorators import any_role_required
from app.utils.response import success_response

rag_bp = Blueprint("rag", __name__)


@rag_bp.route("/query", methods=["POST"])
@any_role_required
def rag_query():
    """
    Execute a RAG query against the processed paper corpus.
    Returns a grounded answer with source citations.
    """
    body = request.get_json() or {}
    question = body.get("question", "").strip()

    if not question:
        raise ValidationError("Question cannot be empty.")
    if len(question) > 2000:
        raise ValidationError("Question too long. Maximum 2000 characters.")

    # Optional scope filters (supports both top-level fields and nested 'scope' dict)
    scope = {}
    nested_scope = body.get("scope") if isinstance(body.get("scope"), dict) else {}
    for key in ["paper_id", "subject_id", "branch_id", "semester_id", "academic_scope_id", "year"]:
        if body.get(key) is not None:
            scope[key] = body[key]
        elif nested_scope.get(key) is not None:
            scope[key] = nested_scope[key]

    n_results = min(int(body.get("n_results", 10)), 20)

    gemini = GeminiService.get_instance()
    embedding = EmbeddingService()
    vector = VectorStoreService()
    rag = RAGService(embedding_svc=embedding, vector_svc=vector, gemini_svc=gemini)

    result = rag.query(
        question=question,
        scope=scope if scope else None,
        n_results=n_results,
    )
    return success_response(data=result)
