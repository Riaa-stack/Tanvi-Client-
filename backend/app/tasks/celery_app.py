"""Celery application factory."""
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = os.environ.get("REDIS_PORT", "6379")
BROKER_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/1"
BACKEND_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/1"


def make_celery(app=None):
    celery = Celery(
        "aaip",
        broker=BROKER_URL,
        backend=BACKEND_URL,
        include=[
            "app.tasks.paper_tasks",
            "app.tasks.analytics_tasks",
            "app.tasks.embedding_tasks",
            "app.tasks.prediction_tasks",
        ],
    )
    celery.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        task_soft_time_limit=600,   # 10 min soft limit
        task_time_limit=900,        # 15 min hard kill
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        task_routes={
            "app.tasks.paper_tasks.process_paper": {"queue": "paper_processing"},
            "app.tasks.analytics_tasks.*": {"queue": "analytics"},
            "app.tasks.embedding_tasks.*": {"queue": "embeddings"},
            "app.tasks.prediction_tasks.*": {"queue": "predictions"},
        },
    )
    if app:
        class ContextTask(celery.Task):
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)
        celery.Task = ContextTask
    return celery


celery = make_celery()
