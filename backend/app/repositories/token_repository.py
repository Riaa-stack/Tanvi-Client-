"""
app/repositories/token_repository.py — JWT revocation token operations.
"""
from __future__ import annotations

from datetime import datetime, timezone

from app.extensions import db
from app.models.revoked_token import RevokedToken


class TokenRepository:

    @staticmethod
    def revoke(jti: str, user_id: str, expires_at: datetime | None = None) -> RevokedToken:
        """Add a token JTI to the revocation list."""
        token = RevokedToken(
            jti=jti,
            user_id=user_id,
            revoked_at=datetime.now(timezone.utc),
            expires_at=expires_at,
        )
        db.session.add(token)
        db.session.commit()
        return token

    @staticmethod
    def is_revoked(jti: str) -> bool:
        """Check if a token JTI is on the revocation list."""
        return db.session.query(
            db.session.query(RevokedToken).filter_by(jti=jti).exists()
        ).scalar()

    @staticmethod
    def cleanup_expired() -> int:
        """Remove expired tokens from the blocklist. Returns count removed."""
        now = datetime.now(timezone.utc)
        deleted = (
            db.session.query(RevokedToken)
            .filter(RevokedToken.expires_at < now)
            .delete(synchronize_session=False)
        )
        db.session.commit()
        return deleted
