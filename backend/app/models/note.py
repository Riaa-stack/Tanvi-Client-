"""
app/models/note.py — Student note model.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class NoteStatus:
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    EXTRACTING = "EXTRACTING"
    OCR_PROCESSING = "OCR_PROCESSING"
    STRUCTURING = "STRUCTURING"
    EMBEDDING = "EMBEDDING"
    ANALYZING = "ANALYZING"
    READY = "READY"
    FAILED = "FAILED"

    IN_PROGRESS_STATUSES = {
        VALIDATING, EXTRACTING, OCR_PROCESSING, STRUCTURING, EMBEDDING, ANALYZING
    }

    ALL = (
        UPLOADED, VALIDATING, EXTRACTING, OCR_PROCESSING,
        STRUCTURING, EMBEDDING, ANALYZING, READY, FAILED,
    )


class Note(db.Model):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    status: Mapped[str] = mapped_column(
        Enum(*NoteStatus.ALL, name="note_status"),
        nullable=False,
        default=NoteStatus.UPLOADED,
        index=True,
    )
    processing_stage: Mapped[str | None] = mapped_column(String(50), nullable=True)
    processing_progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    processing_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

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
    student = relationship("User", back_populates="notes")
    analysis = relationship(
        "NoteAnalysis", back_populates="note", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_notes_student_status", "student_id", "status"),
    )

    def is_ready(self) -> bool:
        return self.status == NoteStatus.READY

    def is_failed(self) -> bool:
        return self.status == NoteStatus.FAILED

    def is_processing(self) -> bool:
        return self.status in NoteStatus.IN_PROGRESS_STATUSES

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "student_id": self.student_id,
            "title": self.title,
            "original_filename": self.original_filename,
            "page_count": self.page_count,
            "status": self.status,
            "processing_progress": self.processing_progress,
            "processing_message": self.processing_message,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
        }

    def to_status_dict(self) -> dict:
        return {
            "note_id": self.id,
            "status": self.status,
            "stage": self.processing_stage,
            "progress": self.processing_progress,
            "message": self.processing_message,
            "is_ready": self.is_ready(),
            "is_failed": self.is_failed(),
            "failure_reason": self.failure_reason if self.is_failed() else None,
        }

    def __repr__(self) -> str:
        return f"<Note id={self.id} title={self.title!r} status={self.status}>"
