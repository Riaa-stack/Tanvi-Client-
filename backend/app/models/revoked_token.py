"""
app/models/revoked_token.py — JWT token revocation (logout blocklist).
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class RevokedToken(db.Model):
    __tablename__ = "revoked_tokens"

    jti: Mapped[str] = mapped_column(String(36), primary_key=True)
    """JWT ID (jti) claim — unique per token."""
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    revoked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        Index("ix_revoked_tokens_user", "user_id"),
        Index("ix_revoked_tokens_expires", "expires_at"),
    )

    def __repr__(self) -> str:
        return f"<RevokedToken jti={self.jti} user_id={self.user_id}>"
