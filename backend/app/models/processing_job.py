"""ProcessingJob model — must be defined before Paper due to FK."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from app.constants import JobType, JobStatus


class ProcessingJob(db.Model):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_type = Column(String(50), nullable=False, default=JobType.PAPER_INGESTION.value)
    status = Column(String(20), nullable=False, default=JobStatus.PENDING.value)
    paper_id = Column(String(36), nullable=True)  # Soft reference (no FK to avoid circular)
    error_message = Column(Text, nullable=True)
    stages_completed = Column(JSONB, nullable=False, default=list, server_default="[]")
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_processing_jobs_status", "status"),
        Index("idx_processing_jobs_paper_id", "paper_id"),
    )

    # Reverse relationship defined on Paper side
    paper = db.relationship("Paper", back_populates="processing_job", uselist=False, foreign_keys="Paper.processing_job_id")

    def __repr__(self):
        return f"<ProcessingJob id={self.id} type={self.job_type} status={self.status}>"
