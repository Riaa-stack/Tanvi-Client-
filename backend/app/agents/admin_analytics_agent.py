"""Admin Analytics Agent — Dashboard aggregation."""
import logging
from typing import Dict, Any

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class AdminAnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__("admin_analytics_agent")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        from app.models.user import User
        from app.models.subject import Subject
        from app.models.paper import Paper
        from app.models.question import Question
        from app.models.processing_job import ProcessingJob
        from app.constants import ProcessingStatus, JobStatus

        data = {
            "total_users": User.query.filter_by(is_deleted=False).count(),
            "total_subjects": Subject.query.filter_by(is_deleted=False).count(),
            "total_papers": Paper.query.filter_by(is_deleted=False).count(),
            "total_questions": Question.query.filter_by(is_deleted=False).count(),
            "papers_pending": Paper.query.filter_by(processing_status=ProcessingStatus.PENDING.value, is_deleted=False).count(),
            "papers_completed": Paper.query.filter_by(processing_status=ProcessingStatus.COMPLETED.value, is_deleted=False).count(),
            "jobs_failed": ProcessingJob.query.filter_by(status=JobStatus.FAILED.value).count(),
        }
        self._log_completion(1)
        return self._success(data)
