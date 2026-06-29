"""
Ingestion Agent — validates file, saves to disk, creates Paper + ProcessingJob, enqueues Celery task.
"""
import os
import uuid
import logging
from typing import Dict, Any

from app.agents.base_agent import BaseAgent
from app.repositories.paper_repository import PaperRepository
from app.models.processing_job import ProcessingJob
from app.constants import ProcessingStatus, JobType, JobStatus
from app.extensions import db

logger = logging.getLogger(__name__)
ALLOWED_EXTENSIONS = {".pdf"}
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


class IngestionAgent(BaseAgent):
    def __init__(self):
        super().__init__("ingestion_agent")
        self._paper_repo = PaperRepository()

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        file_bytes: bytes = context.get("file_bytes")
        filename: str = context.get("filename", "paper.pdf")
        subject_id: str = context.get("subject_id")
        exam_year: int = context.get("exam_year")
        exam_month: str = context.get("exam_month")
        exam_type: str = context.get("exam_type")
        total_marks: int = context.get("total_marks")
        duration_minutes: int = context.get("duration_minutes")
        uploaded_by: str = context.get("uploaded_by_user_id")

        # 1. Validate
        if not file_bytes:
            return self._error("No file bytes provided.")
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return self._error(f"Invalid file type: {ext}. Only PDF is allowed.")
        if not file_bytes.startswith(b"%PDF"):
            return self._error("File does not appear to be a valid PDF (missing %PDF header).")
        if len(file_bytes) > MAX_SIZE_BYTES:
            return self._error(f"File too large: {len(file_bytes)} bytes. Max is {MAX_SIZE_BYTES} bytes.")

        # 2. Generate storage path
        from flask import current_app
        upload_dir = current_app.config.get("UPLOAD_DIR", "./uploads")
        safe_name = f"{uuid.uuid4().hex}_{os.path.basename(filename)}"
        dest_dir = os.path.join(upload_dir, subject_id or "unknown", str(exam_year or "unknown"))
        os.makedirs(dest_dir, exist_ok=True)
        file_path = os.path.join(dest_dir, safe_name)

        # 3. Write file to disk
        try:
            with open(file_path, "wb") as f:
                f.write(file_bytes)
        except IOError as e:
            return self._error(f"Failed to save file: {e}", e)

        paper = None
        job = None
        try:
            # 4. Create Paper record
            paper = self._paper_repo.create(
                subject_id=subject_id,
                exam_year=exam_year,
                exam_month=exam_month,
                exam_type=exam_type,
                total_marks=total_marks,
                duration_minutes=duration_minutes,
                file_name=filename,
                file_path=file_path,
                file_size_bytes=len(file_bytes),
                processing_status=ProcessingStatus.PENDING.value,
                uploaded_by=uploaded_by,
            )

            # 5. Create ProcessingJob
            job = ProcessingJob(
                job_type=JobType.PAPER_INGESTION.value,
                status=JobStatus.PENDING.value,
                paper_id=paper.id,
            )
            db.session.add(job)
            db.session.flush()

            # 6. Link job to paper
            paper.processing_job_id = job.id
            db.session.commit()

            # 7. Enqueue Celery task
            from app.tasks.paper_tasks import process_paper
            process_paper.delay(paper.id, job.id)
            self.logger.info(f"Enqueued process_paper task for paper_id={paper.id} job_id={job.id}")

        except Exception as e:
            db.session.rollback()
            # Clean up saved file on DB failure
            if os.path.exists(file_path):
                os.remove(file_path)
            if paper:
                try:
                    self._paper_repo.hard_delete(paper.id)
                except Exception:
                    pass
            return self._error(f"DB record creation failed: {e}", e)

        self._log_completion(1)
        context["paper_id"] = paper.id
        context["job_id"] = job.id
        return self._success({"paper_id": paper.id, "job_id": job.id, "status": "queued"})
