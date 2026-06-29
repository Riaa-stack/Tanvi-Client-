"""Subject model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.sql import func


class Subject(db.Model):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    semester_id = Column(String(36), ForeignKey("semesters.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_subjects_semester_id", "semester_id"),
        Index("idx_subjects_code", "code", unique=True),
    )

    semester = db.relationship("Semester", back_populates="subjects")
    units = db.relationship("Unit", back_populates="subject", lazy="dynamic", cascade="all, delete-orphan")
    topics = db.relationship("Topic", back_populates="subject", lazy="dynamic")
    papers = db.relationship("Paper", back_populates="subject", lazy="dynamic")
    questions = db.relationship("Question", back_populates="subject", lazy="dynamic")
    clusters = db.relationship("QuestionCluster", back_populates="subject", lazy="dynamic")
    predicted_questions = db.relationship("PredictedQuestion", back_populates="subject", lazy="dynamic")

    def __repr__(self):
        return f"<Subject id={self.id} code={self.code} name={self.name}>"
