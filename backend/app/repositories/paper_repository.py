"""Paper Repository."""
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.exc import SQLAlchemyError
from app.models.paper import Paper
from app.extensions import db
from app.repositories.base_repository import BaseRepository, RepositoryError


class PaperRepository(BaseRepository[Paper]):
    model = Paper

    def get_by_subject(self, subject_id: str, page: int = 1, per_page: int = 20,
                       filters: Dict[str, Any] = None) -> Tuple[List[Paper], int]:
        try:
            q = Paper.query.filter_by(subject_id=subject_id, is_deleted=False)
            if filters:
                if filters.get("exam_year"):
                    q = q.filter(Paper.exam_year == filters["exam_year"])
                if filters.get("exam_type"):
                    q = q.filter(Paper.exam_type == filters["exam_type"])
                if filters.get("processing_status"):
                    q = q.filter(Paper.processing_status == filters["processing_status"])
            q = q.order_by(Paper.exam_year.desc())
            paginated = q.paginate(page=page, per_page=per_page, error_out=False)
            return paginated.items, paginated.total
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_subject failed: {e}") from e

    def update_processing_status(self, paper_id: str, status: str, job_id: str = None) -> None:
        try:
            updates = {"processing_status": status}
            if job_id:
                updates["processing_job_id"] = job_id
            Paper.query.filter_by(id=paper_id).update(updates)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise RepositoryError(f"update_processing_status failed: {e}") from e

    def get_by_subject_year_type(self, subject_id: str, year: int, exam_type: str) -> Optional[Paper]:
        try:
            return Paper.query.filter_by(
                subject_id=subject_id, exam_year=year, exam_type=exam_type, is_deleted=False
            ).first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_by_subject_year_type failed: {e}") from e

    def get_papers_for_subject_ordered(self, subject_id: str) -> List[Paper]:
        try:
            return (Paper.query.filter_by(subject_id=subject_id, is_deleted=False)
                    .order_by(Paper.exam_year.desc()).all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"get_papers_for_subject_ordered failed: {e}") from e
