"""Unit Repository."""
from typing import Optional, List
from sqlalchemy.exc import SQLAlchemyError
from app.models.unit import Unit
from app.repositories.base_repository import BaseRepository, RepositoryError


class UnitRepository(BaseRepository[Unit]):
    model = Unit

    def get_by_subject_ordered(self, subject_id: str) -> List[Unit]:
        try:
            return (Unit.query.filter_by(subject_id=subject_id, is_deleted=False)
                    .order_by(Unit.unit_number.asc()).all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_subject_ordered failed: {e}") from e

    def get_by_subject_and_number(self, subject_id: str, unit_number: int) -> Optional[Unit]:
        try:
            return Unit.query.filter_by(subject_id=subject_id, unit_number=unit_number, is_deleted=False).first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_subject_and_number failed: {e}") from e
