"""
app/errors.py — Centralised error handling and consistent JSON error responses.
All application-level custom exceptions are defined here.
"""
from __future__ import annotations

from http import HTTPStatus
from typing import Any, Dict, Optional

from flask import Flask, jsonify
from flask_jwt_extended.exceptions import (
    InvalidHeaderError,
    JWTDecodeError,
    NoAuthorizationError,
    RevokedTokenError,
)
from werkzeug.exceptions import HTTPException

from app.logging_config import get_logger

logger = get_logger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Stable error codes
# ─────────────────────────────────────────────────────────────────────────────
class ErrorCode:
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
    AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED"
    AUTH_FORBIDDEN = "AUTH_FORBIDDEN"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_TOKEN_REVOKED = "AUTH_TOKEN_REVOKED"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    FILE_INVALID = "FILE_INVALID"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    PAPER_NOT_FOUND = "PAPER_NOT_FOUND"
    PAPER_NOT_READY = "PAPER_NOT_READY"
    PAPER_PROCESSING_FAILED = "PAPER_PROCESSING_FAILED"
    PAPER_ALREADY_PROCESSING = "PAPER_ALREADY_PROCESSING"
    NOTE_NOT_FOUND = "NOTE_NOT_FOUND"
    NOTE_ACCESS_DENIED = "NOTE_ACCESS_DENIED"
    NOTE_NOT_READY = "NOTE_NOT_READY"
    RAG_INSUFFICIENT_EVIDENCE = "RAG_INSUFFICIENT_EVIDENCE"
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR"
    VECTOR_STORE_ERROR = "VECTOR_STORE_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"


# ─────────────────────────────────────────────────────────────────────────────
# Base application exception
# ─────────────────────────────────────────────────────────────────────────────
class AppError(Exception):
    """Base class for all application-specific exceptions."""

    http_status: int = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code: str = ErrorCode.INTERNAL_ERROR

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        error_code: Optional[str] = None,
        details: Optional[Any] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if error_code:
            self.error_code = error_code
        self.details = details

    def to_dict(self) -> Dict[str, Any]:
        body: Dict[str, Any] = {
            "success": False,
            "error": {
                "code": self.error_code,
                "message": self.message,
            },
        }
        if self.details is not None:
            body["error"]["details"] = self.details
        return body


class ValidationError(AppError):
    http_status = HTTPStatus.UNPROCESSABLE_ENTITY
    error_code = ErrorCode.VALIDATION_ERROR


class AuthenticationError(AppError):
    http_status = HTTPStatus.UNAUTHORIZED
    error_code = ErrorCode.AUTH_INVALID_CREDENTIALS


class AuthorizationError(AppError):
    http_status = HTTPStatus.FORBIDDEN
    error_code = ErrorCode.AUTH_FORBIDDEN


class NotFoundError(AppError):
    http_status = HTTPStatus.NOT_FOUND
    error_code = ErrorCode.NOT_FOUND


class ConflictError(AppError):
    http_status = HTTPStatus.CONFLICT
    error_code = ErrorCode.CONFLICT


class FileError(AppError):
    http_status = HTTPStatus.BAD_REQUEST
    error_code = ErrorCode.FILE_INVALID


class FileTooLargeError(AppError):
    http_status = HTTPStatus.REQUEST_ENTITY_TOO_LARGE
    error_code = ErrorCode.FILE_TOO_LARGE


class PaperNotFoundError(NotFoundError):
    error_code = ErrorCode.PAPER_NOT_FOUND

    def __init__(self, paper_id: str = "") -> None:
        super().__init__(f"Paper not found: {paper_id}" if paper_id else "Paper not found.")


class PaperNotReadyError(AppError):
    http_status = HTTPStatus.CONFLICT
    error_code = ErrorCode.PAPER_NOT_READY


class PaperAlreadyProcessingError(AppError):
    http_status = HTTPStatus.CONFLICT
    error_code = ErrorCode.PAPER_ALREADY_PROCESSING


class NoteNotFoundError(NotFoundError):
    error_code = ErrorCode.NOTE_NOT_FOUND

    def __init__(self, note_id: str = "") -> None:
        super().__init__(f"Note not found: {note_id}" if note_id else "Note not found.")


class NoteAccessDeniedError(AuthorizationError):
    error_code = ErrorCode.NOTE_ACCESS_DENIED


class NoteNotReadyError(AppError):
    http_status = HTTPStatus.CONFLICT
    error_code = ErrorCode.NOTE_NOT_READY


class AIServiceError(AppError):
    http_status = HTTPStatus.SERVICE_UNAVAILABLE
    error_code = ErrorCode.AI_SERVICE_ERROR


class VectorStoreError(AppError):
    http_status = HTTPStatus.SERVICE_UNAVAILABLE
    error_code = ErrorCode.VECTOR_STORE_ERROR


class RAGInsufficientEvidenceError(AppError):
    http_status = HTTPStatus.OK  # Returned as 200 with explicit evidence flag
    error_code = ErrorCode.RAG_INSUFFICIENT_EVIDENCE


# ─────────────────────────────────────────────────────────────────────────────
# Flask error registration
# ─────────────────────────────────────────────────────────────────────────────
def register_error_handlers(app: Flask) -> None:
    """Register all error handlers on the Flask application."""

    @app.errorhandler(AppError)
    def handle_app_error(exc: AppError):
        logger.warning(
            "application_error",
            code=exc.error_code,
            message=exc.message,
            status=exc.http_status,
        )
        return jsonify(exc.to_dict()), exc.http_status

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        logger.warning("http_exception", code=exc.code, description=exc.description)
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": f"HTTP_{exc.code}",
                        "message": exc.description,
                    },
                }
            ),
            exc.code,
        )

    @app.errorhandler(NoAuthorizationError)
    def handle_missing_auth(exc):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": ErrorCode.AUTH_UNAUTHORIZED,
                        "message": "Authorization token required.",
                    },
                }
            ),
            HTTPStatus.UNAUTHORIZED,
        )

    @app.errorhandler(JWTDecodeError)
    def handle_jwt_error(exc):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": ErrorCode.AUTH_UNAUTHORIZED,
                        "message": "Invalid authorization token.",
                    },
                }
            ),
            HTTPStatus.UNAUTHORIZED,
        )

    @app.errorhandler(RevokedTokenError)
    def handle_revoked_token(exc):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": ErrorCode.AUTH_TOKEN_REVOKED,
                        "message": "Token has been revoked. Please log in again.",
                    },
                }
            ),
            HTTPStatus.UNAUTHORIZED,
        )

    @app.errorhandler(InvalidHeaderError)
    def handle_invalid_header(exc):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": ErrorCode.AUTH_UNAUTHORIZED,
                        "message": "Invalid authorization header.",
                    },
                }
            ),
            HTTPStatus.UNAUTHORIZED,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        logger.exception("unexpected_error", exc_info=exc)
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": ErrorCode.INTERNAL_ERROR,
                        "message": "An unexpected internal error occurred.",
                    },
                }
            ),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )
