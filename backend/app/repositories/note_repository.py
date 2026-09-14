"""
app/repositories/note_repository.py — Note database operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.note import Note, NoteStatus
from app.models.note_analysis import NoteAnalysis


class NoteRepository:

    @staticmethod
    def get_by_id(note_id: str) -> Optional[Note]:
        return db.session.get(Note, note_id)

    @staticmethod
    def get_by_id_and_student(note_id: str, student_id: str) -> Optional[Note]:
        stmt = select(Note).where(Note.id == note_id, Note.student_id == student_id)
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def list_by_student(
        student_id: str, page: int = 1, page_size: int = 20
    ) -> tuple[list[Note], int]:
        base = select(Note).where(Note.student_id == student_id)
        total = db.session.execute(
            select(func.count()).select_from(base.subquery())
        ).scalar_one()
        stmt = (
            base.order_by(Note.uploaded_at.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        notes = db.session.execute(stmt).scalars().all()
        return list(notes), total

    @staticmethod
    def save(note: Note) -> Note:
        db.session.add(note)
        db.session.flush()
        return note

    @staticmethod
    def delete(note: Note) -> None:
        db.session.delete(note)
        db.session.flush()

    @staticmethod
    def get_analysis(note_id: str) -> Optional[NoteAnalysis]:
        stmt = select(NoteAnalysis).where(NoteAnalysis.note_id == note_id)
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def save_analysis(analysis: NoteAnalysis) -> NoteAnalysis:
        db.session.merge(analysis)
        db.session.flush()
        return analysis
