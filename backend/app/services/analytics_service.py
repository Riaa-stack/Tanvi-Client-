"""Analytics Service."""
from typing import Dict, List, Optional
from app.repositories.analytics_repository import AnalyticsRepository
from app.models.unit import Unit
from app.models.question import Question
from app.extensions import db
from sqlalchemy import func

analytics_repo = AnalyticsRepository()


class AnalyticsService:

    def get_unit_weightage(self, subject_id: str) -> List[Dict]:
        from app.models.unit_weightage import UnitWeightage
        rows = UnitWeightage.query.filter_by(subject_id=subject_id).all()
        if not rows:
            return []
        total_marks = sum(float(r.total_marks) for r in rows)
        result = []
        for row in rows:
            unit = Unit.query.get(row.unit_id)
            pct = (float(row.total_marks) / total_marks * 100) if total_marks > 0 else 0
            result.append({
                "unit_id": row.unit_id,
                "unit_number": unit.unit_number if unit else None,
                "unit_title": unit.title if unit else "Unknown",
                "total_marks": float(row.total_marks),
                "question_count": row.question_count,
                "paper_count": row.paper_count,
                "weightage_percentage": round(pct, 2),
            })
        return sorted(result, key=lambda x: x.get("unit_number", 0))

    def refresh_unit_weightage(self, subject_id: str) -> None:
        """Recalculate and persist unit weightage from questions table."""
        from app.models.unit_weightage import UnitWeightage
        from app.models.paper import Paper

        rows = (db.session.query(
            Question.unit_id,
            func.sum(Question.marks).label("total_marks"),
            func.count(Question.id).label("question_count"),
            func.count(func.distinct(Question.paper_id)).label("paper_count"),
        )
        .filter(Question.subject_id == subject_id, Question.unit_id.isnot(None), Question.is_deleted == False)
        .group_by(Question.unit_id).all())

        for row in rows:
            analytics_repo.upsert_unit_weightage(
                unit_id=row.unit_id, subject_id=subject_id,
                total_marks=float(row.total_marks or 0),
                question_count=row.question_count,
                paper_count=row.paper_count,
            )

    def get_exam_trends(self, subject_id: str, years: int = 5) -> List[Dict]:
        trends = analytics_repo.get_topic_trends_for_subject(subject_id, years=years)
        from app.models.topic import Topic
        result = []
        for t in trends:
            topic = Topic.query.get(t.topic_id)
            result.append({
                "topic_id": t.topic_id,
                "topic_name": topic.name if topic else "Unknown",
                "exam_year": t.exam_year,
                "question_count": t.question_count,
                "total_marks": float(t.total_marks),
                "avg_difficulty": t.avg_difficulty,
            })
        return result

    def get_probability_scores(self, subject_id: str) -> List[Dict]:
        scores = analytics_repo.get_probability_scores_for_subject(subject_id)
        from app.models.topic import Topic
        result = []
        for s in scores:
            topic = Topic.query.get(s.topic_id)
            result.append({
                "topic_id": s.topic_id,
                "topic_name": topic.name if topic else "Unknown",
                "probability": float(s.probability),
                "confidence": float(s.confidence) if s.confidence else None,
                "rationale": s.rationale,
                "contributing_factors": s.contributing_factors,
            })
        return result

    def get_difficulty_distribution(self, subject_id: str) -> Dict:
        """Distribution of difficulty levels across all questions in a subject."""
        from sqlalchemy import func
        rows = (db.session.query(Question.difficulty, func.count(Question.id).label("count"))
                .filter(Question.subject_id == subject_id, Question.difficulty.isnot(None), Question.is_deleted == False)
                .group_by(Question.difficulty).all())
        result = {"easy": 0, "medium": 0, "hard": 0}
        for row in rows:
            if row.difficulty in result:
                result[row.difficulty] = row.count
        return result

    def get_admin_dashboard(self) -> Dict:
        from app.agents.admin_analytics_agent import AdminAnalyticsAgent
        result = AdminAnalyticsAgent().run({})
        return result.get("data", {})

    def get_clusters(self, subject_id: str) -> List[Dict]:
        from app.models.question_cluster import QuestionCluster
        from app.models.topic import Topic
        clusters = QuestionCluster.query.filter_by(subject_id=subject_id).order_by(QuestionCluster.question_count.desc()).all()
        result = []
        for c in clusters:
            topic = Topic.query.get(c.topic_id) if c.topic_id else None
            result.append({
                "id": c.id, "label": c.cluster_label, "question_count": c.question_count,
                "topic_id": c.topic_id, "topic_name": topic.name if topic else None,
            })
        return result
