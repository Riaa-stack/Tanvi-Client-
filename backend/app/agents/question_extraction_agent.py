"""Question Extraction Agent — Parse raw text into discrete question objects using LLM."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.ai.llm_client import LLMClient
from app.ai.prompt_templates import QUESTION_EXTRACTION_PROMPT
from app.constants import ProcessingStatus

logger = logging.getLogger(__name__)


class QuestionExtractionAgent(BaseAgent):
    def __init__(self):
        super().__init__("question_extraction_agent")
        self._llm = LLMClient(model="mistralai/mistral-7b-instruct", temperature=0.0, max_tokens=4000)

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        paper_id: str = context.get("paper_id")
        raw_text: str = context.get("raw_text", "")
        total_marks: int = context.get("total_marks") or 100
        exam_type: str = context.get("exam_type", "ESE")

        if not raw_text.strip():
            return self._error("raw_text is empty — cannot extract questions.")

        # Truncate to avoid token limits (~12k chars)
        raw_text_trimmed = raw_text[:12000]

        messages = QUESTION_EXTRACTION_PROMPT.format_messages(
            raw_text=raw_text_trimmed,
            exam_type=exam_type,
            total_marks=total_marks,
        )

        try:
            extracted: List[Dict] = self._llm.invoke_with_retry(messages, max_retries=3, parse_json=True)
        except Exception as e:
            return self._error(f"LLM extraction failed: {e}", e)

        if not isinstance(extracted, list):
            return self._error(f"LLM returned non-list response: {type(extracted)}")

        # Normalize fields
        questions = []
        for item in extracted:
            if not isinstance(item, dict):
                continue
            text = item.get("text", "").strip()
            if not text:
                continue
            questions.append({
                "question_text": text,
                "question_number": str(item.get("number", "")),
                "marks": item.get("marks"),
                "question_part": item.get("part", ""),
            })

        # Persist questions to DB
        if paper_id and questions:
            self._save_questions(paper_id, questions, context)

        self._log_completion(len(questions))
        context["extracted_questions"] = questions
        return self._success({"question_count": len(questions), "questions": questions})

    def _save_questions(self, paper_id: str, questions: List[Dict], context: Dict):
        from app.models.question import Question
        from app.models.paper import Paper
        from app.extensions import db
        from app.constants import ProcessingStatus

        paper = Paper.query.get(paper_id)
        if not paper:
            return

        created = []
        for q in questions:
            question = Question(
                paper_id=paper_id,
                subject_id=paper.subject_id,
                question_text=q["question_text"],
                question_number=q.get("question_number"),
                marks=q.get("marks"),
                exam_year=paper.exam_year,
            )
            db.session.add(question)
            created.append(question)

        paper.processing_status = ProcessingStatus.EXTRACTION_COMPLETE.value
        db.session.commit()

        # Store IDs in context for downstream agents
        context["question_ids"] = [q.id for q in created]
        self.logger.info(f"Saved {len(created)} questions for paper_id={paper_id}")
