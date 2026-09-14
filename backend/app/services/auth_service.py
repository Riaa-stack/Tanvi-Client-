"""
app/services/auth_service.py — Authentication business logic.
"""
from __future__ import annotations

from datetime import datetime, timezone

from flask_jwt_extended import create_access_token, create_refresh_token, get_jti

from app.errors import AuthenticationError, ConflictError, ValidationError
from app.extensions import db
from app.models.user import UserRole
from app.repositories.token_repository import TokenRepository
from app.repositories.user_repository import UserRepository


class AuthService:
    """Handles registration, login, logout, and token operations."""

    @staticmethod
    def register(name: str, email: str, password: str, role: str) -> dict:
        """
        Register a new user.
        Returns user dict on success.
        """
        # Validate role
        if role not in UserRole.ALL:
            raise ValidationError(
                f"Invalid role '{role}'. Must be one of: {', '.join(UserRole.ALL)}"
            )

        # Validate email uniqueness
        if UserRepository.email_exists(email):
            raise ConflictError(f"An account with email '{email}' already exists.")

        # Create user
        user = UserRepository.create(
            name=name.strip(),
            email=email.strip().lower(),
            password=password,
            role=role,
        )
        db.session.commit()

        return user.to_dict()

    @staticmethod
    def login(email: str, password: str) -> dict:
        """
        Authenticate user and return tokens.
        """
        user = UserRepository.get_by_email(email)
        if not user or not user.check_password(password):
            raise AuthenticationError("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationError("Account is deactivated.")

        # Update last login
        UserRepository.update_last_login(user)
        db.session.commit()

        # Create JWT tokens
        identity = str(user.id)
        additional_claims = {"role": user.role, "name": user.name}

        access_token = create_access_token(
            identity=identity, additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(
            identity=identity, additional_claims=additional_claims
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
        }

    @staticmethod
    def refresh(current_user_id: str, jwt_payload: dict) -> dict:
        """Issue a new access token from a valid refresh token."""
        user = UserRepository.get_by_id(current_user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User not found or inactive.")

        additional_claims = {"role": user.role, "name": user.name}
        access_token = create_access_token(
            identity=str(user.id), additional_claims=additional_claims
        )
        return {"access_token": access_token}

    @staticmethod
    def logout(jti: str, user_id: str) -> None:
        """Revoke the current token (add to blocklist)."""
        TokenRepository.revoke(jti=jti, user_id=user_id)
