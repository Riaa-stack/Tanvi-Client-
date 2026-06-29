"""Dependency Graph Agent — LLM infers topic prerequisite edges."""
import json
import logging
from typing import Dict, Any

from app.agents.base_agent import BaseAgent
from app.ai.llm_client import LLMClient
from app.ai.prompt_templates import DEPENDENCY_GRAPH_PROMPT

logger = logging.getLogger(__name__)


class DependencyGraphAgent(BaseAgent):
    def __init__(self):
        super().__init__("dependency_graph_agent")
        self._llm = LLMClient(temperature=0.0, max_tokens=2000)

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        if not subject_id:
            return self._error("subject_id required.")

        from app.models.topic import Topic
        from app.models.subject import Subject
        from app.models.dependency_graph import DependencyGraphEdge
        from app.extensions import db

        subject = Subject.query.get(subject_id)
        if not subject:
            return self._error(f"Subject {subject_id} not found.")

        topics = Topic.query.filter_by(subject_id=subject_id, is_deleted=False).all()
        if len(topics) < 2:
            return self._success({"edges_created": 0, "message": "Not enough topics."})

        topic_map = {t.name: t for t in topics}
        topics_list = "\n".join([f"- {t.name}" for t in topics])

        messages = DEPENDENCY_GRAPH_PROMPT.format_messages(
            subject_name=subject.name, topics_list=topics_list
        )

        try:
            relationships = self._llm.invoke_with_retry(messages, max_retries=2, parse_json=True)
        except Exception as e:
            return self._error(f"LLM dependency graph generation failed: {e}", e)

        if not isinstance(relationships, list):
            return self._error("LLM returned non-list for dependency graph.")

        # Clear existing edges for this subject
        DependencyGraphEdge.query.filter_by(subject_id=subject_id).delete()
        db.session.flush()

        edges_created = 0
        for item in relationships:
            topic_name = item.get("topic", "")
            prereqs = item.get("prerequisites", [])
            to_topic = topic_map.get(topic_name)
            if not to_topic:
                continue
            for prereq_name in prereqs:
                from_topic = topic_map.get(prereq_name)
                if not from_topic or from_topic.id == to_topic.id:
                    continue
                edge = DependencyGraphEdge(
                    from_topic_id=from_topic.id,
                    to_topic_id=to_topic.id,
                    subject_id=subject_id,
                    strength=0.85,
                    rationale=f"{from_topic.name} is a prerequisite of {to_topic.name}",
                )
                db.session.add(edge)
                edges_created += 1

        db.session.commit()
        self._log_completion(edges_created)
        return self._success({"edges_created": edges_created})
