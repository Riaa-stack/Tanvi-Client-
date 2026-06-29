"""Question model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, SmallInteger, Numeric, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func


class Question(db.Model):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    unit_id = Column(String(36), ForeignKey("units.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    cluster_id = Column(String(36), ForeignKey("question_clusters.id", ondelete="SET NULL"), nullable=True)
    question_text = Column(Text, nullable=False)
    question_number = Column(String(20), nullable=True)
    marks = Column(Numeric(4, 1), nullable=True)
    difficulty = Column(String(10), nullable=True)
    difficulty_confidence = Column(Numeric(4, 3), nullable=True)
    exam_year = Column(SmallInteger, nullable=True)
    question_type = Column(String(30), nullable=True)
    is_repeated = Column(Boolean, default=False, nullable=False)
    repeat_count = Column(SmallInteger, default=0, nullable=False)
    ai_classification_raw = Column(JSONB, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_questions_paper_id", "paper_id"),
        Index("idx_questions_subject_id", "subject_id"),
        Index("idx_questions_unit_id", "unit_id"),
        Index("idx_questions_topic_id", "topic_id"),
        Index("idx_questions_exam_year", "exam_year"),
        Index("idx_questions_difficulty", "difficulty"),
        Index("idx_questions_cluster_id", "cluster_id"),
        Index("idx_questions_topic_year", "topic_id", "exam_year"),
    )

    paper = db.relationship("Paper", back_populates="questions")
    subject = db.relationship("Subject", back_populates="questions")
    unit = db.relationship("Unit", back_populates="questions")
    topic = db.relationship("Topic", back_populates="questions")
    cluster = db.relationship("QuestionCluster", back_populates="questions", foreign_keys=[cluster_id])
    embedding = db.relationship("QuestionEmbedding", back_populates="question", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Question id={self.id} paper_id={self.paper_id} marks={self.marks}>"
