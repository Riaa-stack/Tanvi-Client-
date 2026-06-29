"""
Orchestrator — Chains all agents for the full paper processing pipeline.
Called by the Celery task after ingestion.
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def run_paper_pipeline(paper_id: str, job_id: str) -> Dict[str, Any]:
    """
    Full paper processing pipeline:
    OCR → Extraction → Classification → Mapping → Embedding → Difficulty → Trends → Cluster
    Updates the ProcessingJob status at each stage.
    """
    from app.models.paper import Paper
    from app.models.processing_job import ProcessingJob
    from app.constants import JobStatus, ProcessingStatus
    from app.extensions import db

    paper = Paper.query.get(paper_id)
    if not paper:
        logger.error(f"Orchestrator: Paper {paper_id} not found.")
        return {"status": "error", "message": "Paper not found"}

    job = ProcessingJob.query.get(job_id)
    if job:
        job.status = JobStatus.RUNNING.value
        from sqlalchemy.sql import func
        job.started_at = func.now()
        db.session.commit()

    context = {
        "paper_id": paper_id,
        "file_path": paper.file_path,
        "subject_id": paper.subject_id,
        "exam_year": paper.exam_year,
        "exam_type": paper.exam_type,
        "total_marks": paper.total_marks,
    }

    stages_completed = []
    stages = [
        ("ocr", _run_stage("ocr_agent", "app.agents.ocr_agent", "OCRAgent")),
        ("extraction", _run_stage("question_extraction_agent", "app.agents.question_extraction_agent", "QuestionExtractionAgent")),
        ("classification", _run_stage("topic_classification_agent", "app.agents.topic_classification_agent", "TopicClassificationAgent")),
        ("syllabus_mapping", _run_stage("syllabus_mapping_agent", "app.agents.syllabus_mapping_agent", "SyllabusMappingAgent")),
        ("embedding", _run_stage("embedding_agent", "app.agents.embedding_agent", "EmbeddingAgent")),
        ("difficulty", _run_stage("difficulty_analysis_agent", "app.agents.difficulty_analysis_agent", "DifficultyAnalysisAgent")),
        ("trends", _run_stage("trend_analysis_agent", "app.agents.trend_analysis_agent", "TrendAnalysisAgent")),
        ("clustering", _run_stage("question_clustering_agent", "app.agents.question_clustering_agent", "QuestionClusteringAgent")),
    ]

    for stage_name, agent_cls in stages:
        try:
            result = agent_cls().run(context)
            if result.get("status") == "error":
                logger.error(f"Orchestrator: Stage '{stage_name}' failed: {result.get('message')}")
                _mark_job_failed(job, paper, result.get("message", "Unknown error"), stages_completed, db)
                return {"status": "failed", "stage": stage_name, "stages_completed": stages_completed}
            stages_completed.append(stage_name)
            if job:
                job.stages_completed = stages_completed
                db.session.commit()
            logger.info(f"Orchestrator: Stage '{stage_name}' complete.")
        except Exception as e:
            logger.error(f"Orchestrator: Stage '{stage_name}' raised exception: {e}", exc_info=True)
            _mark_job_failed(job, paper, str(e), stages_completed, db)
            return {"status": "failed", "stage": stage_name, "error": str(e)}

    # Success
    if job:
        job.status = JobStatus.COMPLETED.value
        from sqlalchemy.sql import func
        job.completed_at = func.now()
        job.stages_completed = stages_completed
    paper.processing_status = ProcessingStatus.COMPLETED.value
    db.session.commit()

    logger.info(f"Orchestrator: Paper {paper_id} processed successfully. {len(stages_completed)} stages completed.")
    return {"status": "completed", "paper_id": paper_id, "stages_completed": stages_completed}


def _run_stage(name: str, module_path: str, class_name: str):
    """Lazy import agent class to avoid circular imports at module load time."""
    import importlib
    module = importlib.import_module(module_path)
    return getattr(module, class_name)


def _mark_job_failed(job, paper, message: str, stages: list, db):
    from app.constants import JobStatus, ProcessingStatus
    if job:
        job.status = JobStatus.FAILED.value
        job.error_message = message
        job.stages_completed = stages
    if paper:
        paper.processing_status = ProcessingStatus.FAILED.value
    db.session.commit()
