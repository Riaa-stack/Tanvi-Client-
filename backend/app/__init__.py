"""
AAIP Backend — Application Factory
"""

import logging
import os
from logging.handlers import RotatingFileHandler

from flask import Flask, jsonify

from app.settings import config_map
from app.extensions import (
    db,
    migrate,
    jwt,
    bcrypt,
    cors,
    compress,
)


def create_app(config_name: str = "development") -> Flask:
    """Flask application factory."""

    flask_app = Flask(__name__)

    # ============================================================
    # Load Configuration
    # ============================================================

    cfg_class = config_map.get(
        config_name,
        config_map["development"],
    )

    flask_app.config.from_object(cfg_class)

    # ============================================================
    # Setup Logging
    # ============================================================

    _setup_logging(flask_app)

    # ============================================================
    # Initialize Extensions
    # ============================================================

    db.init_app(flask_app)
    migrate.init_app(flask_app, db)
    jwt.init_app(flask_app)
    bcrypt.init_app(flask_app)
    compress.init_app(flask_app)

    # ============================================================
    # CORS
    # ============================================================

    cors.init_app(
        flask_app,
        resources={
            r"/*": {
                "origins": flask_app.config["ALLOWED_ORIGINS"]
            }
        },
    )

    # ============================================================
    # JWT Token Blocklist
    # ============================================================

    from app.middlewares import jwt_blocklist  # noqa: F401

    # ============================================================
    # Rate Limiter
    # ============================================================

    from app.middlewares.rate_limiter import init_rate_limiter

    init_rate_limiter(flask_app)

    # ============================================================
    # Register Blueprints
    # ============================================================

    from app.api import register_blueprints

    register_blueprints(flask_app)

    # ============================================================
    # Register Error Handlers
    # ============================================================

    from app.utils.errors import register_error_handlers

    register_error_handlers(flask_app)

    # ============================================================
    # Health Check
    # ============================================================

    @flask_app.route("/health", methods=["GET"])
    def health():
        try:
            return jsonify(
                {
                    "status": "healthy",
                    "service": "AAIP Backend v1.0",
                    "environment": config_name,
                }
            ), 200

        except Exception as e:
            flask_app.logger.exception(
                "Health check failed"
            )

            return jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "error_type": type(e).__name__,
                }
            ), 500

    # ============================================================
    # Runtime Directories
    # ============================================================

    os.makedirs(
        flask_app.config["UPLOAD_DIR"],
        exist_ok=True,
    )

    os.makedirs(
        "logs",
        exist_ok=True,
    )

    flask_app.logger.info(
        f"AAIP Backend started in '{config_name}' mode."
    )

    return flask_app


def _setup_logging(app: Flask) -> None:
    """Configure rotating file and console logging."""

    log_level = (
        logging.DEBUG
        if app.config.get("DEBUG")
        else logging.INFO
    )

    fmt = logging.Formatter(
        "[%(asctime)s] "
        "%(levelname)s "
        "in %(name)s "
        "(%(filename)s:%(lineno)d): "
        "%(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # ============================================================
    # Console Handler
    # ============================================================

    console_handler = logging.StreamHandler()

    console_handler.setFormatter(fmt)
    console_handler.setLevel(log_level)

    # ============================================================
    # File Handler
    # ============================================================

    os.makedirs(
        "logs",
        exist_ok=True,
    )

    file_handler = RotatingFileHandler(
        "logs/aaip.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
    )

    file_handler.setFormatter(fmt)
    file_handler.setLevel(log_level)

    # ============================================================
    # Root Logger
    # ============================================================

    root_logger = logging.getLogger()

    root_logger.setLevel(log_level)

    if not root_logger.handlers:
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)