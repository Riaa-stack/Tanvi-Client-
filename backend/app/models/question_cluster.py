"""QuestionCluster model — defined before Question due to FK."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Index
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Float
from sqlalchemy.sql import func


class QuestionCluster(db.Model):
    __tablename__ = "question_clusters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    cluster_label = Column(String(500), nullable=False)
    centroid_embedding = Column(ARRAY(Float), nullable=True)
    question_count = Column(Integer, default=0, nullable=False)
    representative_question_id = Column(String(36), nullable=True)  # Soft ref
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_question_clusters_topic_id", "topic_id"),
        Index("idx_question_clusters_subject_id", "subject_id"),
    )

    topic = db.relationship("Topic", back_populates="clusters")
    subject = db.relationship("Subject", back_populates="clusters")
    questions = db.relationship("Question", back_populates="cluster", lazy="dynamic", foreign_keys="Question.cluster_id")

    def __repr__(self):
        return f"<QuestionCluster id={self.id} label={self.cluster_label[:40]}>"
