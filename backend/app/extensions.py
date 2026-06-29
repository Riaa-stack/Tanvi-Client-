"""
AAIP Backend — Singleton Extension Instances
Initialized in create_app(), used via import throughout the codebase.
"""
import logging
import time
from typing import Optional

import redis as redis_lib
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

logger = logging.getLogger(__name__)

# --- Flask Extensions ---
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()
compress = Compress()
limiter = Limiter(key_func=get_remote_address)

# --- Redis Connection Cache ---
_redis_cache_client: Optional[redis_lib.Redis] = None
_redis_blocklist_client: Optional[redis_lib.Redis] = None
_redis_chat_client: Optional[redis_lib.Redis] = None

# --- ChromaDB Connection Cache ---
_chroma_client = None


def get_redis_cache() -> redis_lib.Redis:
    """Return cached Redis client for DB 0 (general cache)."""
    global _redis_cache_client
    if _redis_cache_client is None:
        from flask import current_app
        _redis_cache_client = _build_redis_client(
            current_app.config["REDIS_HOST"],
            current_app.config["REDIS_PORT"],
            current_app.config["REDIS_DB_CACHE"],
        )
    return _redis_cache_client


def get_redis_blocklist() -> redis_lib.Redis:
    """Return cached Redis client for DB 3 (JWT blocklist)."""
    global _redis_blocklist_client
    if _redis_blocklist_client is None:
        from flask import current_app
        _redis_blocklist_client = _build_redis_client(
            current_app.config["REDIS_HOST"],
            current_app.config["REDIS_PORT"],
            current_app.config["REDIS_DB_JWT_BLOCKLIST"],
        )
    return _redis_blocklist_client


def get_redis_chat() -> redis_lib.Redis:
    """Return cached Redis client for DB 4 (chat session history)."""
    global _redis_chat_client
    if _redis_chat_client is None:
        from flask import current_app
        _redis_chat_client = _build_redis_client(
            current_app.config["REDIS_HOST"],
            current_app.config["REDIS_PORT"],
            current_app.config["REDIS_DB_CHAT"],
        )
    return _redis_chat_client


def _build_redis_client(host: str, port: int, db_index: int) -> redis_lib.Redis:
    """Build a Redis client with retry on connection failure."""
    for attempt in range(3):
        try:
            client = redis_lib.Redis(
                host=host,
                port=port,
                db=db_index,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            client.ping()
            logger.info(f"Redis connected: {host}:{port} db={db_index}")
            return client
        except redis_lib.ConnectionError as e:
            wait = 2 ** attempt
            logger.warning(f"Redis connection attempt {attempt + 1} failed: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    raise RuntimeError(f"Could not connect to Redis at {host}:{port} db={db_index} after 3 attempts.")


def get_chroma_client():
    """Return cached ChromaDB HTTP client singleton."""
    global _chroma_client
    if _chroma_client is None:
        from flask import current_app
        from app.ai.chroma_client import ChromaClientWrapper
        _chroma_client = ChromaClientWrapper(
            host=current_app.config["CHROMA_HOST"],
            port=current_app.config["CHROMA_PORT"],
        )
    return _chroma_client
