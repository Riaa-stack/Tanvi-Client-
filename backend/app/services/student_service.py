"""Student Service — Activity tracking."""
from typing import Dict, List
from app.models.student_activity import StudentActivity
from app.extensions import db


class StudentService:

    def log_activity(self, user_id: str, activity_type: str, entity_type: str = None,
                     entity_id: str = None, session_id: str = None, metadata: dict = None) -> None:
        activity = StudentActivity(
            user_id=user_id, activity_type=activity_type, entity_type=entity_type,
            entity_id=entity_id, session_id=session_id, metadata=metadata
        )
        db.session.add(activity)
        db.session.commit()

    def get_recent_activity(self, user_id: str, limit: int = 20) -> List[Dict]:
        activities = StudentActivity.query.filter_by(user_id=user_id).order_by(StudentActivity.created_at.desc()).limit(limit).all()
        return [{
            "id": a.id, "activity_type": a.activity_type, "entity_type": a.entity_type,
            "entity_id": a.entity_id, "created_at": a.created_at.isoformat(),
            "metadata": a.metadata
        } for a in activities]
