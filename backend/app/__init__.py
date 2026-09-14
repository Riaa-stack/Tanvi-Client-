"""
app/__init__.py — Flask application factory.
"""
from __future__ import annotations

import os
from datetime import timedelta

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager

from app.config import get_settings
from app.errors import register_error_handlers
from app.extensions import cors, db, jwt
from app.logging_config import configure_logging, get_logger


def create_app(config_override: dict | None = None) -> Flask:
    """
    Create and configure a Flask application instance.

    Args:
        config_override: Optional dict of config values to override settings
                         (primarily used in tests).

    Returns:
        Configured Flask application.
    """
    settings = get_settings()

    # ── Logging must be configured first ─────────────────────────────────────
    configure_logging(log_level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)
    logger = get_logger(__name__)

    app = Flask(__name__)

    # ── Core Flask config ─────────────────────────────────────────────────────
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    app.config["DEBUG"] = settings.DEBUG
    app.config["TESTING"] = False

    # ── Database ──────────────────────────────────────────────────────────────
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
    }

    # ── JWT ───────────────────────────────────────────────────────────────────
    app.config["JWT_SECRET_KEY"] = settings.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRES_MINUTES
    )
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
        days=settings.JWT_REFRESH_TOKEN_EXPIRES_DAYS
    )
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    app.config["JWT_ERROR_MESSAGE_KEY"] = "message"

    # ── Apply overrides (testing) ─────────────────────────────────────────────
    if config_override:
        app.config.update(config_override)

    # ── Initialise extensions ─────────────────────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": settings.cors_origins_list}},
        supports_credentials=True,
    )

    # ── Ensure storage directories exist ─────────────────────────────────────
    _ensure_storage_directories(settings)

    # ── Register Blueprints ───────────────────────────────────────────────────
    _register_blueprints(app)

    # ── Root Welcome / Health ─────────────────────────────────────────────────
    @app.route("/", methods=["GET"])
    def index():
        return jsonify(
            {
                "service": "EduArchive AI Backend API",
                "version": "2.0",
                "status": "running",
                "health": "/api/v1/health",
            }
        ), 200

    # ── Request Logging ───────────────────────────────────────────────────────
    import time
    from flask import request

    @app.before_request
    def log_request_start():
        request.environ["_request_start_time"] = time.time()

    @app.after_request
    def log_request_end(response):
        start_time = request.environ.get("_request_start_time")
        duration_ms = round((time.time() - start_time) * 1000, 2) if start_time else 0
        if not request.path.startswith("/api/v1/health") and request.path != "/":
            logger.info(
                "http_request",
                method=request.method,
                path=request.path,
                status=response.status_code,
                duration_ms=duration_ms,
            )
        return response

    # ── Register error handlers ───────────────────────────────────────────────
    register_error_handlers(app)

    # ── JWT token blacklist check ─────────────────────────────────────────────
    _configure_jwt_callbacks(app)

    # ── Register CLI commands ─────────────────────────────────────────────────
    from app.cli import register_cli_commands
    register_cli_commands(app)

    logger.info(
        "application_started",
        env=settings.FLASK_ENV,
        debug=settings.DEBUG,
    )

    return app


def _ensure_storage_directories(settings) -> None:
    """Create required storage directories if they don't exist."""
    directories = [
        settings.UPLOAD_DIRECTORY,
        os.path.join(settings.UPLOAD_DIRECTORY, "papers"),
        os.path.join(settings.UPLOAD_DIRECTORY, "notes"),
        settings.CHROMA_PERSIST_DIRECTORY,
    ]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)


def _register_blueprints(app: Flask) -> None:
    """Register all Flask blueprints."""
    from app.api.auth_routes import auth_bp
    from app.api.chat_routes import chat_bp
    from app.api.health_routes import health_bp
    from app.api.note_routes import note_bp
    from app.api.rag_routes import rag_bp
    from app.api.student_routes import student_bp
    from app.api.teacher_routes import teacher_bp

    url_prefix = "/api/v1"
    app.register_blueprint(health_bp, url_prefix=f"{url_prefix}/health")
    app.register_blueprint(auth_bp, url_prefix=f"{url_prefix}/auth")
    app.register_blueprint(teacher_bp, url_prefix=f"{url_prefix}/teacher")
    app.register_blueprint(student_bp, url_prefix=f"{url_prefix}/student")
    app.register_blueprint(note_bp, url_prefix=f"{url_prefix}/notes")
    app.register_blueprint(rag_bp, url_prefix=f"{url_prefix}/rag")
    app.register_blueprint(chat_bp, url_prefix=f"{url_prefix}/chat")


def _configure_jwt_callbacks(app: Flask) -> None:
    """Set up JWT callbacks including blacklist/revocation check."""
    from app.repositories.token_repository import TokenRepository

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload.get("jti")
        if not jti:
            return True
        return TokenRepository.is_revoked(jti)

    @jwt.revoked_token_loader
    def revoked_token_response(jwt_header, jwt_payload):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": "AUTH_TOKEN_REVOKED",
                        "message": "Token has been revoked. Please log in again.",
                    },
                }
            ),
            401,
        )

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": "AUTH_TOKEN_EXPIRED",
                        "message": "Access token has expired.",
                    },
                }
            ),
            401,
        )

    @jwt.invalid_token_loader
    def invalid_token_response(reason):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": "AUTH_UNAUTHORIZED",
                        "message": f"Invalid token: {reason}",
                    },
                }
            ),
            401,
        )

    @jwt.unauthorized_loader
    def missing_token_response(reason):
        return (
            jsonify(
                {
                    "success": False,
                    "error": {
                        "code": "AUTH_UNAUTHORIZED",
                        "message": "Authorization token required.",
                    },
                }
            ),
            401,
        )
