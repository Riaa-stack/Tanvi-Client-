"""
app/repositories/academic_repository.py — Subject, Branch, Semester, AcademicScope operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.models.academic_scope import AcademicScope
from app.models.branch import Branch
from app.models.semester import Semester
from app.models.subject import Subject


class AcademicRepository:

    # ── Subject ───────────────────────────────────────────────────────────────
    @staticmethod
    def get_or_create_subject(name: str, university: str = "", code: str = "") -> Subject:
        stmt = select(Subject).where(
            Subject.name == name, Subject.university == university
        )
        subject = db.session.execute(stmt).scalar_one_or_none()
        if not subject:
            subject = Subject(name=name, university=university or None, code=code or None)
            db.session.add(subject)
            db.session.flush()
        return subject

    @staticmethod
    def get_subject_by_id(subject_id: str) -> Optional[Subject]:
        return db.session.get(Subject, subject_id)

    @staticmethod
    def list_subjects(university: str | None = None) -> list[Subject]:
        stmt = select(Subject)
        if university:
            stmt = stmt.where(Subject.university == university)
        return db.session.execute(stmt).scalars().all()

    # ── Branch ────────────────────────────────────────────────────────────────
    @staticmethod
    def get_or_create_branch(name: str, code: str = "") -> Branch:
        stmt = select(Branch).where(Branch.name == name)
        branch = db.session.execute(stmt).scalar_one_or_none()
        if not branch:
            branch = Branch(name=name, code=code or None)
            db.session.add(branch)
            db.session.flush()
        return branch

    @staticmethod
    def get_branch_by_id(branch_id: str) -> Optional[Branch]:
        return db.session.get(Branch, branch_id)

    @staticmethod
    def list_branches() -> list[Branch]:
        return db.session.execute(select(Branch)).scalars().all()

    # ── Semester ──────────────────────────────────────────────────────────────
    @staticmethod
    def get_or_create_semester(number: int) -> Semester:
        stmt = select(Semester).where(Semester.number == number)
        semester = db.session.execute(stmt).scalar_one_or_none()
        if not semester:
            semester = Semester(number=number, name=f"Semester {number}")
            db.session.add(semester)
            db.session.flush()
        return semester

    @staticmethod
    def get_semester_by_id(semester_id: str) -> Optional[Semester]:
        return db.session.get(Semester, semester_id)

    @staticmethod
    def list_semesters() -> list[Semester]:
        return db.session.execute(select(Semester).order_by(Semester.number)).scalars().all()

    # ── AcademicScope ─────────────────────────────────────────────────────────
    @staticmethod
    def get_or_create_scope(
        university: str,
        college: str,
        branch: Branch,
        semester: Semester,
        subject: Subject,
    ) -> AcademicScope:
        stmt = select(AcademicScope).where(
            AcademicScope.university == university,
            AcademicScope.college == college,
            AcademicScope.branch_id == branch.id,
            AcademicScope.semester_id == semester.id,
            AcademicScope.subject_id == subject.id,
        )
        scope = db.session.execute(stmt).scalar_one_or_none()
        if not scope:
            scope = AcademicScope(
                university=university,
                college=college,
                branch_id=branch.id,
                semester_id=semester.id,
                subject_id=subject.id,
            )
            db.session.add(scope)
            db.session.flush()
        return scope

    @staticmethod
    def get_scope_by_id(scope_id: str) -> Optional[AcademicScope]:
        return db.session.get(AcademicScope, scope_id)
