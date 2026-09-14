"""
app/utils/pagination.py — Pagination utilities.
"""
from __future__ import annotations

from app.config import get_settings
from app.errors import ValidationError


def get_pagination_params(request_args: dict) -> tuple[int, int]:
    """
    Extract and validate pagination parameters from request args.
    Returns (page, page_size).
    """
    settings = get_settings()
    try:
        page = int(request_args.get("page", 1))
        page_size = int(request_args.get("page_size", settings.DEFAULT_PAGE_SIZE))
    except (ValueError, TypeError):
        raise ValidationError("Page and page_size must be positive integers.")

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 1
    if page_size > settings.MAX_PAGE_SIZE:
        page_size = settings.MAX_PAGE_SIZE

    return page, page_size
