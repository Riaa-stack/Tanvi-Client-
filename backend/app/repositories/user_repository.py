"""User Repository."""
from typing import Optional, List, Tuple
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User
from app.extensions import db
from app.repositories.base_repository import BaseRepository, RepositoryError


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_email(self, email: str) -> Optional[User]:
        try:
            return User.query.filter_by(email=email.lower(), is_deleted=False).first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_email failed: {e}") from e

    def get_active_users_by_role(self, role: str, page: int = 1, per_page: int = 20) -> Tuple[List[User], int]:
        try:
            q = User.query.filter_by(role=role, is_active=True, is_deleted=False)
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_active_users_by_role failed: {e}") from e

    def update_last_login(self, user_id: str) -> None:
        try:
            from sqlalchemy.sql import func
            User.query.filter_by(id=user_id).update({"last_login_at": func.now()})
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"update_last_login failed: {e}") from e
