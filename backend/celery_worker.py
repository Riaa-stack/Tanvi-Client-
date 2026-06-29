"""Celery worker entry point.
Run with: celery -A celery_worker.celery worker --loglevel=info -Q paper_processing,analytics,embeddings,predictions
"""
import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.tasks.celery_app import make_celery

flask_app = create_app(os.environ.get("FLASK_ENV", "development"))
celery = make_celery(flask_app)
