"""
app/models/chat.py — Chat session and message models.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

JSONType = JSON().with_variant(JSONB, "postgresql")


class ChatSession(db.Model):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Optional scope context
    paper_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("papers.id", ondelete="SET NULL"), nullable=True
    )
    subject_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True
    )
    academic_scope_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("academic_scopes.id", ondelete="SET NULL"), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
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
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship(
        "ChatMessage", back_populates="session", cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "paper_id": self.paper_id,
            "subject_id": self.subject_id,
            "academic_scope_id": self.academic_scope_id,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class MessageRole:
    USER = "user"
    ASSISTANT = "assistant"
    ALL = (USER, ASSISTANT)


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        Enum(*MessageRole.ALL, name="message_role"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Evidence/sources from RAG
    evidence: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    used_fallback: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    evidence_level: Mapped[str | None] = mapped_column(String(10), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationship
    session = relationship("ChatSession", back_populates="messages")

    __table_args__ = (Index("ix_chat_messages_session_created", "session_id", "created_at"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "evidence": self.evidence,
            "used_fallback": self.used_fallback,
            "evidence_level": self.evidence_level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
