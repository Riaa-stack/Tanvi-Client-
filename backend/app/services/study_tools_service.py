"""
app/services/study_tools_service.py — Study tools generator for papers and subjects.

Provides dynamically generated active recall flashcards and practice quizzes
grounded in the university exam questions, major topics, and units.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List

from app.extensions import db
from app.logging_config import get_logger
from app.models.paper import Paper, PaperStatus
from app.models.paper_analysis import PaperAnalysis
from app.models.subject import Subject
from app.prompts.paper_prompts import PAPER_FLASHCARDS_PROMPT, PAPER_QUIZ_PROMPT
from app.repositories.historical_repository import HistoricalRepository
from app.services.gemini_service import GeminiService

logger = get_logger(__name__)


class StudyToolsService:
    """Generates study tools (flashcards, quizzes) for papers and subjects."""

    def __init__(self, gemini_svc: GeminiService | None = None):
        self._gemini = gemini_svc or GeminiService.get_instance()

    def generate_paper_flashcards(self, paper: Paper, count: int = 10) -> Dict[str, Any]:
        """Generate active recall flashcards for a specific question paper."""
        analysis = PaperAnalysis.query.filter_by(paper_id=paper.id).first()

        questions_list = [
            f"Q{q.question_number or i+1}: {q.question_text} (Topic: {q.topic or 'General'}, Unit: {q.unit or 'Unit'})"
            for i, q in enumerate(paper.questions)
        ]

        major_topics = []
        if analysis and analysis.topic_analysis and analysis.topic_analysis.get("major_topics"):
            major_topics = [
                t["topic"] for t in analysis.topic_analysis["major_topics"] if "topic" in t
            ]

        content_context = (
            f"EXAM QUESTIONS:\n" + "\n".join(questions_list) + "\n\n"
            f"KEY TOPICS: {', '.join(major_topics)}"
        )

        subject_name = paper.subject.name if paper.subject else "Subject"
        branch_name = paper.branch.name if paper.branch else "Engineering"
        semester_name = f"Semester {paper.semester.number}" if paper.semester else "Semester 5"

        prompt = PAPER_FLASHCARDS_PROMPT.format(
            subject=subject_name,
            branch=branch_name,
            semester=semester_name,
            content_context=content_context,
            count=count,
        )

        try:
            result = self._gemini.generate_json(prompt, f"paper_flashcards_{paper.id}")
            if result.get("flashcards"):
                return result
        except Exception as e:
            logger.error("paper_flashcards_gemini_failed", paper_id=paper.id, error=str(e))

        # Fallback flashcards derived directly from questions
        cards = []
        for i, q in enumerate(paper.questions[:count]):
            cards.append(
                {
                    "id": i + 1,
                    "front": f"Explain: {q.question_text[:120]}...",
                    "back": f"Key exam topic from {q.topic or subject_name} ({q.unit or 'Core Unit'}). Refer to standard textbook definitions and step-by-step formulations.",
                    "concept": q.topic or subject_name,
                    "unit": q.unit or "Unit 1",
                    "difficulty": q.difficulty or "MEDIUM",
                }
            )
        return {"flashcards": cards, "total_count": len(cards)}

    def generate_paper_quiz(self, paper: Paper, count: int = 10) -> Dict[str, Any]:
        """Generate interactive practice quiz questions for a specific question paper."""
        analysis = PaperAnalysis.query.filter_by(paper_id=paper.id).first()

        questions_list = [
            f"Q{q.question_number or i+1}: {q.question_text} (Topic: {q.topic or 'General'}, Unit: {q.unit or 'Unit'})"
            for i, q in enumerate(paper.questions)
        ]

        major_topics = []
        if analysis and analysis.topic_analysis and analysis.topic_analysis.get("major_topics"):
            major_topics = [
                t["topic"] for t in analysis.topic_analysis["major_topics"] if "topic" in t
            ]

        content_context = (
            f"EXAM QUESTIONS:\n" + "\n".join(questions_list) + "\n\n"
            f"KEY TOPICS: {', '.join(major_topics)}"
        )

        subject_name = paper.subject.name if paper.subject else "Subject"
        branch_name = paper.branch.name if paper.branch else "Engineering"
        semester_name = f"Semester {paper.semester.number}" if paper.semester else "Semester 5"

        prompt = PAPER_QUIZ_PROMPT.format(
            subject=subject_name,
            branch=branch_name,
            semester=semester_name,
            content_context=content_context,
            count=count,
        )

        try:
            result = self._gemini.generate_json(prompt, f"paper_quiz_{paper.id}")
            if result.get("quiz_questions"):
                return result
        except Exception as e:
            logger.error("paper_quiz_gemini_failed", paper_id=paper.id, error=str(e))

        return {"quiz_questions": [], "total_questions": 0}

    def generate_subject_flashcards(self, subject: Subject, count: int = 10) -> Dict[str, Any]:
        """Generate flashcards synthesized across all papers for a subject."""
        papers = Paper.query.filter_by(subject_id=subject.id, status=PaperStatus.READY).all()
        
        all_questions = []
        all_topics = set()
        for p in papers:
            for q in p.questions:
                all_questions.append(f"[{p.year}] {q.question_text} (Topic: {q.topic})")
                if q.topic:
                    all_topics.add(q.topic)

        historical = None
        if papers and papers[0].academic_scope_id:
            historical = HistoricalRepository.get_by_scope(papers[0].academic_scope_id)

        clusters_text = ""
        if historical and historical.repetition_clusters:
            clusters_text = "REPETITION CLUSTERS:\n" + "\n".join(
                [f"- {c.get('canonical_question')}" for c in historical.repetition_clusters[:5]]
            )

        content_context = (
            f"QUESTIONS ACROSS ALL YEARS ({len(papers)} papers):\n"
            + "\n".join(all_questions[:20])
            + f"\n\nTOPICS: {', '.join(list(all_topics)[:15])}\n\n"
            + clusters_text
        )

        prompt = PAPER_FLASHCARDS_PROMPT.format(
            subject=subject.name,
            branch="Engineering",
            semester="Semester 5",
            content_context=content_context,
            count=count,
        )

        try:
            result = self._gemini.generate_json(prompt, f"subject_flashcards_{subject.id}")
            if result.get("flashcards"):
                return result
        except Exception as e:
            logger.error("subject_flashcards_gemini_failed", subject_id=subject.id, error=str(e))

        cards = []
        for i, top in enumerate(list(all_topics)[:count]):
            cards.append(
                {
                    "id": i + 1,
                    "front": f"What are the key concepts of {top}?",
                    "back": f"Fundamental topic in {subject.name} evaluated in SGBAU university examinations.",
                    "concept": top,
                    "unit": f"Unit {(i % 6) + 1}",
                    "difficulty": "MEDIUM",
                }
            )
        return {"flashcards": cards, "total_count": len(cards)}

    def generate_subject_quiz(self, subject: Subject, count: int = 10) -> Dict[str, Any]:
        """Generate practice quiz synthesized across all papers for a subject."""
        papers = Paper.query.filter_by(subject_id=subject.id, status=PaperStatus.READY).all()
        
        all_questions = []
        all_topics = set()
        for p in papers:
            for q in p.questions:
                all_questions.append(f"[{p.year}] {q.question_text} (Topic: {q.topic})")
                if q.topic:
                    all_topics.add(q.topic)

        historical = None
        if papers and papers[0].academic_scope_id:
            historical = HistoricalRepository.get_by_scope(papers[0].academic_scope_id)

        clusters_text = ""
        if historical and historical.repetition_clusters:
            clusters_text = "REPETITION CLUSTERS:\n" + "\n".join(
                [f"- {c.get('canonical_question')}" for c in historical.repetition_clusters[:5]]
            )

        content_context = (
            f"QUESTIONS ACROSS ALL YEARS ({len(papers)} papers):\n"
            + "\n".join(all_questions[:20])
            + f"\n\nTOPICS: {', '.join(list(all_topics)[:15])}\n\n"
            + clusters_text
        )

        prompt = PAPER_QUIZ_PROMPT.format(
            subject=subject.name,
            branch="Engineering",
            semester="Semester 5",
            content_context=content_context,
            count=count,
        )

        try:
            result = self._gemini.generate_json(prompt, f"subject_quiz_{subject.id}")
            if result.get("quiz_questions"):
                return result
        except Exception as e:
            logger.error("subject_quiz_gemini_failed", subject_id=subject.id, error=str(e))

        return {"quiz_questions": [], "total_questions": 0}
