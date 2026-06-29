"""API Package Init & Blueprint Registration."""
from flask import Flask

def register_blueprints(app: Flask):
    from .auth_routes import bp as auth_bp
    from .paper_routes import bp as paper_bp
    from .question_routes import bp as question_bp
    from .syllabus_routes import bp as syllabus_bp
    from .analytics_routes import bp as analytics_bp
    from .student_routes import bp as student_bp
    from .search_routes import bp as search_bp
    from .chat_routes import bp as chat_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(paper_bp)
    app.register_blueprint(question_bp)
    app.register_blueprint(syllabus_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(chat_bp)
