"""SearchHistory model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Index
from sqlalchemy.sql import func


class SearchHistory(db.Model):
    __tablename__ = "search_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # nullable for anonymous
    query_text = Column(Text, nullable=False)
    result_count = Column(Integer, default=0, nullable=False)
    subject_id = Column(String(36), nullable=True)
    search_type = Column(String(20), nullable=True)   # 'semantic' or 'keyword'
    response_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_search_history_user_id", "user_id"),
        Index("idx_search_history_subject_id", "subject_id"),
        Index("idx_search_history_created_at", "created_at"),
    )

    user = db.relationship("User", back_populates="search_history")

    def __repr__(self):
        return f"<SearchHistory id={self.id} user_id={self.user_id} query={self.query_text[:30]}>"
