"""StudentActivity model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func


class StudentActivity(db.Model):
    __tablename__ = "student_activity"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(30), nullable=False)
    entity_type = Column(String(30), nullable=True)
    entity_id = Column(String(36), nullable=True)
    session_id = Column(String(100), nullable=True)
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_student_activity_user_id", "user_id"),
        Index("idx_student_activity_type", "activity_type"),
        Index("idx_student_activity_created_at", "created_at"),
    )

    user = db.relationship("User", back_populates="activity")

    def __repr__(self):
        return f"<StudentActivity id={self.id} user_id={self.user_id} type={self.activity_type}>"
