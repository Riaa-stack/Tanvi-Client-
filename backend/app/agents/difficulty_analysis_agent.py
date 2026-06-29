"""Difficulty Analysis Agent — LLM classifies each question difficulty."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.ai.llm_client import LLMClient
from app.ai.prompt_templates import DIFFICULTY_ANALYSIS_PROMPT

logger = logging.getLogger(__name__)


class DifficultyAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("difficulty_analysis_agent")
        self._llm = LLMClient(temperature=0.0, max_tokens=100)

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        question_ids: List[str] = context.get("question_ids", [])
        if not question_ids:
            return self._error("question_ids required.")

        from app.models.question import Question
        from app.extensions import db

        questions = Question.query.filter(
            Question.id.in_(question_ids), Question.is_deleted == False
        ).all()

        classified = 0
        for question in questions:
            try:
                messages = DIFFICULTY_ANALYSIS_PROMPT.format_messages(
                    question_text=question.question_text,
                    marks=float(question.marks) if question.marks else 0,
                    question_type=question.question_type or "unknown",
                )
                result: Dict = self._llm.invoke_with_retry(messages, max_retries=2, parse_json=True)
                if isinstance(result, dict):
                    diff = result.get("difficulty", "medium").lower()
                    conf = float(result.get("confidence", 0.7))
                    if diff in ("easy", "medium", "hard"):
                        question.difficulty = diff
                        question.difficulty_confidence = conf
                        classified += 1
            except Exception as e:
                self.logger.warning(f"Difficulty classification failed for {question.id}: {e}")

        db.session.commit()
        self._log_completion(classified)
        return self._success({"classified_count": classified, "total": len(questions)})
