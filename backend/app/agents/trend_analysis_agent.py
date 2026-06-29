"""Trend Analysis Agent — Computes topic trends from historical question data."""
import logging
from typing import Dict, Any

from app.agents.base_agent import BaseAgent
from app.repositories.question_repository import QuestionRepository
from app.repositories.analytics_repository import AnalyticsRepository

logger = logging.getLogger(__name__)


class TrendAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("trend_analysis_agent")
        self._question_repo = QuestionRepository()
        self._analytics_repo = AnalyticsRepository()

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        if not subject_id:
            return self._error("subject_id required.")

        trend_data = self._question_repo.get_trend_data_for_subject(subject_id)
        if not trend_data:
            return self._success({"trends_updated": 0})

        updated = 0
        for row in trend_data:
            try:
                self._analytics_repo.upsert_topic_trend(
                    topic_id=row["topic_id"],
                    subject_id=subject_id,
                    exam_year=row["exam_year"],
                    count=row["count"],
                    total_marks=row["sum_marks"],
                )
                updated += 1
            except Exception as e:
                self.logger.warning(f"Failed to upsert trend for topic {row['topic_id']}: {e}")

        self._log_completion(updated)
        return self._success({"trends_updated": updated})
