"""
app/models/teacher_note.py — Teacher uploaded study notes and course materials.
Direct upload (PDF / Word) without requiring OCR processing.
Available for students to browse by Subject, Semester, and download.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class TeacherNote(db.Model):
    __tablename__ = "teacher_notes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    teacher_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    subject_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    semester_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    branch_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(150), nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)

    uploaded_at: Mapped[datetime] = mapped_column(
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
    teacher = relationship("User", backref="uploaded_teacher_notes")

    __table_args__ = (
        Index("ix_teacher_notes_subject_sem", "subject_name", "semester_name"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "teacher_name": self.teacher.name if self.teacher else "Instructor",
            "title": self.title,
            "description": self.description or "",
            "subject_name": self.subject_name,
            "semester_name": self.semester_name,
            "branch_name": self.branch_name or "",
            "original_filename": self.original_filename,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "download_url": f"/api/v1/student/notes/{self.id}/download",
        }

    def __repr__(self) -> str:
        return f"<TeacherNote id={self.id} title={self.title!r} subject={self.subject_name!r} sem={self.semester_name!r}>"
