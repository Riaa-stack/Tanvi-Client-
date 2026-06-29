"""Paper model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, SmallInteger, Integer, Index
from sqlalchemy.sql import func
from app.constants import ProcessingStatus


class Paper(db.Model):
    __tablename__ = "papers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    semester_id = Column(String(36), ForeignKey("semesters.id", ondelete="SET NULL"), nullable=True)
    exam_year = Column(SmallInteger, nullable=False)
    exam_month = Column(String(20), nullable=True)
    exam_type = Column(String(50), nullable=True)
    total_marks = Column(SmallInteger, nullable=True)
    duration_minutes = Column(SmallInteger, nullable=True)
    file_name = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    processing_status = Column(String(30), nullable=False, default=ProcessingStatus.PENDING.value)
    processing_job_id = Column(String(36), ForeignKey("processing_jobs.id", ondelete="SET NULL"), nullable=True)
    extracted_text = Column(Text, nullable=True)
    page_count = Column(SmallInteger, nullable=True)
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_papers_subject_id", "subject_id"),
        Index("idx_papers_exam_year", "exam_year"),
        Index("idx_papers_processing_status", "processing_status"),
        Index("idx_papers_semester_id", "semester_id"),
        Index("idx_papers_subject_year", "subject_id", "exam_year"),
    )

    subject = db.relationship("Subject", back_populates="papers")
    semester = db.relationship("Semester", back_populates="papers")
    uploader = db.relationship("User", back_populates="papers")
    processing_job = db.relationship("ProcessingJob", back_populates="paper", foreign_keys=[processing_job_id])
    questions = db.relationship("Question", back_populates="paper", lazy="dynamic", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Paper id={self.id} subject_id={self.subject_id} year={self.exam_year} type={self.exam_type}>"
