"""Dependency Service."""
from typing import Dict, List
from app.models.dependency_graph import DependencyGraphEdge
from app.models.topic import Topic

class DependencyService:
    def get_dependency_graph(self, subject_id: str) -> Dict:
        edges = DependencyGraphEdge.query.filter_by(subject_id=subject_id).all()
        nodes = {}
        links = []
        for e in edges:
            nodes[e.from_topic_id] = True
            nodes[e.to_topic_id] = True
            links.append({
                "source": e.from_topic_id,
                "target": e.to_topic_id,
                "strength": float(e.strength) if e.strength else 1.0,
                "rationale": e.rationale
            })

        node_list = []
        for n_id in nodes:
            t = Topic.query.get(n_id)
            if t:
                node_list.append({"id": t.id, "name": t.name, "unit_id": t.unit_id})

        return {"nodes": node_list, "links": links}
