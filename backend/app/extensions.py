"""
app/extensions.py — Flask extension objects (SQLAlchemy, JWT, CORS).
These are initialised here and bound to the app in the application factory.
"""
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db: SQLAlchemy = SQLAlchemy()
jwt: JWTManager = JWTManager()
cors: CORS = CORS()
