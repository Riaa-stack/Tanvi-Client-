"""
app/models/__init__.py — Import all models for Alembic autogeneration and SQLAlchemy.

The order of imports matters for relationship resolution.
All models must be imported here before create_all() or Alembic env.py is run.
"""
from app.models.user import User
from app.models.subject import Subject
from app.models.branch import Branch
from app.models.semester import Semester
from app.models.academic_scope import AcademicScope
from app.models.paper import Paper, PaperStatus
from app.models.paper_question import PaperQuestion, QuestionType, DifficultyLevel
from app.models.paper_analysis import PaperAnalysis
from app.models.repetition import QuestionRepetitionGroup, QuestionRepetitionOccurrence
from app.models.historical_analysis import SubjectHistoricalAnalysis, EvidenceLevel
from app.models.note import Note, NoteStatus
from app.models.note_analysis import NoteAnalysis
from app.models.chat import ChatSession, ChatMessage, MessageRole
from app.models.processing_log import ProcessingLog
from app.models.revoked_token import RevokedToken

__all__ = [
    "User",
    "Subject",
    "Branch",
    "Semester",
    "AcademicScope",
    "Paper",
    "PaperStatus",
    "PaperQuestion",
    "QuestionType",
    "DifficultyLevel",
    "PaperAnalysis",
    "QuestionRepetitionGroup",
    "QuestionRepetitionOccurrence",
    "SubjectHistoricalAnalysis",
    "EvidenceLevel",
    "Note",
    "NoteStatus",
    "NoteAnalysis",
    "ChatSession",
    "ChatMessage",
    "MessageRole",
    "ProcessingLog",
    "RevokedToken",
]
