"""
Embedding Client — Singleton wrapper around sentence-transformers all-MiniLM-L6-v2.
Loaded once at process startup. Thread-safe for read operations.
"""
import logging
import time
from typing import List

import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingClient:
    _instance: "EmbeddingClient" = None
    _model = None

    @classmethod
    def get_instance(cls) -> "EmbeddingClient":
        if cls._instance is None:
            cls._instance = EmbeddingClient()
            t0 = time.time()
            logger.info("Loading sentence-transformer model all-MiniLM-L6-v2 ...")
            from sentence_transformers import SentenceTransformer
            cls._instance._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info(f"Embedding model loaded in {(time.time() - t0):.2f}s")
        return cls._instance

    def encode(self, texts: List[str], batch_size: int = 64) -> np.ndarray:
        """Encode a list of texts. Returns L2-normalised 384-dim float32 ndarray."""
        t0 = time.time()
        embeddings = self._model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        elapsed = time.time() - t0
        throughput = len(texts) / elapsed if elapsed > 0 else 0
        logger.debug(f"Encoded {len(texts)} texts in {elapsed:.3f}s ({throughput:.1f} texts/s)")
        return embeddings

    def encode_single(self, text: str) -> List[float]:
        """Encode one text, return as Python list for JSON/Chroma compatibility."""
        return self.encode([text])[0].tolist()
