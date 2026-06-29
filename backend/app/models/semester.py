"""Semester model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, SmallInteger, Index
from sqlalchemy.sql import func


class Semester(db.Model):
    __tablename__ = "semesters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    number = Column(SmallInteger, nullable=False)
    academic_year = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_semesters_number", "number"),
    )

    subjects = db.relationship("Subject", back_populates="semester", lazy="dynamic")
    papers = db.relationship("Paper", back_populates="semester", lazy="dynamic")

    def __repr__(self):
        return f"<Semester id={self.id} name={self.name} number={self.number}>"
