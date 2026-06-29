"""
AAIP Backend — Enums and Constants
All discrete value sets used across the system.
"""
from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    STUDENT = "student"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    OCR_COMPLETE = "ocr_complete"
    EXTRACTION_COMPLETE = "extraction_complete"
    COMPLETED = "completed"
    FAILED = "failed"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuestionType(str, Enum):
    SHORT = "short"
    LONG = "long"
    MCQ = "mcq"
    NUMERICAL = "numerical"


class ActivityType(str, Enum):
    VIEW_PAPER = "view_paper"
    VIEW_TOPIC = "view_topic"
    SEARCH = "search"
    BOOKMARK = "bookmark"
    CHAT = "chat"


class BookmarkEntityType(str, Enum):
    QUESTION = "question"
    PAPER = "paper"
    TOPIC = "topic"


class RecommendationType(str, Enum):
    TOPIC = "topic"
    QUESTION = "question"
    PAPER = "paper"


class JobType(str, Enum):
    PAPER_INGESTION = "paper_ingestion"
    BATCH_EMBED = "batch_embed"
    ANALYTICS_REFRESH = "analytics_refresh"
    PREDICTION_REFRESH = "prediction_refresh"
    CLUSTERING = "clustering"
    DEPENDENCY_GRAPH = "dependency_graph"


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SearchType(str, Enum):
    SEMANTIC = "semantic"
    KEYWORD = "keyword"


class DifficultyDimension(str, Enum):
    TOPIC = "topic"
    UNIT = "unit"
    SUBJECT = "subject"
    SEMESTER = "semester"
    YEAR = "year"


class ExamType(str, Enum):
    ESE = "ESE"
    MSE = "MSE"
    SESSIONAL = "Sessional"
    INTERNAL = "Internal"
    EXTERNAL = "External"


# AI-generated question disclaimer — MUST appear on every predicted question
AI_DISCLAIMER = "AI Generated Practice Question — Not an actual exam question"
