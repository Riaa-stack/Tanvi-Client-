"""
app/models/historical_analysis.py — Subject-level historical intelligence.

One record per academic scope, updated every time a new paper becomes READY.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

JSONType = JSON().with_variant(JSONB, "postgresql")


class EvidenceLevel:
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SubjectHistoricalAnalysis(db.Model):
    __tablename__ = "subject_historical_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    academic_scope_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("academic_scopes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    papers_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    papers_included: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """List of paper IDs included in this analysis."""

    evidence_level: Mapped[str] = mapped_column(
        String(10), nullable=False, default=EvidenceLevel.NONE
    )

    topic_frequency: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"topic_name": {"count": 5, "papers": ["pid1", ...], "total_marks": 40}}"""

    question_frequency: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """Top repeated concepts with counts and years."""

    repetition_clusters: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    """[{group_id, canonical_question, count, years, importance}]"""

    unit_importance: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    """{"Unit 1": {"total_marks": 80, "question_count": 10, "importance": "HIGH"}}"""

    marks_distribution: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    difficulty_trends: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    question_type_trends: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    historical_trends: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    study_recommendations: Mapped[list | None] = mapped_column(JSONType, nullable=True)
    potential_patterns: Mapped[list | None] = mapped_column(JSONType, nullable=True)

    analysis_version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationship
    academic_scope = relationship("AcademicScope", back_populates="historical_analyses")

    def to_dict(self) -> dict:
        return {
            "academic_scope_id": self.academic_scope_id,
            "papers_count": self.papers_count,
            "evidence_level": self.evidence_level,
            "topic_frequency": self.topic_frequency,
            "question_frequency": self.question_frequency,
            "repetition_clusters": self.repetition_clusters,
            "unit_importance": self.unit_importance,
            "marks_distribution": self.marks_distribution,
            "difficulty_trends": self.difficulty_trends,
            "question_type_trends": self.question_type_trends,
            "historical_trends": self.historical_trends,
            "study_recommendations": self.study_recommendations,
            "potential_patterns": self.potential_patterns,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "analysis_version": self.analysis_version,
        }

    def __repr__(self) -> str:
        return (
            f"<SubjectHistoricalAnalysis scope={self.academic_scope_id} "
            f"papers={self.papers_count} evidence={self.evidence_level}>"
        )
