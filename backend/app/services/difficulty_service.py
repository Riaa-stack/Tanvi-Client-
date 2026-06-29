"""Difficulty Service."""
from typing import Dict, List
from app.models.question import Question
from app.extensions import db
from sqlalchemy import func

class DifficultyService:
    def get_difficulty_distribution(self, subject_id: str) -> Dict:
        rows = (db.session.query(Question.difficulty, func.count(Question.id).label("count"))
                .filter(Question.subject_id == subject_id, Question.difficulty.isnot(None), Question.is_deleted == False)
                .group_by(Question.difficulty).all())
        result = {"easy": 0, "medium": 0, "hard": 0}
        for row in rows:
            if row.difficulty in result:
                result[row.difficulty] = row.count
        return result
