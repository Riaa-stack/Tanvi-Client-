"""Syllabus Mapping Agent — Maps AI-classified topic names to DB unit/topic records."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.repositories.topic_repository import TopicRepository
from app.repositories.unit_repository import UnitRepository

logger = logging.getLogger(__name__)


class SyllabusMappingAgent(BaseAgent):
    def __init__(self):
        super().__init__("syllabus_mapping_agent")
        self._topic_repo = TopicRepository()
        self._unit_repo = UnitRepository()

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        question_ids: List[str] = context.get("question_ids", [])

        if not question_ids or not subject_id:
            return self._error("question_ids and subject_id are required.")

        from app.models.question import Question
        from app.extensions import db

        questions = Question.query.filter(
            Question.id.in_(question_ids),
            Question.ai_classification_raw.isnot(None),
            Question.is_deleted == False,
        ).all()

        mapped = 0
        for question in questions:
            raw = question.ai_classification_raw or {}
            topic_name = raw.get("topic_name", "").strip()
            unit_number = raw.get("unit_number")
            if not topic_name:
                continue

            # Find matching topic via fuzzy search
            topic = self._topic_repo.search_by_name(subject_id, topic_name, threshold=0.75)
            if not topic:
                # Try to find the unit by number and create topic
                unit = None
                if unit_number:
                    unit = self._unit_repo.get_by_subject_and_number(subject_id, int(unit_number))
                if unit:
                    topic, _ = self._topic_repo.get_or_create(unit.id, subject_id, topic_name)

            if topic:
                question.topic_id = topic.id
                question.unit_id = topic.unit_id
                mapped += 1

        db.session.commit()

        context["syllabus_mapped"] = mapped
        self._log_completion(mapped)
        return self._success({"mapped_count": mapped, "total": len(questions)})
