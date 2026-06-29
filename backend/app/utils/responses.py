"""JSend Response Wrappers."""
from flask import jsonify
from typing import Any, Tuple

def success_response(data: Any = None, message: str = None, status_code: int = 200) -> Tuple[Any, int]:
    res = {"status": "success"}
    if message:
        res["message"] = message
    if data is not None:
        res["data"] = data
    return jsonify(res), status_code

def error_response(message: str, status_code: int = 400, data: Any = None) -> Tuple[Any, int]:
    res = {"status": "error", "message": message}
    if data is not None:
        res["data"] = data
    return jsonify(res), status_code
