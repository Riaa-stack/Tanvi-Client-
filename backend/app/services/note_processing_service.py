"""
app/services/note_processing_service.py — Note processing pipeline.

Mirrors paper processing pipeline but:
- Uses notes_chunks ChromaDB collection (strict isolation)
- No historical intelligence update
- Generates note-specific analysis
"""
from __future__ import annotations

import threading
from datetime import datetime, timezone

from app.config import get_settings
from app.errors import PaperAlreadyProcessingError
from app.logging_config import get_logger
from app.models.note import Note, NoteStatus
from app.models.processing_log import ProcessingLog

logger = get_logger(__name__)

NOTE_STAGE_PROGRESS = {
    NoteStatus.VALIDATING: 5,
    NoteStatus.EXTRACTING: 20,
    NoteStatus.OCR_PROCESSING: 35,
    NoteStatus.STRUCTURING: 50,
    NoteStatus.EMBEDDING: 70,
    NoteStatus.ANALYZING: 88,
    NoteStatus.READY: 100,
}


class NoteProcessingService:
    """Orchestrates note processing pipeline in background thread."""

    def __init__(self, app):
        self._app = app

    def process_async(self, note_id: str) -> None:
        thread = threading.Thread(
            target=self._process_in_context,
            args=(note_id,),
            daemon=True,
            name=f"note-processing-{note_id}",
        )
        thread.start()
        logger.info("note_processing_thread_started", note_id=note_id)

    def _process_in_context(self, note_id: str) -> None:
        with self._app.app_context():
            try:
                self._run_pipeline(note_id)
            except Exception as e:
                logger.exception("note_processing_unhandled_error", note_id=note_id, error=str(e))

    def _run_pipeline(self, note_id: str) -> None:
        from app.extensions import db
        from app.repositories.note_repository import NoteRepository
        from app.services.cleaning_service import DocumentCleaningService
        from app.services.embedding_service import EmbeddingService
        from app.services.extraction_service import ExtractionService
        from app.services.gemini_service import GeminiService
        from app.services.ocr_service import OCRService
        from app.services.vector_store_service import VectorStoreService
        from app.services.storage_service import StorageService

        note = NoteRepository.get_by_id(note_id)
        if not note:
            logger.error("note_not_found_in_pipeline", note_id=note_id)
            return

        if note.status in NoteStatus.IN_PROGRESS_STATUSES:
            logger.warning("note_already_processing", note_id=note_id)
            return

        settings = get_settings()
        cleaner = DocumentCleaningService()
        extraction_svc = ExtractionService()
        ocr_svc = OCRService()
        embedding_svc = EmbeddingService()
        vector_svc = VectorStoreService()
        gemini = GeminiService.get_instance()
        storage = StorageService()

        note.processing_started_at = datetime.now(timezone.utc) if hasattr(note, 'processing_started_at') else None

        try:
            # Stage 1: VALIDATING
            self._update_status(note, NoteStatus.VALIDATING, "Validating note PDF...", db)
            if not storage.exists(note.file_path):
                raise RuntimeError("Note PDF file not found on storage.")

            # Stage 2: EXTRACTING
            self._update_status(note, NoteStatus.EXTRACTING, "Extracting text from note...", db)
            extraction_result = extraction_svc.extract(note.file_path)
            note.page_count = extraction_result.page_count
            db.session.commit()

            # Stage 3: OCR if needed
            if extraction_result.needs_ocr and settings.OCR_ENABLED:
                self._update_status(note, NoteStatus.OCR_PROCESSING, "Running OCR on scanned pages...", db)
                extraction_result = ocr_svc.process_extraction_result(extraction_result, note.file_path)

            # Clean text
            for page in extraction_result.pages:
                page.text = cleaner.clean_page_text(page.text, page.page_number)
            extraction_result.build_full_text()

            # Stage 4: STRUCTURING
            self._update_status(note, NoteStatus.STRUCTURING, "Structuring note content...", db)
            full_text = extraction_result.full_text

            # Stage 5: EMBEDDING
            self._update_status(note, NoteStatus.EMBEDDING, "Generating embeddings for note...", db)

            # Delete existing vectors for idempotency
            vector_svc.delete_note_vectors(note_id)

            # Chunk the note
            chunks, metadatas, ids = self._chunk_note(extraction_result, note)

            if chunks:
                embeddings = embedding_svc.embed_texts(chunks)
                vector_svc.add_note_chunks(
                    note_id=note_id,
                    student_id=note.student_id,
                    chunks=chunks,
                    embeddings=embeddings,
                    metadatas=metadatas,
                    ids=ids,
                )
            logger.info("note_chunks_embedded", note_id=note_id, count=len(chunks))
            db.session.commit()

            # Stage 6: ANALYZING
            self._update_status(note, NoteStatus.ANALYZING, "Analyzing note content with AI...", db)
            note_analysis = self._analyze_note(
                note=note,
                full_text=full_text,
                gemini=gemini,
                db=db,
            )

            # READY
            note.status = NoteStatus.READY
            note.processing_stage = NoteStatus.READY
            note.processing_progress = 100
            note.processing_message = "Note is ready."
            note.processed_at = datetime.now(timezone.utc)
            note.failure_reason = None
            db.session.commit()
            logger.info("note_processing_complete", note_id=note_id)

        except Exception as e:
            logger.exception("note_processing_failed", note_id=note_id, error=str(e))
            try:
                from app.extensions import db as _db
                note_fresh = _db.session.get(Note, note_id)
                if note_fresh:
                    note_fresh.status = NoteStatus.FAILED
                    note_fresh.processing_stage = NoteStatus.FAILED
                    note_fresh.failed_at = datetime.now(timezone.utc)
                    note_fresh.failure_reason = str(e)[:1000]
                    note_fresh.processing_message = "Note processing failed."
                    _db.session.commit()
            except Exception as commit_err:
                logger.error("note_failure_state_commit_error", error=str(commit_err))

    def _update_status(self, note: Note, stage: str, message: str, db) -> None:
        note.status = stage
        note.processing_stage = stage
        note.processing_progress = NOTE_STAGE_PROGRESS.get(stage, note.processing_progress)
        note.processing_message = message
        db.session.commit()
        logger.info("note_stage_update", note_id=note.id, stage=stage)

    def _chunk_note(self, extraction_result, note: Note):
        settings = get_settings()
        chunk_size = settings.CHUNK_SIZE
        overlap = settings.CHUNK_OVERLAP

        chunks = []
        metadatas = []
        ids = []
        chunk_idx = 0

        for page in extraction_result.pages:
            text = page.text
            if not text or not text.strip():
                continue

            words = text.split()
            pos = 0
            while pos < len(words):
                chunk_words = words[pos : pos + chunk_size]
                chunk_text = " ".join(chunk_words)
                if len(chunk_text.strip()) < 20:
                    pos += chunk_size - overlap
                    continue

                chunk_id = f"note_{note.id}_{chunk_idx}"
                chunks.append(chunk_text)
                metadatas.append(
                    {
                        "document_type": "note",
                        "note_id": note.id,
                        "student_id": note.student_id,
                        "page_number": page.page_number,
                        "chunk_index": chunk_idx,
                    }
                )
                ids.append(chunk_id)
                chunk_idx += 1
                pos += chunk_size - overlap

        return chunks, metadatas, ids

    def _analyze_note(self, note: Note, full_text: str, gemini, db) -> None:
        """Run AI analysis on note content and save to DB."""
        from app.models.note_analysis import NoteAnalysis
        from app.prompts.note_prompts import NOTE_ANALYSIS_PROMPT
        from app.repositories.note_repository import NoteRepository

        # Truncate text for prompt (avoid token limit)
        text_for_analysis = full_text[:8000] if len(full_text) > 8000 else full_text

        prompt = NOTE_ANALYSIS_PROMPT.format(note_text=text_for_analysis)
        try:
            analysis_data = gemini.generate_json(prompt, f"note_analysis_{note.id}")
        except Exception as e:
            logger.warning("note_analysis_gemini_failed", note_id=note.id, error=str(e))
            analysis_data = {
                "key_concepts": [],
                "important_points": [],
                "summary": {"quick": "", "detailed": "", "exam": ""},
                "detected_topics": [],
                "detected_units": [],
            }

        analysis = NoteAnalysis(
            note_id=note.id,
            key_concepts=analysis_data.get("key_concepts", []),
            important_points=analysis_data.get("important_points", []),
            summary=analysis_data.get("summary"),
            detected_topics=analysis_data.get("detected_topics", []),
            detected_units=analysis_data.get("detected_units", []),
            model_name=gemini._model_name,
        )

        existing = NoteRepository.get_analysis(note.id)
        if existing:
            db.session.delete(existing)
            db.session.flush()

        db.session.add(analysis)
        db.session.flush()
        return analysis

    def retry_processing(self, note_id: str) -> None:
        from app.extensions import db
        from app.repositories.note_repository import NoteRepository

        note = NoteRepository.get_by_id(note_id)
        if not note:
            from app.errors import NoteNotFoundError
            raise NoteNotFoundError(note_id)

        if note.status in NoteStatus.IN_PROGRESS_STATUSES:
            raise PaperAlreadyProcessingError("Note is already being processed.")

        note.status = NoteStatus.UPLOADED
        note.processing_stage = None
        note.processing_progress = 0
        note.processing_message = "Queued for retry."
        note.failure_reason = None
        note.failed_at = None
        note.processed_at = None
        db.session.commit()

        self.process_async(note_id)
