"""DifficultyStat model — polymorphic by dimension."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, SmallInteger, Integer, Numeric, Index
from sqlalchemy.sql import func


class DifficultyStat(db.Model):
    __tablename__ = "difficulty_stats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dimension = Column(String(20), nullable=False)   # 'topic','unit','subject','semester','year'
    dimension_id = Column(String(36), nullable=False)  # polymorphic FK (topic_id, unit_id, etc.)
    exam_year = Column(SmallInteger, nullable=True)
    easy_count = Column(Integer, default=0, nullable=False)
    medium_count = Column(Integer, default=0, nullable=False)
    hard_count = Column(Integer, default=0, nullable=False)
    total_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_difficulty_stats_dimension", "dimension", "dimension_id"),
        Index("idx_difficulty_stats_year", "exam_year"),
    )

    def __repr__(self):
        return f"<DifficultyStat id={self.id} dim={self.dimension}:{self.dimension_id} year={self.exam_year}>"
