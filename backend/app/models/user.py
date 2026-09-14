"""
app/models/user.py — User model.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

import bcrypt
from sqlalchemy import Boolean, DateTime, Enum, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class UserRole:
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    ALL = (TEACHER, STUDENT)


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(
        Enum(UserRole.TEACHER, UserRole.STUDENT, name="user_role"),
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    papers = relationship("Paper", back_populates="teacher", lazy="dynamic")
    notes = relationship("Note", back_populates="student", lazy="dynamic")
    chat_sessions = relationship("ChatSession", back_populates="user", lazy="dynamic")

    __table_args__ = (Index("ix_users_email_active", "email", "is_active"),)

    def set_password(self, plain_password: str) -> None:
        """Hash and store the password. Never stores plaintext."""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(
            plain_password.encode("utf-8"), salt
        ).decode("utf-8")

    def check_password(self, plain_password: str) -> bool:
        """Verify a plaintext password against the stored hash."""
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            self.password_hash.encode("utf-8"),
        )

    def is_teacher(self) -> bool:
        return self.role == UserRole.TEACHER

    def is_student(self) -> bool:
        return self.role == UserRole.STUDENT

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": (
                self.last_login_at.isoformat() if self.last_login_at else None
            ),
        }

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
