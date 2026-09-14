"""
tests/test_historical.py — Historical intelligence and dynamic recomputation tests.
"""
from __future__ import annotations

from http import HTTPStatus

from app.extensions import db
from app.models.historical_analysis import EvidenceLevel, SubjectHistoricalAnalysis
from app.models.paper import Paper, PaperStatus
from app.models.paper_question import PaperQuestion, DifficultyLevel, QuestionType
from app.services.historical_service import HistoricalService


def test_historical_scope_fallback_when_empty(client, student_headers, academic_data):
    """Test historical intelligence returns curriculum fallback when no papers exist."""
    scope = academic_data["scope"]

    res = client.get(f"/api/v1/student/historical/{scope.id}", headers=student_headers)
    assert res.status_code == HTTPStatus.OK
    resp = res.get_json()
    assert resp["success"] is True
    assert resp["data"]["available"] is False
    assert "fallback" in resp["data"]


def test_historical_computation_deterministic(academic_data, teacher_user):
    """Test deterministic aggregation of topic frequencies and unit marks without LLM."""
    scope = academic_data["scope"]
    sem = academic_data["semester"]
    branch = academic_data["branch"]
    subj = academic_data["subject"]

    # Paper 1 (2023)
    p1 = Paper(
        teacher_id=teacher_user.id,
        title="DBMS 2023",
        original_filename="dbms_2023.pdf",
        stored_filename="dbms_2023.pdf",
        file_path="/tmp/2023.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="chk_2023",
        year=2023,
        semester_id=sem.id,
        branch_id=branch.id,
        subject_id=subj.id,
        academic_scope_id=scope.id,
        status=PaperStatus.READY,
    )
    # Paper 2 (2024)
    p2 = Paper(
        teacher_id=teacher_user.id,
        title="DBMS 2024",
        original_filename="dbms_2024.pdf",
        stored_filename="dbms_2024.pdf",
        file_path="/tmp/2024.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="chk_2024",
        year=2024,
        semester_id=sem.id,
        branch_id=branch.id,
        subject_id=subj.id,
        academic_scope_id=scope.id,
        status=PaperStatus.READY,
    )
    db.session.add_all([p1, p2])
    db.session.flush()

    q1 = PaperQuestion(
        paper_id=p1.id,
        question_number="Q1",
        question_text="Explain SQL Joins with examples.",
        topic="SQL Joins",
        unit="Unit 2",
        marks=10.0,
        difficulty=DifficultyLevel.MEDIUM,
        question_type=QuestionType.DESCRIPTIVE,
    )
    q2 = PaperQuestion(
        paper_id=p2.id,
        question_number="Q1",
        question_text="What are the different types of SQL Joins?",
        topic="SQL Joins",
        unit="Unit 2",
        marks=10.0,
        difficulty=DifficultyLevel.EASY,
        question_type=QuestionType.CONCEPTUAL,
    )
    db.session.add_all([q1, q2])
    db.session.commit()

    service = HistoricalService()
    topic_freq = service._compute_topic_frequency([p1, p2])
    assert "SQL Joins" in topic_freq
    assert topic_freq["SQL Joins"]["count"] == 2
    assert topic_freq["SQL Joins"]["total_marks"] == 20.0
    assert len(topic_freq["SQL Joins"]["papers"]) == 2

    unit_imp = service._compute_unit_importance([p1, p2])
    assert "Unit 2" in unit_imp
    assert unit_imp["Unit 2"]["total_marks"] == 20.0
    assert unit_imp["Unit 2"]["importance"] == "VERY_HIGH"
