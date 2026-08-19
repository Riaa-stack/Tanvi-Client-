"""
AAIP Backend - Application Configuration
"""

import os

from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Base configuration shared by all environments."""

    # ============================================================
    # Flask
    # ============================================================

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-this",
    )

    DEBUG = False
    TESTING = False

    # ============================================================
    # Database
    # ============================================================

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/aaip",
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ============================================================
    # JWT
    # ============================================================

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dev-jwt-secret-key-change-this",
    )

    JWT_ACCESS_TOKEN_EXPIRES = 3600
    JWT_REFRESH_TOKEN_EXPIRES = 2592000

    # ============================================================
    # CORS
    # ============================================================

    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:5173",
        ).split(",")
        if origin.strip()
    ]

    # ============================================================
    # Redis
    # ============================================================

    REDIS_HOST = os.getenv(
        "REDIS_HOST",
        "localhost",
    )

    REDIS_PORT = int(
        os.getenv(
            "REDIS_PORT",
            "6379",
        )
    )

    # Redis DB 0 - General Cache
    REDIS_DB_CACHE = int(
        os.getenv(
            "REDIS_DB_CACHE",
            "0",
        )
    )

    # Redis DB 3 - JWT Blocklist
    REDIS_DB_JWT_BLOCKLIST = int(
        os.getenv(
            "REDIS_DB_JWT_BLOCKLIST",
            "3",
        )
    )

    # Redis DB 4 - Chat History
    REDIS_DB_CHAT = int(
        os.getenv(
            "REDIS_DB_CHAT",
            "4",
        )
    )

    # ============================================================
    # Flask-Limiter
    # ============================================================

    RATELIMIT_ENABLED = True

    # IMPORTANT:
    # Flask-Limiter 3.8.0 expects this to be a string,
    # not a Python list.
    RATELIMIT_DEFAULT = "200 per day; 50 per hour"

    RATELIMIT_STORAGE_URI = (
        f"redis://{REDIS_HOST}:{REDIS_PORT}/2"
    )

    RATELIMIT_STRATEGY = "fixed-window"

    # ============================================================
    # ChromaDB
    # ============================================================

    CHROMA_HOST = os.getenv(
        "CHROMA_HOST",
        "localhost",
    )

    CHROMA_PORT = int(
        os.getenv(
            "CHROMA_PORT",
            "8000",
        )
    )

    # ============================================================
    # File Uploads
    # ============================================================

    UPLOAD_DIR = os.getenv(
        "UPLOAD_DIR",
        "./uploads",
    )

    # ============================================================
    # OpenRouter
    # ============================================================

    OPENROUTER_API_KEY = os.getenv(
        "OPENROUTER_API_KEY",
        "",
    )

    OPENROUTER_BASE_URL = os.getenv(
        "OPENROUTER_BASE_URL",
        "https://openrouter.ai/api/v1",
    )


class DevelopmentConfig(BaseConfig):
    """Development configuration."""

    DEBUG = True


class ProductionConfig(BaseConfig):
    """Production configuration."""

    DEBUG = False


class TestingConfig(BaseConfig):
    """Testing configuration."""

    TESTING = True
    DEBUG = True

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TEST_DATABASE_URL",
        BaseConfig.SQLALCHEMY_DATABASE_URI,
    )


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}