"""Question Service."""
from typing import Dict, Any, Optional, List
from app.repositories.question_repository import QuestionRepository
from app.models.bookmark import Bookmark
from app.extensions import db

question_repo = QuestionRepository()


class QuestionService:

    def get_questions(self, paper_id: str, page: int = 1, per_page: int = 50,
                      filters: Dict = None) -> Dict:
        items, total = question_repo.get_by_paper(paper_id, page=page, per_page=per_page, filters=filters or {})
        return {"questions": [self._q_dict(q) for q in items], "total": total, "page": page, "per_page": per_page}

    def get_question(self, question_id: str) -> Optional[Dict]:
        q = question_repo.get_by_id(question_id)
        return self._q_dict(q) if q else None

    def bookmark(self, user_id: str, entity_type: str, entity_id: str, note: str = None) -> Dict:
        existing = Bookmark.query.filter_by(user_id=user_id, entity_type=entity_type, entity_id=entity_id).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return {"action": "removed"}
        bookmark = Bookmark(user_id=user_id, entity_type=entity_type, entity_id=entity_id, note=note)
        db.session.add(bookmark)
        db.session.commit()
        return {"action": "added", "id": bookmark.id}

    def get_bookmarks(self, user_id: str, entity_type: str = None, page: int = 1, per_page: int = 20) -> Dict:
        q = Bookmark.query.filter_by(user_id=user_id)
        if entity_type:
            q = q.filter_by(entity_type=entity_type)
        paginated = q.order_by(Bookmark.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        return {"bookmarks": [{"id": b.id, "entity_type": b.entity_type, "entity_id": b.entity_id, "note": b.note,
                               "created_at": b.created_at.isoformat()} for b in paginated.items],
                "total": paginated.total, "page": page, "per_page": per_page}

    def _q_dict(self, q) -> Dict:
        return {
            "id": q.id, "paper_id": q.paper_id, "subject_id": q.subject_id, "unit_id": q.unit_id,
            "topic_id": q.topic_id, "cluster_id": q.cluster_id, "question_text": q.question_text,
            "question_number": q.question_number, "marks": float(q.marks) if q.marks else None,
            "difficulty": q.difficulty, "difficulty_confidence": float(q.difficulty_confidence) if q.difficulty_confidence else None,
            "exam_year": q.exam_year, "question_type": q.question_type,
            "is_repeated": q.is_repeated, "repeat_count": q.repeat_count,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
