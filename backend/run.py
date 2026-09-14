"""
run.py — Development server entry point for EduArchive AI backend.
"""
from __future__ import annotations

import os
import sys

# Ensure immediate unbuffered output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(line_buffering=True)

from app import create_app
from app.config import get_settings

app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    host = os.environ.get("FLASK_RUN_HOST", "0.0.0.0")
    port = int(os.environ.get("FLASK_RUN_PORT", 5000))
    debug = settings.DEBUG

    print(f"\n{'='*60}")
    print(f"  EduArchive AI 2.0 Backend Server")
    print(f"  Environment: {settings.FLASK_ENV}")
    print(f"  Listening on: http://{host}:{port}")
    print(f"  Debug mode: {debug}")
    print(f"{'='*60}\n", flush=True)

    app.run(
        host=host,
        port=port,
        debug=debug,
        use_reloader=debug,
    )

