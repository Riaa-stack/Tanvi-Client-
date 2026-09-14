"""
app/models/paper_analysis.py — AI analysis results for a processed paper.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

JSONType = JSON().with_variant(JSONB, "postgresql")


class PaperAnalysis(db.Model):
    __tablename__ = "paper_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    paper_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Structured JSON analysis fields
    topic_analysis: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """
    {
        "major_topics": [{"topic": "...", "frequency": 3, "marks_contribution": 20}],
        "topic_count": 5
    }
    """
    difficulty_analysis: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"easy": 4, "medium": 6, "hard": 2, "distribution": {...}}"""

    mark_distribution: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"by_section": {...}, "by_unit": {...}, "high_weight_questions": [...]}"""

    unit_distribution: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"Unit 1": {"marks": 30, "question_count": 5}, ...}"""

    question_type_distribution: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"THEORY": 4, "NUMERICAL": 3, ...}"""

    repetition_analysis: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """Available after historical intelligence update."""

    study_recommendations: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """[{"priority": 1, "topic": "...", "reason": "..."}]"""

    potential_questions: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """[{"question": "...", "label": "Potentially Important", "basis": "..."}]"""

    exam_trends: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"overall_trend": "...", "insights": [...]}"""

    # Metadata
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    analysis_version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")

    # Relationship
    paper = relationship("Paper", back_populates="analysis")

    def to_dict(self) -> dict:
        return {
            "paper_id": self.paper_id,
            "topic_analysis": self.topic_analysis,
            "difficulty_analysis": self.difficulty_analysis,
            "mark_distribution": self.mark_distribution,
            "unit_distribution": self.unit_distribution,
            "question_type_distribution": self.question_type_distribution,
            "repetition_analysis": self.repetition_analysis,
            "study_recommendations": self.study_recommendations,
            "potential_questions": self.potential_questions,
            "exam_trends": self.exam_trends,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "model_name": self.model_name,
            "analysis_version": self.analysis_version,
        }

    def __repr__(self) -> str:
        return f"<PaperAnalysis paper_id={self.paper_id}>"
