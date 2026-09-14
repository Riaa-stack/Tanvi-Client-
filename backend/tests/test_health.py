"""
tests/test_health.py — Health check endpoints tests.
"""
from __future__ import annotations

from http import HTTPStatus


def test_health_liveness(client):
    """Test basic /api/v1/health liveness probe."""
    res = client.get("/api/v1/health")
    assert res.status_code == HTTPStatus.OK
    data = res.get_json()
    assert data["status"] == "ok"
    assert "EduArchive AI" in data["service"]


def test_health_detailed(client):
    """Test detailed component health check."""
    res = client.get("/api/v1/health/detailed")
    assert res.status_code in (HTTPStatus.OK, HTTPStatus.SERVICE_UNAVAILABLE)
    data = res.get_json()
    assert "status" in data
    assert "components" in data
    assert "database" in data["components"]
