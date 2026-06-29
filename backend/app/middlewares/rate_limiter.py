"""Rate Limiter setup."""
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

redis_host = os.environ.get("REDIS_HOST", "localhost")
redis_port = os.environ.get("REDIS_PORT", "6379")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{redis_host}:{redis_port}/2",
    default_limits=["200 per day", "50 per hour"],
    strategy="fixed-window"
)

def init_rate_limiter(app):
    limiter.init_app(app)
