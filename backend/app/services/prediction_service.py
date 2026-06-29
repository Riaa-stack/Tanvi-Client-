"""Prediction Service."""
from typing import Dict, List, Optional
from app.repositories.prediction_repository import PredictionRepository

prediction_repo = PredictionRepository()


class PredictionService:

    def generate_predictions(self, subject_id: str, topic_id: str, count: int = 5, difficulty: str = "medium") -> Dict:
        from app.tasks.prediction_tasks import generate_predicted_questions
        task = generate_predicted_questions.delay(subject_id, topic_id, count=count, difficulty=difficulty)
        return {"status": "queued", "task_id": task.id}

    def get_predictions(self, subject_id: str, unit_id: str = None, difficulty: str = None,
                        page: int = 1, per_page: int = 20) -> Dict:
        items, total = prediction_repo.get_predicted_for_subject(
            subject_id=subject_id, unit_id=unit_id, difficulty=difficulty, page=page, per_page=per_page
        )
        return {
            "predictions": [{
                "id": p.id, "topic_id": p.topic_id, "subject_id": p.subject_id, "unit_id": p.unit_id,
                "question_text": p.question_text, "marks_estimated": float(p.marks_estimated) if p.marks_estimated else None,
                "difficulty_estimated": p.difficulty_estimated, "probability_score": float(p.probability_score) if p.probability_score else None,
                "generation_rationale": p.generation_rationale, "is_ai_generated": p.is_ai_generated,
                "ai_disclaimer": p.ai_disclaimer, "created_at": p.created_at.isoformat() if p.created_at else None
            } for p in items],
            "total": total, "page": page, "per_page": per_page
        }
