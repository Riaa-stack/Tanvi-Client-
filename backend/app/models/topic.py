"""Topic model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.sql import func


class Topic(db.Model):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    unit_id = Column(String(36), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_important = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_topics_unit_id", "unit_id"),
        Index("idx_topics_subject_id", "subject_id"),
    )

    unit = db.relationship("Unit", back_populates="topics")
    subject = db.relationship("Subject", back_populates="topics")
    questions = db.relationship("Question", back_populates="topic", lazy="dynamic")
    trends = db.relationship("TopicTrend", back_populates="topic", lazy="dynamic", cascade="all, delete-orphan")
    probability_scores = db.relationship("ProbabilityScore", back_populates="topic", lazy="dynamic", cascade="all, delete-orphan")
    clusters = db.relationship("QuestionCluster", back_populates="topic", lazy="dynamic")
    predicted_questions = db.relationship("PredictedQuestion", back_populates="topic", lazy="dynamic")
    from_edges = db.relationship("DependencyGraphEdge", foreign_keys="DependencyGraphEdge.from_topic_id", back_populates="from_topic", lazy="dynamic", cascade="all, delete-orphan")
    to_edges = db.relationship("DependencyGraphEdge", foreign_keys="DependencyGraphEdge.to_topic_id", back_populates="to_topic", lazy="dynamic", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Topic id={self.id} name={self.name} unit_id={self.unit_id}>"
