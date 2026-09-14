"""
app/services/paper_processing_service.py — Orchestrates the complete paper processing pipeline.

Pipeline stages (in order):
  validate → extract → ocr → structure → normalize → classify → chunk → embed
  → persist_vectors → analyze → update_historical → finalize

Each stage:
  1. Updates DB status
  2. Logs to processing_log
  3. Performs real work
  4. Handles and records failures

The paper is only marked READY when ALL stages succeed.
"""
from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from typing import List, Optional

from app.config import get_settings
from app.errors import PaperAlreadyProcessingError
from app.logging_config import get_logger
from app.models.paper import Paper, PaperStatus
from app.models.paper_question import PaperQuestion
from app.models.processing_log import ProcessingLog

logger = get_logger(__name__)

# Stage → progress percentage mapping
STAGE_PROGRESS = {
    PaperStatus.VALIDATING: 5,
    PaperStatus.EXTRACTING: 18,
    PaperStatus.OCR_PROCESSING: 35,
    PaperStatus.STRUCTURING: 50,
    PaperStatus.EMBEDDING: 65,
    PaperStatus.ANALYZING: 80,
    PaperStatus.HISTORICAL_UPDATE: 93,
    PaperStatus.READY: 100,
}


class PaperProcessingService:
    """
    Orchestrates the complete paper processing pipeline.
    Designed to run synchronously in a background thread.
    Each stage updates DB state for frontend polling.
    """

    def __init__(self, app):
        """
        Args:
            app: Flask application instance (for app context in thread).
        """
        self._app = app

    def process_async(self, paper_id: str) -> None:
        """
        Start processing in a background thread.
        The calling request returns immediately after this.
        """
        thread = threading.Thread(
            target=self._process_in_context,
            args=(paper_id,),
            daemon=True,
            name=f"paper-processing-{paper_id}",
        )
        thread.start()
        logger.info("paper_processing_thread_started", paper_id=paper_id)

    def _process_in_context(self, paper_id: str) -> None:
        """Run processing within the Flask application context."""
        with self._app.app_context():
            try:
                self._run_pipeline(paper_id)
            except Exception as e:
                logger.exception(
                    "paper_processing_unhandled_error",
                    paper_id=paper_id,
                    error=str(e),
                )

    def _run_pipeline(self, paper_id: str) -> None:
        """Execute the full processing pipeline for a paper."""
        from app.extensions import db
        from app.models.paper import Paper, PaperStatus
        from app.repositories.paper_repository import PaperRepository
        from app.services.cleaning_service import DocumentCleaningService
        from app.services.embedding_service import EmbeddingService
        from app.services.extraction_service import ExtractionService
        from app.services.ocr_service import OCRService
        from app.services.paper_analysis_service import PaperAnalysisService
        from app.services.question_service import QuestionExtractionService
        from app.services.vector_store_service import VectorStoreService
        from app.services.historical_service import HistoricalService

        paper = PaperRepository.get_by_id(paper_id)
        if not paper:
            logger.error("paper_not_found_in_pipeline", paper_id=paper_id)
            return

        # Concurrency guard: if already processing, skip
        if paper.status in PaperStatus.IN_PROGRESS_STATUSES:
            logger.warning("paper_already_processing", paper_id=paper_id, status=paper.status)
            return

        settings = get_settings()
        cleaner = DocumentCleaningService()
        extraction_svc = ExtractionService()
        ocr_svc = OCRService()
        question_svc = QuestionExtractionService(cleaner)
        embedding_svc = EmbeddingService()
        vector_svc = VectorStoreService()

        paper.processing_started_at = datetime.now(timezone.utc)
        paper.processing_version = "1.0"
        db.session.commit()

        try:
            # ── Stage 1: VALIDATING ──────────────────────────────────────────
            self._update_status(paper, PaperStatus.VALIDATING, "Validating PDF...", db)
            self._log_stage(paper.id, "VALIDATING", "STARTED", db)
            # Validation already happened at upload; verify file still exists
            from app.services.storage_service import StorageService
            storage = StorageService()
            if not storage.exists(paper.file_path):
                raise RuntimeError("PDF file not found on storage.")
            self._log_stage(paper.id, "VALIDATING", "COMPLETED", db)

            # ── Stage 2: EXTRACTING ──────────────────────────────────────────
            self._update_status(paper, PaperStatus.EXTRACTING, "Extracting text from PDF...", db)
            self._log_stage(paper.id, "EXTRACTING", "STARTED", db)
            extraction_result = extraction_svc.extract(paper.file_path)
            paper.page_count = extraction_result.page_count
            db.session.commit()
            self._log_stage(paper.id, "EXTRACTING", "COMPLETED", db)

            # ── Stage 3: OCR (if needed) ──────────────────────────────────────
            if extraction_result.needs_ocr and settings.OCR_ENABLED:
                self._update_status(paper, PaperStatus.OCR_PROCESSING, "Running OCR on scanned pages...", db)
                self._log_stage(paper.id, "OCR_PROCESSING", "STARTED", db)
                extraction_result = ocr_svc.process_extraction_result(extraction_result, paper.file_path)
                self._log_stage(paper.id, "OCR_PROCESSING", "COMPLETED", db)

            # Clean text
            for page in extraction_result.pages:
                page.text = cleaner.clean_page_text(page.text, page.page_number)
            extraction_result.build_full_text()

            # ── Stage 4: STRUCTURING (question extraction) ───────────────────
            self._update_status(paper, PaperStatus.STRUCTURING, "Extracting and structuring questions...", db)
            self._log_stage(paper.id, "STRUCTURING", "STARTED", db)

            extracted_questions = question_svc.extract_questions(
                extraction_result.pages, extraction_result.full_text
            )

            # Run Gemini classification if we have questions
            if extracted_questions:
                from app.services.gemini_service import GeminiService
                from app.prompts.paper_prompts import QUESTION_CLASSIFICATION_PROMPT
                gemini = GeminiService.get_instance()
                try:
                    questions_for_gemini = [
                        {"question_number": q.question_number, "question_text": q.question_text[:500]}
                        for q in extracted_questions[:50]  # Limit to 50 to avoid token limits
                    ]
                    scope = paper.academic_scope
                    subject_name = paper.subject.name if paper.subject else "Unknown"
                    branch_name = paper.branch.name if paper.branch else "Unknown"
                    semester_name = paper.semester.name if paper.semester else "Unknown"

                    prompt = QUESTION_CLASSIFICATION_PROMPT.format(
                        questions_json=json.dumps(questions_for_gemini, indent=2),
                        subject=subject_name,
                        branch=branch_name,
                        semester=semester_name,
                    )
                    classification_result = gemini.generate_json(prompt, "question_classification")
                    classified = {
                        q["question_number"]: q
                        for q in classification_result.get("classified_questions", [])
                    }
                    # Apply Gemini classification to extracted questions
                    for eq in extracted_questions:
                        cls_data = classified.get(eq.question_number, {})
                        if cls_data:
                            eq.topic = cls_data.get("topic") or eq.topic
                            eq.subtopic = cls_data.get("subtopic") or eq.subtopic
                            eq.unit = cls_data.get("unit") or eq.unit
                            if cls_data.get("difficulty"):
                                from app.models.paper_question import DifficultyLevel
                                eq.difficulty = cls_data["difficulty"]
                            if cls_data.get("question_type"):
                                eq.question_type = cls_data["question_type"]
                            if cls_data.get("marks") is not None and eq.marks is None:
                                eq.marks = cls_data["marks"]
                except Exception as e:
                    logger.warning(
                        "question_classification_gemini_failed",
                        paper_id=paper.id,
                        error=str(e),
                        message="Continuing with deterministic classification only",
                    )

            # Save questions to DB (delete existing first for idempotency)
            from app.repositories.paper_repository import PaperRepository
            PaperRepository.delete_questions(paper.id)
            db.session.flush()

            db_questions = question_svc.convert_to_db_questions(extracted_questions, paper.id)
            if db_questions:
                db.session.add_all(db_questions)
                db.session.flush()
            logger.info("questions_structured", paper_id=paper.id, count=len(db_questions))
            self._log_stage(paper.id, "STRUCTURING", "COMPLETED", db, message=f"{len(db_questions)} questions extracted")

            # ── Stage 5: EMBEDDING ───────────────────────────────────────────
            self._update_status(paper, PaperStatus.EMBEDDING, "Generating embeddings...", db)
            self._log_stage(paper.id, "EMBEDDING", "STARTED", db)

            # Delete existing vectors (idempotency for retry)
            vector_svc.delete_paper_vectors(paper.id)

            # Chunk the document
            chunks, chunk_metadatas, chunk_ids = self._chunk_document(
                extraction_result, paper, db_questions
            )

            if chunks:
                chunk_embeddings = embedding_svc.embed_texts(chunks)
                vector_svc.add_paper_chunks(
                    paper_id=paper.id,
                    chunks=chunks,
                    embeddings=chunk_embeddings,
                    metadatas=chunk_metadatas,
                    ids=chunk_ids,
                )

            # Embed individual questions
            if db_questions:
                question_texts = [q.question_text for q in db_questions]
                question_embeddings = embedding_svc.embed_texts(question_texts)
                q_metadatas = [
                    {
                        "document_type": "paper",
                        "paper_id": paper.id,
                        "question_id": q.id,
                        "academic_scope_id": paper.academic_scope_id or "",
                        "subject_id": paper.subject_id,
                        "branch_id": paper.branch_id,
                        "semester_id": paper.semester_id,
                        "year": paper.year,
                        "page_number": q.page_number or 0,
                        "topic": q.topic or "",
                        "marks": float(q.marks) if q.marks else 0.0,
                        "difficulty": q.difficulty,
                        "question_type": q.question_type,
                    }
                    for q in db_questions
                ]
                q_ids = [
                    embedding_svc.deterministic_vector_id(paper.id, i, "question")
                    for i in range(len(db_questions))
                ]
                # Store question_id on question model
                for i, q in enumerate(db_questions):
                    q.embedding_id = q_ids[i]

                vector_svc.add_paper_questions(
                    paper_id=paper.id,
                    texts=question_texts,
                    embeddings=question_embeddings,
                    metadatas=q_metadatas,
                    ids=q_ids,
                )

            paper.embedding_model = embedding_svc.get_model_name()
            db.session.commit()
            self._log_stage(paper.id, "EMBEDDING", "COMPLETED", db, message=f"{len(chunks)} chunks, {len(db_questions)} questions")

            # ── Stage 6: ANALYZING ───────────────────────────────────────────
            self._update_status(paper, PaperStatus.ANALYZING, "Running AI analysis...", db)
            self._log_stage(paper.id, "ANALYZING", "STARTED", db)
            analysis_svc = PaperAnalysisService()
            analysis_svc.analyze_paper(paper, db_questions, db)
            self._log_stage(paper.id, "ANALYZING", "COMPLETED", db)

            # ── Stage 7: HISTORICAL UPDATE ────────────────────────────────────
            paper.status = PaperStatus.READY
            paper.processing_stage = PaperStatus.HISTORICAL_UPDATE
            paper.processing_progress = 90
            paper.processing_message = "Updating historical intelligence..."
            db.session.commit()
            self._log_stage(paper.id, "HISTORICAL_UPDATE", "STARTED", db)
            if paper.academic_scope_id:
                historical_svc = HistoricalService()
                historical_svc.update_for_scope(
                    academic_scope_id=paper.academic_scope_id,
                    new_paper=paper,
                    embedding_svc=embedding_svc,
                    vector_svc=vector_svc,
                    gemini_svc=GeminiService.get_instance(),
                    db=db,
                )
            self._log_stage(paper.id, "HISTORICAL_UPDATE", "COMPLETED", db)

            # ── FINALIZE ──────────────────────────────────────────────────────
            paper.status = PaperStatus.READY
            paper.processing_stage = PaperStatus.READY
            paper.processing_progress = 100
            paper.processing_message = "Paper is ready."
            paper.processed_at = datetime.now(timezone.utc)
            paper.failure_reason = None
            db.session.commit()
            logger.info("paper_processing_complete", paper_id=paper.id)

        except Exception as e:
            logger.exception("paper_processing_failed", paper_id=paper_id, error=str(e))
            try:
                from app.extensions import db as _db
                paper_fresh = _db.session.get(Paper, paper_id)
                if paper_fresh:
                    paper_fresh.status = PaperStatus.FAILED
                    paper_fresh.processing_stage = PaperStatus.FAILED
                    paper_fresh.processing_progress = paper_fresh.processing_progress or 0
                    paper_fresh.failed_at = datetime.now(timezone.utc)
                    paper_fresh.failure_reason = str(e)[:1000]
                    paper_fresh.processing_message = "Processing failed. See failure_reason for details."
                    _db.session.commit()
                    self._log_stage(paper_id, paper_fresh.processing_stage or "UNKNOWN", "FAILED", _db, error=str(e))
            except Exception as commit_err:
                logger.error("failure_state_commit_error", error=str(commit_err))

    def _update_status(
        self, paper: Paper, stage: str, message: str, db
    ) -> None:
        """Update paper status in DB and commit."""
        paper.status = stage
        paper.processing_stage = stage
        paper.processing_progress = STAGE_PROGRESS.get(stage, paper.processing_progress)
        paper.processing_message = message
        db.session.commit()
        logger.info(
            "paper_stage_update",
            paper_id=paper.id,
            stage=stage,
            progress=paper.processing_progress,
        )

    def _log_stage(
        self,
        paper_id: str,
        stage: str,
        status: str,
        db,
        message: str | None = None,
        error: str | None = None,
    ) -> None:
        """Insert a processing log record."""
        try:
            log = ProcessingLog(
                paper_id=paper_id,
                stage=stage,
                status=status,
                message=message,
                error=error,
                completed_at=datetime.now(timezone.utc) if status in ("COMPLETED", "FAILED") else None,
            )
            db.session.add(log)
            db.session.flush()
        except Exception as e:
            logger.warning("processing_log_failed", error=str(e))

    def _chunk_document(
        self, extraction_result, paper: Paper, questions: list
    ) -> tuple[list, list, list]:
        """
        Split document into overlapping chunks for vector storage.
        Preserves page association in metadata.
        """
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

                chunk_id = f"chunk_{paper.id}_{chunk_idx}"
                chunks.append(chunk_text)
                metadatas.append(
                    {
                        "document_type": "paper",
                        "paper_id": paper.id,
                        "academic_scope_id": paper.academic_scope_id or "",
                        "subject_id": paper.subject_id,
                        "branch_id": paper.branch_id,
                        "semester_id": paper.semester_id,
                        "year": paper.year,
                        "page_number": page.page_number,
                        "chunk_index": chunk_idx,
                    }
                )
                ids.append(chunk_id)
                chunk_idx += 1
                pos += chunk_size - overlap

        return chunks, metadatas, ids

    def retry_processing(self, paper_id: str, user_id: str) -> None:
        """
        Reset a FAILED paper and restart processing.
        Idempotent: clears all existing derived data before reprocessing.
        """
        from app.extensions import db
        from app.repositories.paper_repository import PaperRepository

        paper = PaperRepository.get_by_id(paper_id)
        if not paper:
            from app.errors import PaperNotFoundError
            raise PaperNotFoundError(paper_id)

        if paper.status in PaperStatus.IN_PROGRESS_STATUSES:
            raise PaperAlreadyProcessingError(
                "Paper is already being processed. Please wait."
            )

        # Reset to uploadable state
        paper.status = PaperStatus.UPLOADED
        paper.processing_stage = None
        paper.processing_progress = 0
        paper.processing_message = "Queued for retry processing."
        paper.failure_reason = None
        paper.failed_at = None
        paper.processed_at = None
        paper.processing_started_at = None
        db.session.commit()

        self.process_async(paper_id)
        logger.info("paper_retry_initiated", paper_id=paper_id, user_id=user_id)
