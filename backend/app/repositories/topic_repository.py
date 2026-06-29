"""Topic Repository."""
import difflib
from typing import Optional, List, Tuple
from sqlalchemy.exc import SQLAlchemyError
from app.models.topic import Topic
from app.extensions import db
from app.repositories.base_repository import BaseRepository, RepositoryError


class TopicRepository(BaseRepository[Topic]):
    model = Topic

    def get_by_unit(self, unit_id: str) -> List[Topic]:
        try:
            return Topic.query.filter_by(unit_id=unit_id, is_deleted=False).all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_unit failed: {e}") from e

    def get_by_subject(self, subject_id: str) -> List[Topic]:
        try:
            return Topic.query.filter_by(subject_id=subject_id, is_deleted=False).all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_subject failed: {e}") from e

    def search_by_name(self, subject_id: str, name: str, threshold: float = 0.85) -> Optional[Topic]:
        """Fuzzy-match a topic name within a subject using difflib."""
        try:
            topics = self.get_by_subject(subject_id)
            best_match = None
            best_ratio = 0.0
            for topic in topics:
                ratio = difflib.SequenceMatcher(None, name.lower(), topic.name.lower()).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = topic
            if best_ratio >= threshold:
                return best_match
            return None
        except SQLAlchemyError as e:
            raise RepositoryError(f"search_by_name failed: {e}") from e

    def get_or_create(self, unit_id: str, subject_id: str, name: str) -> Tuple[Topic, bool]:
        """Return (topic, created). If similar topic exists, return it; else create."""
        existing = self.search_by_name(subject_id, name)
        if existing:
            return existing, False
        try:
            topic = Topic(unit_id=unit_id, subject_id=subject_id, name=name)
            db.session.add(topic)
            db.session.commit()
            return topic, True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"get_or_create failed: {e}") from e
