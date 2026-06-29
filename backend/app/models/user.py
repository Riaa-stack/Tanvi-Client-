"""User model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint, Index
from sqlalchemy.sql import func
from app.constants import UserRole


class User(db.Model):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.STUDENT.value)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(f"role IN ('{UserRole.SUPER_ADMIN.value}', '{UserRole.ADMIN.value}', '{UserRole.STUDENT.value}')", name="ck_users_role"),
        Index("idx_users_email", "email", unique=True),
        Index("idx_users_role", "role"),
    )

    # Relationships
    papers = db.relationship("Paper", back_populates="uploader", lazy="dynamic")
    bookmarks = db.relationship("Bookmark", back_populates="user", lazy="dynamic")
    activity = db.relationship("StudentActivity", back_populates="user", lazy="dynamic")
    recommendations = db.relationship("Recommendation", back_populates="user", lazy="dynamic")
    search_history = db.relationship("SearchHistory", back_populates="user", lazy="dynamic")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"
