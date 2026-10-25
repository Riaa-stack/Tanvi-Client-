"""
migrate_db.py — Database Migration and Setup Helper

Run this script to automatically create any missing tables (including teacher_notes)
and ensure database schema is in sync with models.

Usage:
    cd backend
    python migrate_db.py
"""
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
# Import all models to ensure metadata is registered
from app.models import *

app = create_app()

with app.app_context():
    print("==================================================")
    print("EduArchive AI 2.0 — Database Schema Synchronization")
    print("==================================================")
    try:
        db.create_all()
        print(" [SUCCESS] All database tables created / verified:")
        print("   - teacher_notes (Teacher uploaded PDFs and Word notes)")
        print("   - users, academic_branches, academic_semesters, academic_subjects")
        print("   - papers, questions, paper_analyses, notes, flashcards, quizzes")
        print("==================================================")
        print("Schema is up to date!")
    except Exception as e:
        print(f" [ERROR] Could not sync database: {e}")
        sys.exit(1)
