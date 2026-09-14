"""
app/models/academic_scope.py — Academic scope: the grouping key for historical intelligence.

An academic scope uniquely identifies a combination of:
  university + college + branch + semester + subject

Year is NOT part of the scope — it is paper metadata.
Multiple papers from different years belong to the same scope.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class AcademicScope(db.Model):
    __tablename__ = "academic_scopes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    university: Mapped[str] = mapped_column(String(255), nullable=False)
    college: Mapped[str] = mapped_column(String(255), nullable=False)
    branch_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("branches.id", ondelete="RESTRICT"), nullable=False
    )
    semester_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("semesters.id", ondelete="RESTRICT"), nullable=False
    )
    subject_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    branch = relationship("Branch", back_populates="academic_scopes")
    semester = relationship("Semester", back_populates="academic_scopes")
    subject = relationship("Subject", back_populates="academic_scopes")
    papers = relationship("Paper", back_populates="academic_scope")
    historical_analyses = relationship(
        "SubjectHistoricalAnalysis", back_populates="academic_scope"
    )

    __table_args__ = (
        UniqueConstraint(
            "university", "college", "branch_id", "semester_id", "subject_id",
            name="uq_academic_scope",
        ),
        Index("ix_academic_scope_subject", "subject_id"),
        Index("ix_academic_scope_branch_semester", "branch_id", "semester_id"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "university": self.university,
            "college": self.college,
            "branch_id": self.branch_id,
            "semester_id": self.semester_id,
            "subject_id": self.subject_id,
            "branch": self.branch.to_dict() if self.branch else None,
            "semester": self.semester.to_dict() if self.semester else None,
            "subject": self.subject.to_dict() if self.subject else None,
        }

    def __repr__(self) -> str:
        return (
            f"<AcademicScope id={self.id} "
            f"university={self.university} college={self.college}>"
        )
