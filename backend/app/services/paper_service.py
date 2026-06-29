"""Paper Service."""
import logging
from typing import Dict, Any, Optional

from app.agents.ingestion_agent import IngestionAgent
from app.repositories.paper_repository import PaperRepository
from app.models.processing_job import ProcessingJob

logger = logging.getLogger(__name__)
paper_repo = PaperRepository()


class PaperService:

    def upload_paper(self, file_bytes: bytes, filename: str, subject_id: str, exam_year: int,
                     exam_type: str, total_marks: int = None, duration_minutes: int = None,
                     exam_month: str = None, uploaded_by: str = None) -> Dict:
        context = {
            "file_bytes": file_bytes, "filename": filename, "subject_id": subject_id,
            "exam_year": exam_year, "exam_type": exam_type, "total_marks": total_marks,
            "duration_minutes": duration_minutes, "exam_month": exam_month,
            "uploaded_by_user_id": uploaded_by,
        }
        result = IngestionAgent().run(context)
        if result.get("status") == "error":
            raise ValueError(result.get("message", "Upload failed."))
        return result["data"]

    def get_papers(self, subject_id: str, page: int = 1, per_page: int = 20,
                   filters: Dict = None) -> Dict:
        items, total = paper_repo.get_by_subject(subject_id, page=page, per_page=per_page, filters=filters or {})
        return {
            "papers": [self._paper_dict(p) for p in items],
            "total": total, "page": page, "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }

    def get_paper(self, paper_id: str) -> Optional[Dict]:
        paper = paper_repo.get_by_id(paper_id)
        return self._paper_dict(paper) if paper else None

    def delete_paper(self, paper_id: str) -> bool:
        return paper_repo.soft_delete(paper_id)

    def get_job_status(self, job_id: str) -> Optional[Dict]:
        job = ProcessingJob.query.get(job_id)
        if not job:
            return None
        return {
            "id": job.id, "status": job.status, "job_type": job.job_type,
            "paper_id": job.paper_id, "error_message": job.error_message,
            "stages_completed": job.stages_completed or [],
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "created_at": job.created_at.isoformat(),
        }

    def reprocess_paper(self, paper_id: str) -> Dict:
        from app.models.paper import Paper
        from app.models.processing_job import ProcessingJob
        from app.constants import ProcessingStatus, JobType, JobStatus
        from app.extensions import db
        from app.tasks.paper_tasks import process_paper

        paper = Paper.query.get(paper_id)
        if not paper:
            raise ValueError("Paper not found.")

        job = ProcessingJob(job_type=JobType.PAPER_INGESTION.value, status=JobStatus.PENDING.value, paper_id=paper_id)
        db.session.add(job)
        db.session.flush()
        paper.processing_status = ProcessingStatus.PENDING.value
        paper.processing_job_id = job.id
        db.session.commit()

        process_paper.delay(paper_id, job.id)
        return {"paper_id": paper_id, "job_id": job.id, "status": "queued"}

    def _paper_dict(self, paper) -> Dict:
        return {
            "id": paper.id, "subject_id": paper.subject_id, "semester_id": paper.semester_id,
            "exam_year": paper.exam_year, "exam_month": paper.exam_month, "exam_type": paper.exam_type,
            "total_marks": paper.total_marks, "duration_minutes": paper.duration_minutes,
            "file_name": paper.file_name, "file_size_bytes": paper.file_size_bytes,
            "page_count": paper.page_count, "processing_status": paper.processing_status,
            "processing_job_id": paper.processing_job_id,
            "created_at": paper.created_at.isoformat() if paper.created_at else None,
        }
