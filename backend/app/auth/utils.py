import bcrypt
from flask_jwt_extended import create_access_token


# ==========================================
# Hash Password
# ==========================================
def hash_password(password):
    """
    Convert plain password into hashed password
    """

    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


# ==========================================
# Verify Password
# ==========================================
def verify_password(password, password_hash):
    """
    Verify entered password with hashed password
    """

    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


# ==========================================
# Generate JWT Token
# ==========================================
def generate_token(user):
    """
    Generate JWT Access Token
    """

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    )

    return token


# ==========================================
# Validate Register Data
# ==========================================
def validate_register_data(data):

    required_fields = [
        "name",
        "email",
        "password"
    ]

    for field in required_fields:

        if field not in data or not data[field]:
            return False, f"{field} is required"

    return True, None


# ==========================================
# Validate Login Data
# ==========================================
def validate_login_data(data):

    required_fields = [
        "email",
        "password"
    ]

    for field in required_fields:

        if field not in data or not data[field]:
            return False, f"{field} is required"

    return True, None