"""Rate Limiter setup."""

from flask import Flask

from app.extensions import limiter


def init_rate_limiter(application: Flask):
    """Initialize Flask-Limiter with the Flask application."""

    

    limiter.init_app(application)