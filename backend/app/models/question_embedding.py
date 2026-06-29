"""QuestionEmbedding model."""
import uuid
from app.extensions import db
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Float
from sqlalchemy.sql import func


class QuestionEmbedding(db.Model):
    __tablename__ = "question_embeddings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding = Column(ARRAY(Float), nullable=False)   # 384-dim all-MiniLM-L6-v2
    chroma_doc_id = Column(String(100), nullable=True)
    model_name = Column(String(100), nullable=False, default="all-MiniLM-L6-v2")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_question_embeddings_question_id", "question_id"),
    )

    question = db.relationship("Question", back_populates="embedding")

    def __repr__(self):
        return f"<QuestionEmbedding id={self.id} question_id={self.question_id} model={self.model_name}>"
