import os
from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate, jwt

# Blueprints
from app.auth.routes import auth_bp, api_bp

# Import Models
from app.models import (
    User,
    Subject,
    Unit,
    Paper,
    Question,
    Topic,
    QuestionOccurrence,
    UnitAnalytics,
    SearchHistory
)


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # ==========================
    # Initialize Extensions
    # ==========================
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ==========================
    # Register Blueprints
    # ==========================

    # Authentication APIs
    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )

    # All Other APIs
    app.register_blueprint(
        api_bp,
        url_prefix="/api"
    )

    # ==========================
    # Upload Folder
    # ==========================
    os.makedirs(
        app.config["UPLOAD_FOLDER"],
        exist_ok=True
    )

    # ==========================
    # Health Check
    # ==========================
    @app.route("/health", methods=["GET"])
    def health():

        return jsonify({
            "status": "healthy",
            "service": "EDUARCHIVE AI 2.0 Backend"
        }), 200

    # ==========================
    # Error Handlers
    # ==========================
    @app.errorhandler(404)
    def not_found(error):

        return jsonify({
            "success": False,
            "message": "Resource not found"
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):

        return jsonify({
            "success": False,
            "message": "Internal Server Error"
        }), 500

    return app


if __name__ == "__main__":

    app = create_app()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )