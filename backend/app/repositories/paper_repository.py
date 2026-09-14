"""
app/repositories/paper_repository.py — Paper database operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import and_, func, select
from sqlalchemy.orm import joinedload, selectinload

from app.extensions import db
from app.models.paper import Paper, PaperStatus
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_question import PaperQuestion


class PaperRepository:

    @staticmethod
    def get_by_id(paper_id: str, load_relations: bool = False) -> Optional[Paper]:
        if load_relations:
            stmt = (
                select(Paper)
                .options(
                    joinedload(Paper.semester),
                    joinedload(Paper.branch),
                    joinedload(Paper.subject),
                    selectinload(Paper.questions),
                )
                .where(Paper.id == paper_id)
            )
            return db.session.execute(stmt).unique().scalar_one_or_none()
        return db.session.get(Paper, paper_id)

    @staticmethod
    def get_by_id_and_teacher(paper_id: str, teacher_id: str) -> Optional[Paper]:
        stmt = select(Paper).where(
            Paper.id == paper_id, Paper.teacher_id == teacher_id
        )
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_ready_paper_for_student(paper_id: str) -> Optional[Paper]:
        stmt = (
            select(Paper)
            .options(
                joinedload(Paper.semester),
                joinedload(Paper.branch),
                joinedload(Paper.subject),
                joinedload(Paper.academic_scope),
                selectinload(Paper.questions),
                joinedload(Paper.analysis),
            )
            .where(Paper.id == paper_id, Paper.status == PaperStatus.READY)
        )
        return db.session.execute(stmt).unique().scalar_one_or_none()

    @staticmethod
    def list_teacher_papers(
        teacher_id: str,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Paper], int]:
        base = select(Paper).where(Paper.teacher_id == teacher_id)
        total = db.session.execute(
            select(func.count()).select_from(base.subquery())
        ).scalar_one()
        stmt = (
            base.options(
                joinedload(Paper.semester),
                joinedload(Paper.branch),
                joinedload(Paper.subject),
            )
            .order_by(Paper.uploaded_at.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        papers = db.session.execute(stmt).unique().scalars().all()
        return list(papers), total

    @staticmethod
    def list_ready_papers(
        page: int = 1,
        page_size: int = 20,
        year: int | None = None,
        subject_id: str | None = None,
        branch_id: str | None = None,
        semester_id: str | None = None,
        college: str | None = None,
        university: str | None = None,
        academic_scope_id: str | None = None,
    ) -> tuple[list[Paper], int]:
        conditions = [Paper.status == PaperStatus.READY]
        if year is not None:
            conditions.append(Paper.year == year)
        if subject_id:
            conditions.append(Paper.subject_id == subject_id)
        if branch_id:
            conditions.append(Paper.branch_id == branch_id)
        if semester_id:
            conditions.append(Paper.semester_id == semester_id)
        if academic_scope_id:
            conditions.append(Paper.academic_scope_id == academic_scope_id)

        from app.models.academic_scope import AcademicScope
        base = select(Paper).where(and_(*conditions))
        if college or university:
            base = base.join(AcademicScope, Paper.academic_scope_id == AcademicScope.id)
            if college:
                base = base.where(AcademicScope.college == college)
            if university:
                base = base.where(AcademicScope.university == university)

        total = db.session.execute(
            select(func.count()).select_from(base.subquery())
        ).scalar_one()

        stmt = (
            base.options(
                joinedload(Paper.semester),
                joinedload(Paper.branch),
                joinedload(Paper.subject),
            )
            .order_by(Paper.year.desc(), Paper.uploaded_at.desc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        papers = db.session.execute(stmt).unique().scalars().all()
        return list(papers), total

    @staticmethod
    def get_ready_papers_in_scope(academic_scope_id: str) -> list[Paper]:
        """Fetch all READY papers belonging to a given academic scope."""
        stmt = (
            select(Paper)
            .options(selectinload(Paper.questions))
            .where(
                Paper.academic_scope_id == academic_scope_id,
                Paper.status == PaperStatus.READY,
            )
            .order_by(Paper.year.asc())
        )
        return db.session.execute(stmt).unique().scalars().all()

    @staticmethod
    def get_by_checksum(checksum: str) -> Optional[Paper]:
        stmt = select(Paper).where(Paper.checksum == checksum)
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def save(paper: Paper) -> Paper:
        db.session.add(paper)
        db.session.flush()
        return paper

    @staticmethod
    def delete(paper: Paper) -> None:
        db.session.delete(paper)
        db.session.flush()

    @staticmethod
    def get_analysis(paper_id: str) -> Optional[PaperAnalysis]:
        stmt = select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id)
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def save_analysis(analysis: PaperAnalysis) -> PaperAnalysis:
        db.session.merge(analysis)
        db.session.flush()
        return analysis

    @staticmethod
    def delete_questions(paper_id: str) -> int:
        """Delete all questions for a paper (used on retry)."""
        deleted = (
            db.session.query(PaperQuestion)
            .filter(PaperQuestion.paper_id == paper_id)
            .delete(synchronize_session=False)
        )
        return deleted

    @staticmethod
    def teacher_stats(teacher_id: str) -> dict:
        """Return processing state counts for teacher dashboard."""
        from sqlalchemy import case
        rows = db.session.execute(
            select(
                Paper.status,
                func.count(Paper.id).label("count"),
            )
            .where(Paper.teacher_id == teacher_id)
            .group_by(Paper.status)
        ).all()
        stats = {r.status: r.count for r in rows}
        return {
            "total": sum(stats.values()),
            "ready": stats.get(PaperStatus.READY, 0),
            "failed": stats.get(PaperStatus.FAILED, 0),
            "processing": sum(
                stats.get(s, 0) for s in PaperStatus.IN_PROGRESS_STATUSES
            ),
        }
