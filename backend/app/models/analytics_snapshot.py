"""AnalyticsSnapshot model — cached aggregation results."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func


class AnalyticsSnapshot(db.Model):
    __tablename__ = "analytics_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    snapshot_type = Column(String(50), nullable=False)   # e.g. 'unit_weightage', 'exam_trends'
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True)
    data = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("snapshot_type", "subject_id", name="uq_analytics_snapshots_type_subject"),
        Index("idx_analytics_snapshots_type", "snapshot_type"),
        Index("idx_analytics_snapshots_subject_id", "subject_id"),
    )

    def __repr__(self):
        return f"<AnalyticsSnapshot id={self.id} type={self.snapshot_type} subject_id={self.subject_id}>"
