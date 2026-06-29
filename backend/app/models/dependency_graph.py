"""DependencyGraphEdge model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, UniqueConstraint, Index
from sqlalchemy.sql import func


class DependencyGraphEdge(db.Model):
    __tablename__ = "dependency_graph_edges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    from_topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    to_topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    strength = Column(Numeric(4, 3), nullable=True)   # 0.0–1.0 dependency strength
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("from_topic_id", "to_topic_id", name="uq_dep_graph_edge"),
        Index("idx_dep_graph_from", "from_topic_id"),
        Index("idx_dep_graph_to", "to_topic_id"),
        Index("idx_dep_graph_subject", "subject_id"),
    )

    from_topic = db.relationship("Topic", foreign_keys=[from_topic_id], back_populates="from_edges")
    to_topic = db.relationship("Topic", foreign_keys=[to_topic_id], back_populates="to_edges")

    def __repr__(self):
        return f"<DependencyGraphEdge {self.from_topic_id} -> {self.to_topic_id}>"
