"""
app/services/paper_analysis_service.py — AI-powered analysis of a processed paper.

Uses Gemini to generate structured analysis including:
- Topic analysis
- Difficulty distribution
- Marks distribution
- Unit distribution
- Study recommendations
- Potential questions

Does NOT claim historical repetition from a single paper.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import List

from app.logging_config import get_logger
from app.models.paper import Paper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_question import PaperQuestion
from app.prompts.paper_prompts import PAPER_ANALYSIS_PROMPT

logger = get_logger(__name__)


class PaperAnalysisService:
    """
    Generates and persists AI analysis for a single paper.
    """

    def analyze_paper(self, paper: Paper, questions: List[PaperQuestion], db) -> PaperAnalysis:
        """
        Run full AI analysis on a paper.
        Returns the saved PaperAnalysis record.
        """
        from app.services.gemini_service import GeminiService
        from app.config import get_settings

        settings = get_settings()
        gemini = GeminiService.get_instance()

        # Prepare questions summary for prompt
        questions_data = [
            {
                "question_number": q.question_number,
                "question_text": q.question_text[:300],
                "marks": q.marks,
                "topic": q.topic,
                "unit": q.unit,
                "difficulty": q.difficulty,
                "question_type": q.question_type,
                "section": q.section,
            }
            for q in questions
        ]

        subject_name = paper.subject.name if paper.subject else "Unknown"
        branch_name = paper.branch.name if paper.branch else "Unknown"
        semester_name = paper.semester.name if paper.semester else "Unknown"
        university_name = ""
        college_name = ""
        if paper.academic_scope:
            university_name = paper.academic_scope.university
            college_name = paper.academic_scope.college

        prompt = PAPER_ANALYSIS_PROMPT.format(
            subject=subject_name,
            branch=branch_name,
            semester=semester_name,
            year=paper.year,
            university=university_name or "SGBAU",
            questions_json=json.dumps(questions_data, indent=2),
        )

        try:
            analysis_data = gemini.generate_json(prompt, f"paper_analysis_{paper.id}")
        except Exception as e:
            logger.error("paper_analysis_gemini_failed", paper_id=paper.id, error=str(e))
            # Fall back to deterministic analysis
            analysis_data = self._deterministic_analysis(questions)

        # Build PaperAnalysis from Gemini response
        analysis = PaperAnalysis(
            paper_id=paper.id,
            topic_analysis=analysis_data.get("topic_analysis"),
            difficulty_analysis=analysis_data.get("difficulty_analysis")
            or self._count_difficulties(questions),
            mark_distribution=analysis_data.get("mark_distribution")
            or self._count_marks(questions),
            unit_distribution=analysis_data.get("unit_distribution")
            or self._count_units(questions),
            question_type_distribution=analysis_data.get("question_type_distribution")
            or self._count_question_types(questions),
            study_recommendations=analysis_data.get("study_recommendations"),
            potential_questions=analysis_data.get("potential_questions"),
            exam_trends=analysis_data.get("exam_trends"),
            generated_at=datetime.now(timezone.utc),
            model_name=settings.GEMINI_MODEL,
            analysis_version="1.0",
        )

        # Upsert: delete existing then insert
        existing = db.session.get(PaperAnalysis, paper.id)
        if existing:
            db.session.delete(existing)
            db.session.flush()

        db.session.add(analysis)
        db.session.flush()
        logger.info("paper_analysis_saved", paper_id=paper.id)
        return analysis

    def _deterministic_analysis(self, questions: List[PaperQuestion]) -> dict:
        """Fallback: compute basic statistics without Gemini."""
        return {
            "topic_analysis": {
                "major_topics": self._aggregate_topics(questions),
                "topic_count": len({q.topic for q in questions if q.topic}),
            },
            "difficulty_analysis": self._count_difficulties(questions),
            "mark_distribution": self._count_marks(questions),
            "unit_distribution": self._count_units(questions),
            "question_type_distribution": self._count_question_types(questions),
            "study_recommendations": [],
            "potential_questions": [],
            "exam_trends": None,
        }

    def _aggregate_topics(self, questions: List[PaperQuestion]) -> list:
        from collections import Counter
        topic_counts: Counter = Counter()
        topic_marks: dict = {}
        for q in questions:
            if q.topic:
                topic_counts[q.topic] += 1
                topic_marks[q.topic] = topic_marks.get(q.topic, 0) + (q.marks or 0)
        return [
            {
                "topic": topic,
                "frequency": count,
                "marks_contribution": topic_marks.get(topic, 0),
                "importance": "HIGH" if count >= 3 else "MEDIUM" if count >= 2 else "LOW",
            }
            for topic, count in topic_counts.most_common()
        ]

    def _count_difficulties(self, questions: List[PaperQuestion]) -> dict:
        from collections import Counter
        counts: Counter = Counter(q.difficulty for q in questions)
        total = len(questions) or 1
        return {
            "easy": counts.get("EASY", 0),
            "medium": counts.get("MEDIUM", 0),
            "hard": counts.get("HARD", 0),
            "unknown": counts.get("UNKNOWN", 0),
            "distribution_percentage": {
                "easy": round(counts.get("EASY", 0) / total * 100),
                "medium": round(counts.get("MEDIUM", 0) / total * 100),
                "hard": round(counts.get("HARD", 0) / total * 100),
            },
        }

    def _count_marks(self, questions: List[PaperQuestion]) -> dict:
        total_marks = sum(q.marks or 0 for q in questions)
        high_weight = [
            {"question_number": q.question_number, "marks": q.marks, "topic": q.topic}
            for q in questions
            if q.marks and q.marks >= 8
        ]
        return {
            "total_marks": total_marks,
            "high_weight_questions": high_weight,
            "by_section": {},
            "by_unit": self._count_units(questions),
        }

    def _count_units(self, questions: List[PaperQuestion]) -> dict:
        from collections import defaultdict
        units: dict = defaultdict(lambda: {"marks": 0, "question_count": 0})
        for q in questions:
            unit_key = q.unit or "Unknown"
            units[unit_key]["question_count"] += 1
            units[unit_key]["marks"] += q.marks or 0
        return dict(units)

    def _count_question_types(self, questions: List[PaperQuestion]) -> dict:
        from collections import Counter
        counts: Counter = Counter(q.question_type for q in questions)
        return dict(counts)
