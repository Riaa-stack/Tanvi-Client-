"""001_initial_schema — Complete initial database schema for EduArchive AI 2.0.

Revision ID: 001_initial_schema
Revises: None
Create Date: 2026-09-02 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.Enum("TEACHER", "STUDENT", name="user_role"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role", "users", ["role"])
    op.create_index("ix_users_email_active", "users", ["email", "is_active"])

    # ── 2. Subjects ───────────────────────────────────────────────────────────
    op.create_table(
        "subjects",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=True),
        sa.Column("university", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", "university", name="uq_subject_name_university"),
    )
    op.create_index("ix_subjects_name", "subjects", ["name"])

    # ── 3. Branches ───────────────────────────────────────────────────────────
    op.create_table(
        "branches",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_branches_name", "branches", ["name"])

    # ── 4. Semesters ──────────────────────────────────────────────────────────
    op.create_table(
        "semesters",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("number"),
    )
    op.create_index("ix_semesters_number", "semesters", ["number"])

    # ── 5. Academic Scopes ────────────────────────────────────────────────────
    op.create_table(
        "academic_scopes",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("university", sa.String(length=255), nullable=False),
        sa.Column("college", sa.String(length=255), nullable=False),
        sa.Column("branch_id", sa.String(length=36), nullable=False),
        sa.Column("semester_id", sa.String(length=36), nullable=False),
        sa.Column("subject_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["semester_id"], ["semesters.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("university", "college", "branch_id", "semester_id", "subject_id", name="uq_academic_scope"),
    )
    op.create_index("ix_academic_scope_subject", "academic_scopes", ["subject_id"])
    op.create_index("ix_academic_scope_branch_semester", "academic_scopes", ["branch_id", "semester_id"])

    # ── 6. Papers ─────────────────────────────────────────────────────────────
    op.create_table(
        "papers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("teacher_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("original_filename", sa.String(length=500), nullable=False),
        sa.Column("stored_filename", sa.String(length=500), nullable=False),
        sa.Column("file_path", sa.Text(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("checksum", sa.String(length=64), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("semester_id", sa.String(length=36), nullable=False),
        sa.Column("branch_id", sa.String(length=36), nullable=False),
        sa.Column("subject_id", sa.String(length=36), nullable=False),
        sa.Column("academic_scope_id", sa.String(length=36), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "UPLOADED", "VALIDATING", "EXTRACTING", "OCR_PROCESSING",
                "STRUCTURING", "EMBEDDING", "ANALYZING", "HISTORICAL_UPDATE",
                "READY", "FAILED",
                name="paper_status",
            ),
            nullable=False,
            server_default="UPLOADED",
        ),
        sa.Column("processing_stage", sa.String(length=50), nullable=True),
        sa.Column("processing_progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processing_message", sa.Text(), nullable=True),
        sa.Column("page_count", sa.Integer(), nullable=True),
        sa.Column("language", sa.String(length=20), nullable=False, server_default="en"),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("processing_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("processing_version", sa.String(length=20), nullable=False, server_default="1.0"),
        sa.Column("embedding_model", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["academic_scope_id"], ["academic_scopes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["branch_id"], ["branches.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["semester_id"], ["semesters.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stored_filename"),
    )
    op.create_index("ix_papers_teacher_id", "papers", ["teacher_id"])
    op.create_index("ix_papers_status", "papers", ["status"])
    op.create_index("ix_papers_year", "papers", ["year"])
    op.create_index("ix_papers_branch_id", "papers", ["branch_id"])
    op.create_index("ix_papers_subject_id", "papers", ["subject_id"])
    op.create_index("ix_papers_academic_scope_id", "papers", ["academic_scope_id"])
    op.create_index("ix_papers_checksum", "papers", ["checksum"])
    op.create_index("ix_papers_status_year", "papers", ["status", "year"])
    op.create_index("ix_papers_academic_scope_status", "papers", ["academic_scope_id", "status"])

    # ── 7. Paper Questions ────────────────────────────────────────────────────
    op.create_table(
        "paper_questions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("paper_id", sa.String(length=36), nullable=False),
        sa.Column("parent_question_id", sa.String(length=36), nullable=True),
        sa.Column("question_number", sa.String(length=50), nullable=True),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("normalized_text", sa.Text(), nullable=True),
        sa.Column("marks", sa.Float(), nullable=True),
        sa.Column("section", sa.String(length=100), nullable=True),
        sa.Column("unit", sa.String(length=100), nullable=True),
        sa.Column("topic", sa.String(length=255), nullable=True),
        sa.Column("subtopic", sa.String(length=255), nullable=True),
        sa.Column(
            "difficulty",
            sa.Enum("EASY", "MEDIUM", "HARD", "UNKNOWN", name="difficulty_level"),
            nullable=False,
            server_default="UNKNOWN",
        ),
        sa.Column(
            "question_type",
            sa.Enum(
                "THEORY", "NUMERICAL", "CONCEPTUAL", "DESCRIPTIVE", "DEFINITION",
                "DERIVATION", "PROGRAMMING", "DIAGRAM", "SHORT_ANSWER", "LONG_ANSWER",
                "MIXED", "UNKNOWN",
                name="question_type",
            ),
            nullable=False,
            server_default="UNKNOWN",
        ),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("embedding_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["paper_id"], ["papers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_question_id"], ["paper_questions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_paper_questions_paper_id", "paper_questions", ["paper_id"])
    op.create_index("ix_pq_paper_topic", "paper_questions", ["paper_id", "topic"])
    op.create_index("ix_pq_paper_difficulty", "paper_questions", ["paper_id", "difficulty"])
    op.create_index("ix_pq_paper_type", "paper_questions", ["paper_id", "question_type"])

    # ── 8. Paper Analyses ─────────────────────────────────────────────────────
    op.create_table(
        "paper_analyses",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("paper_id", sa.String(length=36), nullable=False),
        sa.Column("topic_analysis", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("difficulty_analysis", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("mark_distribution", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("unit_distribution", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("question_type_distribution", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("repetition_analysis", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("study_recommendations", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("potential_questions", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("exam_trends", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("model_name", sa.String(length=100), nullable=True),
        sa.Column("analysis_version", sa.String(length=20), nullable=False, server_default="1.0"),
        sa.ForeignKeyConstraint(["paper_id"], ["papers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("paper_id"),
    )
    op.create_index("ix_paper_analyses_paper_id", "paper_analyses", ["paper_id"])

    # ── 9. Question Repetition Groups ─────────────────────────────────────────
    op.create_table(
        "question_repetition_groups",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("academic_scope_id", sa.String(length=36), nullable=False),
        sa.Column("canonical_question", sa.Text(), nullable=False),
        sa.Column("concept_label", sa.String(length=500), nullable=True),
        sa.Column("occurrence_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("importance", sa.String(length=20), nullable=False, server_default="MEDIUM"),
        sa.Column("topic", sa.String(length=255), nullable=True),
        sa.Column("unit", sa.String(length=100), nullable=True),
        sa.Column("years", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["academic_scope_id"], ["academic_scopes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_question_repetition_groups_scope_id", "question_repetition_groups", ["academic_scope_id"])
    op.create_index("ix_qrg_scope_occurrence", "question_repetition_groups", ["academic_scope_id", "occurrence_count"])

    # ── 10. Question Repetition Occurrences ───────────────────────────────────
    op.create_table(
        "question_repetition_occurrences",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("group_id", sa.String(length=36), nullable=False),
        sa.Column("question_id", sa.String(length=36), nullable=False),
        sa.Column("paper_id", sa.String(length=36), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=False, server_default="1.0"),
        sa.ForeignKeyConstraint(["group_id"], ["question_repetition_groups.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["paper_id"], ["papers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["question_id"], ["paper_questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_question_repetition_occurrences_group_id", "question_repetition_occurrences", ["group_id"])
    op.create_index("ix_question_repetition_occurrences_question_id", "question_repetition_occurrences", ["question_id"])
    op.create_index("ix_question_repetition_occurrences_paper_id", "question_repetition_occurrences", ["paper_id"])
    op.create_index("ix_qro_group_year", "question_repetition_occurrences", ["group_id", "year"])

    # ── 11. Subject Historical Analyses ───────────────────────────────────────
    op.create_table(
        "subject_historical_analyses",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("academic_scope_id", sa.String(length=36), nullable=False),
        sa.Column("papers_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("papers_included", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("evidence_level", sa.String(length=10), nullable=False, server_default="NONE"),
        sa.Column("topic_frequency", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("question_frequency", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("repetition_clusters", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("unit_importance", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("marks_distribution", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("difficulty_trends", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("question_type_trends", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("historical_trends", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("study_recommendations", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("potential_patterns", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("analysis_version", sa.String(length=20), nullable=False, server_default="1.0"),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["academic_scope_id"], ["academic_scopes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("academic_scope_id"),
    )
    op.create_index("ix_subject_historical_analyses_scope_id", "subject_historical_analyses", ["academic_scope_id"])

    # ── 12. Notes ─────────────────────────────────────────────────────────────
    op.create_table(
        "notes",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("student_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("original_filename", sa.String(length=500), nullable=False),
        sa.Column("stored_filename", sa.String(length=500), nullable=False),
        sa.Column("file_path", sa.Text(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("checksum", sa.String(length=64), nullable=False),
        sa.Column("page_count", sa.Integer(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "UPLOADED", "VALIDATING", "EXTRACTING", "OCR_PROCESSING",
                "STRUCTURING", "EMBEDDING", "ANALYZING", "READY", "FAILED",
                name="note_status",
            ),
            nullable=False,
            server_default="UPLOADED",
        ),
        sa.Column("processing_stage", sa.String(length=50), nullable=True),
        sa.Column("processing_progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processing_message", sa.Text(), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stored_filename"),
    )
    op.create_index("ix_notes_student_id", "notes", ["student_id"])
    op.create_index("ix_notes_status", "notes", ["status"])
    op.create_index("ix_notes_student_status", "notes", ["student_id", "status"])

    # ── 13. Note Analyses ─────────────────────────────────────────────────────
    op.create_table(
        "note_analyses",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("note_id", sa.String(length=36), nullable=False),
        sa.Column("key_concepts", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("important_points", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("detected_topics", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("detected_units", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("model_name", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("note_id"),
    )
    op.create_index("ix_note_analyses_note_id", "note_analyses", ["note_id"])

    # ── 14. Chat Sessions ─────────────────────────────────────────────────────
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=True),
        sa.Column("paper_id", sa.String(length=36), nullable=True),
        sa.Column("subject_id", sa.String(length=36), nullable=True),
        sa.Column("academic_scope_id", sa.String(length=36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["academic_scope_id"], ["academic_scopes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["paper_id"], ["papers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chat_sessions_user_id", "chat_sessions", ["user_id"])

    # ── 15. Chat Messages ─────────────────────────────────────────────────────
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.Enum("user", "assistant", name="message_role"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("evidence", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("used_fallback", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("evidence_level", sa.String(length=10), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["session_id"], ["chat_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])
    op.create_index("ix_chat_messages_session_created", "chat_messages", ["session_id", "created_at"])

    # ── 16. Processing Logs ───────────────────────────────────────────────────
    op.create_table(
        "processing_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("paper_id", sa.String(length=36), nullable=True),
        sa.Column("note_id", sa.String(length=36), nullable=True),
        sa.Column("stage", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["paper_id"], ["papers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_processing_logs_paper_id", "processing_logs", ["paper_id"])
    op.create_index("ix_processing_logs_note_id", "processing_logs", ["note_id"])
    op.create_index("ix_processing_logs_paper_stage", "processing_logs", ["paper_id", "stage"])

    # ── 17. Revoked Tokens ────────────────────────────────────────────────────
    op.create_table(
        "revoked_tokens",
        sa.Column("jti", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("jti"),
    )
    op.create_index("ix_revoked_tokens_user", "revoked_tokens", ["user_id"])
    op.create_index("ix_revoked_tokens_expires", "revoked_tokens", ["expires_at"])


def downgrade() -> None:
    op.drop_table("revoked_tokens")
    op.drop_table("processing_logs")
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
    op.drop_table("note_analyses")
    op.drop_table("notes")
    op.drop_table("subject_historical_analyses")
    op.drop_table("question_repetition_occurrences")
    op.drop_table("question_repetition_groups")
    op.drop_table("paper_analyses")
    op.drop_table("paper_questions")
    op.drop_table("papers")
    op.drop_table("academic_scopes")
    op.drop_table("semesters")
    op.drop_table("branches")
    op.drop_table("subjects")
    op.drop_table("users")

    # Drop custom enums
    op.execute("DROP TYPE IF EXISTS message_role")
    op.execute("DROP TYPE IF EXISTS note_status")
    op.execute("DROP TYPE IF EXISTS question_type")
    op.execute("DROP TYPE IF EXISTS difficulty_level")
    op.execute("DROP TYPE IF EXISTS paper_status")
    op.execute("DROP TYPE IF EXISTS user_role")
