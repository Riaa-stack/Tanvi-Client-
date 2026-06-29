"""
ChromaDB HTTP Client Wrapper — Singleton with retry and one collection per subject.
Collection naming: questions_{subject_code_lowercase}
"""
import logging
import time
from typing import List, Optional, Dict, Any

import chromadb

logger = logging.getLogger(__name__)

# Metadata schema for every stored question document
CHROMA_METADATA_SCHEMA = {
    "question_id": str,
    "paper_id": str,
    "subject_id": str,
    "subject_code": str,
    "unit_id": str,       # "" if NULL
    "topic_id": str,      # "" if NULL
    "exam_year": int,
    "difficulty": str,    # "" if NULL
    "marks": float,
    "is_repeated": bool,
    "question_type": str, # "" if NULL
}


class ChromaClientWrapper:
    _instance: "ChromaClientWrapper" = None
    _client: chromadb.HttpClient = None

    def __init__(self, host: str = "localhost", port: int = 8000):
        self._host = host
        self._port = port
        self._client = self._connect()

    @classmethod
    def get_instance(cls, host: str = "localhost", port: int = 8000) -> "ChromaClientWrapper":
        if cls._instance is None:
            cls._instance = ChromaClientWrapper(host=host, port=port)
        return cls._instance

    def _connect(self) -> chromadb.HttpClient:
        for attempt in range(3):
            try:
                client = chromadb.HttpClient(host=self._host, port=self._port)
                client.heartbeat()
                logger.info(f"ChromaDB connected at {self._host}:{self._port}")
                return client
            except Exception as e:
                wait = 2 ** attempt
                logger.warning(f"ChromaDB connect attempt {attempt + 1} failed: {e}. Retrying in {wait}s...")
                time.sleep(wait)
        raise RuntimeError(f"Could not connect to ChromaDB at {self._host}:{self._port} after 3 attempts.")

    def _collection_name(self, subject_code: str) -> str:
        return f"questions_{subject_code.lower().replace(' ', '_').replace('-', '_')}"

    def get_or_create_collection(self, subject_code: str) -> chromadb.Collection:
        return self._client.get_or_create_collection(
            name=self._collection_name(subject_code),
            metadata={"hnsw:space": "cosine"},
        )

    def upsert_questions(self, subject_code: str, ids: List[str],
                         embeddings: List[List[float]], documents: List[str],
                         metadatas: List[Dict[str, Any]]) -> None:
        t0 = time.time()
        collection = self.get_or_create_collection(subject_code)
        collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
        logger.info(f"Chroma upsert: {len(ids)} docs to {self._collection_name(subject_code)} in {(time.time()-t0)*1000:.0f}ms")

    def query(self, subject_code: str, query_embedding: List[float],
              n_results: int = 20, where: Optional[Dict] = None) -> Dict:
        t0 = time.time()
        collection = self.get_or_create_collection(subject_code)
        kwargs = {"query_embeddings": [query_embedding], "n_results": n_results, "include": ["documents", "metadatas", "distances"]}
        if where:
            kwargs["where"] = where
        results = collection.query(**kwargs)
        logger.debug(f"Chroma query returned {len(results.get('ids', [[]])[0])} results in {(time.time()-t0)*1000:.0f}ms")
        return results

    def delete_questions(self, subject_code: str, ids: List[str]) -> None:
        try:
            collection = self.get_or_create_collection(subject_code)
            collection.delete(ids=ids)
            logger.info(f"Chroma deleted {len(ids)} docs from {self._collection_name(subject_code)}")
        except Exception as e:
            logger.error(f"Chroma delete failed: {e}")

    def collection_exists(self, subject_code: str) -> bool:
        try:
            self._client.get_collection(self._collection_name(subject_code))
            return True
        except Exception:
            return False

    def get_collection_count(self, subject_code: str) -> int:
        try:
            collection = self.get_or_create_collection(subject_code)
            return collection.count()
        except Exception:
            return 0

    def health_check(self) -> bool:
        try:
            self._client.heartbeat()
            return True
        except Exception:
            return False
