"""
Base Repository — Generic CRUD with soft-delete support.
All repositories extend this class.
"""
import logging
from typing import TypeVar, Generic, Type, Optional, List, Tuple, Any
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db

logger = logging.getLogger(__name__)

T = TypeVar("T")


class RepositoryError(Exception):
    """Raised when a repository operation fails at the database level."""
    pass


class BaseRepository(Generic[T]):
    model: Type[T]

    def get_by_id(self, id: str, include_deleted: bool = False) -> Optional[T]:
        try:
            q = self.model.query.filter_by(id=id)
            if not include_deleted and hasattr(self.model, "is_deleted"):
                q = q.filter_by(is_deleted=False)
            return q.first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_id failed: {e}") from e

    def get_all(self, page: int = 1, per_page: int = 20, include_deleted: bool = False) -> Tuple[List[T], int]:
        try:
            q = self.model.query
            if not include_deleted and hasattr(self.model, "is_deleted"):
                q = q.filter_by(is_deleted=False)
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_all failed: {e}") from e

    def create(self, **kwargs) -> T:
        try:
            instance = self.model(**kwargs)
            db.session.add(instance)
            db.session.commit()
            return instance
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"create failed: {e}") from e

    def update(self, id: str, **kwargs) -> Optional[T]:
        try:
            instance = self.get_by_id(id)
            if not instance:
                return None
            for key, value in kwargs.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)
            db.session.commit()
            return instance
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"update failed: {e}") from e

    def soft_delete(self, id: str) -> bool:
        try:
            instance = self.get_by_id(id)
            if not instance or not hasattr(instance, "is_deleted"):
                return False
            instance.is_deleted = True
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"soft_delete failed: {e}") from e

    def hard_delete(self, id: str) -> bool:
        try:
            instance = self.model.query.filter_by(id=id).first()
            if not instance:
                return False
            db.session.delete(instance)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"hard_delete failed: {e}") from e

    def exists(self, id: str) -> bool:
        try:
            return self.model.query.filter_by(id=id).count() > 0
        except SQLAlchemyError as e:
            raise RepositoryError(f"exists failed: {e}") from e

    def filter_by(self, include_deleted: bool = False, **kwargs) -> List[T]:
        try:
            q = self.model.query.filter_by(**kwargs)
            if not include_deleted and hasattr(self.model, "is_deleted"):
                q = q.filter_by(is_deleted=False)
            return q.all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"filter_by failed: {e}") from e

    def count(self, include_deleted: bool = False, **filters) -> int:
        try:
            q = self.model.query.filter_by(**filters)
            if not include_deleted and hasattr(self.model, "is_deleted"):
                q = q.filter_by(is_deleted=False)
            return q.count()
        except SQLAlchemyError as e:
            raise RepositoryError(f"count failed: {e}") from e
