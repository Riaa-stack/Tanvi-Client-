from app.extensions import db
from app.models import User

from app.auth.utils import (
    hash_password,
    verify_password,
    generate_token,
    validate_register_data,
    validate_login_data
)


# ==========================================================
# Register User
# ==========================================================

def register_user(data):

    valid, message = validate_register_data(data)

    if not valid:
        return {
            "success": False,
            "message": message
        }, 400

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data.get("role", "student")

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    password_hash = hash_password(password)

    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    token = generate_token(user)

    return {

        "success": True,

        "message": "Registration Successful",

        "token": token,

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }

    }, 201


# ==========================================================
# Login User
# ==========================================================

def login_user(data):

    valid, message = validate_login_data(data)

    if not valid:
        return {
            "success": False,
            "message": message
        }, 400

    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user:
        return {
            "success": False,
            "message": "Invalid Email or Password"
        }, 401

    if not verify_password(password, user.password_hash):
        return {
            "success": False,
            "message": "Invalid Email or Password"
        }, 401

    token = generate_token(user)

    return {

        "success": True,

        "message": "Login Successful",

        "token": token,

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }

    }, 200