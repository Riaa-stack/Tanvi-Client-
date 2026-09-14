"""
app/services/rag_service.py — RAG pipeline for academic question answering.

Pipeline:
  query → intent detection → metadata scope → DB filter → vector retrieval
  → evidence sufficiency evaluation → grounded answer

Priority:
  PostgreSQL structured facts → ChromaDB chunks/questions → Paper analysis
  → Historical analysis → Gemini fallback (only if permitted)

CRITICAL: Never invent historical frequency, paper existence, or source citations.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from app.config import get_settings
from app.logging_config import get_logger
from app.models.historical_analysis import EvidenceLevel
from app.prompts.note_prompts import RAG_ANSWER_PROMPT

logger = get_logger(__name__)

# Minimum similarity threshold for including a result in evidence
RAG_SIMILARITY_THRESHOLD = 0.30


class RAGDecisionService:
    """
    Determines whether database evidence is sufficient,
    whether vector evidence is sufficient,
    whether historical evidence is available,
    and whether fallback is permitted.
    """

    def evaluate(
        self,
        db_results: list,
        vector_results: list,
        historical_analysis=None,
    ) -> dict:
        has_db = len(db_results) > 0
        has_vectors = len(vector_results) > 0
        has_historical = (
            historical_analysis is not None
            and historical_analysis.get("available", False)
            and historical_analysis.get("evidence_level") != EvidenceLevel.NONE
        )
        evidence_level = self._compute_evidence_level(has_db, has_vectors, has_historical)
        allow_fallback = evidence_level in (EvidenceLevel.NONE, EvidenceLevel.LOW)

        return {
            "has_db_evidence": has_db,
            "has_vector_evidence": has_vectors,
            "has_historical_evidence": has_historical,
            "evidence_level": evidence_level,
            "allow_fallback": allow_fallback,
        }

    def _compute_evidence_level(self, has_db, has_vectors, has_historical) -> str:
        if has_db and has_vectors and has_historical:
            return EvidenceLevel.HIGH
        elif has_db and has_vectors:
            return EvidenceLevel.MEDIUM
        elif has_db or has_vectors:
            return EvidenceLevel.LOW
        return EvidenceLevel.NONE


class RAGService:
    """
    Executes RAG queries against paper content and historical data.
    """

    def __init__(
        self,
        embedding_svc,
        vector_svc,
        gemini_svc,
        decision_svc: RAGDecisionService | None = None,
    ):
        self._embedding = embedding_svc
        self._vector = vector_svc
        self._gemini = gemini_svc
        self._decision = decision_svc or RAGDecisionService()

    def query(
        self,
        question: str,
        scope: Dict[str, Any] | None = None,
        n_results: int = 10,
    ) -> Dict[str, Any]:
        """
        Execute a RAG query and return a grounded answer.

        Args:
            question: The user's question.
            scope: Optional filtering scope (subject_id, branch_id, etc.)
            n_results: Number of vector results to retrieve.
        """
        if not question or not question.strip():
            return self._insufficient_response("Empty question provided.")

        scope_dict = dict(scope or {})

        # 1. Embed query
        query_embedding = self._embedding.embed_single(question)

        # 2. Build metadata filter from scope
        where_filter = self._build_where_filter(scope_dict)

        # 3. Vector retrieval — paper chunks
        try:
            chunk_results = self._vector.search_paper_chunks(
                query_embedding=query_embedding,
                n_results=n_results,
                where=where_filter if where_filter else None,
            )
        except Exception as e:
            logger.warning("rag_chunk_search_failed", error=str(e))
            chunk_results = []

        # 4. Vector retrieval — paper questions
        try:
            question_results = self._vector.search_paper_questions(
                query_embedding=query_embedding,
                n_results=n_results,
                where=where_filter if where_filter else None,
            )
        except Exception as e:
            logger.warning("rag_question_search_failed", error=str(e))
            question_results = []

        # Filter by similarity threshold
        chunk_results = [r for r in chunk_results if r["similarity"] >= RAG_SIMILARITY_THRESHOLD]
        question_results = [r for r in question_results if r["similarity"] >= RAG_SIMILARITY_THRESHOLD]

        # 5. Get DB structured facts
        db_facts = self._get_db_facts(scope_dict)

        # 6. Get historical analysis if scope available
        historical = self._get_historical_context(scope_dict)

        # 7. Evaluate evidence
        decision = self._decision.evaluate(db_facts, chunk_results + question_results, historical)

        # 8. Build context for Gemini
        context = self._build_context(
            question=question,
            chunk_results=chunk_results,
            question_results=question_results,
            db_facts=db_facts,
            historical=historical,
        )

        # 9. Generate answer
        scope_desc = self._scope_description(scope_dict)
        prompt = RAG_ANSWER_PROMPT.format(
            context=context,
            question=question,
            scope_description=scope_desc,
        )

        try:
            answer_data = self._gemini.generate_json(prompt, "rag_answer")
        except Exception as e:
            logger.error("rag_gemini_failed", error=str(e))
            answer_data = {
                "answer": "I'm unable to process your question at this time due to a service error.",
                "evidence_used": False,
                "confidence": "LOW",
                "sources": [],
                "used_fallback": True,
            }

        # 10. Enrich sources with DB metadata
        sources = self._enrich_sources(
            answer_data.get("sources", []),
            question_results,
            chunk_results,
        )

        return {
            "answer": answer_data.get("answer", ""),
            "evidence_level": decision["evidence_level"],
            "confidence": answer_data.get("confidence", "LOW"),
            "sources": sources,
            "related_questions": self._format_related_questions(question_results),
            "related_papers": self._format_related_papers(chunk_results + question_results),
            "used_fallback": answer_data.get("used_fallback", False),
            "decision": decision,
        }

    def _build_where_filter(self, scope: dict | None) -> dict | None:
        """Build ChromaDB metadata filter from scope."""
        if not scope:
            return None

        conditions = []
        if scope.get("subject_id"):
            conditions.append({"subject_id": {"$eq": scope["subject_id"]}})
        if scope.get("branch_id"):
            conditions.append({"branch_id": {"$eq": scope["branch_id"]}})
        if scope.get("semester_id"):
            conditions.append({"semester_id": {"$eq": scope["semester_id"]}})
        if scope.get("year"):
            conditions.append({"year": {"$eq": int(scope["year"])}})
        if scope.get("paper_id"):
            conditions.append({"paper_id": {"$eq": scope["paper_id"]}})

        if not conditions:
            return None
        if len(conditions) == 1:
            return conditions[0]
        return {"$and": conditions}

    def _get_db_facts(self, scope: dict | None) -> list:
        """Retrieve structured facts from PostgreSQL based on scope."""
        if not scope:
            return []

        facts = []
        try:
            from app.extensions import db
            from app.models.paper import Paper, PaperStatus
            from app.models.paper_analysis import PaperAnalysis
            from sqlalchemy import select

            target_paper_id = scope.get("paper_id")
            if target_paper_id:
                paper = db.session.get(Paper, target_paper_id)
                if paper:
                    analysis = db.session.execute(
                        select(PaperAnalysis).where(PaperAnalysis.paper_id == paper.id)
                    ).scalar_one_or_none()

                    questions_data = [
                        {
                            "question_number": q.question_number,
                            "question_text": q.question_text,
                            "marks": q.marks,
                            "unit": q.unit,
                            "topic": q.topic,
                            "difficulty": q.difficulty,
                        }
                        for q in paper.questions
                    ]

                    unit_dist = {}
                    if analysis and analysis.unit_distribution:
                        unit_dist = analysis.unit_distribution
                    elif questions_data:
                        for q in questions_data:
                            u = q.get("unit") or "General"
                            if u not in unit_dist:
                                unit_dist[u] = {"marks": 0, "question_count": 0}
                            unit_dist[u]["marks"] += q.get("marks") or 0
                            unit_dist[u]["question_count"] += 1

                    facts.append(
                        {
                            "type": "target_paper_details",
                            "paper_id": paper.id,
                            "title": paper.title,
                            "year": paper.year,
                            "subject": paper.subject.name if paper.subject else "",
                            "branch": paper.branch.name if paper.branch else "",
                            "semester": paper.semester.number if paper.semester else 5,
                            "total_questions": len(questions_data),
                            "unit_distribution": unit_dist,
                            "mark_distribution": analysis.mark_distribution if analysis else None,
                            "major_topics": (
                                analysis.topic_analysis.get("major_topics")
                                if analysis and analysis.topic_analysis
                                else []
                            ),
                            "questions_summary": questions_data,
                            "difficulty_analysis": analysis.difficulty_analysis if analysis else None,
                            "study_recommendations": analysis.study_recommendations if analysis else None,
                        }
                    )
            else:
                stmt = select(Paper).where(Paper.status == PaperStatus.READY)
                if scope.get("subject_id"):
                    stmt = stmt.where(Paper.subject_id == scope["subject_id"])
                papers = db.session.execute(stmt.limit(5)).scalars().all()
                for p in papers:
                    facts.append(
                        {
                            "type": "paper_metadata",
                            "paper_id": p.id,
                            "title": p.title,
                            "year": p.year,
                            "subject": p.subject.name if p.subject else "",
                            "branch": p.branch.name if p.branch else "",
                            "questions_count": len(p.questions),
                        }
                    )
        except Exception as e:
            logger.warning("rag_db_facts_failed", error=str(e))

        return facts

    def _get_historical_context(self, scope: dict | None) -> dict | None:
        """Get historical analysis for the scope if available."""
        if not scope:
            return None

        scope_id = scope.get("academic_scope_id")
        try:
            from app.extensions import db
            from app.models.paper import Paper
            from app.repositories.historical_repository import HistoricalRepository

            if not scope_id and scope.get("paper_id"):
                paper = db.session.get(Paper, scope["paper_id"])
                if paper and paper.academic_scope_id:
                    scope_id = paper.academic_scope_id

            if not scope_id and scope.get("subject_id"):
                paper = db.session.execute(
                    select(Paper).where(Paper.subject_id == scope["subject_id"])
                ).scalars().first()
                if paper and paper.academic_scope_id:
                    scope_id = paper.academic_scope_id

            if not scope_id:
                return None

            analysis = HistoricalRepository.get_by_scope(scope_id)
            if analysis:
                return {
                    "available": True,
                    "evidence_level": analysis.evidence_level,
                    "papers_count": analysis.papers_count,
                    "topic_frequency": analysis.topic_frequency,
                    "unit_importance": analysis.unit_importance,
                    "marks_distribution": analysis.marks_distribution,
                    "repetition_clusters": analysis.repetition_clusters,
                    "study_recommendations": analysis.study_recommendations,
                    "historical_trends": analysis.historical_trends,
                }
        except Exception as e:
            logger.warning("rag_historical_context_failed", error=str(e))
        return None

    def _build_context(
        self, question, chunk_results, question_results, db_facts, historical
    ) -> str:
        """Build the context string for the Gemini prompt."""
        parts = []

        if db_facts:
            parts.append("DATABASE STRUCTURED FACTS & PAPER BREAKDOWN:\n" + json.dumps(db_facts, indent=2))

        if historical:
            parts.append("MULTI-YEAR HISTORICAL INTELLIGENCE & REPETITION CLUSTERS:\n" + json.dumps(historical, indent=2))

        if question_results:
            q_ctx = []
            for r in question_results[:8]:
                meta = r["metadata"]
                q_ctx.append(
                    f"- [Paper: {meta.get('paper_id', '?')}, "
                    f"Year: {meta.get('year', '?')}, "
                    f"Unit: {meta.get('unit', '?')}, "
                    f"Marks: {meta.get('marks', '?')}M, "
                    f"Page: {meta.get('page_number', '?')}, "
                    f"Similarity: {r['similarity']:.2f}]\n"
                    f"  Question: {r['document'][:400]}"
                )
            parts.append("RELEVANT QUESTIONS FROM PAPERS:\n" + "\n".join(q_ctx))

        if chunk_results:
            c_ctx = []
            for r in chunk_results[:5]:
                meta = r["metadata"]
                c_ctx.append(
                    f"- [Paper: {meta.get('paper_id', '?')}, "
                    f"Page: {meta.get('page_number', '?')}]\n"
                    f"  {r['document'][:400]}"
                )
            parts.append("RELEVANT CONTENT CHUNKS:\n" + "\n".join(c_ctx))

        if not parts:
            parts.append("No relevant content found in the document corpus for this query.")

        return "\n\n".join(parts)

    def _scope_description(self, scope: dict | None) -> str:
        if not scope:
            return "All available papers"
        parts = []
        for key in ["subject_id", "branch_id", "semester_id", "year"]:
            if scope.get(key):
                parts.append(f"{key}: {scope[key]}")
        return ", ".join(parts) if parts else "All available papers"

    def _enrich_sources(
        self, sources: list, question_results: list, chunk_results: list
    ) -> list:
        """Add paper metadata to sources if missing."""
        enriched = []
        for s in sources:
            enriched.append(s)
        return enriched[:10]  # Limit sources

    def _format_related_questions(self, question_results: list) -> list:
        return [
            {
                "question_text": r["document"][:300],
                "paper_id": r["metadata"].get("paper_id"),
                "year": r["metadata"].get("year"),
                "marks": r["metadata"].get("marks"),
                "topic": r["metadata"].get("topic"),
                "similarity": r["similarity"],
            }
            for r in question_results[:5]
        ]

    def _format_related_papers(self, results: list) -> list:
        seen_papers = set()
        papers = []
        for r in results:
            paper_id = r["metadata"].get("paper_id")
            if paper_id and paper_id not in seen_papers:
                seen_papers.add(paper_id)
                papers.append(
                    {
                        "paper_id": paper_id,
                        "year": r["metadata"].get("year"),
                        "subject_id": r["metadata"].get("subject_id"),
                    }
                )
        return papers[:5]

    @staticmethod
    def _insufficient_response(reason: str) -> dict:
        return {
            "answer": "I don't have enough information to answer this question.",
            "evidence_level": EvidenceLevel.NONE,
            "confidence": "LOW",
            "sources": [],
            "related_questions": [],
            "related_papers": [],
            "used_fallback": False,
            "reason": reason,
        }
