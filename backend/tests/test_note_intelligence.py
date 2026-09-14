"""
tests/test_note_intelligence.py — Note upload, note-only QA grounding, and AI endpoints.
"""
from __future__ import annotations

from http import HTTPStatus
from unittest.mock import MagicMock, patch

from app.extensions import db
from app.models.note import Note, NoteStatus
from app.models.note_analysis import NoteAnalysis


def test_student_upload_note(client, student_headers, sample_pdf_stream):
    """Test student successfully uploads a note."""
    with patch("app.services.note_processing_service.NoteProcessingService.process_async") as mock_proc:
        mock_proc.return_value = None

        data = {
            "file": (sample_pdf_stream, "my_lecture_notes.pdf"),
            "title": "DBMS Unit 1 & 2 Lecture Notes",
        }

        res = client.post(
            "/api/v1/notes",
            data=data,
            headers=student_headers,
            content_type="multipart/form-data",
        )

        assert res.status_code == HTTPStatus.CREATED
        resp = res.get_json()
        assert resp["success"] is True
        assert "note_id" in resp["data"]
        assert resp["data"]["status"] == "UPLOADED"


def test_note_qa_strictly_grounded(client, student_headers, student_user):
    """Test note Q&A returns grounded response from mock Gemini."""
    note = Note(
        student_id=student_user.id,
        title="Ready Physics Notes",
        original_filename="physics.pdf",
        stored_filename="physics_stored.pdf",
        file_path="/tmp/physics.pdf",
        file_size=2048,
        mime_type="application/pdf",
        checksum="checksum_physics_note",
        status=NoteStatus.READY,
        processing_progress=100,
    )
    db.session.add(note)
    db.session.commit()

    with patch("app.services.gemini_service.GeminiService.get_instance") as mock_gemini_cls:
        mock_gemini = MagicMock()
        mock_gemini._model_name = "gemini-2.5-flash"
        mock_gemini.generate_json.return_value = {
            "answer": "According to the note, Newton's second law is F = ma.",
            "found_in_note": True,
            "source_chunks": [{"chunk_text": "F = ma", "confidence": 0.95}],
            "confidence": 0.95,
            "note_id": note.id,
        }
        mock_gemini_cls.return_value = mock_gemini

        with patch("app.services.embedding_service.EmbeddingService.embed_single") as mock_embed:
            mock_embed.return_value = [0.1] * 384
            with patch("app.services.vector_store_service.VectorStoreService.search_note_chunks") as mock_search:
                mock_search.return_value = [
                    {"document": "Newton's second law states F=ma", "metadata": {"page_number": 1}, "similarity": 0.92}
                ]

                res = client.post(
                    f"/api/v1/notes/{note.id}/query",
                    json={"question": "What is Newton's second law?"},
                    headers=student_headers,
                )

                assert res.status_code == HTTPStatus.OK
                resp = res.get_json()
                assert resp["success"] is True
                assert resp["data"]["found_in_note"] is True
                assert "Newton" in resp["data"]["answer"]


def test_note_isolation_between_students(client, student_headers, teacher_user):
    """Test a student cannot access another user's note."""
    # Note belongs to teacher (different user)
    note = Note(
        student_id=teacher_user.id,
        title="Teacher Private Note",
        original_filename="private.pdf",
        stored_filename="private_note.pdf",
        file_path="/tmp/private.pdf",
        file_size=1024,
        mime_type="application/pdf",
        checksum="checksum_private_note",
        status=NoteStatus.READY,
    )
    db.session.add(note)
    db.session.commit()

    res = client.get(f"/api/v1/notes/{note.id}", headers=student_headers)
    assert res.status_code == HTTPStatus.NOT_FOUND
    resp = res.get_json()
    assert resp["error"]["code"] == "NOTE_NOT_FOUND"
