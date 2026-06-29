"""Subject, Unit, Topic, Analytics, Search, Prediction Repositories."""
# subject_repository.py
from typing import Optional, List, Dict, Any
from sqlalchemy.exc import SQLAlchemyError
from app.models.subject import Subject
from app.repositories.base_repository import BaseRepository, RepositoryError


class SubjectRepository(BaseRepository[Subject]):
    model = Subject

    def get_by_code(self, code: str) -> Optional[Subject]:
        try:
            return Subject.query.filter_by(code=code.upper(), is_deleted=False).first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_code failed: {e}") from e

    def get_by_semester(self, semester_id: str) -> List[Subject]:
        try:
            return Subject.query.filter_by(semester_id=semester_id, is_deleted=False, is_active=True).all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_semester failed: {e}") from e

    def get_with_unit_count(self, subject_id: str) -> Dict[str, Any]:
        try:
            from app.models.unit import Unit
            from sqlalchemy import func
            from app.extensions import db
            subject = self.get_by_id(subject_id)
            if not subject:
                return {}
            unit_count = Unit.query.filter_by(subject_id=subject_id, is_deleted=False).count()
            return {"subject": subject, "unit_count": unit_count}
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_with_unit_count failed: {e}") from e
