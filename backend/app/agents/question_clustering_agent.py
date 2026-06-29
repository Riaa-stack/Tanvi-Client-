"""Question Clustering Agent — KMeans clustering of question embeddings."""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class QuestionClusteringAgent(BaseAgent):
    def __init__(self):
        super().__init__("question_clustering_agent")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        subject_id: str = context.get("subject_id")
        if not subject_id:
            return self._error("subject_id required.")

        from app.models.question import Question
        from app.models.question_embedding import QuestionEmbedding
        from app.models.question_cluster import QuestionCluster
        from app.extensions import db
        import numpy as np
        from sklearn.cluster import KMeans
        from sklearn.preprocessing import normalize

        # Load questions with embeddings
        rows = (db.session.query(Question, QuestionEmbedding)
                .join(QuestionEmbedding, Question.id == QuestionEmbedding.question_id)
                .filter(Question.subject_id == subject_id, Question.is_deleted == False)
                .all())

        if len(rows) < 2:
            return self._success({"clusters_created": 0, "message": "Not enough questions to cluster."})

        questions = [r[0] for r in rows]
        embeddings = np.array([r[1].embedding for r in rows])
        embeddings = normalize(embeddings)

        # Determine k — sqrt of question count, min 2, max 20
        k = max(2, min(20, int(len(questions) ** 0.5)))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(embeddings)

        # Delete old clusters for this subject
        QuestionCluster.query.filter_by(subject_id=subject_id).delete()
        db.session.flush()

        # Create new cluster records
        cluster_map = {}
        for cluster_id in range(k):
            centroid = kmeans.cluster_centers_[cluster_id].tolist()
            cluster_questions = [questions[i] for i, l in enumerate(labels) if l == cluster_id]
            label = self._generate_cluster_label(cluster_questions)
            cluster = QuestionCluster(
                subject_id=subject_id,
                cluster_label=label,
                centroid_embedding=centroid,
                question_count=len(cluster_questions),
            )
            db.session.add(cluster)
            db.session.flush()
            cluster_map[cluster_id] = cluster

        # Update questions with cluster assignment and repeat detection
        from collections import Counter
        text_counts = Counter(q.question_text.strip().lower()[:100] for q in questions)

        for i, question in enumerate(questions):
            cluster = cluster_map[labels[i]]
            text_key = question.question_text.strip().lower()[:100]
            repeat_count = text_counts[text_key] - 1
            question.cluster_id = cluster.id
            question.is_repeated = repeat_count > 0
            question.repeat_count = repeat_count

        db.session.commit()
        self._log_completion(k)
        return self._success({"clusters_created": k, "questions_clustered": len(questions)})

    def _generate_cluster_label(self, questions: List) -> str:
        if not questions:
            return "Uncategorized"
        # Use the first question's topic name or truncated text as label
        first = questions[0]
        if first.topic_id:
            from app.models.topic import Topic
            topic = Topic.query.get(first.topic_id)
            if topic:
                return topic.name
        return questions[0].question_text[:80] + ("..." if len(questions[0].question_text) > 80 else "")
