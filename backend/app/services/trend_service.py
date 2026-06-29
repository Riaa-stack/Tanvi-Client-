"""Trend Service."""
from typing import Dict, List
from app.repositories.analytics_repository import AnalyticsRepository
from app.models.topic import Topic

analytics_repo = AnalyticsRepository()

class TrendService:
    def get_topic_trends(self, subject_id: str, years: int = 5) -> List[Dict]:
        trends = analytics_repo.get_topic_trends_for_subject(subject_id, years=years)
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
