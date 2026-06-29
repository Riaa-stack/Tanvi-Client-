"""Search Agent — Wraps semantic and keyword search flows."""
import logging
import time
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class SearchAgent(BaseAgent):
    def __init__(self):
        super().__init__("search_agent")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        query_text: str = context.get("query_text", "").strip()
        subject_id: str = context.get("subject_id")
        search_type: str = context.get("search_type", "semantic")
        top_k: int = int(context.get("top_k", 20))
        user_id: str = context.get("user_id")

        if not query_text:
            return self._error("query_text is required.")

        t0 = time.time()
        results = []

        if search_type == "semantic":
            results = self._semantic_search(query_text, subject_id, top_k)
        else:
            results = self._keyword_search(query_text, subject_id, top_k)

        response_ms = int((time.time() - t0) * 1000)

        # Log search
        try:
            from app.repositories.search_repository import SearchRepository
            SearchRepository().log_search(
                user_id=user_id, query_text=query_text, result_count=len(results),
                subject_id=subject_id, search_type=search_type, response_ms=response_ms,
            )
        except Exception as e:
            self.logger.warning(f"Failed to log search: {e}")

        context["search_results"] = results
        context["response_ms"] = response_ms
        self._log_completion(len(results))
        return self._success({"results": results, "count": len(results), "response_ms": response_ms})

    def _semantic_search(self, query: str, subject_id: str, top_k: int) -> List[Dict]:
        from app.ai.embedding_client import EmbeddingClient
        from app.extensions import get_chroma_client
        from app.models.subject import Subject

        subject = Subject.query.get(subject_id) if subject_id else None
        if not subject:
            return []

        embedding = EmbeddingClient.get_instance().encode_single(query)
        chroma = get_chroma_client()
        try:
            raw = chroma.query(subject_code=subject.code, query_embedding=embedding, n_results=top_k)
            docs = raw.get("documents", [[]])[0]
            metas = raw.get("metadatas", [[]])[0]
            distances = raw.get("distances", [[]])[0]
            results = []
            for doc, meta, dist in zip(docs, metas, distances):
                results.append({**meta, "question_text": doc, "similarity_score": round(1 - dist, 4)})
            return results
        except Exception as e:
            logger.warning(f"Semantic search failed: {e}")
            return []

    def _keyword_search(self, query: str, subject_id: str, top_k: int) -> List[Dict]:
        from app.repositories.question_repository import QuestionRepository
        questions, _ = QuestionRepository().keyword_search(query, subject_id=subject_id, per_page=top_k)
        return [{"question_id": q.id, "question_text": q.question_text, "marks": float(q.marks) if q.marks else 0,
                 "difficulty": q.difficulty, "exam_year": q.exam_year} for q in questions]
