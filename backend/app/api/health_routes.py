"""
app/api/health_routes.py — System health check endpoints.

GET /api/v1/health         — Basic liveness check
GET /api/v1/health/detailed — Full system component health
"""
from __future__ import annotations

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("", methods=["GET"])
def health():
    """Simple liveness check."""
    return jsonify({"status": "ok", "service": "EduArchive AI"}), 200


@health_bp.route("/detailed", methods=["GET"])
def health_detailed():
    """
    Check the health of all system components:
    - Database (PostgreSQL)
    - Vector store (ChromaDB)
    - Gemini API
    - Embedding model
    """
    from app.extensions import db

    results = {}

    # Database
    try:
        db.session.execute(db.text("SELECT 1"))
        results["database"] = {"status": "healthy"}
    except Exception as e:
        results["database"] = {"status": "unhealthy", "error": str(e)}

    # Vector store
    try:
        from app.services.vector_store_service import VectorStoreService
        vs = VectorStoreService()
        results["vector_store"] = vs.health_check()
    except Exception as e:
        results["vector_store"] = {"status": "unhealthy", "error": str(e)}

    # Gemini
    try:
        from app.services.gemini_service import GeminiService
        gemini = GeminiService.get_instance()
        available = gemini.is_available()
        results["gemini"] = {"status": "healthy" if available else "degraded"}
    except Exception as e:
        results["gemini"] = {"status": "unhealthy", "error": str(e)}

    # Embedding model
    try:
        from app.services.embedding_service import EmbeddingService
        emb = EmbeddingService()
        dim = emb.get_embedding_dimension()
        results["embedding"] = {
            "status": "healthy",
            "model": emb.get_model_name(),
            "dimensions": dim,
        }
    except Exception as e:
        results["embedding"] = {"status": "unhealthy", "error": str(e)}

    overall = "healthy"
    if any(r.get("status") == "unhealthy" for r in results.values()):
        overall = "unhealthy"
    elif any(r.get("status") == "degraded" for r in results.values()):
        overall = "degraded"

    status_code = 200 if overall == "healthy" else 503
    return jsonify({"status": overall, "components": results}), status_code
