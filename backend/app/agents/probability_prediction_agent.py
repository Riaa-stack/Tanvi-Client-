"""Probability Prediction Agent — LLM predicts exam appearance probability per topic."""
import json
import logging
from typing import Dict, Any

from app.agents.base_agent import BaseAgent
from app.ai.llm_client import LLMClient
from app.ai.prompt_templates import PROBABILITY_PREDICTION_PROMPT
from app.repositories.analytics_repository import AnalyticsRepository

logger = logging.getLogger(__name__)


class ProbabilityPredictionAgent(BaseAgent):
    def __init__(self):
        super().__init__("probability_prediction_agent")
        self._llm = LLMClient(temperature=0.1, max_tokens=2000)
        self._analytics_repo = AnalyticsRepository()

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        if not subject_id:
            return self._error("subject_id required.")

        from app.models.subject import Subject
        subject = Subject.query.get(subject_id)
        if not subject:
            return self._error(f"Subject {subject_id} not found.")

        # Build trend JSON for LLM context
        trends = self._analytics_repo.get_topic_trends_for_subject(subject_id, years=6)
        if not trends:
            return self._success({"predictions_created": 0, "message": "No trend data available."})

        from app.models.topic import Topic
        trend_json = json.dumps([{
            "topic_id": t.topic_id,
            "topic_name": Topic.query.get(t.topic_id).name if Topic.query.get(t.topic_id) else "Unknown",
            "exam_year": t.exam_year,
            "question_count": t.question_count,
            "total_marks": float(t.total_marks),
        } for t in trends], indent=2)

        messages = PROBABILITY_PREDICTION_PROMPT.format_messages(
            subject_name=subject.name,
            trend_json=trend_json,
        )

        try:
            predictions = self._llm.invoke_with_retry(messages, max_retries=2, parse_json=True)
        except Exception as e:
            return self._error(f"LLM prediction failed: {e}", e)

        if not isinstance(predictions, list):
            return self._error("LLM returned non-list prediction response.")

        saved = 0
        for pred in predictions:
            topic_id = pred.get("topic_id")
            probability = float(pred.get("probability", 0))
            rationale = pred.get("rationale", "")
            factors = pred.get("factors", [])
            if not topic_id or not (0 <= probability <= 1):
                continue
            try:
                self._analytics_repo.upsert_probability_score(
                    topic_id=topic_id, subject_id=subject_id,
                    probability=probability, confidence=0.7,
                    rationale=rationale, factors={"factors": factors},
                    model_version=self._llm.DEFAULT_MODEL,
                )
                saved += 1
            except Exception as e:
                self.logger.warning(f"Failed to save prediction for topic {topic_id}: {e}")

        self._log_completion(saved)
        return self._success({"predictions_created": saved})
