"""
app/config.py — Centralised configuration via Pydantic Settings.
All application settings are read from environment variables or .env file.
"""
from __future__ import annotations

import os
from functools import lru_cache
from typing import List

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ───────────────────────────────────────────────────────────
    FLASK_ENV: str = "production"
    SECRET_KEY: str
    DEBUG: bool = False

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRES_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRES_DAYS: int = 30

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── Gemini ────────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_TEMPERATURE: float = 0.1
    GEMINI_TIMEOUT: int = 120
    GEMINI_MAX_RETRIES: int = 3

    # ── ChromaDB ──────────────────────────────────────────────────────────────
    CHROMA_PERSIST_DIRECTORY: str = "./storage/chroma"

    # ── Storage ───────────────────────────────────────────────────────────────
    UPLOAD_DIRECTORY: str = "./storage/uploads"
    MAX_UPLOAD_SIZE: int = 52_428_800  # 50 MB

    # ── OCR ───────────────────────────────────────────────────────────────────
    OCR_ENABLED: bool = True
    TESSERACT_CMD: str = ""
    OCR_TEXT_DENSITY_THRESHOLD: float = 0.05

    # ── Embeddings ────────────────────────────────────────────────────────────
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_BATCH_SIZE: int = 32

    # ── Chunking ──────────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 100

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Processing ────────────────────────────────────────────────────────────
    PAPER_PROCESSING_TIMEOUT: int = 600
    REPETITION_SIMILARITY_THRESHOLD: float = 0.82

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"  # json | console

    # ── API ───────────────────────────────────────────────────────────────────
    MAX_PAGE_SIZE: int = 100
    DEFAULT_PAGE_SIZE: int = 20

    # ── Derived / computed ────────────────────────────────────────────────────
    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @model_validator(mode="after")
    def _derive_debug(self) -> "Settings":
        if self.FLASK_ENV == "development":
            object.__setattr__(self, "DEBUG", True)
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
