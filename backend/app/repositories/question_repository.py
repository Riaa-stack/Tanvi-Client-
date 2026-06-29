"""Question Repository."""
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError
from app.models.question import Question
from app.models.paper import Paper
from app.extensions import db
from app.repositories.base_repository import BaseRepository, RepositoryError


class QuestionRepository(BaseRepository[Question]):
    model = Question

    def get_by_paper(self, paper_id: str, page: int = 1, per_page: int = 50,
                     filters: Dict[str, Any] = None) -> Tuple[List[Question], int]:
        try:
            q = Question.query.filter_by(paper_id=paper_id, is_deleted=False)
            if filters:
                if filters.get("unit_id"):
                    q = q.filter(Question.unit_id == filters["unit_id"])
                if filters.get("topic_id"):
                    q = q.filter(Question.topic_id == filters["topic_id"])
                if filters.get("difficulty"):
                    q = q.filter(Question.difficulty == filters["difficulty"])
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_paper failed: {e}") from e

    def get_by_topic(self, topic_id: str, page: int = 1, per_page: int = 20) -> Tuple[List[Question], int]:
        try:
            q = Question.query.filter_by(topic_id=topic_id, is_deleted=False).order_by(Question.exam_year.desc())
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_topic failed: {e}") from e

    def get_by_unit(self, unit_id: str, page: int = 1, per_page: int = 20) -> Tuple[List[Question], int]:
        try:
            q = Question.query.filter_by(unit_id=unit_id, is_deleted=False).order_by(Question.exam_year.desc())
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_unit failed: {e}") from e

    def get_unembedded_questions(self, subject_id: str) -> List[Question]:
        """Return questions for a subject that have no embedding yet."""
        try:
            from app.models.question_embedding import QuestionEmbedding
            return (Question.query
                    .outerjoin(QuestionEmbedding, Question.id == QuestionEmbedding.question_id)
                    .filter(Question.subject_id == subject_id, Question.is_deleted == False,
                            QuestionEmbedding.id == None)
                    .all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_unembedded_questions failed: {e}") from e

    def bulk_update_topic_mapping(self, question_ids: List[str], unit_id: str, topic_id: str) -> int:
        try:
            count = (Question.query.filter(Question.id.in_(question_ids))
                     .update({"unit_id": unit_id, "topic_id": topic_id}, synchronize_session="fetch"))
            db.session.commit()
            return count
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"bulk_update_topic_mapping failed: {e}") from e

    def get_questions_for_clustering(self, subject_id: str) -> List[Question]:
        try:
            return (Question.query
                    .filter_by(subject_id=subject_id, is_deleted=False)
                    .filter(Question.topic_id.isnot(None))
                    .all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_questions_for_clustering failed: {e}") from e

    def update_cluster_assignment(self, question_id: str, cluster_id: str,
                                  is_repeated: bool, repeat_count: int) -> None:
        try:
            Question.query.filter_by(id=question_id).update({
                "cluster_id": cluster_id,
                "is_repeated": is_repeated,
                "repeat_count": repeat_count,
            })
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"update_cluster_assignment failed: {e}") from e

    def get_trend_data_for_subject(self, subject_id: str) -> List[Dict[str, Any]]:
        """Return {topic_id, exam_year, count, sum_marks} grouped by topic and year."""
        try:
            rows = (db.session.query(
                Question.topic_id,
                Question.exam_year,
                func.count(Question.id).label("count"),
                func.sum(Question.marks).label("sum_marks"),
            )
            .filter(Question.subject_id == subject_id, Question.is_deleted == False,
                    Question.topic_id.isnot(None), Question.exam_year.isnot(None))
            .group_by(Question.topic_id, Question.exam_year)
            .all())
            return [{"topic_id": r.topic_id, "exam_year": r.exam_year,
                     "count": r.count, "sum_marks": float(r.sum_marks or 0)} for r in rows]
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_trend_data_for_subject failed: {e}") from e

    def keyword_search(self, query: str, subject_id: str = None, page: int = 1, per_page: int = 20) -> Tuple[List[Question], int]:
        try:
            q = Question.query.filter(
                Question.question_text.ilike(f"%{query}%"),
                Question.is_deleted == False
            )
            if subject_id:
                q = q.filter(Question.subject_id == subject_id)
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"keyword_search failed: {e}") from e
