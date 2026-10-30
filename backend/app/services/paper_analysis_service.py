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

        deterministic = self._deterministic_analysis(questions)
        try:
            analysis_data = gemini.generate_json(prompt, f"paper_analysis_{paper.id}")
            if not isinstance(analysis_data, dict):
                analysis_data = deterministic
        except Exception as e:
            logger.error("paper_analysis_gemini_failed", paper_id=paper.id, error=str(e))
            analysis_data = deterministic

        # Merge with smart deterministic fallback for any missing or empty keys
        topic_analysis = analysis_data.get("topic_analysis") or deterministic.get("topic_analysis")
        difficulty_analysis = analysis_data.get("difficulty_analysis") or deterministic.get("difficulty_analysis")
        mark_distribution = analysis_data.get("mark_distribution") or deterministic.get("mark_distribution")
        unit_distribution = analysis_data.get("unit_distribution") or deterministic.get("unit_distribution")
        question_type_distribution = analysis_data.get("question_type_distribution") or deterministic.get("question_type_distribution")
        study_recommendations = analysis_data.get("study_recommendations") or deterministic.get("study_recommendations")
        potential_questions = analysis_data.get("potential_questions") or deterministic.get("potential_questions")
        exam_trends = analysis_data.get("exam_trends") or deterministic.get("exam_trends")

        from sqlalchemy import select

        # Upsert: find existing by paper_id (foreign key)
        existing = db.session.execute(
            select(PaperAnalysis).where(PaperAnalysis.paper_id == paper.id)
        ).scalar_one_or_none()

        if existing:
            existing.topic_analysis = topic_analysis
            existing.difficulty_analysis = difficulty_analysis
            existing.mark_distribution = mark_distribution
            existing.unit_distribution = unit_distribution
            existing.question_type_distribution = question_type_distribution
            existing.study_recommendations = study_recommendations
            existing.potential_questions = potential_questions
            existing.exam_trends = exam_trends
            existing.generated_at = datetime.now(timezone.utc)
            existing.model_name = settings.GEMINI_MODEL
            analysis = existing
        else:
            analysis = PaperAnalysis(
                paper_id=paper.id,
                topic_analysis=topic_analysis,
                difficulty_analysis=difficulty_analysis,
                mark_distribution=mark_distribution,
                unit_distribution=unit_distribution,
                question_type_distribution=question_type_distribution,
                study_recommendations=study_recommendations,
                potential_questions=potential_questions,
                exam_trends=exam_trends,
                generated_at=datetime.now(timezone.utc),
                model_name=settings.GEMINI_MODEL,
                analysis_version="1.0",
            )
            db.session.add(analysis)

        db.session.flush()
        db.session.commit()
        logger.info("paper_analysis_saved", paper_id=paper.id)
        return analysis

    def _deterministic_analysis(self, questions: List[PaperQuestion]) -> dict:
        """Smart fallback: compute comprehensive statistics & recommendations directly from extracted questions."""
        topics = self._aggregate_topics(questions)
        units = self._count_units(questions)
        marks = self._count_marks(questions)
        difficulties = self._count_difficulties(questions)
        q_types = self._count_question_types(questions)

        # Smart predicted / potential questions from highest weight questions
        potential_qs = []
        sorted_qs = sorted(questions, key=lambda x: (x.marks or 0), reverse=True)
        for q in sorted_qs[:4]:
            potential_qs.append({
                "question": q.question_text.strip()[:240],
                "label": "High Probability",
                "basis": f"High weightage ({int(q.marks or 10)} marks) covering {q.topic or q.unit or 'core syllabus'}",
                "topic": q.topic or "Core Concept",
                "estimated_marks": int(q.marks or 10),
            })

        # Smart study recommendations sorted by unit weight
        sorted_units = sorted(units.items(), key=lambda kv: kv[1]["marks"], reverse=True)
        study_recs = []
        for p, (u_name, u_info) in enumerate(sorted_units[:3], 1):
            study_recs.append({
                "priority": p,
                "topic": f"{u_name} ({int(u_info['marks'])} Marks)",
                "reason": f"Heavily tested with {u_info['question_count']} questions in the exam.",
                "suggested_time": f"{max(2, round(u_info['marks'] / 10))} hours",
            })

        top_unit_name = sorted_units[0][0] if sorted_units else "Unit 1"
        top_unit_marks = sorted_units[0][1]["marks"] if sorted_units else 0

        exam_trends = {
            "overall_trend": f"Structured university exam paper with {len(questions)} questions across {len(units)} units totalling {marks['total_marks']} marks.",
            "insights": [
                f"{top_unit_name} carries the highest exam weightage ({top_unit_marks} marks).",
                f"Paper balance: {difficulties['distribution_percentage']['medium']}% medium application and {difficulties['distribution_percentage']['hard']}% advanced analytical questions.",
                f"Syllabus distribution focuses on core concepts across {len(topics)} major academic topics."
            ]
        }

        return {
            "topic_analysis": {
                "major_topics": topics,
                "topic_count": len(topics),
            },
            "difficulty_analysis": difficulties,
            "mark_distribution": marks,
            "unit_distribution": units,
            "question_type_distribution": q_types,
            "study_recommendations": study_recs,
            "potential_questions": potential_qs,
            "exam_trends": exam_trends,
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
