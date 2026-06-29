"""TopicTrend model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, ForeignKey, SmallInteger, Integer, Numeric, UniqueConstraint, Index
from sqlalchemy.sql import func


class TopicTrend(db.Model):
    __tablename__ = "topic_trends"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    exam_year = Column(SmallInteger, nullable=False)
    question_count = Column(Integer, default=0, nullable=False)
    total_marks = Column(Numeric(6, 1), default=0, nullable=False)
    avg_difficulty = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("topic_id", "exam_year", name="uq_topic_trends_topic_year"),
        Index("idx_topic_trends_topic_id", "topic_id"),
        Index("idx_topic_trends_subject_id", "subject_id"),
    )

    topic = db.relationship("Topic", back_populates="trends")

    def __repr__(self):
        return f"<TopicTrend id={self.id} topic_id={self.topic_id} year={self.exam_year}>"
