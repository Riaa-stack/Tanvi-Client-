"""
app/models/paper.py — Question Paper model.
Tracks all lifecycle stages from UPLOADED through READY or FAILED.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class PaperStatus:
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    EXTRACTING = "EXTRACTING"
    OCR_PROCESSING = "OCR_PROCESSING"
    STRUCTURING = "STRUCTURING"
    EMBEDDING = "EMBEDDING"
    ANALYZING = "ANALYZING"
    HISTORICAL_UPDATE = "HISTORICAL_UPDATE"
    READY = "READY"
    FAILED = "FAILED"

    IN_PROGRESS_STATUSES = {
        VALIDATING, EXTRACTING, OCR_PROCESSING, STRUCTURING, EMBEDDING, ANALYZING, HISTORICAL_UPDATE
    }

    ALL = (
        UPLOADED, VALIDATING, EXTRACTING, OCR_PROCESSING,
        STRUCTURING, EMBEDDING, ANALYZING, HISTORICAL_UPDATE,
        READY, FAILED,
    )


class Paper(db.Model):
    __tablename__ = "papers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    teacher_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    semester_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("semesters.id", ondelete="RESTRICT"), nullable=False
    )
    branch_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("branches.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    subject_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    academic_scope_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("academic_scopes.id", ondelete="SET NULL"), nullable=True, index=True
    )

    status: Mapped[str] = mapped_column(
        Enum(*PaperStatus.ALL, name="paper_status"),
        nullable=False,
        default=PaperStatus.UPLOADED,
        index=True,
    )
    processing_stage: Mapped[str | None] = mapped_column(String(50), nullable=True)
    processing_progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    processing_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str] = mapped_column(String(20), nullable=False, default="en")

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    processing_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    processing_version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")
    embedding_model: Mapped[str | None] = mapped_column(String(255), nullable=True)

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
    teacher = relationship("User", back_populates="papers")
    semester = relationship("Semester")
    branch = relationship("Branch")
    subject = relationship("Subject")
    academic_scope = relationship("AcademicScope", back_populates="papers")
    questions = relationship(
        "PaperQuestion", back_populates="paper", cascade="all, delete-orphan"
    )
    analysis = relationship(
        "PaperAnalysis", back_populates="paper", uselist=False, cascade="all, delete-orphan"
    )
    processing_logs = relationship(
        "ProcessingLog", back_populates="paper", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_papers_status_year", "status", "year"),
        Index("ix_papers_academic_scope_status", "academic_scope_id", "status"),
    )

    def is_ready(self) -> bool:
        return self.status == PaperStatus.READY

    def is_failed(self) -> bool:
        return self.status == PaperStatus.FAILED

    def is_processing(self) -> bool:
        return self.status in PaperStatus.IN_PROGRESS_STATUSES

    def to_dict(self, include_internal: bool = False) -> dict:
        data = {
            "id": self.id,
            "title": self.title,
            "original_filename": self.original_filename,
            "year": self.year,
            "status": self.status,
            "processing_progress": self.processing_progress,
            "processing_message": self.processing_message,
            "page_count": self.page_count,
            "language": self.language,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "semester": self.semester.to_dict() if self.semester else None,
            "branch": self.branch.to_dict() if self.branch else None,
            "subject": self.subject.to_dict() if self.subject else None,
            "academic_scope_id": self.academic_scope_id,
        }
        if include_internal:
            data.update(
                {
                    "teacher_id": self.teacher_id,
                    "stored_filename": self.stored_filename,
                    "file_path": self.file_path,
                    "file_size": self.file_size,
                    "mime_type": self.mime_type,
                    "checksum": self.checksum,
                    "failure_reason": self.failure_reason,
                }
            )
        return data

    def to_status_dict(self) -> dict:
        """Compact status dict for processing-status endpoint."""
        return {
            "paper_id": self.id,
            "status": self.status,
            "stage": self.processing_stage,
            "progress": self.processing_progress,
            "message": self.processing_message,
            "is_ready": self.is_ready(),
            "is_failed": self.is_failed(),
            "failure_reason": self.failure_reason if self.is_failed() else None,
        }

    def __repr__(self) -> str:
        return f"<Paper id={self.id} title={self.title!r} status={self.status}>"
