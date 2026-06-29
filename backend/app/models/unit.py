"""Unit model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, SmallInteger, Numeric, Index, UniqueConstraint
from sqlalchemy.sql import func


class Unit(db.Model):
    __tablename__ = "units"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    unit_number = Column(SmallInteger, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    weightage_percentage = Column(Numeric(5, 2), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("subject_id", "unit_number", name="uq_units_subject_number"),
        Index("idx_units_subject_id", "subject_id"),
    )

    subject = db.relationship("Subject", back_populates="units")
    topics = db.relationship("Topic", back_populates="unit", lazy="dynamic", cascade="all, delete-orphan")
    questions = db.relationship("Question", back_populates="unit", lazy="dynamic")
    predicted_questions = db.relationship("PredictedQuestion", back_populates="unit", lazy="dynamic")
    weightage = db.relationship("UnitWeightage", back_populates="unit", uselist=False)

    def __repr__(self):
        return f"<Unit id={self.id} subject_id={self.subject_id} unit_number={self.unit_number} title={self.title}>"
