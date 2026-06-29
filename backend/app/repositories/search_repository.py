"""Search Repository."""
from typing import Optional, List, Dict, Any
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from app.models.search_history import SearchHistory
from app.extensions import db
from app.repositories.base_repository import RepositoryError


class SearchRepository:

    def log_search(self, user_id: Optional[str], query_text: str, result_count: int,
                   subject_id: str = None, search_type: str = None, response_ms: int = None) -> SearchHistory:
        try:
            entry = SearchHistory(user_id=user_id, query_text=query_text, result_count=result_count,
                                  subject_id=subject_id, search_type=search_type, response_ms=response_ms)
            db.session.add(entry)
            db.session.commit()
            return entry
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"log_search failed: {e}") from e

    def get_user_recent_searches(self, user_id: str, limit: int = 10) -> List[SearchHistory]:
        return (SearchHistory.query.filter_by(user_id=user_id)
                .order_by(SearchHistory.created_at.desc()).limit(limit).all())

    def get_top_searched_topics(self, subject_id: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            q = db.session.query(SearchHistory.query_text, func.count(SearchHistory.id).label("count"))
            if subject_id:
                q = q.filter(SearchHistory.subject_id == subject_id)
            results = q.group_by(SearchHistory.query_text).order_by(func.count(SearchHistory.id).desc()).limit(limit).all()
            return [{"query": r.query_text, "count": r.count} for r in results]
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_top_searched_topics failed: {e}") from e
