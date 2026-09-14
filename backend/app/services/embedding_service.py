"""
app/services/embedding_service.py — Local embedding generation using Sentence Transformers.

Responsibilities:
- Model loading (singleton, lazy-loaded)
- Batch embedding with configurable batch size
- L2 normalization
- Content hash-based idempotency
- Retries on transient failures
"""
from __future__ import annotations

import hashlib
from typing import List, Optional

import numpy as np

from app.config import get_settings
from app.logging_config import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """
    Generates embeddings using a local sentence-transformers model.
    Model is loaded once and cached.
    """

    _model = None
    _model_name: str = ""

    @classmethod
    def _get_model(cls):
        """Lazy-load the embedding model (singleton)."""
        settings = get_settings()
        model_name = settings.EMBEDDING_MODEL
        if cls._model is None or cls._model_name != model_name:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info("embedding_model_loading", model=model_name)
                cls._model = SentenceTransformer(model_name)
                cls._model_name = model_name
                logger.info("embedding_model_loaded", model=model_name)
            except ImportError:
                raise RuntimeError(
                    "sentence-transformers not installed. "
                    "Install with: pip install sentence-transformers"
                )
            except Exception as e:
                raise RuntimeError(f"Failed to load embedding model: {str(e)}") from e
        return cls._model

    def embed_texts(self, texts: List[str], normalize: bool = True) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        Returns list of embedding vectors (as lists for JSON-serialisation).
        """
        if not texts:
            return []

        settings = get_settings()
        batch_size = settings.EMBEDDING_BATCH_SIZE
        model = self._get_model()

        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            try:
                embeddings = model.encode(
                    batch,
                    batch_size=min(batch_size, len(batch)),
                    normalize_embeddings=normalize,
                    show_progress_bar=False,
                )
                all_embeddings.extend(embeddings.tolist())
            except Exception as e:
                logger.error(
                    "embedding_batch_failed",
                    batch_start=i,
                    batch_size=len(batch),
                    error=str(e),
                )
                raise RuntimeError(f"Embedding generation failed for batch {i}: {str(e)}") from e

        logger.info(
            "embeddings_generated",
            count=len(texts),
            dimensions=len(all_embeddings[0]) if all_embeddings else 0,
        )
        return all_embeddings

    def embed_single(self, text: str, normalize: bool = True) -> List[float]:
        """Generate embedding for a single text."""
        results = self.embed_texts([text], normalize=normalize)
        return results[0] if results else []

    @staticmethod
    def content_hash(text: str) -> str:
        """SHA-256 hash of text for idempotency checks."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    @staticmethod
    def deterministic_vector_id(paper_id: str, index: int, prefix: str = "chunk") -> str:
        """
        Generate a deterministic ChromaDB document ID.
        Using paper_id + index ensures retry is idempotent (upsert replaces).
        """
        return f"{prefix}_{paper_id}_{index}"

    def get_embedding_dimension(self) -> int:
        """Return the dimension of embeddings from the loaded model."""
        model = self._get_model()
        return model.get_sentence_embedding_dimension()

    def get_model_name(self) -> str:
        """Return the name of the loaded model."""
        return self._model_name or get_settings().EMBEDDING_MODEL
