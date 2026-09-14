"""
app/models/paper_question.py — Extracted questions from a paper.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class QuestionType:
    THEORY = "THEORY"
    NUMERICAL = "NUMERICAL"
    CONCEPTUAL = "CONCEPTUAL"
    DESCRIPTIVE = "DESCRIPTIVE"
    DEFINITION = "DEFINITION"
    DERIVATION = "DERIVATION"
    PROGRAMMING = "PROGRAMMING"
    DIAGRAM = "DIAGRAM"
    SHORT_ANSWER = "SHORT_ANSWER"
    LONG_ANSWER = "LONG_ANSWER"
    MIXED = "MIXED"
    UNKNOWN = "UNKNOWN"

    ALL = (
        THEORY, NUMERICAL, CONCEPTUAL, DESCRIPTIVE, DEFINITION,
        DERIVATION, PROGRAMMING, DIAGRAM, SHORT_ANSWER, LONG_ANSWER,
        MIXED, UNKNOWN,
    )


class DifficultyLevel:
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    UNKNOWN = "UNKNOWN"

    ALL = (EASY, MEDIUM, HARD, UNKNOWN)


class PaperQuestion(db.Model):
    __tablename__ = "paper_questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    paper_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_question_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("paper_questions.id", ondelete="SET NULL"), nullable=True
    )
    question_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    marks: Mapped[float | None] = mapped_column(Float, nullable=True)
    section: Mapped[str | None] = mapped_column(String(100), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    topic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subtopic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    difficulty: Mapped[str] = mapped_column(
        Enum(*DifficultyLevel.ALL, name="difficulty_level"),
        nullable=False,
        default=DifficultyLevel.UNKNOWN,
    )
    question_type: Mapped[str] = mapped_column(
        Enum(*QuestionType.ALL, name="question_type"),
        nullable=False,
        default=QuestionType.UNKNOWN,
    )
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    embedding_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
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
    paper = relationship("Paper", back_populates="questions")
    sub_questions = relationship(
        "PaperQuestion",
        backref=db.backref("parent_question", remote_side=[id]),
    )
    repetition_occurrences = relationship(
        "QuestionRepetitionOccurrence", back_populates="question", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_pq_paper_topic", "paper_id", "topic"),
        Index("ix_pq_paper_difficulty", "paper_id", "difficulty"),
        Index("ix_pq_paper_type", "paper_id", "question_type"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "paper_id": self.paper_id,
            "question_number": self.question_number,
            "question_text": self.question_text,
            "marks": self.marks,
            "section": self.section,
            "unit": self.unit,
            "topic": self.topic,
            "subtopic": self.subtopic,
            "difficulty": self.difficulty,
            "question_type": self.question_type,
            "page_number": self.page_number,
            "parent_question_id": self.parent_question_id,
        }

    def __repr__(self) -> str:
        return (
            f"<PaperQuestion id={self.id} paper_id={self.paper_id} "
            f"number={self.question_number!r}>"
        )
