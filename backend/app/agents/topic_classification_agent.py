"""Topic Classification Agent — LLM classifies each question to a syllabus topic."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.ai.llm_client import LLMClient
from app.ai.prompt_templates import TOPIC_CLASSIFICATION_PROMPT

logger = logging.getLogger(__name__)


class TopicClassificationAgent(BaseAgent):
    def __init__(self):
        super().__init__("topic_classification_agent")
        self._llm = LLMClient(model="anthropic/claude-3-haiku", temperature=0.0, max_tokens=500)

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        paper_id: str = context.get("paper_id")
        subject_id: str = context.get("subject_id")
        question_ids: List[str] = context.get("question_ids", [])

        if not question_ids or not subject_id:
            return self._error("question_ids and subject_id are required.")

        # Build syllabus JSON for the subject
        syllabus_json = self._build_syllabus_json(subject_id)
        if not syllabus_json:
            return self._error("No syllabus (units/topics) found for subject. Upload syllabus first.")

        from app.models.question import Question
        questions = Question.query.filter(Question.id.in_(question_ids), Question.is_deleted == False).all()

        classified = 0
        for question in questions:
            try:
                messages = TOPIC_CLASSIFICATION_PROMPT.format_messages(
                    question_text=question.question_text,
                    marks=float(question.marks) if question.marks else 0,
                    syllabus_json=syllabus_json,
                )
                result: Dict = self._llm.invoke_with_retry(messages, max_retries=2, parse_json=True)
                if isinstance(result, dict) and result.get("topic_name"):
                    question.ai_classification_raw = result
                    classified += 1
            except Exception as e:
                self.logger.warning(f"Classification failed for question {question.id}: {e}")

        from app.extensions import db
        db.session.commit()

        context["classifications_done"] = classified
        self._log_completion(classified)
        return self._success({"classified_count": classified, "total": len(questions)})

    def _build_syllabus_json(self, subject_id: str) -> str:
        import json
        from app.models.unit import Unit
        from app.models.topic import Topic

        units = Unit.query.filter_by(subject_id=subject_id, is_deleted=False).order_by(Unit.unit_number).all()
        syllabus = []
        for unit in units:
            topics = Topic.query.filter_by(unit_id=unit.id, is_deleted=False).all()
            syllabus.append({
                "unit_number": unit.unit_number,
                "unit_title": unit.title,
                "topics": [t.name for t in topics],
            })
        return json.dumps(syllabus, indent=2)
