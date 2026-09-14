"""
app/repositories/user_repository.py — User database operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.models.user import User, UserRole


class UserRepository:

    @staticmethod
    def get_by_id(user_id: str) -> Optional[User]:
        return db.session.get(User, user_id)

    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower().strip())
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create(name: str, email: str, password: str, role: str) -> User:
        """Create and persist a new user. Hashes password automatically."""
        user = User(
            name=name,
            email=email.lower().strip(),
            role=role,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # get id before commit
        return user

    @staticmethod
    def email_exists(email: str) -> bool:
        stmt = select(User.id).where(User.email == email.lower().strip())
        return db.session.execute(stmt).scalar_one_or_none() is not None

    @staticmethod
    def update_last_login(user: User) -> None:
        from datetime import datetime, timezone
        user.last_login_at = datetime.now(timezone.utc)
        db.session.flush()
