"""Recommendation Agent — Generates personalized recommendations from student activity."""
import logging
from typing import Dict, Any

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class RecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__("recommendation_agent")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        user_id: str = context.get("user_id")
        subject_id: str = context.get("subject_id")

        if not user_id:
            return self._error("user_id required.")

        from app.models.student_activity import StudentActivity
        from app.models.recommendation import Recommendation
        from app.models.probability_score import ProbabilityScore
        from app.extensions import db
        from sqlalchemy import func

        # Get user's most viewed topics
        viewed_topics = (db.session.query(StudentActivity.entity_id, func.count().label("cnt"))
                         .filter_by(user_id=user_id, entity_type="topic")
                         .group_by(StudentActivity.entity_id)
                         .order_by(func.count().desc())
                         .limit(5).all())

        viewed_topic_ids = {r.entity_id for r in viewed_topics}

        # Get high probability topics the user hasn't viewed
        q = ProbabilityScore.query.filter(
            ProbabilityScore.probability >= 0.6,
            ProbabilityScore.topic_id.notin_(viewed_topic_ids),
        )
        if subject_id:
            q = q.filter_by(subject_id=subject_id)
        high_prob_topics = q.order_by(ProbabilityScore.probability.desc()).limit(10).all()

        created = 0
        for score in high_prob_topics:
            existing = Recommendation.query.filter_by(
                user_id=user_id, entity_type="topic", entity_id=score.topic_id
            ).first()
            if not existing:
                rec = Recommendation(
                    user_id=user_id,
                    recommendation_type="topic",
                    entity_type="topic",
                    entity_id=score.topic_id,
                    score=score.probability,
                    rationale=f"High exam probability ({float(score.probability)*100:.0f}%) based on historical trends.",
                )
                db.session.add(rec)
                created += 1

        db.session.commit()
        self._log_completion(created)
        return self._success({"recommendations_created": created})
