"""
app/logging_config.py — Structured logging setup via structlog.
Supports both console (development) and JSON (production) rendering.
"""
from __future__ import annotations

import logging
import sys

import structlog


def configure_logging(log_level: str = "INFO", log_format: str = "console") -> None:
    """
    Configure structlog with the requested level and format.

    Args:
        log_level:  Python log level string (DEBUG, INFO, WARNING, ERROR, CRITICAL).
        log_format: 'console' for coloured dev output or 'json' for production.
    """
    level = getattr(logging, log_level.upper(), logging.INFO)

    # Shared processors
    shared_processors: list = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if log_format == "json":
        shared_processors.append(structlog.processors.format_exc_info)
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=shared_processors + [renderer],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)

    # Also configure stdlib logging to forward to stdout
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
        force=True,
    )

    # Ensure werkzeug request logging is active
    logging.getLogger("werkzeug").setLevel(logging.INFO)

    # Silence noisy libraries in production
    for noisy in ("urllib3", "httpcore", "httpx", "sentence_transformers", "chromadb"):
        logging.getLogger(noisy).setLevel(logging.WARNING)



def get_logger(name: str = __name__) -> structlog.BoundLogger:
    """Return a bound structlog logger."""
    return structlog.get_logger(name)
