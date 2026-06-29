"""Auth API Routes."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.auth_service import AuthService
from app.utils.responses import success_response, error_response
from app.middlewares.rate_limiter import limiter

bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")
auth_service = AuthService()

@bp.route("/register", methods=["POST"])
@limiter.limit("10 per hour")
def register():
    data = request.get_json() or {}
    try:
        user = auth_service.register(
            email=data.get("email"),
            password=data.get("password"),
            full_name=data.get("full_name")
        )
        return success_response(user, "User registered successfully", 201)
    except ValueError as e:
        return error_response(str(e))

@bp.route("/login", methods=["POST"])
@limiter.limit("20 per hour")
def login():
    data = request.get_json() or {}
    try:
        tokens = auth_service.login(data.get("email"), data.get("password"))
        return success_response(tokens, "Login successful")
    except ValueError as e:
        return error_response(str(e), 401)

@bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    auth_service.logout(jti)
    return success_response(message="Successfully logged out")

@bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    try:
        access_token = auth_service.refresh_access_token(user_id)
        return success_response({"access_token": access_token})
    except ValueError as e:
        return error_response(str(e), 401)

@bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = auth_service.get_user(user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response(user)
