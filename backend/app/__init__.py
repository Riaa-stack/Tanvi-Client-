"""
AAIP Backend — Application Factory
"""
import logging
import os
from logging.handlers import RotatingFileHandler

from flask import Flask, jsonify

from app.config import config_map
from app.extensions import db, migrate, jwt, bcrypt, cors, compress

def create_app(config_name: str = "development") -> Flask:
    """Flask application factory."""
    app = Flask(__name__)

    # --- Load Config ---
    cfg_class = config_map.get(config_name, config_map["development"])
    app.config.from_object(cfg_class)

    # --- Setup Logging ---
    _setup_logging(app)

    # --- Initialize Extensions ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    compress.init_app(app)

    # CORS — allow configured origins
    cors.init_app(app, resources={r"/*": {"origins": app.config["ALLOWED_ORIGINS"]}})

    # --- JWT Token Blocklist Check ---
    import app.middlewares.jwt_blocklist  # noqa

    # --- Rate Limiter ---
    from app.middlewares.rate_limiter import init_rate_limiter
    init_rate_limiter(app)

    # --- Register Blueprints ---
    from app.api import register_blueprints
    register_blueprints(app)

    # --- Register Error Handlers ---
    from app.utils.errors import register_error_handlers
    register_error_handlers(app)

    # --- Health Check ---
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "AAIP Backend v1.0",
            "environment": config_name,
        }), 200

    # --- Ensure runtime directories exist ---
    os.makedirs(app.config["UPLOAD_DIR"], exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    app.logger.info(f"AAIP Backend started in '{config_name}' mode.")
    return app


def _setup_logging(app: Flask) -> None:
    """Configure structured rotating file + console logging."""
    log_level = logging.DEBUG if app.config.get("DEBUG") else logging.INFO
    fmt = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(name)s (%(filename)s:%(lineno)d): %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(fmt)
    console_handler.setLevel(log_level)

    os.makedirs("logs", exist_ok=True)
    file_handler = RotatingFileHandler("logs/aaip.log", maxBytes=10 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(fmt)
    file_handler.setLevel(log_level)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    if not root_logger.handlers:
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)
