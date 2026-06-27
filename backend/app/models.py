from datetime import datetime
from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student', nullable=False) # 'admin' or 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    papers_uploaded = db.relationship('Paper', backref='uploader', lazy=True)
    searches = db.relationship('SearchHistory', backref='user', lazy=True)

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    branch = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    units = db.relationship('Unit', backref='subject', cascade='all, delete-orphan', lazy=True)
    papers = db.relationship('Paper', backref='subject', cascade='all, delete-orphan', lazy=True)

class Unit(db.Model):
    __tablename__ = 'units'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    unit_number = db.Column(db.Integer, nullable=False)
    unit_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)

    questions = db.relationship('Question', backref='unit', lazy=True)
    topics = db.relationship('Topic', backref='unit', cascade='all, delete-orphan', lazy=True)
    analytics = db.relationship('UnitAnalytics', backref='unit', cascade='all, delete-orphan', uselist=False, lazy=True)

class Paper(db.Model):
    __tablename__ = 'papers'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    exam_type = db.Column(db.String(50), nullable=False) # 'ESE', 'MSE', 'Sessional'
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship('Question', backref='paper', cascade='all, delete-orphan', lazy=True)
    occurrences = db.relationship('QuestionOccurrence', backref='paper', cascade='all, delete-orphan', lazy=True)

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    paper_id = db.Column(db.Integer, db.ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id', ondelete='SET NULL'), nullable=True)
    question_text = db.Column(db.Text, nullable=False)
    marks = db.Column(db.Integer, nullable=False, default=10)
    question_type = db.Column(db.String(50), default='Descriptive') # 'Descriptive', 'MCQ', 'Short'

    occurrences = db.relationship('QuestionOccurrence', backref='question', cascade='all, delete-orphan', lazy=True)

class Topic(db.Model):
    __tablename__ = 'topics'
    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id', ondelete='CASCADE'), nullable=False)
    topic_name = db.Column(db.String(150), nullable=False)
    importance_score = db.Column(db.Float, default=0.0)

class QuestionOccurrence(db.Model):
    __tablename__ = 'question_occurrences'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    paper_id = db.Column(db.Integer, db.ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    frequency = db.Column(db.Integer, default=1)

class UnitAnalytics(db.Model):
    __tablename__ = 'unit_analytics'
    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id', ondelete='CASCADE'), nullable=False, unique=True)
    total_questions = db.Column(db.Integer, default=0)
    total_marks = db.Column(db.Integer, default=0)
    weightage_percentage = db.Column(db.Float, default=0.0)
    importance_score = db.Column(db.Float, default=0.0)

class SearchHistory(db.Model):
    __tablename__ = 'search_histories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    query = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
