"""
app/models/note_analysis.py — AI analysis results for a student note.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

JSONType = JSON().with_variant(JSONB, "postgresql")


class NoteAnalysis(db.Model):
    __tablename__ = "note_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    key_concepts: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """[{"concept": "...", "definition": "..."}]"""

    important_points: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """["Point 1", "Point 2", ...]"""

    summary: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"quick": "...", "detailed": "...", "exam": "..."}"""

    detected_topics: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    detected_units: Mapped[list | None] = mapped_column(JSONType, nullable=True)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationship
    note = relationship("Note", back_populates="analysis")

    def to_dict(self) -> dict:
        return {
            "note_id": self.note_id,
            "key_concepts": self.key_concepts,
            "important_points": self.important_points,
            "summary": self.summary,
            "detected_topics": self.detected_topics,
            "detected_units": self.detected_units,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "model_name": self.model_name,
        }

    def __repr__(self) -> str:
        return f"<NoteAnalysis note_id={self.note_id}>"
