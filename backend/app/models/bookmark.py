"""Bookmark model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func


class Bookmark(db.Model):
    __tablename__ = "bookmarks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(20), nullable=False)   # 'question','paper','topic'
    entity_id = Column(String(36), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_bookmarks_user_entity"),
        Index("idx_bookmarks_user_id", "user_id"),
        Index("idx_bookmarks_entity", "entity_type", "entity_id"),
    )

    user = db.relationship("User", back_populates="bookmarks")

    def __repr__(self):
        return f"<Bookmark id={self.id} user_id={self.user_id} entity={self.entity_type}:{self.entity_id}>"
