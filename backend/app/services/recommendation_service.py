"""Recommendation Service."""
from typing import Dict, List
from app.models.recommendation import Recommendation
from app.agents.recommendation_agent import RecommendationAgent
from app.extensions import db


class RecommendationService:

    def generate_recommendations(self, user_id: str, subject_id: str = None) -> Dict:
        return RecommendationAgent().run({"user_id": user_id, "subject_id": subject_id})

    def get_recommendations(self, user_id: str) -> List[Dict]:
        recs = Recommendation.query.filter_by(user_id=user_id, is_dismissed=False).order_by(Recommendation.score.desc()).limit(10).all()
        result = []
        for r in recs:
            name = "Unknown"
            if r.entity_type == "topic":
                from app.models.topic import Topic
                topic = Topic.query.get(r.entity_id)
                name = topic.name if topic else "Unknown"
            result.append({
                "id": r.id, "type": r.recommendation_type, "entity_id": r.entity_id,
                "name": name, "score": float(r.score) if r.score else 0,
                "rationale": r.rationale
            })
        return result

    def dismiss_recommendation(self, rec_id: str, user_id: str) -> bool:
        rec = Recommendation.query.filter_by(id=rec_id, user_id=user_id).first()
        if not rec:
            return False
        rec.is_dismissed = True
        db.session.commit()
        return True
