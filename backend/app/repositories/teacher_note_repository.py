"""
app/repositories/teacher_note_repository.py — Database access for TeacherNote.
"""
from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import desc, or_, select
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models.teacher_note import TeacherNote


class TeacherNoteRepository:

    @staticmethod
    def create(
        teacher_id: str,
        title: str,
        subject_name: str,
        semester_name: str,
        branch_name: str | None,
        description: str | None,
        original_filename: str,
        stored_filename: str,
        file_path: str,
        file_size: int,
        mime_type: str,
        checksum: str,
    ) -> TeacherNote:
        note = TeacherNote(
            teacher_id=teacher_id,
            title=title.strip(),
            subject_name=subject_name.strip(),
            semester_name=semester_name.strip(),
            branch_name=branch_name.strip() if branch_name else None,
            description=description.strip() if description else None,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            checksum=checksum,
        )
        db.session.add(note)
        db.session.commit()
        return note

    @staticmethod
    def get_by_id(note_id: str) -> Optional[TeacherNote]:
        return db.session.execute(
            select(TeacherNote)
            .options(selectinload(TeacherNote.teacher))
            .where(TeacherNote.id == note_id)
        ).scalar_one_or_none()

    @staticmethod
    def get_by_id_and_teacher(note_id: str, teacher_id: str) -> Optional[TeacherNote]:
        return db.session.execute(
            select(TeacherNote).where(
                TeacherNote.id == note_id, TeacherNote.teacher_id == teacher_id
            )
        ).scalar_one_or_none()

    @staticmethod
    def list_by_teacher(
        teacher_id: str, page: int = 1, page_size: int = 20
    ) -> Tuple[List[TeacherNote], int]:
        stmt = (
            select(TeacherNote)
            .where(TeacherNote.teacher_id == teacher_id)
            .order_by(desc(TeacherNote.uploaded_at))
        )
        total = db.session.scalar(
            select(db.func.count(TeacherNote.id)).where(TeacherNote.teacher_id == teacher_id)
        ) or 0
        items = db.session.execute(
            stmt.offset((page - 1) * page_size).limit(page_size)
        ).scalars().all()
        return items, total

    @staticmethod
    def list_for_students(
        subject: Optional[str] = None,
        semester: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 50,
    ) -> Tuple[List[TeacherNote], int]:
        stmt = (
            select(TeacherNote)
            .options(selectinload(TeacherNote.teacher))
            .order_by(desc(TeacherNote.uploaded_at))
        )

        if subject:
            stmt = stmt.where(TeacherNote.subject_name.ilike(f"%{subject.strip()}%"))
        if semester:
            sem_clean = semester.strip()
            # Support both "5" and "Semester 5"
            stmt = stmt.where(
                or_(
                    TeacherNote.semester_name.ilike(f"%{sem_clean}%"),
                    TeacherNote.semester_name == sem_clean,
                )
            )
        if search:
            q = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    TeacherNote.title.ilike(q),
                    TeacherNote.subject_name.ilike(q),
                    TeacherNote.description.ilike(q),
                    TeacherNote.original_filename.ilike(q),
                )
            )

        # Count total
        count_stmt = select(db.func.count(TeacherNote.id))
        if subject:
            count_stmt = count_stmt.where(TeacherNote.subject_name.ilike(f"%{subject.strip()}%"))
        if semester:
            sem_clean = semester.strip()
            count_stmt = count_stmt.where(
                or_(
                    TeacherNote.semester_name.ilike(f"%{sem_clean}%"),
                    TeacherNote.semester_name == sem_clean,
                )
            )
        if search:
            q = f"%{search.strip()}%"
            count_stmt = count_stmt.where(
                or_(
                    TeacherNote.title.ilike(q),
                    TeacherNote.subject_name.ilike(q),
                    TeacherNote.description.ilike(q),
                    TeacherNote.original_filename.ilike(q),
                )
            )

        total = db.session.scalar(count_stmt) or 0
        items = db.session.execute(
            stmt.offset((page - 1) * page_size).limit(page_size)
        ).scalars().all()
        return items, total

    @staticmethod
    def delete(note: TeacherNote) -> None:
        db.session.delete(note)
        db.session.commit()
