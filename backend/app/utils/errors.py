"""Custom Exceptions and Error Handlers."""
from typing import Dict, Any, Tuple
from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException

class APIError(Exception):
    def __init__(self, message: str, status_code: int = 400, payload: Any = None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = {"status": "error", "message": error.message}
        if error.payload:
            response["data"] = error.payload
        return jsonify(response), error.status_code

    @app.errorhandler(ValueError)
    def handle_value_error(error):
        return jsonify({"status": "error", "message": str(error)}), 400

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({"status": "error", "message": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        current_app.logger.error(f"Unhandled Exception: {error}", exc_info=True)
        return jsonify({"status": "error", "message": "An unexpected error occurred."}), 500
