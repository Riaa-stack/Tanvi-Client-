"""
app/services/chat_service.py — Chat session and message management.

Maintains context-aware conversations with RAG grounding.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

from app.errors import NotFoundError
from app.logging_config import get_logger
from app.models.chat import MessageRole
from app.repositories.chat_repository import ChatRepository
from app.services.rag_service import RAGService

logger = get_logger(__name__)


class ChatService:
    """Manages chat sessions and generates grounded AI responses."""

    def __init__(self, rag_service: RAGService):
        self._rag = rag_service
        self._chat_repo = ChatRepository()

    def create_session(
        self,
        user_id: str,
        title: str | None = None,
        paper_id: str | None = None,
        subject_id: str | None = None,
        academic_scope_id: str | None = None,
    ) -> dict:
        """Create a new chat session."""
        from app.extensions import db
        session = ChatRepository.create_session(
            user_id=user_id,
            title=title or "New Chat",
            paper_id=paper_id,
            subject_id=subject_id,
            academic_scope_id=academic_scope_id,
        )
        db.session.commit()
        return session.to_dict()

    def list_sessions(self, user_id: str, page: int = 1, page_size: int = 20) -> dict:
        sessions, total = ChatRepository.list_sessions(user_id, page, page_size)
        return {
            "items": [s.to_dict() for s in sessions],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            },
        }

    def get_session(self, session_id: str, user_id: str) -> dict:
        session = ChatRepository.get_session_with_messages(session_id, user_id)
        if not session:
            raise NotFoundError("Chat session not found.")
        return {
            **session.to_dict(),
            "messages": [m.to_dict() for m in session.messages],
        }

    def send_message(
        self,
        session_id: str,
        user_id: str,
        content: str,
    ) -> dict:
        """Process a user message and generate a grounded AI response."""
        from app.extensions import db
        from app.models.chat import ChatSession

        # Verify session ownership
        session = ChatRepository.get_session(session_id, user_id)
        if not session:
            raise NotFoundError("Chat session not found.")

        # Store user message
        user_msg = ChatRepository.add_message(
            session_id=session_id,
            role=MessageRole.USER,
            content=content,
        )

        # Build scope from session context
        scope: Dict[str, Any] = {}
        if session.paper_id:
            scope["paper_id"] = session.paper_id
        if session.subject_id:
            scope["subject_id"] = session.subject_id
        if session.academic_scope_id:
            scope["academic_scope_id"] = session.academic_scope_id

        # Get recent conversation history for context
        recent_messages = ChatRepository.get_recent_messages(session_id, limit=6)
        conversation_history = [
            {"role": m.role, "content": m.content}
            for m in recent_messages[:-1]  # Exclude the just-added user message
        ]

        # Execute RAG
        try:
            rag_result = self._rag.query(
                question=content,
                scope=scope if scope else None,
            )
            answer = rag_result.get("answer", "I'm unable to answer that question.")
            sources = rag_result.get("sources", [])
            used_fallback = rag_result.get("used_fallback", False)
            evidence_level = rag_result.get("evidence_level")
        except Exception as e:
            logger.error("chat_rag_failed", session_id=session_id, error=str(e))
            answer = "I'm experiencing a technical issue. Please try again."
            sources = []
            used_fallback = False
            evidence_level = None

        # Store assistant response
        assistant_msg = ChatRepository.add_message(
            session_id=session_id,
            role=MessageRole.ASSISTANT,
            content=answer,
            evidence=sources[:10],
            used_fallback=used_fallback,
            evidence_level=evidence_level,
        )

        # Update session title if first message
        if not session.title or session.title == "New Chat":
            session.title = content[:100]

        db.session.commit()

        return {
            "user_message": user_msg.to_dict(),
            "assistant_message": assistant_msg.to_dict(),
            "sources": sources,
            "evidence_level": evidence_level,
            "used_fallback": used_fallback,
        }
