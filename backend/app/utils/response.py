"""
app/utils/response.py — Consistent API response helpers.
"""
from __future__ import annotations

from http import HTTPStatus
from typing import Any, Optional

from flask import jsonify


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = HTTPStatus.OK,
):
    """Return a standard success JSON response."""
    body = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status_code


def created_response(data: Any = None, message: str = "Created successfully"):
    return success_response(data=data, message=message, status_code=HTTPStatus.CREATED)


def error_response(
    message: str,
    error_code: str = "ERROR",
    status_code: int = HTTPStatus.BAD_REQUEST,
    details: Any = None,
):
    """Return a standard error JSON response."""
    body = {
        "success": False,
        "error": {"code": error_code, "message": message},
    }
    if details is not None:
        body["error"]["details"] = details
    return jsonify(body), status_code


def paginated_response(
    items: list,
    page: int,
    page_size: int,
    total: int,
    data_key: str = "items",
):
    """Return a paginated list response."""
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    return jsonify(
        {
            "success": True,
            data_key: items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
            },
        }
    ), HTTPStatus.OK
