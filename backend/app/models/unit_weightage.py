"""UnitWeightage model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric, UniqueConstraint, Index
from sqlalchemy.sql import func


class UnitWeightage(db.Model):
    __tablename__ = "unit_weightage"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    unit_id = Column(String(36), ForeignKey("units.id", ondelete="CASCADE"), unique=True, nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    total_marks = Column(Numeric(8, 1), default=0, nullable=False)
    question_count = Column(Integer, default=0, nullable=False)
    paper_count = Column(Integer, default=0, nullable=False)
    weightage_percentage = Column(Numeric(5, 2), default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_unit_weightage_subject_id", "subject_id"),
    )

    unit = db.relationship("Unit", back_populates="weightage")

    def __repr__(self):
        return f"<UnitWeightage id={self.id} unit_id={self.unit_id} pct={self.weightage_percentage}>"
