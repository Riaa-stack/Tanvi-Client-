"""
tests/conftest.py — Pytest configuration, fixtures, and mock factories.
"""
from __future__ import annotations

import io
import os
import tempfile

# Configure test environment variables before importing app
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-eduarchive-32chars!")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-32-chars-long!")
os.environ.setdefault("DATABASE_URL", "sqlite:///test.db")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("FLASK_ENV", "testing")
os.environ.setdefault("DEBUG", "false")
os.environ.setdefault("UPLOAD_DIRECTORY", "storage/test_uploads")
os.environ.setdefault("CHROMA_PERSIST_DIRECTORY", "storage/test_chroma")

import pytest
from unittest.mock import MagicMock, patch

from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db as _db
from app.models.user import User, UserRole
from app.models.semester import Semester
from app.models.branch import Branch
from app.models.subject import Subject
from app.models.academic_scope import AcademicScope


@pytest.fixture(scope="session")
def temp_dir():
    """Create a temporary directory for tests and clean up after."""
    with tempfile.TemporaryDirectory() as td:
        yield td


@pytest.fixture(scope="session")
def app(temp_dir):
    """Create application configured for testing with SQLite in-memory."""
    upload_dir = os.path.join(temp_dir, "uploads")
    chroma_dir = os.path.join(temp_dir, "chroma")

    from sqlalchemy.pool import StaticPool

    app = create_app(
        config_override={
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_ENGINE_OPTIONS": {
                "poolclass": StaticPool,
                "connect_args": {"check_same_thread": False},
            },
            "SQLALCHEMY_SESSION_OPTIONS": {
                "expire_on_commit": False,
            },
            "UPLOAD_DIRECTORY": upload_dir,
            "CHROMA_PERSIST_DIRECTORY": chroma_dir,
            "JWT_SECRET_KEY": "test-jwt-secret-key-32-chars-long!",
            "SECRET_KEY": "test-secret-key-for-eduarchive!",
            "GEMINI_API_KEY": "test-gemini-key",
            "OCR_ENABLED": False,
        }
    )

    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(autouse=True)
def app_ctx(app):
    """Keep application context active for all fixtures and tests."""
    with app.app_context():
        _db.session.rollback()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()
        yield
        _db.session.rollback()


@pytest.fixture
def client(app):
    """Test client."""
    return app.test_client()


@pytest.fixture
def teacher_user():
    """Create and return a teacher user."""
    user = User(
        name="Teacher One",
        email="teacher.test@eduarchive.ai",
        role=UserRole.TEACHER,
        is_active=True,
    )
    user.set_password("Teacher1234!")
    _db.session.add(user)
    _db.session.commit()
    return user


@pytest.fixture
def student_user():
    """Create and return a student user."""
    user = User(
        name="Student One",
        email="student.test@eduarchive.ai",
        role=UserRole.STUDENT,
        is_active=True,
    )
    user.set_password("Student1234!")
    _db.session.add(user)
    _db.session.commit()
    return user


@pytest.fixture
def teacher_headers(teacher_user):
    """Authorization headers for the test teacher."""
    token = create_access_token(
        identity=teacher_user.id,
        additional_claims={"role": teacher_user.role, "name": teacher_user.name},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def student_headers(student_user):
    """Authorization headers for the test student."""
    token = create_access_token(
        identity=student_user.id,
        additional_claims={"role": student_user.role, "name": student_user.name},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def academic_data():
    """Pre-create academic metadata (Semester, Branch, Subject, Scope)."""
    sem = Semester(number=5, name="Semester 5")
    branch = Branch(name="Computer Science & Engineering", code="CSE")
    subj = Subject(name="Database Management Systems", code="CSE501", university="SGBAU")
    _db.session.add_all([sem, branch, subj])
    _db.session.flush()

    scope = AcademicScope(
        university="SGBAU",
        college="Ram Meghe College",
        branch_id=branch.id,
        semester_id=sem.id,
        subject_id=subj.id,
    )
    _db.session.add(scope)
    _db.session.commit()

    return {
        "semester": sem,
        "branch": branch,
        "subject": subj,
        "scope": scope,
    }


@pytest.fixture
def sample_pdf_stream():
    """Create a minimal valid PDF byte stream with %PDF header."""
    # Minimal valid PDF file
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj\n"
        b"4 0 obj << /Length 55 >> stream\n"
        b"BT /F1 12 Tf 72 712 Td (Q1. Define Database Management System. [5 Marks]) Tj ET\n"
        b"endstream\nendobj\nxref\n0 5\n0000000000 65535 f\n"
        b"0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000214 00000 n\n"
        b"trailer << /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF\n"
    )
    return io.BytesIO(pdf_content)
