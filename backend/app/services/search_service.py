"""Search Service."""
from typing import Dict
from app.agents.search_agent import SearchAgent


class SearchService:

    def search(self, query: str, subject_id: str = None, search_type: str = "semantic",
               top_k: int = 20, user_id: str = None) -> Dict:
        context = {
            "query_text": query, "subject_id": subject_id,
            "search_type": search_type, "top_k": top_k, "user_id": user_id,
        }
        result = SearchAgent().run(context)
        return result.get("data", {"results": [], "count": 0})
