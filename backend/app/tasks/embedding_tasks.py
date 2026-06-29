"""Embedding Celery tasks."""
import logging
from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(name="app.tasks.embedding_tasks.batch_embed_questions", queue="embeddings")
def batch_embed_questions(subject_id: str):
    """Embed all un-embedded questions for a subject."""
    logger.info(f"batch_embed_questions: subject_id={subject_id}")
    from app.agents.embedding_agent import EmbeddingAgent
    result = EmbeddingAgent().run({"subject_id": subject_id})
    return result
