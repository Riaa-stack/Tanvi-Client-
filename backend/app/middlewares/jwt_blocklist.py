"""JWT Blocklist callback."""
from app.extensions import jwt, get_redis_blocklist

@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    try:
        redis = get_redis_blocklist()
        token_in_redis = redis.get(f"blocklist:{jti}")
        return token_in_redis is not None
    except Exception:
        # Fail open or closed based on security requirements. Here we fail open if Redis is down.
        return False
