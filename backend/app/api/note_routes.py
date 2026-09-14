"""
app/api/note_routes.py — Student note management and AI endpoints.

POST   /api/v1/notes
GET    /api/v1/notes
GET    /api/v1/notes/{id}
DELETE /api/v1/notes/{id}
GET    /api/v1/notes/{id}/status
GET    /api/v1/notes/{id}/analysis
POST   /api/v1/notes/{id}/query
POST   /api/v1/notes/{id}/summary
GET    /api/v1/notes/{id}/key-concepts
GET    /api/v1/notes/{id}/important-points
GET    /api/v1/notes/{id}/diagram
GET    /api/v1/notes/{id}/flashcards
GET    /api/v1/notes/{id}/quiz
POST   /api/v1/notes/{id}/retry-processing
"""
from __future__ import annotations

from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt_identity

from app.errors import NotFoundError, NoteNotFoundError, ValidationError
from app.extensions import db
from app.models.note import Note, NoteStatus
from app.repositories.note_repository import NoteRepository
from app.services.embedding_service import EmbeddingService
from app.services.gemini_service import GeminiService
from app.services.note_ai_service import NoteAIService
from app.services.note_processing_service import NoteProcessingService
from app.services.storage_service import StorageService
from app.services.vector_store_service import VectorStoreService
from app.utils.decorators import student_required
from app.utils.pagination import get_pagination_params
from app.utils.response import created_response, paginated_response, success_response

note_bp = Blueprint("notes", __name__)
_storage = StorageService()


def _get_note_ai_service() -> NoteAIService:
    return NoteAIService(
        embedding_svc=EmbeddingService(),
        vector_svc=VectorStoreService(),
        gemini_svc=GeminiService.get_instance(),
    )


def _get_owned_note(note_id: str, student_id: str) -> Note:
    note = NoteRepository.get_by_id_and_student(note_id, student_id)
    if not note:
        raise NoteNotFoundError(note_id)
    return note


@note_bp.route("", methods=["POST"])
@student_required
def upload_note():
    """Upload a student note PDF."""
    student_id = get_jwt_identity()

    if "file" not in request.files:
        raise ValidationError("No file provided. Include 'file' in multipart form.")

    file = request.files["file"]
    if not file.filename:
        raise ValidationError("File has no filename.")

    _storage.validate_file(file.stream, file.filename, request.content_length)
    file.stream.seek(0)

    title = (request.form.get("title") or "").strip()
    if not title:
        raise ValidationError("Title is required.")

    stored_filename, file_path, file_size, checksum = _storage.store_note(
        file.stream, file.filename
    )

    note = Note(
        student_id=student_id,
        title=title,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type="application/pdf",
        checksum=checksum,
        status=NoteStatus.UPLOADED,
        processing_progress=0,
        processing_message="Uploaded. Queued for processing.",
    )
    db.session.add(note)
    db.session.commit()

    processing_svc = NoteProcessingService(current_app._get_current_object())
    processing_svc.process_async(note.id)

    return created_response(
        data={
            "note_id": note.id,
            "status": note.status,
            "title": note.title,
        },
        message="Note uploaded and processing initiated.",
    )


@note_bp.route("", methods=["GET"])
@student_required
def list_notes():
    """List all notes for the current student."""
    student_id = get_jwt_identity()
    page, page_size = get_pagination_params(request.args)
    notes, total = NoteRepository.list_by_student(
        student_id=student_id, page=page, page_size=page_size
    )
    return paginated_response(
        items=[n.to_dict() for n in notes],
        page=page,
        page_size=page_size,
        total=total,
        data_key="notes",
    )


@note_bp.route("/<note_id>", methods=["GET"])
@student_required
def get_note(note_id: str):
    """Get details of a specific note."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    return success_response(data=note.to_dict())


@note_bp.route("/<note_id>", methods=["DELETE"])
@student_required
def delete_note(note_id: str):
    """Delete a note and all associated data."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)

    # Delete vectors
    try:
        VectorStoreService().delete_note_vectors(note_id)
    except Exception:
        pass

    # Delete physical file
    _storage.delete_note(note.stored_filename)

    # Delete DB records
    NoteRepository.delete(note)
    db.session.commit()
    return success_response(message="Note deleted successfully.")


@note_bp.route("/<note_id>/status", methods=["GET"])
@student_required
def get_note_status(note_id: str):
    """Get processing status for polling."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    return success_response(data=note.to_status_dict())


@note_bp.route("/<note_id>/analysis", methods=["GET"])
@student_required
def get_note_analysis(note_id: str):
    """Get the stored AI analysis for a READY note."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    if note.status != NoteStatus.READY:
        raise NotFoundError("Note is not yet ready for analysis.")
    analysis = NoteRepository.get_analysis(note_id)
    if not analysis:
        raise NotFoundError("Analysis not yet available.")
    return success_response(data=analysis.to_dict())


@note_bp.route("/<note_id>/query", methods=["POST"])
@student_required
def query_note(note_id: str):
    """Ask a question strictly from this note's content."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    body = request.get_json() or {}
    question = body.get("question", "").strip()
    if not question:
        raise ValidationError("Question cannot be empty.")

    svc = _get_note_ai_service()
    result = svc.query_note(note=note, question=question)
    return success_response(data=result)


@note_bp.route("/<note_id>/summary", methods=["POST"])
@student_required
def summarize_note(note_id: str):
    """Generate a summary of this note in the requested mode."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    body = request.get_json() or {}
    mode = body.get("mode", "quick")

    svc = _get_note_ai_service()
    result = svc.summarize_note(note=note, mode=mode)
    return success_response(data=result)


@note_bp.route("/<note_id>/key-concepts", methods=["GET"])
@student_required
def get_key_concepts(note_id: str):
    """Get extracted key concepts from a note."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    svc = _get_note_ai_service()
    return success_response(data=svc.get_key_concepts(note))


@note_bp.route("/<note_id>/important-points", methods=["GET"])
@student_required
def get_important_points(note_id: str):
    """Get important points from a note."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    svc = _get_note_ai_service()
    return success_response(data=svc.get_important_points(note))


@note_bp.route("/<note_id>/diagram", methods=["GET"])
@student_required
def get_diagram(note_id: str):
    """Generate concept diagram for a note."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    svc = _get_note_ai_service()
    result = svc.generate_diagram(note)
    return success_response(data=result)


@note_bp.route("/<note_id>/flashcards", methods=["GET"])
@student_required
def get_flashcards(note_id: str):
    """Generate flashcards from note content."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    count = min(int(request.args.get("count", 10)), 50)
    svc = _get_note_ai_service()
    result = svc.generate_flashcards(note=note, count=count)
    return success_response(data=result)


@note_bp.route("/<note_id>/quiz", methods=["GET"])
@student_required
def get_quiz(note_id: str):
    """Generate quiz questions from note content."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    count = min(int(request.args.get("count", 10)), 30)
    svc = _get_note_ai_service()
    result = svc.generate_quiz(note=note, question_count=count)
    return success_response(data=result)


@note_bp.route("/<note_id>/retry-processing", methods=["POST"])
@student_required
def retry_note_processing(note_id: str):
    """Retry processing a FAILED note."""
    student_id = get_jwt_identity()
    note = _get_owned_note(note_id, student_id)
    processing_svc = NoteProcessingService(current_app._get_current_object())
    processing_svc.retry_processing(note_id)
    return success_response(
        data={"note_id": note_id, "status": "QUEUED"},
        message="Note processing retry initiated.",
    )


@note_bp.route("/<note_id>/file", methods=["GET"])
def get_note_file(note_id: str):
    """Serve the raw PDF file for a student note."""
    import os
    from flask import send_file
    note = NoteRepository.get_by_id(note_id)
    if not note:
        raise NoteNotFoundError(note_id)
    if not os.path.exists(note.file_path):
        raise NotFoundError("Physical note PDF file not found on server.")
    return send_file(
        note.file_path,
        mimetype="application/pdf",
        as_attachment=False,
        download_name=note.original_filename,
    )

