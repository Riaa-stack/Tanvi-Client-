"""
app/services/question_service.py — Question extraction, normalization, and classification.

Extracts structured questions from cleaned PDF text using:
1. Deterministic regex patterns for common question formats
2. Gemini for semantic classification when deterministic is insufficient
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional

from app.logging_config import get_logger
from app.models.paper_question import DifficultyLevel, PaperQuestion, QuestionType
from app.services.cleaning_service import DocumentCleaningService

logger = get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Question number pattern families
# ─────────────────────────────────────────────────────────────────────────────
_QNUM_PATTERNS = [
    # Q1, Q.1, Q1., Q 1
    r"(?:^|\n)(?P<num>Q\.?\s*\d+[a-zA-Z]?(?:\([a-zA-Z0-9]\))?)\s*[.):]?\s*",
    # 1. or 1) or 1:
    r"(?:^|\n)(?P<num>\d+[a-zA-Z]?[.):])\s+",
    # (a) (b) (i) (ii)
    r"(?:^|\n)(?P<num>\([a-zA-Z]{1,3}\)|\([ivx]+\))\s+",
    # Question 1
    r"(?:^|\n)(?P<num>Question\s+\d+)\s*[.):]?\s*",
]

_MARKS_PATTERN = re.compile(
    r"\[?\(?(?P<marks>\d+(?:\.\d+)?)\s*(?:marks?|M|Marks)\)?\]?", re.IGNORECASE
)

_SECTION_PATTERN = re.compile(
    r"^(?:Section|SECTION)\s+(?P<section>[A-Z])\b", re.MULTILINE
)

_UNIT_PATTERN = re.compile(
    r"(?:Unit|UNIT)\s*[-:]\s*(?P<unit>\d+)", re.IGNORECASE
)


@dataclass
class ExtractedQuestion:
    """Intermediate representation of an extracted question."""
    question_number: str
    question_text: str
    marks: Optional[float] = None
    section: Optional[str] = None
    unit: Optional[str] = None
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty: str = DifficultyLevel.UNKNOWN
    question_type: str = QuestionType.UNKNOWN
    page_number: Optional[int] = None
    parent_number: Optional[str] = None
    sub_questions: List["ExtractedQuestion"] = field(default_factory=list)


class QuestionExtractionService:
    """
    Extracts and structures questions from cleaned text.
    """

    def __init__(self, cleaning_service: DocumentCleaningService):
        self._cleaner = cleaning_service

    def extract_questions(
        self, pages: list, paper_text: str
    ) -> List[ExtractedQuestion]:
        """
        Extract all questions from page content.
        Returns list of ExtractedQuestion instances.
        """
        questions: List[ExtractedQuestion] = []
        current_section = None

        # Process each page
        for page in pages:
            page_text = page.text
            page_num = page.page_number

            # Update section context
            section_match = _SECTION_PATTERN.search(page_text)
            if section_match:
                current_section = section_match.group("section")

            page_questions = self._extract_from_text(
                page_text, page_num, current_section
            )
            questions.extend(page_questions)

        # Deduplicate: remove duplicates by normalized text
        questions = self._deduplicate(questions)
        return questions

    def _extract_from_text(
        self, text: str, page_number: int, current_section: Optional[str]
    ) -> List[ExtractedQuestion]:
        """
        Use regex patterns to extract questions from a text block.
        """
        questions = []

        # Build a combined pattern that matches any question starter
        combined = re.compile(
            r"""
            (?:^|\n)
            (?P<qnum>
                Q\.?\s*\d+[a-zA-Z]?(?:\([a-zA-Z0-9]\))?[.):\s]|
                \d+[a-zA-Z]?[.)]\s|
                \([a-zA-Z]{1,3}\)\s|
                Question\s+\d+[.):\s]
            )
            (?P<body>.*?)
            (?=(?:\n(?:Q\.?\s*\d+|\d+[a-zA-Z]?[.)]\s|\([a-zA-Z]{1,3}\)\s|Question\s+\d+))|\Z)
            """,
            re.VERBOSE | re.DOTALL | re.MULTILINE,
        )

        for match in combined.finditer(text):
            qnum = match.group("qnum").strip(" \t\n.):").strip()
            body = match.group("body").strip()

            if not body or len(body) < 5:
                continue

            # Extract marks
            marks = None
            marks_match = _MARKS_PATTERN.search(body)
            if marks_match:
                try:
                    marks = float(marks_match.group("marks"))
                    # Remove marks notation from question text
                    body = _MARKS_PATTERN.sub("", body).strip()
                except ValueError:
                    pass

            # Extract unit
            unit = None
            unit_match = _UNIT_PATTERN.search(body)
            if unit_match:
                unit = f"Unit {unit_match.group('unit')}"

            q = ExtractedQuestion(
                question_number=qnum,
                question_text=body,
                marks=marks,
                section=current_section,
                unit=unit,
                page_number=page_number,
            )
            questions.append(q)

        return questions

    def _deduplicate(self, questions: List[ExtractedQuestion]) -> List[ExtractedQuestion]:
        """Remove near-duplicate questions based on normalized text."""
        seen: set[str] = set()
        unique = []
        for q in questions:
            key = re.sub(r"\s+", " ", q.question_text[:100].lower().strip())
            if key not in seen:
                seen.add(key)
                unique.append(q)
        return unique

    def classify_question_type(self, text: str) -> str:
        """
        Deterministic classification of question type from text.
        """
        text_lower = text.lower()

        if any(kw in text_lower for kw in ["derive", "derivation", "prove", "proof"]):
            return QuestionType.DERIVATION
        if any(kw in text_lower for kw in ["define", "definition", "what is", "what are"]):
            return QuestionType.DEFINITION
        if any(kw in text_lower for kw in ["explain", "describe", "elaborate", "discuss"]):
            return QuestionType.DESCRIPTIVE
        if any(kw in text_lower for kw in ["draw", "diagram", "sketch", "illustrate"]):
            return QuestionType.DIAGRAM
        if any(kw in text_lower for kw in ["calculate", "find", "compute", "determine", "solve"]):
            return QuestionType.NUMERICAL
        if any(kw in text_lower for kw in ["write a program", "code", "algorithm", "implement"]):
            return QuestionType.PROGRAMMING
        if any(kw in text_lower for kw in ["compare", "distinguish", "differentiate"]):
            return QuestionType.CONCEPTUAL
        if len(text.split()) <= 20:
            return QuestionType.SHORT_ANSWER
        if len(text.split()) > 60:
            return QuestionType.LONG_ANSWER

        return QuestionType.THEORY

    def estimate_difficulty(self, text: str, marks: Optional[float]) -> str:
        """
        Estimate difficulty from question characteristics.
        """
        if marks is not None:
            if marks <= 2:
                return DifficultyLevel.EASY
            elif marks <= 5:
                return DifficultyLevel.MEDIUM
            elif marks >= 8:
                return DifficultyLevel.HARD

        text_lower = text.lower()
        hard_keywords = ["derive", "prove", "design", "compare", "analyze", "evaluate"]
        if any(kw in text_lower for kw in hard_keywords):
            return DifficultyLevel.HARD

        easy_keywords = ["define", "list", "state", "what is"]
        if any(kw in text_lower for kw in easy_keywords):
            return DifficultyLevel.EASY

        return DifficultyLevel.MEDIUM

    def convert_to_db_questions(
        self, extracted: List[ExtractedQuestion], paper_id: str
    ) -> List[PaperQuestion]:
        """
        Convert extracted question objects to database model instances.
        """
        db_questions = []
        for eq in extracted:
            # Classify type and difficulty deterministically
            q_type = self.classify_question_type(eq.question_text)
            difficulty = self.estimate_difficulty(eq.question_text, eq.marks)

            normalized = self._cleaner.normalize_question_text(eq.question_text)

            pq = PaperQuestion(
                paper_id=paper_id,
                question_number=eq.question_number,
                question_text=eq.question_text,
                normalized_text=normalized,
                marks=eq.marks,
                section=eq.section,
                unit=eq.unit,
                topic=eq.topic,
                subtopic=eq.subtopic,
                difficulty=difficulty,
                question_type=q_type,
                page_number=eq.page_number,
            )
            db_questions.append(pq)

        return db_questions
