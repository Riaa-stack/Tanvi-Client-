"""
tests/test_auth.py — Authentication API and token management tests.
"""
from __future__ import annotations

import json
from http import HTTPStatus


def test_register_teacher_success(client):
    """Test successful teacher registration."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Prof. Alan Turing",
            "email": "turing@eduarchive.ai",
            "password": "StrongPassword123!",
            "role": "TEACHER",
        },
    )
    assert res.status_code == HTTPStatus.CREATED
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["email"] == "turing@eduarchive.ai"
    assert data["data"]["role"] == "TEACHER"
    assert "password" not in data["data"]


def test_register_student_success(client):
    """Test successful student registration."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Ada Lovelace",
            "email": "ada@eduarchive.ai",
            "password": "StrongPassword123!",
            "role": "STUDENT",
        },
    )
    assert res.status_code == HTTPStatus.CREATED
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["role"] == "STUDENT"


def test_register_duplicate_email(client, teacher_user):
    """Test duplicate registration returns 409 Conflict."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Another Teacher",
            "email": teacher_user.email,
            "password": "Password1234!",
            "role": "TEACHER",
        },
    )
    assert res.status_code == HTTPStatus.CONFLICT
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "CONFLICT"


def test_register_invalid_role(client):
    """Test invalid role returns 422 Unprocessable Entity."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Hacker",
            "email": "hacker@eduarchive.ai",
            "password": "Password1234!",
            "role": "SUPERADMIN",
        },
    )
    assert res.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    data = res.get_json()
    assert data["success"] is False


def test_login_success(client, teacher_user):
    """Test successful login returns access and refresh tokens."""
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": teacher_user.email,
            "password": "Teacher1234!",
        },
    )
    assert res.status_code == HTTPStatus.OK
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["user"]["email"] == teacher_user.email


def test_login_wrong_password(client, teacher_user):
    """Test login with incorrect password returns 401 Unauthorized."""
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": teacher_user.email,
            "password": "WrongPassword999!",
        },
    )
    assert res.status_code == HTTPStatus.UNAUTHORIZED
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "AUTH_INVALID_CREDENTIALS"


def test_me_endpoint(client, teacher_headers, teacher_user):
    """Test /api/v1/auth/me returns current user profile."""
    res = client.get("/api/v1/auth/me", headers=teacher_headers)
    assert res.status_code == HTTPStatus.OK
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["id"] == teacher_user.id
    assert data["data"]["email"] == teacher_user.email


def test_me_without_token(client):
    """Test accessing protected route without token returns 401."""
    res = client.get("/api/v1/auth/me")
    assert res.status_code == HTTPStatus.UNAUTHORIZED


def test_logout_and_revocation(client, teacher_user):
    """Test token revocation on logout."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": teacher_user.email, "password": "Teacher1234!"},
    )
    access_token = login_res.get_json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # Verify access works
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == HTTPStatus.OK

    # Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == HTTPStatus.OK

    # Verify token is now revoked
    revoked_res = client.get("/api/v1/auth/me", headers=headers)
    assert revoked_res.status_code == HTTPStatus.UNAUTHORIZED
    data = revoked_res.get_json()
    assert data["error"]["code"] == "AUTH_TOKEN_REVOKED"
