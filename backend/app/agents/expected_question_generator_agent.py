"""Expected Question Generator Agent — LLM generates AI practice questions with disclaimer."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.ai.llm_client import LLMClient
from app.ai.prompt_templates import EXPECTED_QUESTION_GENERATION_PROMPT
from app.constants import AI_DISCLAIMER
from app.repositories.prediction_repository import PredictionRepository

logger = logging.getLogger(__name__)


class ExpectedQuestionGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__("expected_question_generator_agent")
        self._llm = LLMClient(temperature=0.4, max_tokens=3000)
        self._prediction_repo = PredictionRepository()

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        unit_id: str = context.get("unit_id")
        topic_id: str = context.get("topic_id")
        count: int = int(context.get("count", 5))
        difficulty: str = context.get("difficulty", "medium")
        marks: int = int(context.get("marks", 10))
        batch_id: str = context.get("batch_id")

        if not topic_id or not subject_id:
            return self._error("topic_id and subject_id required.")

        from app.models.topic import Topic
        from app.models.unit import Unit
        from app.models.subject import Subject

        topic = Topic.query.get(topic_id)
        unit = Unit.query.get(unit_id) if unit_id else (Unit.query.get(topic.unit_id) if topic else None)
        subject = Subject.query.get(subject_id)

        if not topic or not subject:
            return self._error("Topic or Subject not found.")

        messages = EXPECTED_QUESTION_GENERATION_PROMPT.format_messages(
            topic_name=topic.name, unit_title=unit.title if unit else "General",
            subject_name=subject.name, count=count, difficulty=difficulty, marks=marks,
        )

        try:
            generated = self._llm.invoke_with_retry(messages, max_retries=2, parse_json=True)
        except Exception as e:
            return self._error(f"LLM generation failed: {e}", e)

        if not isinstance(generated, list):
            return self._error("LLM returned non-list response for question generation.")

        # Deactivate old predictions for this subject
        self._prediction_repo.deactivate_old_predictions(subject_id)

        questions_to_save = []
        for q in generated:
            if not isinstance(q, dict) or not q.get("question"):
                continue
            questions_to_save.append({
                "topic_id": topic_id,
                "subject_id": subject_id,
                "unit_id": unit.id if unit else topic.unit_id,
                "question_text": q["question"],
                "marks_estimated": q.get("estimated_marks", marks),
                "difficulty_estimated": q.get("difficulty", difficulty),
                "is_ai_generated": True,
                "ai_disclaimer": q.get("disclaimer", AI_DISCLAIMER),
                "model_used": self._llm.DEFAULT_MODEL,
                "generation_batch_id": batch_id,
            })

        saved = self._prediction_repo.create_predicted_questions_batch(questions_to_save)
        self._log_completion(len(saved))
        return self._success({"questions_generated": len(saved)})
