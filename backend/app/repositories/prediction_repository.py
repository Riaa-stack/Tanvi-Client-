"""Prediction Repository."""
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.exc import SQLAlchemyError
from app.models.predicted_question import PredictedQuestion
from app.extensions import db
from app.repositories.base_repository import RepositoryError


class PredictionRepository:

    def create_predicted_questions_batch(self, questions: List[Dict[str, Any]]) -> List[PredictedQuestion]:
        try:
            created = []
            for q_data in questions:
                pq = PredictedQuestion(**q_data)
                db.session.add(pq)
                created.append(pq)
            db.session.commit()
            return created
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"create_predicted_questions_batch failed: {e}") from e

    def get_predicted_for_subject(self, subject_id: str, unit_id: str = None, difficulty: str = None,
                                  page: int = 1, per_page: int = 20) -> Tuple[List[PredictedQuestion], int]:
        try:
            q = PredictedQuestion.query.filter_by(subject_id=subject_id, is_active=True)
            if unit_id:
                q = q.filter(PredictedQuestion.unit_id == unit_id)
            if difficulty:
                q = q.filter(PredictedQuestion.difficulty_estimated == difficulty)
            q = q.order_by(PredictedQuestion.probability_score.desc())
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_predicted_for_subject failed: {e}") from e

    def deactivate_old_predictions(self, subject_id: str) -> int:
        try:
            count = PredictedQuestion.query.filter_by(subject_id=subject_id, is_active=True).update({"is_active": False})
            db.session.commit()
            return count
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"deactivate_old_predictions failed: {e}") from e
