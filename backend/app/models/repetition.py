"""
app/models/repetition.py — Semantic question repetition tracking.

QuestionRepetitionGroup: A cluster of semantically similar questions
                          across multiple papers in the same academic scope.
QuestionRepetitionOccurrence: A specific question's membership in a group.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

JSONType = JSON().with_variant(JSONB, "postgresql")


class QuestionRepetitionGroup(db.Model):
    __tablename__ = "question_repetition_groups"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    academic_scope_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("academic_scopes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    canonical_question: Mapped[str] = mapped_column(Text, nullable=False)
    """The best/most complete version of the question representing this cluster."""
    concept_label: Mapped[str | None] = mapped_column(String(500), nullable=True)
    """Human-readable label for this concept cluster."""
    occurrence_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    importance: Mapped[str] = mapped_column(
        String(20), nullable=False, default="MEDIUM"
    )
    """LOW | MEDIUM | HIGH | VERY_HIGH"""
    topic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    years: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """List of years in which this concept appeared."""
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
    academic_scope = relationship("AcademicScope")
    occurrences = relationship(
        "QuestionRepetitionOccurrence",
        back_populates="group",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_qrg_scope_occurrence", "academic_scope_id", "occurrence_count"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "academic_scope_id": self.academic_scope_id,
            "canonical_question": self.canonical_question,
            "concept_label": self.concept_label,
            "occurrence_count": self.occurrence_count,
            "importance": self.importance,
            "topic": self.topic,
            "unit": self.unit,
            "years": self.years,
        }

    def __repr__(self) -> str:
        return (
            f"<QuestionRepetitionGroup id={self.id} occurrences={self.occurrence_count}>"
        )


class QuestionRepetitionOccurrence(db.Model):
    __tablename__ = "question_repetition_occurrences"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    group_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("question_repetition_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("paper_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    paper_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    # Relationships
    group = relationship("QuestionRepetitionGroup", back_populates="occurrences")
    question = relationship("PaperQuestion", back_populates="repetition_occurrences")
    paper = relationship("Paper")

    __table_args__ = (
        Index("ix_qro_group_year", "group_id", "year"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "group_id": self.group_id,
            "question_id": self.question_id,
            "paper_id": self.paper_id,
            "year": self.year,
            "similarity_score": self.similarity_score,
        }
