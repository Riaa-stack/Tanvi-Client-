"""
tests/test_contract_regressions.py — Regression test suite for frontend-backend contract alignments.
"""
from __future__ import annotations

import io
import os
from unittest.mock import MagicMock, patch
import pytest

from app.models.paper import Paper, PaperStatus
from app.models.note import Note, NoteStatus
from app.extensions import db


def test_paper_to_dict_exposes_academic_scope_id(client, teacher_headers, teacher_user, academic_data):
    """Regression test 1: Paper.to_dict() must expose academic_scope_id in public dict."""
    paper = Paper(
        teacher_id=teacher_user.id,
        title="Test Scope Paper",
        original_filename="scope.pdf",
        stored_filename="stored_scope.pdf",
        file_path="/tmp/scope.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="testchecksum12345",
        year=2025,
        semester_id=academic_data["semester"].id,
        branch_id=academic_data["branch"].id,
        subject_id=academic_data["subject"].id,
        academic_scope_id=academic_data["scope"].id,
        status=PaperStatus.READY,
    )
    db.session.add(paper)
    db.session.commit()

    # Public to_dict() (include_internal=False)
    public_dict = paper.to_dict(include_internal=False)
    assert "academic_scope_id" in public_dict
    assert public_dict["academic_scope_id"] == academic_data["scope"].id


def test_rag_query_supports_nested_scope_parameter(client, student_headers):
    """Regression test 2: RAG query endpoint must accept nested scope dicts without error."""
    with patch("app.services.gemini_service.GeminiService.get_instance") as mock_gemini_cls:
        mock_gemini = MagicMock()
        mock_gemini.generate_json.return_value = {
            "answer": "Binary search tree is a node-based binary tree data structure.",
            "evidence_used": True,
            "confidence": "HIGH",
            "sources": [
                {
                    "type": "question",
                    "paper_id": "paper-123",
                    "year": 2025,
                    "question_number": "Q5(a)",
                    "page": 3,
                    "similarity": 0.92,
                }
            ],
            "used_fallback": False,
            "fallback_reason": None,
        }
        mock_gemini_cls.return_value = mock_gemini

        with patch("app.services.embedding_service.EmbeddingService.embed_single") as mock_embed:
            mock_embed.return_value = [0.05] * 384
            with patch("app.services.vector_store_service.VectorStoreService.search_paper_chunks") as mock_chunks:
                mock_chunks.return_value = []
                with patch("app.services.vector_store_service.VectorStoreService.search_paper_questions") as mock_q:
                    mock_q.return_value = [
                        {
                            "document": "Explain Binary Search Tree.",
                            "metadata": {"paper_id": "paper-123", "year": 2025, "page_number": 3, "question_id": "q-5"},
                            "similarity": 0.92,
                        }
                    ]

                    payload = {
                        "question": "What is binary search tree?",
                        "scope": {
                            "paper_id": "paper-123",
                            "year": 2025,
                        },
                        "n_results": 5,
                    }
                    res = client.post(
                        "/api/v1/rag/query",
                        json=payload,
                        headers=student_headers,
                    )
                    assert res.status_code == 200
                    data = res.get_json()
                    assert data["success"] is True
                    assert "Binary search tree" in data["data"]["answer"]
                    assert len(data["data"]["sources"]) > 0


def test_student_paper_file_serving(client, student_headers, teacher_user, academic_data, tmp_path):
    """Regression test 3: Student paper file serving endpoint must stream existing PDF files."""
    dummy_pdf_path = tmp_path / "dummy_exam.pdf"
    dummy_pdf_path.write_bytes(b"%PDF-1.4 dummy binary content")

    paper = Paper(
        teacher_id=teacher_user.id,
        title="File Serving Paper",
        original_filename="dummy_exam.pdf",
        stored_filename="stored_exam.pdf",
        file_path=str(dummy_pdf_path),
        file_size=len(b"%PDF-1.4 dummy binary content"),
        mime_type="application/pdf",
        checksum="dummychecksum999",
        year=2025,
        semester_id=academic_data["semester"].id,
        branch_id=academic_data["branch"].id,
        subject_id=academic_data["subject"].id,
        academic_scope_id=academic_data["scope"].id,
        status=PaperStatus.READY,
    )
    db.session.add(paper)
    db.session.commit()

    res = client.get(
        f"/api/v1/student/papers/{paper.id}/file",
        headers=student_headers,
    )
    assert res.status_code == 200
    assert res.mimetype == "application/pdf"
    assert res.data == b"%PDF-1.4 dummy binary content"


def test_student_note_file_serving(client, student_headers, student_user, tmp_path):
    """Regression test 4: Student note file serving endpoint must stream existing note PDF files."""
    dummy_note_path = tmp_path / "dummy_note.pdf"
    dummy_note_path.write_bytes(b"%PDF-1.4 student note content")

    note = Note(
        student_id=student_user.id,
        title="Lecture Note 1",
        original_filename="dummy_note.pdf",
        stored_filename="stored_note.pdf",
        file_path=str(dummy_note_path),
        file_size=len(b"%PDF-1.4 student note content"),
        mime_type="application/pdf",
        checksum="notechecksum999",
        status=NoteStatus.READY,
    )
    db.session.add(note)
    db.session.commit()

    res = client.get(
        f"/api/v1/notes/{note.id}/file",
        headers=student_headers,
    )
    assert res.status_code == 200
    assert res.mimetype == "application/pdf"
    assert res.data == b"%PDF-1.4 student note content"
