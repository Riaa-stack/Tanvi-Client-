"""
tests/test_teacher_papers.py — Teacher question paper management tests.
"""
from __future__ import annotations

from http import HTTPStatus
from unittest.mock import patch


def test_upload_paper_success(client, teacher_headers, sample_pdf_stream):
    """Test teacher successfully uploads a paper."""
    with patch("app.services.paper_processing_service.PaperProcessingService.process_async") as mock_proc:
        mock_proc.return_value = None

        data = {
            "file": (sample_pdf_stream, "dbms_summer_2024.pdf"),
            "title": "DBMS Summer 2024 Question Paper",
            "year": "2024",
            "semester": "5",
            "subject": "Database Management Systems",
            "branch": "Computer Science & Engineering",
            "college": "Ram Meghe College",
            "university": "SGBAU",
        }

        res = client.post(
            "/api/v1/teacher/papers",
            data=data,
            headers=teacher_headers,
            content_type="multipart/form-data",
        )

        assert res.status_code == HTTPStatus.CREATED
        resp = res.get_json()
        assert resp["success"] is True
        assert "paper_id" in resp["data"]
        assert resp["data"]["status"] == "UPLOADED"


def test_upload_paper_missing_fields(client, teacher_headers, sample_pdf_stream):
    """Test validation failure when required metadata fields are missing."""
    data = {
        "file": (sample_pdf_stream, "test.pdf"),
        "title": "Incomplete Paper",
        # Missing year, semester, subject, branch, college, university
    }
    res = client.post(
        "/api/v1/teacher/papers",
        data=data,
        headers=teacher_headers,
        content_type="multipart/form-data",
    )
    assert res.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    resp = res.get_json()
    assert resp["success"] is False


def test_student_cannot_upload_paper(client, student_headers, sample_pdf_stream):
    """Test student role is forbidden from teacher paper upload endpoint."""
    data = {
        "file": (sample_pdf_stream, "test.pdf"),
        "title": "Attempted Student Upload",
        "year": "2024",
        "semester": "5",
        "subject": "Database Management Systems",
        "branch": "Computer Science & Engineering",
        "college": "Ram Meghe College",
        "university": "SGBAU",
    }
    res = client.post(
        "/api/v1/teacher/papers",
        data=data,
        headers=student_headers,
        content_type="multipart/form-data",
    )
    assert res.status_code == HTTPStatus.FORBIDDEN
    resp = res.get_json()
    assert resp["error"]["code"] == "AUTH_FORBIDDEN"


def test_teacher_dashboard(client, teacher_headers):
    """Test teacher dashboard endpoint returns stats and recent papers."""
    res = client.get("/api/v1/teacher/dashboard", headers=teacher_headers)
    assert res.status_code == HTTPStatus.OK
    resp = res.get_json()
    assert resp["success"] is True
    assert "statistics" in resp["data"]
    assert "recent_papers" in resp["data"]
    assert "total" in resp["data"]["statistics"]
