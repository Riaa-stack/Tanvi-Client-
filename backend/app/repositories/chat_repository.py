"""
app/repositories/chat_repository.py — Chat session and message operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models.chat import ChatMessage, ChatSession, MessageRole


class ChatRepository:

    @staticmethod
    def create_session(
        user_id: str,
        title: str | None = None,
        paper_id: str | None = None,
        subject_id: str | None = None,
        academic_scope_id: str | None = None,
    ) -> ChatSession:
        session = ChatSession(
            user_id=user_id,
            title=title,
            paper_id=paper_id,
            subject_id=subject_id,
            academic_scope_id=academic_scope_id,
        )
        db.session.add(session)
        db.session.flush()
        return session

    @staticmethod
    def get_session(session_id: str, user_id: str) -> Optional[ChatSession]:
        stmt = select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def list_sessions(user_id: str, page: int = 1, page_size: int = 20) -> tuple[list[ChatSession], int]:
        base = select(ChatSession).where(ChatSession.user_id == user_id)
        total = db.session.execute(
            select(func.count()).select_from(base.subquery())
        ).scalar_one()
        stmt = (
            base.order_by(ChatSession.updated_at.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        sessions = db.session.execute(stmt).scalars().all()
        return list(sessions), total

    @staticmethod
    def get_session_with_messages(session_id: str, user_id: str) -> Optional[ChatSession]:
        stmt = (
            select(ChatSession)
            .options(selectinload(ChatSession.messages))
            .where(ChatSession.id == session_id, ChatSession.user_id == user_id)
        )
        return db.session.execute(stmt).unique().scalar_one_or_none()

    @staticmethod
    def add_message(
        session_id: str,
        role: str,
        content: str,
        evidence: list | None = None,
        used_fallback: bool = False,
        evidence_level: str | None = None,
    ) -> ChatMessage:
        msg = ChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            evidence=evidence,
            used_fallback=used_fallback,
            evidence_level=evidence_level,
        )
        db.session.add(msg)
        db.session.flush()
        return msg

    @staticmethod
    def get_recent_messages(session_id: str, limit: int = 10) -> list[ChatMessage]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        messages = db.session.execute(stmt).scalars().all()
        return list(reversed(messages))
