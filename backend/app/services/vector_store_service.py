"""
app/services/vector_store_service.py — ChromaDB persistent vector store.

Collections:
  - papers_chunks: Text chunks from question papers
  - papers_questions: Individual questions from papers
  - notes_chunks: Text chunks from student notes (student-isolated)

Strict separation prevents data contamination between collections.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.config import get_settings
from app.errors import VectorStoreError
from app.logging_config import get_logger

logger = get_logger(__name__)

COLLECTION_PAPERS_CHUNKS = "papers_chunks"
COLLECTION_PAPERS_QUESTIONS = "papers_questions"
COLLECTION_NOTES_CHUNKS = "notes_chunks"


class VectorStoreService:
    """
    Manages ChromaDB persistent collections.
    All vector operations go through this service.
    """

    _client = None
    _collections: Dict[str, Any] = {}

    @classmethod
    def _get_client(cls):
        """Return or initialise the ChromaDB persistent client (singleton)."""
        if cls._client is None:
            try:
                import chromadb
                from chromadb.config import Settings as ChromaSettings

                settings = get_settings()
                cls._client = chromadb.PersistentClient(
                    path=settings.CHROMA_PERSIST_DIRECTORY,
                )
                logger.info(
                    "chromadb_client_initialized",
                    path=settings.CHROMA_PERSIST_DIRECTORY,
                )
            except ImportError:
                raise VectorStoreError("chromadb not installed. Install with: pip install chromadb")
            except Exception as e:
                raise VectorStoreError(f"ChromaDB initialization failed: {str(e)}") from e
        return cls._client

    @classmethod
    def _get_collection(cls, name: str):
        """Get or create a ChromaDB collection by name."""
        if name not in cls._collections:
            client = cls._get_client()
            try:
                collection = client.get_or_create_collection(
                    name=name,
                    metadata={"hnsw:space": "cosine"},
                )
                cls._collections[name] = collection
                logger.info("chromadb_collection_ready", collection=name)
            except Exception as e:
                raise VectorStoreError(
                    f"Failed to get/create ChromaDB collection '{name}': {str(e)}"
                ) from e
        return cls._collections[name]

    # ── Paper chunks ──────────────────────────────────────────────────────────

    def add_paper_chunks(
        self,
        paper_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadatas: List[dict],
        ids: List[str],
    ) -> None:
        """Add or update paper text chunks in the vector store."""
        if not chunks:
            return
        collection = self._get_collection(COLLECTION_PAPERS_CHUNKS)
        try:
            collection.upsert(
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info("paper_chunks_stored", paper_id=paper_id, count=len(chunks))
        except Exception as e:
            raise VectorStoreError(f"Failed to store paper chunks: {str(e)}") from e

    def search_paper_chunks(
        self,
        query_embedding: List[float],
        n_results: int = 10,
        where: Optional[dict] = None,
    ) -> List[Dict[str, Any]]:
        """Search paper chunks by vector similarity with optional metadata filter."""
        collection = self._get_collection(COLLECTION_PAPERS_CHUNKS)
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, collection.count()),
                where=where,
                include=["documents", "metadatas", "distances"],
            )
            return self._format_results(results)
        except Exception as e:
            raise VectorStoreError(f"Paper chunk search failed: {str(e)}") from e

    # ── Paper questions ───────────────────────────────────────────────────────

    def add_paper_questions(
        self,
        paper_id: str,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[dict],
        ids: List[str],
    ) -> None:
        """Add or update paper questions in the vector store."""
        if not texts:
            return
        collection = self._get_collection(COLLECTION_PAPERS_QUESTIONS)
        try:
            collection.upsert(
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info("paper_questions_stored", paper_id=paper_id, count=len(texts))
        except Exception as e:
            raise VectorStoreError(f"Failed to store paper questions: {str(e)}") from e

    def search_paper_questions(
        self,
        query_embedding: List[float],
        n_results: int = 20,
        where: Optional[dict] = None,
    ) -> List[Dict[str, Any]]:
        """Semantic search on paper questions."""
        collection = self._get_collection(COLLECTION_PAPERS_QUESTIONS)
        try:
            count = collection.count()
            if count == 0:
                return []
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, count),
                where=where,
                include=["documents", "metadatas", "distances"],
            )
            return self._format_results(results)
        except Exception as e:
            raise VectorStoreError(f"Paper question search failed: {str(e)}") from e

    # ── Note chunks ───────────────────────────────────────────────────────────

    def add_note_chunks(
        self,
        note_id: str,
        student_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadatas: List[dict],
        ids: List[str],
    ) -> None:
        """
        Add note chunks to the note-only collection.
        Always tagged with note_id + student_id for strict isolation.
        """
        if not chunks:
            return
        # Force isolation metadata on every record
        for meta in metadatas:
            meta["note_id"] = note_id
            meta["student_id"] = student_id
            meta["document_type"] = "note"

        collection = self._get_collection(COLLECTION_NOTES_CHUNKS)
        try:
            collection.upsert(
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info(
                "note_chunks_stored",
                note_id=note_id,
                student_id=student_id,
                count=len(chunks),
            )
        except Exception as e:
            raise VectorStoreError(f"Failed to store note chunks: {str(e)}") from e

    def search_note_chunks(
        self,
        query_embedding: List[float],
        note_id: str,
        student_id: str,
        n_results: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Search note chunks. ALWAYS filters by both note_id AND student_id
        to enforce strict note isolation.
        """
        collection = self._get_collection(COLLECTION_NOTES_CHUNKS)
        try:
            count = collection.count()
            if count == 0:
                return []
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, count),
                where={
                    "$and": [
                        {"note_id": {"$eq": note_id}},
                        {"student_id": {"$eq": student_id}},
                    ]
                },
                include=["documents", "metadatas", "distances"],
            )
            return self._format_results(results)
        except Exception as e:
            raise VectorStoreError(f"Note chunk search failed: {str(e)}") from e

    # ── Deletion ──────────────────────────────────────────────────────────────

    def delete_paper_vectors(self, paper_id: str) -> None:
        """Remove all vectors for a paper from both paper collections."""
        self._delete_where(COLLECTION_PAPERS_CHUNKS, {"paper_id": {"$eq": paper_id}})
        self._delete_where(COLLECTION_PAPERS_QUESTIONS, {"paper_id": {"$eq": paper_id}})
        logger.info("paper_vectors_deleted", paper_id=paper_id)

    def delete_note_vectors(self, note_id: str) -> None:
        """Remove all vectors for a note."""
        self._delete_where(COLLECTION_NOTES_CHUNKS, {"note_id": {"$eq": note_id}})
        logger.info("note_vectors_deleted", note_id=note_id)

    def _delete_where(self, collection_name: str, where: dict) -> None:
        try:
            collection = self._get_collection(collection_name)
            collection.delete(where=where)
        except Exception as e:
            logger.warning(
                "vector_delete_failed",
                collection=collection_name,
                where=where,
                error=str(e),
            )

    # ── Health ────────────────────────────────────────────────────────────────

    def health_check(self) -> dict:
        """Return collection counts for health monitoring."""
        try:
            paper_chunks = self._get_collection(COLLECTION_PAPERS_CHUNKS).count()
            paper_questions = self._get_collection(COLLECTION_PAPERS_QUESTIONS).count()
            note_chunks = self._get_collection(COLLECTION_NOTES_CHUNKS).count()
            return {
                "status": "healthy",
                "collections": {
                    COLLECTION_PAPERS_CHUNKS: paper_chunks,
                    COLLECTION_PAPERS_QUESTIONS: paper_questions,
                    COLLECTION_NOTES_CHUNKS: note_chunks,
                },
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

    # ── Utilities ─────────────────────────────────────────────────────────────

    @staticmethod
    def _format_results(raw_results: dict) -> List[Dict[str, Any]]:
        """Convert ChromaDB raw results to a flat list of result dicts."""
        results = []
        if not raw_results or not raw_results.get("ids"):
            return results

        ids = raw_results["ids"][0]
        documents = raw_results.get("documents", [[]])[0]
        metadatas = raw_results.get("metadatas", [[]])[0]
        distances = raw_results.get("distances", [[]])[0]

        for i, doc_id in enumerate(ids):
            similarity = 1.0 - distances[i] if distances else 0.0
            results.append(
                {
                    "id": doc_id,
                    "document": documents[i] if i < len(documents) else "",
                    "metadata": metadatas[i] if i < len(metadatas) else {},
                    "similarity": round(similarity, 4),
                }
            )
        return results
