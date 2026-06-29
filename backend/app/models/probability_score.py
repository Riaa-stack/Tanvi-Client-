"""ProbabilityScore model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func


class ProbabilityScore(db.Model):
    __tablename__ = "probability_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    probability = Column(Numeric(5, 4), nullable=False)   # 0.0000 – 1.0000
    confidence = Column(Numeric(4, 3), nullable=True)
    rationale = Column(Text, nullable=True)
    contributing_factors = Column(JSONB, nullable=True)
    model_version = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_probability_scores_topic_id", "topic_id"),
        Index("idx_probability_scores_subject_id", "subject_id"),
    )

    topic = db.relationship("Topic", back_populates="probability_scores")

    def __repr__(self):
        return f"<ProbabilityScore id={self.id} topic_id={self.topic_id} probability={self.probability}>"
