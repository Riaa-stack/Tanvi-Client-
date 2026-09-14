"""
app/utils/decorators.py — Authorization decorators for role-based access control.
"""
from __future__ import annotations

from functools import wraps
from http import HTTPStatus

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from app.models.user import UserRole


def require_role(*roles):
    """Decorator that requires the current user to have one of the specified roles."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            if user_role not in roles:
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": {
                                "code": "AUTH_FORBIDDEN",
                                "message": f"Access denied. Required role(s): {', '.join(roles)}",
                            },
                        }
                    ),
                    HTTPStatus.FORBIDDEN,
                )
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def teacher_required(fn):
    """Require TEACHER role."""
    return require_role(UserRole.TEACHER)(fn)


def student_required(fn):
    """Require STUDENT role."""
    return require_role(UserRole.STUDENT)(fn)


def any_role_required(fn):
    """Require any authenticated user (either role)."""
    return require_role(UserRole.TEACHER, UserRole.STUDENT)(fn)
