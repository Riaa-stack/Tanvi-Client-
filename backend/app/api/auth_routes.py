"""
app/api/auth_routes.py — Authentication endpoints.

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
"""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from pydantic import BaseModel, EmailStr, field_validator

from app.errors import ValidationError
from app.models.user import UserRole
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.utils.response import created_response, success_response

auth_bp = Blueprint("auth", __name__)


# ── Request schemas ───────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty.")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in UserRole.ALL:
            raise ValueError(f"Role must be one of: {', '.join(UserRole.ALL)}")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Routes ────────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user (TEACHER or STUDENT)."""
    try:
        req = RegisterRequest.model_validate(request.get_json() or {})
    except Exception as e:
        raise ValidationError(str(e))

    user = AuthService.register(
        name=req.name,
        email=str(req.email),
        password=req.password,
        role=req.role,
    )
    return created_response(data=user, message="Registration successful.")


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate and receive JWT tokens."""
    try:
        req = LoginRequest.model_validate(request.get_json() or {})
    except Exception as e:
        raise ValidationError(str(e))

    result = AuthService.login(email=str(req.email), password=req.password)
    return success_response(data=result, message="Login successful.")


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Get a new access token using a refresh token."""
    current_user_id = get_jwt_identity()
    jwt_payload = get_jwt()
    result = AuthService.refresh(current_user_id, jwt_payload)
    return success_response(data=result, message="Token refreshed.")


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Revoke the current access token."""
    jwt_payload = get_jwt()
    jti = jwt_payload.get("jti")
    user_id = get_jwt_identity()
    AuthService.logout(jti=jti, user_id=user_id)
    return success_response(message="Logged out successfully.")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Return the current authenticated user's profile."""
    user_id = get_jwt_identity()
    user = UserRepository.get_by_id(user_id)
    if not user:
        raise ValidationError("User not found.")
    return success_response(data=user.to_dict())
