"""
app/repositories/question_repository.py — Paper question database operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import and_, func, or_, select

from app.extensions import db
from app.models.paper_question import PaperQuestion, DifficultyLevel, QuestionType


class QuestionRepository:

    @staticmethod
    def bulk_create(questions: list[PaperQuestion]) -> list[PaperQuestion]:
        db.session.add_all(questions)
        db.session.flush()
        return questions

    @staticmethod
    def get_by_paper(paper_id: str) -> list[PaperQuestion]:
        stmt = select(PaperQuestion).where(PaperQuestion.paper_id == paper_id)
        return db.session.execute(stmt).scalars().all()

    @staticmethod
    def search(
        query: str = "",
        subject_id: str | None = None,
        branch_id: str | None = None,
        semester_id: str | None = None,
        difficulty: str | None = None,
        question_type: str | None = None,
        marks: float | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PaperQuestion], int]:
        from app.models.paper import Paper, PaperStatus

        stmt = (
            select(PaperQuestion)
            .join(Paper, PaperQuestion.paper_id == Paper.id)
            .where(Paper.status == PaperStatus.READY)
        )

        if query:
            stmt = stmt.where(
                or_(
                    PaperQuestion.question_text.ilike(f"%{query}%"),
                    PaperQuestion.topic.ilike(f"%{query}%"),
                )
            )
        if subject_id:
            stmt = stmt.where(Paper.subject_id == subject_id)
        if branch_id:
            stmt = stmt.where(Paper.branch_id == branch_id)
        if semester_id:
            stmt = stmt.where(Paper.semester_id == semester_id)
        if difficulty:
            stmt = stmt.where(PaperQuestion.difficulty == difficulty)
        if question_type:
            stmt = stmt.where(PaperQuestion.question_type == question_type)
        if marks is not None:
            stmt = stmt.where(PaperQuestion.marks == marks)
        if year is not None:
            stmt = stmt.where(Paper.year == year)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.session.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(PaperQuestion.topic, PaperQuestion.marks.desc())
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
        questions = db.session.execute(stmt).scalars().all()
        return list(questions), total

    @staticmethod
    def get_by_id(question_id: str) -> Optional[PaperQuestion]:
        return db.session.get(PaperQuestion, question_id)
