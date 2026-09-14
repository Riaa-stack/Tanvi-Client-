"""
app/models/processing_log.py — Audit trail for paper processing stages.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class ProcessingLog(db.Model):
    __tablename__ = "processing_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    paper_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=True, index=True
    )
    note_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=True, index=True
    )
    stage: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    """STARTED | COMPLETED | FAILED"""
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    paper = relationship("Paper", back_populates="processing_logs")

    __table_args__ = (
        Index("ix_processing_logs_paper_stage", "paper_id", "stage"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "paper_id": self.paper_id,
            "note_id": self.note_id,
            "stage": self.stage,
            "status": self.status,
            "message": self.message,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
        }
