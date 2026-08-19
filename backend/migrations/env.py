"""
Alembic migration environment for AAIP Backend.
"""

from flask import current_app

from alembic import context


# ============================================================
# Alembic Config
# ============================================================

config = context.config


# ============================================================
# Do NOT use fileConfig()
#
# The project's alembic.ini does not contain the logging
# sections required by Python's logging.config.fileConfig().
# Flask already configures application logging.
# ============================================================


# ============================================================
# SQLAlchemy Metadata
# ============================================================

def get_engine():
    """Get SQLAlchemy engine from Flask-Migrate."""

    return current_app.extensions["migrate"].db.engine


def get_metadata():
    """Get SQLAlchemy metadata from Flask-Migrate."""

    return current_app.extensions["migrate"].db.metadata


target_metadata = get_metadata()


# ============================================================
# Database URL
# ============================================================

def get_database_url():
    """
    Get database URL from Flask configuration.

    ConfigParser treats '%' as interpolation syntax.
    PostgreSQL URLs can contain encoded values such as
    %40, so escape '%' before passing the URL to Alembic.
    """

    database_url = current_app.config.get(
        "SQLALCHEMY_DATABASE_URI"
    )

    if not database_url:
        raise RuntimeError(
            "SQLALCHEMY_DATABASE_URI is not configured."
        )

    return database_url.replace("%", "%%")


# ============================================================
# Offline Migration
# ============================================================

def run_migrations_offline() -> None:
    """Run migrations without connecting to the database."""

    database_url = get_database_url()

    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ============================================================
# Online Migration
# ============================================================

def run_migrations_online() -> None:
    """Run migrations using a live database connection."""

    connectable = get_engine()

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ============================================================
# Run Migration
# ============================================================

if context.is_offline_mode():

    run_migrations_offline()

else:

    run_migrations_online()