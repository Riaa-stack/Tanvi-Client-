"""
tests/test_extraction_and_cleaning.py — Document text cleaning and question parser tests.
"""
from __future__ import annotations

from app.services.cleaning_service import DocumentCleaningService
from app.services.question_service import QuestionExtractionService


def test_document_cleaning_removes_headers_and_artifacts():
    """Test cleaning service removes page noise and preserves core mathematical content."""
    cleaner = DocumentCleaningService()
    raw_text = (
        "Time Allowed : 3 Hours\n"
        "[Total Marks : 80]\n"
        "Roll No. : 12345\n\n"
        "Q1. Solve the quadratic equation ax^2 + bx + c = 0.\n\n\n\n"
        "Page 1\n"
        "--1--\n"
    )

    cleaned = cleaner.clean_page_text(raw_text, page_number=1)
    assert "Time Allowed" not in cleaned
    assert "Total Marks" not in cleaned
    assert "Page 1" not in cleaned
    assert "ax^2 + bx + c = 0" in cleaned


def test_question_text_normalization():
    """Test normalizing question text for semantic comparison."""
    cleaner = DocumentCleaningService()
    text = "Q.1. (a) What is Database Normalization? [10 Marks]"
    normalized = cleaner.normalize_question_text(text)
    assert "q.1" not in normalized.lower()
    assert "database normalization" in normalized


def test_regex_question_extraction():
    """Test deterministic regex extraction of questions with marks and sections."""
    cleaner = DocumentCleaningService()
    extractor = QuestionExtractionService(cleaner)

    sample_page_text = (
        "Section A\n\n"
        "Q.1 Explain the difference between primary key and foreign key. [5 marks]\n\n"
        "Q.2 Describe ACID properties in transaction management with examples. [10 Marks]\n\n"
        "Q.3 Write short notes on:\n"
        "(a) ER Diagrams [5 Marks]\n"
        "(b) Functional Dependency [5 Marks]\n"
    )

    class MockPage:
        page_number = 1
        text = sample_page_text

    questions = extractor.extract_questions([MockPage()], sample_page_text)
    assert len(questions) >= 2
    assert any("primary key" in q.question_text.lower() for q in questions)
    assert any("acid" in q.question_text.lower() for q in questions)
