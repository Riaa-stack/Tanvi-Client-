"""Recommendation model — polymorphic entity."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Numeric, Index
from sqlalchemy.sql import func


class Recommendation(db.Model):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recommendation_type = Column(String(20), nullable=False)   # 'topic','question','paper'
    entity_id = Column(String(36), nullable=False)             # polymorphic FK
    entity_type = Column(String(20), nullable=False)
    score = Column(Numeric(5, 4), nullable=True)
    rationale = Column(Text, nullable=True)
    is_dismissed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_recommendations_user_id", "user_id"),
        Index("idx_recommendations_type", "recommendation_type"),
    )

    user = db.relationship("User", back_populates="recommendations")

    def __repr__(self):
        return f"<Recommendation id={self.id} user_id={self.user_id} type={self.recommendation_type}>"
