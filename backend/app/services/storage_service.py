"""
app/services/storage_service.py — Abstracted file storage for PDFs.

Provides secure filename generation, storage, retrieval and deletion.
Raw filesystem paths are never exposed to API clients.
"""
from __future__ import annotations

import hashlib
import os
import secrets
import shutil
import tempfile
from pathlib import Path

from app.config import get_settings
from app.errors import FileError, FileTooLargeError
from app.logging_config import get_logger

logger = get_logger(__name__)

ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}
# Additional check for PDF magic bytes
PDF_MAGIC = b"%PDF"


class StorageService:
    """
    Local filesystem storage implementation.
    Designed so that cloud storage can be swapped in later.
    """

    def __init__(self):
        settings = get_settings()
        self._base_dir = Path(settings.UPLOAD_DIRECTORY).resolve()
        self._max_size = settings.MAX_UPLOAD_SIZE

    def _papers_dir(self) -> Path:
        d = self._base_dir / "papers"
        d.mkdir(parents=True, exist_ok=True)
        return d

    def _notes_dir(self) -> Path:
        d = self._base_dir / "notes"
        d.mkdir(parents=True, exist_ok=True)
        return d

    # ── Public API ────────────────────────────────────────────────────────────

    def validate_file(self, file_stream, original_filename: str, content_length: int | None = None) -> None:
        """
        Validate a file stream before storing.
        Raises FileError or FileTooLargeError on invalid input.
        """
        # Check size from content-length header
        if content_length is not None and content_length > self._max_size:
            raise FileTooLargeError(
                f"File size {content_length} bytes exceeds limit of {self._max_size} bytes."
            )

        # Extension check
        ext = Path(original_filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise FileError(
                f"Invalid file extension '{ext}'. Only PDF files are accepted."
            )

        # Read header bytes for magic number check
        header = file_stream.read(4)
        file_stream.seek(0)
        if header != PDF_MAGIC:
            raise FileError("File does not appear to be a valid PDF (invalid magic bytes).")

    def store_paper(self, file_stream, original_filename: str) -> tuple[str, str, int, str]:
        """
        Store a paper PDF. Returns (stored_filename, absolute_path, file_size, checksum).
        """
        return self._store(file_stream, original_filename, self._papers_dir())

    def store_note(self, file_stream, original_filename: str) -> tuple[str, str, int, str]:
        """
        Store a note PDF. Returns (stored_filename, absolute_path, file_size, checksum).
        """
        return self._store(file_stream, original_filename, self._notes_dir())

    def _store(self, file_stream, original_filename: str, directory: Path) -> tuple[str, str, int, str]:
        """
        Internal: store a file stream securely.
        Returns (stored_filename, absolute_path, file_size, sha256_checksum).
        """
        # Generate a cryptographically random filename — never use client filename
        random_token = secrets.token_hex(16)
        stored_filename = f"{random_token}.pdf"
        dest_path = directory / stored_filename

        # Write to temp file first, then move atomically
        hasher = hashlib.sha256()
        total_size = 0
        settings = get_settings()

        try:
            with tempfile.NamedTemporaryFile(
                dir=directory, delete=False, suffix=".tmp"
            ) as tmp:
                tmp_path = tmp.name
                while True:
                    chunk = file_stream.read(65536)
                    if not chunk:
                        break
                    total_size += len(chunk)
                    if total_size > settings.MAX_UPLOAD_SIZE:
                        raise FileTooLargeError(
                            f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE} bytes."
                        )
                    hasher.update(chunk)
                    tmp.write(chunk)

            os.replace(tmp_path, dest_path)
        except Exception:
            # Clean up temp file if something went wrong
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise

        checksum = hasher.hexdigest()
        absolute_path = str(dest_path)
        logger.info(
            "file_stored",
            stored_filename=stored_filename,
            size=total_size,
            checksum=checksum,
        )
        return stored_filename, absolute_path, total_size, checksum

    def get_paper_path(self, stored_filename: str) -> Path:
        """Return the absolute path to a stored paper. Does NOT verify existence."""
        path = (self._papers_dir() / stored_filename).resolve()
        # Path traversal protection
        if not str(path).startswith(str(self._papers_dir())):
            raise FileError("Invalid stored filename.")
        return path

    def get_note_path(self, stored_filename: str) -> Path:
        """Return the absolute path to a stored note."""
        path = (self._notes_dir() / stored_filename).resolve()
        if not str(path).startswith(str(self._notes_dir())):
            raise FileError("Invalid stored filename.")
        return path

    def delete_paper(self, stored_filename: str) -> bool:
        """Delete a stored paper file. Returns True if deleted, False if not found."""
        return self._delete(self._papers_dir() / stored_filename)

    def delete_note(self, stored_filename: str) -> bool:
        """Delete a stored note file."""
        return self._delete(self._notes_dir() / stored_filename)

    def _delete(self, path: Path) -> bool:
        try:
            if path.exists():
                path.unlink()
                logger.info("file_deleted", path=str(path))
                return True
            return False
        except OSError as e:
            logger.error("file_delete_failed", path=str(path), error=str(e))
            return False

    def exists(self, file_path: str) -> bool:
        """Check if a stored file still exists on disk."""
        return os.path.isfile(file_path)
