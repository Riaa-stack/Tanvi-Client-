"""
tests/test_rag.py — RAG pipeline and chat routes tests.
"""
from __future__ import annotations

from http import HTTPStatus
from unittest.mock import MagicMock, patch


def test_rag_query_endpoint(client, student_headers):
    """Test /api/v1/rag/query endpoint with mocked AI and vector services."""
    with patch("app.services.gemini_service.GeminiService.get_instance") as mock_gemini_cls:
        mock_gemini = MagicMock()
        mock_gemini.generate_json.return_value = {
            "answer": "Normalization eliminates data redundancy and improves data integrity.",
            "evidence_used": True,
            "confidence": "HIGH",
            "sources": [
                {
                    "type": "question",
                    "paper_id": "paper-123",
                    "year": 2024,
                    "question_number": "Q2(a)",
                    "page": 2,
                    "similarity": 0.89,
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
                            "document": "Define Normalization in DBMS.",
                            "metadata": {"paper_id": "paper-123", "year": 2024, "page_number": 2, "question_id": "q-1"},
                            "similarity": 0.89,
                        }
                    ]

                    res = client.post(
                        "/api/v1/rag/query",
                        json={"question": "What is database normalization?"},
                        headers=student_headers,
                    )

                    assert res.status_code == HTTPStatus.OK
                    resp = res.get_json()
                    assert resp["success"] is True
                    assert "Normalization" in resp["data"]["answer"]
                    assert len(resp["data"]["sources"]) > 0


def test_chat_session_lifecycle(client, student_headers):
    """Test creating chat session, sending message, and retrieving history."""
    # 1. Create chat session
    create_res = client.post(
        "/api/v1/chat/sessions",
        json={"title": "DBMS Revision Chat"},
        headers=student_headers,
    )
    assert create_res.status_code == HTTPStatus.CREATED
    session_id = create_res.get_json()["data"]["id"]

    # 2. Send message with mock RAG
    with patch("app.services.gemini_service.GeminiService.get_instance") as mock_gemini_cls:
        mock_gemini = MagicMock()
        mock_gemini.generate_json.return_value = {
            "answer": "Primary keys uniquely identify a tuple in a relation.",
            "confidence": "HIGH",
            "sources": [],
            "used_fallback": False,
        }
        mock_gemini_cls.return_value = mock_gemini

        with patch("app.services.embedding_service.EmbeddingService.embed_single") as mock_embed:
            mock_embed.return_value = [0.05] * 384
            with patch("app.services.vector_store_service.VectorStoreService.search_paper_chunks") as mock_c:
                mock_c.return_value = []
                with patch("app.services.vector_store_service.VectorStoreService.search_paper_questions") as mock_q:
                    mock_q.return_value = []

                    msg_res = client.post(
                        f"/api/v1/chat/sessions/{session_id}/messages",
                        json={"content": "What is a primary key?"},
                        headers=student_headers,
                    )
                    assert msg_res.status_code == HTTPStatus.OK
                    msg_resp = msg_res.get_json()
                    assert msg_resp["success"] is True
                    assert msg_resp["data"]["user_message"]["content"] == "What is a primary key?"
                    assert "Primary key" in msg_resp["data"]["assistant_message"]["content"]

    # 3. Retrieve session with message history
    get_res = client.get(f"/api/v1/chat/sessions/{session_id}", headers=student_headers)
    assert get_res.status_code == HTTPStatus.OK
    get_resp = get_res.get_json()
    assert len(get_resp["data"]["messages"]) == 2  # 1 user + 1 assistant
