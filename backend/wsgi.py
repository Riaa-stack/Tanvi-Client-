"""
wsgi.py — Production WSGI entry point for Gunicorn / uWSGI.
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
