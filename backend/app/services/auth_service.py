"""Auth Service — JWT + bcrypt, Redis JWT blocklist."""
import logging
from datetime import datetime, timezone
from typing import Dict, Optional

from flask_jwt_extended import create_access_token, create_refresh_token, get_jti
from app.extensions import bcrypt, get_redis_blocklist
from app.repositories.user_repository import UserRepository
from app.constants import UserRole

logger = logging.getLogger(__name__)
user_repo = UserRepository()

JWT_ACCESS_TTL = 3600    # 1 hour in seconds
JWT_REFRESH_TTL = 2592000  # 30 days


class AuthService:

    def register(self, email: str, password: str, full_name: str, role: str = UserRole.STUDENT.value) -> Dict:
        email = email.lower().strip()
        if user_repo.get_by_email(email):
            raise ValueError("Email already registered.")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters.")
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        user = user_repo.create(email=email, password_hash=password_hash, full_name=full_name, role=role)
        return self._user_dict(user)

    def login(self, email: str, password: str) -> Dict:
        email = email.lower().strip()
        user = user_repo.get_by_email(email)
        if not user or not user.is_active:
            raise ValueError("Invalid credentials.")
        if not bcrypt.check_password_hash(user.password_hash, password):
            raise ValueError("Invalid credentials.")
        user_repo.update_last_login(user.id)
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity=user.id)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": self._user_dict(user),
        }

    def logout(self, jti: str) -> None:
        """Add JTI to Redis blocklist."""
        try:
            redis = get_redis_blocklist()
            redis.setex(f"blocklist:{jti}", JWT_ACCESS_TTL, "revoked")
        except Exception as e:
            logger.warning(f"Failed to add JTI to blocklist: {e}")

    def refresh_access_token(self, user_id: str) -> str:
        user = user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise ValueError("User not found or inactive.")
        return create_access_token(identity=user.id, additional_claims={"role": user.role})

    def change_password(self, user_id: str, old_password: str, new_password: str) -> None:
        user = user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found.")
        if not bcrypt.check_password_hash(user.password_hash, old_password):
            raise ValueError("Current password is incorrect.")
        if len(new_password) < 8:
            raise ValueError("New password must be at least 8 characters.")
        new_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        user_repo.update(user_id, password_hash=new_hash)

    def get_user(self, user_id: str) -> Optional[Dict]:
        user = user_repo.get_by_id(user_id)
        return self._user_dict(user) if user else None

    def _user_dict(self, user) -> Dict:
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        }
