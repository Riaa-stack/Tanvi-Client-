"""Analytics Repository."""
from typing import Optional, List, Dict, Any
from sqlalchemy.exc import SQLAlchemyError
from app.models.topic_trend import TopicTrend
from app.models.probability_score import ProbabilityScore
from app.models.difficulty_stat import DifficultyStat
from app.models.analytics_snapshot import AnalyticsSnapshot
from app.models.unit_weightage import UnitWeightage
from app.extensions import db
from app.repositories.base_repository import RepositoryError


class AnalyticsRepository:

    def upsert_topic_trend(self, topic_id: str, subject_id: str, exam_year: int,
                           count: int, total_marks: float, avg_difficulty: str = None) -> TopicTrend:
        try:
            trend = TopicTrend.query.filter_by(topic_id=topic_id, exam_year=exam_year).first()
            if trend:
                trend.question_count = count
                trend.total_marks = total_marks
                trend.avg_difficulty = avg_difficulty
            else:
                trend = TopicTrend(topic_id=topic_id, subject_id=subject_id, exam_year=exam_year,
                                   question_count=count, total_marks=total_marks, avg_difficulty=avg_difficulty)
                db.session.add(trend)
            db.session.commit()
            return trend
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"upsert_topic_trend failed: {e}") from e

    def upsert_probability_score(self, topic_id: str, subject_id: str, probability: float,
                                 confidence: float, rationale: str, factors: dict,
                                 model_version: str) -> ProbabilityScore:
        try:
            score = ProbabilityScore.query.filter_by(topic_id=topic_id, subject_id=subject_id).first()
            if score:
                score.probability = probability
                score.confidence = confidence
                score.rationale = rationale
                score.contributing_factors = factors
                score.model_version = model_version
            else:
                score = ProbabilityScore(topic_id=topic_id, subject_id=subject_id, probability=probability,
                                         confidence=confidence, rationale=rationale,
                                         contributing_factors=factors, model_version=model_version)
                db.session.add(score)
            db.session.commit()
            return score
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"upsert_probability_score failed: {e}") from e

    def upsert_difficulty_stat(self, dimension: str, dimension_id: str, year: int,
                               easy: int, medium: int, hard: int) -> DifficultyStat:
        try:
            stat = DifficultyStat.query.filter_by(dimension=dimension, dimension_id=dimension_id, exam_year=year).first()
            if stat:
                stat.easy_count = easy
                stat.medium_count = medium
                stat.hard_count = hard
                stat.total_count = easy + medium + hard
            else:
                stat = DifficultyStat(dimension=dimension, dimension_id=dimension_id, exam_year=year,
                                      easy_count=easy, medium_count=medium, hard_count=hard,
                                      total_count=easy + medium + hard)
                db.session.add(stat)
            db.session.commit()
            return stat
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"upsert_difficulty_stat failed: {e}") from e

    def upsert_analytics_snapshot(self, snapshot_type: str, subject_id: str, data: dict) -> AnalyticsSnapshot:
        try:
            snap = AnalyticsSnapshot.query.filter_by(snapshot_type=snapshot_type, subject_id=subject_id).first()
            if snap:
                snap.data = data
            else:
                snap = AnalyticsSnapshot(snapshot_type=snapshot_type, subject_id=subject_id, data=data)
                db.session.add(snap)
            db.session.commit()
            return snap
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"upsert_analytics_snapshot failed: {e}") from e

    def upsert_unit_weightage(self, unit_id: str, subject_id: str, total_marks: float,
                              question_count: int, paper_count: int) -> UnitWeightage:
        try:
            uw = UnitWeightage.query.filter_by(unit_id=unit_id).first()
            if uw:
                uw.total_marks = total_marks
                uw.question_count = question_count
                uw.paper_count = paper_count
            else:
                uw = UnitWeightage(unit_id=unit_id, subject_id=subject_id, total_marks=total_marks,
                                   question_count=question_count, paper_count=paper_count)
                db.session.add(uw)
            db.session.commit()
            return uw
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"upsert_unit_weightage failed: {e}") from e

    def get_analytics_snapshot(self, snapshot_type: str, subject_id: str) -> Optional[AnalyticsSnapshot]:
        return AnalyticsSnapshot.query.filter_by(snapshot_type=snapshot_type, subject_id=subject_id).first()

    def get_probability_scores_for_subject(self, subject_id: str) -> List[ProbabilityScore]:
        return ProbabilityScore.query.filter_by(subject_id=subject_id).order_by(ProbabilityScore.probability.desc()).all()

    def get_topic_trends_for_subject(self, subject_id: str, years: int = 5) -> List[TopicTrend]:
        from sqlalchemy import func
        from sqlalchemy.sql import select
        cutoff = None
        try:
            max_year = db.session.query(func.max(TopicTrend.exam_year)).filter_by(subject_id=subject_id).scalar()
            if max_year:
                cutoff = max_year - years
        except Exception:
            pass
        q = TopicTrend.query.filter_by(subject_id=subject_id)
        if cutoff:
            q = q.filter(TopicTrend.exam_year >= cutoff)
        return q.order_by(TopicTrend.exam_year.desc()).all()
