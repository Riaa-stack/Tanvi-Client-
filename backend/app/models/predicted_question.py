"""PredictedQuestion model."""
import uuid
from app.extensions import db
from app.constants import AI_DISCLAIMER
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Numeric, CheckConstraint, Index
from sqlalchemy.sql import func


class PredictedQuestion(db.Model):
    __tablename__ = "predicted_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    unit_id = Column(String(36), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    marks_estimated = Column(Numeric(4, 1), nullable=True)
    difficulty_estimated = Column(String(10), nullable=True)
    probability_score = Column(Numeric(5, 4), nullable=True)
    generation_rationale = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, nullable=False, default=True, server_default="true")
    ai_disclaimer = Column(Text, nullable=False, default=AI_DISCLAIMER)
    model_used = Column(String(100), nullable=True)
    generation_batch_id = Column(String(36), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("is_ai_generated = TRUE", name="ck_predicted_questions_is_ai"),
        CheckConstraint("ai_disclaimer IS NOT NULL AND length(ai_disclaimer) > 10", name="ck_predicted_questions_disclaimer"),
        Index("idx_predicted_questions_topic_id", "topic_id"),
        Index("idx_predicted_questions_subject_id", "subject_id"),
    )

    topic = db.relationship("Topic", back_populates="predicted_questions")
    subject = db.relationship("Subject", back_populates="predicted_questions")
    unit = db.relationship("Unit", back_populates="predicted_questions")

    def __repr__(self):
        return f"<PredictedQuestion id={self.id} topic_id={self.topic_id}>"
