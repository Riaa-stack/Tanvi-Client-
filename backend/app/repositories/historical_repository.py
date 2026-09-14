"""
app/repositories/historical_repository.py — Historical analysis and repetition operations.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select

from app.extensions import db
from app.models.historical_analysis import SubjectHistoricalAnalysis
from app.models.repetition import QuestionRepetitionGroup, QuestionRepetitionOccurrence


class HistoricalRepository:

    @staticmethod
    def get_by_scope(academic_scope_id: str) -> Optional[SubjectHistoricalAnalysis]:
        stmt = select(SubjectHistoricalAnalysis).where(
            SubjectHistoricalAnalysis.academic_scope_id == academic_scope_id
        )
        return db.session.execute(stmt).scalar_one_or_none()

    @staticmethod
    def save_analysis(analysis: SubjectHistoricalAnalysis) -> SubjectHistoricalAnalysis:
        existing = HistoricalRepository.get_by_scope(analysis.academic_scope_id)
        if existing:
            # Update fields in place
            for attr in [
                "papers_count", "papers_included", "evidence_level",
                "topic_frequency", "question_frequency", "repetition_clusters",
                "unit_importance", "marks_distribution", "difficulty_trends",
                "question_type_trends", "historical_trends",
                "study_recommendations", "potential_patterns",
                "analysis_version", "generated_at",
            ]:
                setattr(existing, attr, getattr(analysis, attr))
            db.session.flush()
            return existing
        db.session.add(analysis)
        db.session.flush()
        return analysis

    # ── Repetition groups ─────────────────────────────────────────────────────
    @staticmethod
    def get_groups_by_scope(academic_scope_id: str) -> list[QuestionRepetitionGroup]:
        stmt = (
            select(QuestionRepetitionGroup)
            .where(QuestionRepetitionGroup.academic_scope_id == academic_scope_id)
            .order_by(QuestionRepetitionGroup.occurrence_count.desc())
        )
        return db.session.execute(stmt).scalars().all()

    @staticmethod
    def save_group(group: QuestionRepetitionGroup) -> QuestionRepetitionGroup:
        db.session.add(group)
        db.session.flush()
        return group

    @staticmethod
    def save_occurrence(occ: QuestionRepetitionOccurrence) -> QuestionRepetitionOccurrence:
        db.session.add(occ)
        db.session.flush()
        return occ

    @staticmethod
    def get_occurrences_for_paper(paper_id: str) -> list[QuestionRepetitionOccurrence]:
        stmt = select(QuestionRepetitionOccurrence).where(
            QuestionRepetitionOccurrence.paper_id == paper_id
        )
        return db.session.execute(stmt).scalars().all()

    @staticmethod
    def delete_occurrences_for_paper(paper_id: str) -> None:
        """Remove all repetition occurrences for a paper (used before retry)."""
        db.session.query(QuestionRepetitionOccurrence).filter(
            QuestionRepetitionOccurrence.paper_id == paper_id
        ).delete(synchronize_session=False)

    @staticmethod
    def delete_empty_groups(academic_scope_id: str) -> None:
        """Remove repetition groups that have lost all their occurrences."""
        from sqlalchemy import func, not_, exists
        occ_sub = (
            select(QuestionRepetitionOccurrence.group_id)
            .where(QuestionRepetitionOccurrence.group_id == QuestionRepetitionGroup.id)
            .correlate(QuestionRepetitionGroup)
            .exists()
        )
        db.session.query(QuestionRepetitionGroup).filter(
            QuestionRepetitionGroup.academic_scope_id == academic_scope_id,
            not_(occ_sub),
        ).delete(synchronize_session=False)
