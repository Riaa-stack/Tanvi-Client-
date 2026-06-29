"""Analytics Celery tasks."""
import logging
from app.tasks.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(name="app.tasks.analytics_tasks.refresh_analytics", queue="analytics")
def refresh_analytics(subject_id: str):
    """Refresh trend and weightage analytics for a subject."""
    logger.info(f"refresh_analytics: subject_id={subject_id}")
    from app.agents.trend_analysis_agent import TrendAnalysisAgent
    from app.services.analytics_service import AnalyticsService
    TrendAnalysisAgent().run({"subject_id": subject_id})
    AnalyticsService().refresh_unit_weightage(subject_id)
    return {"status": "completed", "subject_id": subject_id}


@celery.task(name="app.tasks.analytics_tasks.refresh_predictions", queue="analytics")
def refresh_predictions(subject_id: str):
    """Refresh probability predictions for a subject."""
    logger.info(f"refresh_predictions: subject_id={subject_id}")
    from app.agents.probability_prediction_agent import ProbabilityPredictionAgent
    result = ProbabilityPredictionAgent().run({"subject_id": subject_id})
    return result
