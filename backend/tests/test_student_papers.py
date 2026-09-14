"""
tests/test_student_papers.py — Student paper discovery, search, and analysis endpoints.
"""
from __future__ import annotations

from http import HTTPStatus

from app.extensions import db
from app.models.paper import Paper, PaperStatus
from app.models.paper_question import PaperQuestion, QuestionType, DifficultyLevel


def test_list_ready_papers_empty(client, student_headers):
    """Test student listing papers when none are ready."""
    res = client.get("/api/v1/student/papers", headers=student_headers)
    assert res.status_code == HTTPStatus.OK
    resp = res.get_json()
    assert resp["success"] is True
    assert resp["papers"] == []
    assert resp["pagination"]["total"] == 0


def test_student_discovers_only_ready_papers(client, student_headers, teacher_user, academic_data):
    """Test student can only view READY papers, not UPLOADED or FAILED."""
    # Create one READY and one UPLOADED paper
    scope = academic_data["scope"]
    sem = academic_data["semester"]
    branch = academic_data["branch"]
    subj = academic_data["subject"]

    ready_paper = Paper(
        teacher_id=teacher_user.id,
        title="Ready Question Paper 2024",
        original_filename="ready.pdf",
        stored_filename="ready_123.pdf",
        file_path="/tmp/ready.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="checksum_ready_1",
        year=2024,
        semester_id=sem.id,
        branch_id=branch.id,
        subject_id=subj.id,
        academic_scope_id=scope.id,
        status=PaperStatus.READY,
        processing_progress=100,
    )

    draft_paper = Paper(
        teacher_id=teacher_user.id,
        title="Draft Processing Paper",
        original_filename="draft.pdf",
        stored_filename="draft_123.pdf",
        file_path="/tmp/draft.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="checksum_draft_2",
        year=2023,
        semester_id=sem.id,
        branch_id=branch.id,
        subject_id=subj.id,
        academic_scope_id=scope.id,
        status=PaperStatus.STRUCTURING,
        processing_progress=50,
    )

    db.session.add_all([ready_paper, draft_paper])
    db.session.commit()

    res = client.get("/api/v1/student/papers", headers=student_headers)
    assert res.status_code == HTTPStatus.OK
    resp = res.get_json()
    assert resp["pagination"]["total"] == 1
    assert resp["papers"][0]["id"] == ready_paper.id


def test_search_questions(client, student_headers, teacher_user, academic_data):
    """Test searching questions across ready papers with filters."""
    sem = academic_data["semester"]
    branch = academic_data["branch"]
    subj = academic_data["subject"]
    scope = academic_data["scope"]

    paper = Paper(
        teacher_id=teacher_user.id,
        title="DBMS 2024",
        original_filename="dbms.pdf",
        stored_filename="dbms_stored.pdf",
        file_path="/tmp/dbms.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="checksum_dbms_q",
        year=2024,
        semester_id=sem.id,
        branch_id=branch.id,
        subject_id=subj.id,
        academic_scope_id=scope.id,
        status=PaperStatus.READY,
        processing_progress=100,
    )
    db.session.add(paper)
    db.session.flush()

    q1 = PaperQuestion(
        paper_id=paper.id,
        question_number="Q1(a)",
        question_text="Explain B-Tree indexing in Database Systems with an example.",
        normalized_text="explain b-tree indexing in database systems with an example",
        marks=10.0,
        section="A",
        unit="Unit 3",
        topic="B-Tree Indexing",
        difficulty=DifficultyLevel.MEDIUM,
        question_type=QuestionType.DESCRIPTIVE,
    )
    q2 = PaperQuestion(
        paper_id=paper.id,
        question_number="Q2(a)",
        question_text="Define Normalization. Explain 1NF, 2NF and 3NF.",
        normalized_text="define normalization explain 1nf 2nf and 3nf",
        marks=10.0,
        section="A",
        unit="Unit 2",
        topic="Normalization",
        difficulty=DifficultyLevel.EASY,
        question_type=QuestionType.CONCEPTUAL,
    )
    db.session.add_all([q1, q2])
    db.session.commit()

    # Search for "indexing"
    res = client.get("/api/v1/student/questions/search?q=indexing", headers=student_headers)
    assert res.status_code == HTTPStatus.OK
    resp = res.get_json()
    assert resp["pagination"]["total"] == 1
    assert "B-Tree" in resp["questions"][0]["question_text"]
