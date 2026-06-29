"""Prediction Celery tasks."""
import logging
import uuid
from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(name="app.tasks.prediction_tasks.generate_predicted_questions", queue="predictions")
def generate_predicted_questions(subject_id: str, topic_id: str, count: int = 5,
                                 difficulty: str = "medium", marks: int = 10):
    """Generate AI practice questions for a topic."""
    logger.info(f"generate_predicted_questions: subject_id={subject_id} topic_id={topic_id}")
    from app.agents.expected_question_generator_agent import ExpectedQuestionGeneratorAgent
    context = {
        "subject_id": subject_id,
        "topic_id": topic_id,
        "count": count,
        "difficulty": difficulty,
        "marks": marks,
        "batch_id": str(uuid.uuid4()),
    }
    result = ExpectedQuestionGeneratorAgent().run(context)
    return result
