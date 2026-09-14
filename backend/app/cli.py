"""
app/cli.py — Custom Flask CLI commands for database operations and administration.

Commands:
  flask seed        — Seed initial branches, semesters, subjects, and test accounts
  flask clean-tokens — Remove expired tokens from the revocation blocklist
  flask verify-system — Diagnostic verification of database, vector store, and AI services
  flask create-user  — Interactive or argument-based user creation
"""
from __future__ import annotations

import click
from flask import Flask
from flask.cli import with_appcontext

from app.extensions import db
from app.logging_config import get_logger

logger = get_logger(__name__)


# ── Standard SGBAU engineering curriculum seed data ──────────────────────────
DEFAULT_BRANCHES = [
    {"name": "Computer Science & Engineering", "code": "CSE"},
    {"name": "Information Technology", "code": "IT"},
    {"name": "Electronics & Telecommunication", "code": "EXTC"},
    {"name": "Mechanical Engineering", "code": "MECH"},
    {"name": "Civil Engineering", "code": "CIVIL"},
    {"name": "Electrical Engineering", "code": "EE"},
    {"name": "Artificial Intelligence & Data Science", "code": "AIDS"},
]

DEFAULT_SUBJECTS = [
    # CSE / IT subjects
    {"name": "Data Structures & Algorithms", "code": "CSE301", "university": "SGBAU"},
    {"name": "Discrete Mathematics", "code": "CSE302", "university": "SGBAU"},
    {"name": "Database Management Systems", "code": "CSE401", "university": "SGBAU"},
    {"name": "Operating Systems", "code": "CSE402", "university": "SGBAU"},
    {"name": "Computer Networks", "code": "CSE501", "university": "SGBAU"},
    {"name": "Theory of Computation", "code": "CSE502", "university": "SGBAU"},
    {"name": "Design & Analysis of Algorithms", "code": "CSE503", "university": "SGBAU"},
    {"name": "Software Engineering", "code": "CSE601", "university": "SGBAU"},
    {"name": "Compiler Design", "code": "CSE602", "university": "SGBAU"},
    {"name": "Artificial Intelligence", "code": "CSE701", "university": "SGBAU"},
    {"name": "Machine Learning", "code": "CSE702", "university": "SGBAU"},
    {"name": "Cloud Computing & DevOps", "code": "CSE801", "university": "SGBAU"},
    {"name": "Cyber Security & Digital Forensics", "code": "CSE802", "university": "SGBAU"},
    # Common First Year
    {"name": "Engineering Mathematics-I", "code": "FE101", "university": "SGBAU"},
    {"name": "Engineering Physics", "code": "FE102", "university": "SGBAU"},
    {"name": "Engineering Chemistry", "code": "FE103", "university": "SGBAU"},
    {"name": "Engineering Mathematics-II", "code": "FE201", "university": "SGBAU"},
    {"name": "Basic Electrical Engineering", "code": "FE202", "university": "SGBAU"},
]

TEST_USERS = [
    {
        "name": "Prof. Rajesh Sharma",
        "email": "teacher@eduarchive.ai",
        "password": "TeacherPassword123!",
        "role": "TEACHER",
    },
    {
        "name": "Prof. Sneha Deshmukh",
        "email": "sneha.deshmukh@eduarchive.ai",
        "password": "TeacherPassword123!",
        "role": "TEACHER",
    },
    {
        "name": "Aarav Patel",
        "email": "student@eduarchive.ai",
        "password": "StudentPassword123!",
        "role": "STUDENT",
    },
    {
        "name": "Pooja Kulkarni",
        "email": "pooja.kulkarni@eduarchive.ai",
        "password": "StudentPassword123!",
        "role": "STUDENT",
    },
]


@click.command("seed")
@with_appcontext
def seed_command():
    """Seed branches, semesters, subjects, and test accounts."""
    from app.models.academic_scope import AcademicScope
    from app.models.branch import Branch
    from app.models.semester import Semester
    from app.models.subject import Subject
    from app.models.user import User

    click.echo("Seeding database...")
    db.create_all()

    # 1. Semesters 1 to 8
    semesters = {}
    for sem_num in range(1, 9):
        sem = db.session.query(Semester).filter_by(number=sem_num).first()
        if not sem:
            sem = Semester(number=sem_num, name=f"Semester {sem_num}")
            db.session.add(sem)
            click.echo(f"  + Added Semester {sem_num}")
        semesters[sem_num] = sem
    db.session.flush()

    # 2. Branches
    branches = {}
    for b_data in DEFAULT_BRANCHES:
        branch = db.session.query(Branch).filter_by(name=b_data["name"]).first()
        if not branch:
            branch = Branch(name=b_data["name"], code=b_data["code"])
            db.session.add(branch)
            click.echo(f"  + Added Branch: {b_data['name']} ({b_data['code']})")
        branches[b_data["code"]] = branch
    db.session.flush()

    # 3. Subjects
    subjects = {}
    for s_data in DEFAULT_SUBJECTS:
        subj = db.session.query(Subject).filter_by(name=s_data["name"]).first()
        if not subj:
            subj = Subject(
                name=s_data["name"],
                code=s_data["code"],
                university=s_data["university"],
            )
            db.session.add(subj)
            click.echo(f"  + Added Subject: {s_data['name']} ({s_data['code']})")
        subjects[s_data["code"]] = subj
    db.session.flush()

    # 4. Default Academic Scopes for CSE
    cse_branch = branches.get("CSE")
    if cse_branch:
        scope_mappings = [
            ("CSE401", 4),  # DBMS -> Sem 4
            ("CSE402", 4),  # OS -> Sem 4
            ("CSE501", 5),  # CN -> Sem 5
            ("CSE503", 5),  # DAA -> Sem 5
            ("CSE701", 7),  # AI -> Sem 7
            ("CSE702", 7),  # ML -> Sem 7
        ]
        for subj_code, sem_num in scope_mappings:
            subj = subjects.get(subj_code)
            sem = semesters.get(sem_num)
            if subj and sem:
                existing_scope = (
                    db.session.query(AcademicScope)
                    .filter_by(
                        university="SGBAU",
                        college="Ram Meghe College",
                        branch_id=cse_branch.id,
                        semester_id=sem.id,
                        subject_id=subj.id,
                    )
                    .first()
                )
                if not existing_scope:
                    scope = AcademicScope(
                        university="SGBAU",
                        college="Ram Meghe College",
                        branch_id=cse_branch.id,
                        semester_id=sem.id,
                        subject_id=subj.id,
                    )
                    db.session.add(scope)
                    click.echo(f"  + Added Scope: SGBAU / Ram Meghe / CSE / Sem {sem_num} / {subj.name}")
        db.session.flush()

    # 5. Test Users
    for u_data in TEST_USERS:
        existing_user = db.session.query(User).filter_by(email=u_data["email"]).first()
        if not existing_user:
            user = User(
                name=u_data["name"],
                email=u_data["email"],
                role=u_data["role"],
                is_active=True,
            )
            user.set_password(u_data["password"])
            db.session.add(user)
            click.echo(f"  + Added Test User: {u_data['email']} [{u_data['role']}]")

    db.session.commit()
    click.echo(click.style("Database seeding completed successfully!", fg="green", bold=True))


@click.command("clean-tokens")
@with_appcontext
def clean_tokens_command():
    """Purge expired JWT tokens from the revocation list."""
    from app.repositories.token_repository import TokenRepository

    count = TokenRepository.cleanup_expired()
    click.echo(f"Cleaned up {count} expired revoked token(s).")


@click.command("verify-system")
@with_appcontext
def verify_system_command():
    """Run diagnostic verification of all subsystems."""
    click.echo("Running EduArchive AI system verification...\n")

    # 1. Database check
    click.echo("[1/4] Checking PostgreSQL database connection...")
    try:
        db.session.execute(db.text("SELECT 1"))
        click.echo(click.style("  ✓ Database: Connected successfully.", fg="green"))
    except Exception as e:
        click.echo(click.style(f"  ✗ Database error: {str(e)}", fg="red"))

    # 2. Vector Store check
    click.echo("[2/4] Checking ChromaDB vector store...")
    try:
        from app.services.vector_store_service import VectorStoreService
        vs = VectorStoreService()
        health = vs.health_check()
        click.echo(click.style(f"  ✓ ChromaDB: {health}", fg="green"))
    except Exception as e:
        click.echo(click.style(f"  ✗ ChromaDB error: {str(e)}", fg="red"))

    # 3. Embedding model check
    click.echo("[3/4] Checking local Sentence Transformer embedding model...")
    try:
        from app.services.embedding_service import EmbeddingService
        emb = EmbeddingService()
        dim = emb.get_embedding_dimension()
        test_vec = emb.embed_single("Test sentence for embedding model verification.")
        click.echo(click.style(f"  ✓ Embedding Model: Loaded '{emb.get_model_name()}' ({dim} dimensions, generated {len(test_vec)} vector floats)", fg="green"))
    except Exception as e:
        click.echo(click.style(f"  ✗ Embedding Model error: {str(e)}", fg="red"))

    # 4. Gemini check
    click.echo("[4/4] Checking Google Gemini API integration...")
    try:
        from app.services.gemini_service import GeminiService
        gemini = GeminiService.get_instance()
        available = gemini.is_available()
        if available:
            click.echo(click.style("  ✓ Gemini API: Connection verified and responsive.", fg="green"))
        else:
            click.echo(click.style("  ! Gemini API: Initialized but test response degraded.", fg="yellow"))
    except Exception as e:
        click.echo(click.style(f"  ✗ Gemini error: {str(e)}", fg="red"))

    click.echo("\nSystem diagnostic verification complete.")


@click.command("create-user")
@click.option("--name", prompt=True, help="Full name of user")
@click.option("--email", prompt=True, help="Email address")
@click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True, help="User password")
@click.option("--role", type=click.Choice(["TEACHER", "STUDENT"], case_sensitive=False), prompt=True, help="User role")
@with_appcontext
def create_user_command(name, email, password, role):
    """Create a new user account via CLI."""
    from app.services.auth_service import AuthService
    try:
        user = AuthService.register(
            name=name,
            email=email,
            password=password,
            role=role.upper(),
        )
        click.echo(click.style(f"User '{user['email']}' created successfully with role '{user['role']}'!", fg="green"))
    except Exception as e:
        click.echo(click.style(f"Failed to create user: {str(e)}", fg="red"))


def register_cli_commands(app: Flask) -> None:
    """Register all custom CLI commands with the Flask application."""
    app.cli.add_command(seed_command)
    app.cli.add_command(clean_tokens_command)
    app.cli.add_command(verify_system_command)
    app.cli.add_command(create_user_command)
