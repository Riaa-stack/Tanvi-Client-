"""Embedding Agent — Embeds all questions and upserts to Chroma + DB."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.ai.embedding_client import EmbeddingClient

logger = logging.getLogger(__name__)
BATCH_SIZE = 64


class EmbeddingAgent(BaseAgent):
    def __init__(self):
        super().__init__("embedding_agent")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        question_ids: List[str] = context.get("question_ids", [])

        if not subject_id:
            return self._error("subject_id required.")

        from app.models.question import Question
        from app.models.question_embedding import QuestionEmbedding
        from app.models.subject import Subject
        from app.extensions import db, get_chroma_client

        subject = Subject.query.get(subject_id)
        if not subject:
            return self._error(f"Subject {subject_id} not found.")

        # Get questions to embed (either specific IDs or all unembedded)
        if question_ids:
            questions = Question.query.filter(Question.id.in_(question_ids), Question.is_deleted == False).all()
        else:
            from app.repositories.question_repository import QuestionRepository
            questions = QuestionRepository().get_unembedded_questions(subject_id)

        if not questions:
            self._log_completion(0)
            return self._success({"embedded_count": 0})

        embedder = EmbeddingClient.get_instance()
        chroma = get_chroma_client()
        embedded = 0

        # Process in batches
        for i in range(0, len(questions), BATCH_SIZE):
            batch = questions[i:i + BATCH_SIZE]
            texts = [q.question_text for q in batch]
            try:
                vectors = embedder.encode(texts, batch_size=BATCH_SIZE)
            except Exception as e:
                self.logger.error(f"Embedding batch {i} failed: {e}")
                continue

            chroma_ids, chroma_embeddings, chroma_docs, chroma_metas = [], [], [], []

            for j, question in enumerate(batch):
                vec = vectors[j].tolist()
                chroma_ids.append(question.id)
                chroma_embeddings.append(vec)
                chroma_docs.append(question.question_text)
                chroma_metas.append({
                    "question_id": question.id,
                    "paper_id": question.paper_id or "",
                    "subject_id": subject_id,
                    "subject_code": subject.code,
                    "unit_id": question.unit_id or "",
                    "topic_id": question.topic_id or "",
                    "exam_year": question.exam_year or 0,
                    "difficulty": question.difficulty or "",
                    "marks": float(question.marks) if question.marks else 0.0,
                    "is_repeated": bool(question.is_repeated),
                    "question_type": question.question_type or "",
                })

                # Upsert DB embedding record
                existing = QuestionEmbedding.query.filter_by(question_id=question.id).first()
                if existing:
                    existing.embedding = vec
                    existing.chroma_doc_id = question.id
                else:
                    db.session.add(QuestionEmbedding(
                        question_id=question.id, embedding=vec,
                        chroma_doc_id=question.id, model_name="all-MiniLM-L6-v2",
                    ))
                embedded += 1

            # Batch upsert to Chroma
            try:
                chroma.upsert_questions(subject.code, chroma_ids, chroma_embeddings, chroma_docs, chroma_metas)
            except Exception as e:
                self.logger.error(f"Chroma upsert batch {i} failed: {e}")

        db.session.commit()
        self._log_completion(embedded)
        return self._success({"embedded_count": embedded})
