"""Paper processing Celery task."""
import logging
from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True, name="app.tasks.paper_tasks.process_paper",
             max_retries=2, default_retry_delay=60, queue="paper_processing")
def process_paper(self, paper_id: str, job_id: str):
    """
    Full paper processing pipeline task.
    Runs inside Flask app context (via ContextTask).
    """
    logger.info(f"process_paper started: paper_id={paper_id} job_id={job_id} attempt={self.request.retries + 1}")
    try:
        from app.agents.orchestrator import run_paper_pipeline
        result = run_paper_pipeline(paper_id, job_id)
        if result.get("status") == "failed":
            logger.error(f"process_paper failed at stage '{result.get('stage')}': {result.get('error')}")
        return result
    except Exception as exc:
        logger.error(f"process_paper task exception: {exc}", exc_info=True)
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            from app.models.processing_job import ProcessingJob
            from app.models.paper import Paper
            from app.constants import JobStatus, ProcessingStatus
            from app.extensions import db
            job = ProcessingJob.query.get(job_id)
            paper = Paper.query.get(paper_id)
            if job:
                job.status = JobStatus.FAILED.value
                job.error_message = str(exc)
            if paper:
                paper.processing_status = ProcessingStatus.FAILED.value
            db.session.commit()
            return {"status": "failed", "error": str(exc), "retries_exhausted": True}
