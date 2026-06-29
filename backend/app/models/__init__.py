"""
AAIP Backend — Model Exports
Import all models here so Alembic can discover them via target_metadata = db.metadata.
Import ORDER matters — dependencies must be imported before dependents.
"""

# Independent base tables
from app.models.user import User
from app.models.semester import Semester

# Subject (depends on Semester)
from app.models.subject import Subject

# Unit (depends on Subject)
from app.models.unit import Unit

# Topic (depends on Unit, Subject)
from app.models.topic import Topic

# ProcessingJob (independent — referenced by Paper)
from app.models.processing_job import ProcessingJob

# Paper (depends on Subject, Semester, User, ProcessingJob)
from app.models.paper import Paper

# QuestionCluster (depends on Topic, Subject) — before Question
from app.models.question_cluster import QuestionCluster

# Question (depends on Paper, Subject, Unit, Topic, QuestionCluster)
from app.models.question import Question

# QuestionEmbedding (depends on Question)
from app.models.question_embedding import QuestionEmbedding

# PredictedQuestion (depends on Topic, Subject, Unit)
from app.models.predicted_question import PredictedQuestion

# TopicTrend (depends on Topic, Subject)
from app.models.topic_trend import TopicTrend

# DifficultyStat (polymorphic — no FK)
from app.models.difficulty_stat import DifficultyStat

# ProbabilityScore (depends on Topic, Subject)
from app.models.probability_score import ProbabilityScore

# DependencyGraphEdge (depends on Topic, Subject)
from app.models.dependency_graph import DependencyGraphEdge

# Recommendation (depends on User)
from app.models.recommendation import Recommendation

# SearchHistory (depends on User)
from app.models.search_history import SearchHistory

# StudentActivity (depends on User)
from app.models.student_activity import StudentActivity

# Bookmark (depends on User)
from app.models.bookmark import Bookmark

# AnalyticsSnapshot (depends on Subject)
from app.models.analytics_snapshot import AnalyticsSnapshot

# UnitWeightage (depends on Unit, Subject)
from app.models.unit_weightage import UnitWeightage

__all__ = [
    "User",
    "Semester",
    "Subject",
    "Unit",
    "Topic",
    "ProcessingJob",
    "Paper",
    "QuestionCluster",
    "Question",
    "QuestionEmbedding",
    "PredictedQuestion",
    "TopicTrend",
    "DifficultyStat",
    "ProbabilityScore",
    "DependencyGraphEdge",
    "Recommendation",
    "SearchHistory",
    "StudentActivity",
    "Bookmark",
    "AnalyticsSnapshot",
    "UnitWeightage",
]
