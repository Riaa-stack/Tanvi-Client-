"""
app/services/note_ai_service.py — AI features strictly grounded in selected note only.

ABSOLUTE CONSTRAINT: All operations use ONLY the selected note's content.
No cross-note, no paper data, no outside knowledge.
If the answer is not in the note, the service says so explicitly.
"""
from __future__ import annotations

from typing import Dict, Any, List, Optional

from app.errors import NoteNotReadyError
from app.logging_config import get_logger
from app.models.note import Note, NoteStatus
from app.prompts.note_prompts import (
    NOTE_DIAGRAM_PROMPT,
    NOTE_FLASHCARDS_PROMPT,
    NOTE_QA_PROMPT,
    NOTE_QUIZ_PROMPT,
    NOTE_SUMMARY_PROMPT,
)

logger = get_logger(__name__)

VALID_SUMMARY_MODES = ("quick", "detailed", "exam")


class NoteAIService:
    """
    Provides AI-powered features for a single selected note.
    All retrieval is note-scoped and student-scoped.
    """

    def __init__(self, embedding_svc, vector_svc, gemini_svc):
        self._embedding = embedding_svc
        self._vector = vector_svc
        self._gemini = gemini_svc

    def _verify_note_ready(self, note: Note) -> None:
        """Raise if note is not in READY state."""
        if note.status != NoteStatus.READY:
            raise NoteNotReadyError(
                f"Note is not ready for AI operations. Current status: {note.status}"
            )

    def query_note(
        self, note: Note, question: str, n_results: int = 5
    ) -> Dict[str, Any]:
        """
        Answer a question strictly from the selected note.
        If the answer is not in the note, says so explicitly.
        """
        self._verify_note_ready(note)

        if not question or not question.strip():
            return {
                "answer": "Please provide a question.",
                "found_in_note": False,
                "source_chunks": [],
                "confidence": 0.0,
                "note_id": note.id,
            }

        # Retrieve relevant chunks from THIS note only
        query_embedding = self._embedding.embed_single(question)
        results = self._vector.search_note_chunks(
            query_embedding=query_embedding,
            note_id=note.id,
            student_id=note.student_id,
            n_results=n_results,
        )

        # Build note context from retrieved chunks
        if results:
            note_context = "\n\n".join(
                f"[Page {r['metadata'].get('page_number', '?')}]: {r['document']}"
                for r in results
            )
        else:
            note_context = "No relevant content found in this note."

        prompt = NOTE_QA_PROMPT.format(
            note_context=note_context,
            question=question,
            note_id=note.id,
        )

        try:
            answer_data = self._gemini.generate_json(prompt, f"note_qa_{note.id}")
        except Exception as e:
            logger.error("note_qa_gemini_failed", note_id=note.id, error=str(e))
            answer_data = {
                "answer": "Unable to process your question at this time.",
                "found_in_note": False,
                "source_chunks": [],
                "confidence": 0.0,
                "note_id": note.id,
            }

        answer_data["note_id"] = note.id
        answer_data["query_matched_chunks"] = len(results)
        return answer_data

    def summarize_note(
        self, note: Note, mode: str = "quick"
    ) -> Dict[str, Any]:
        """Generate a summary of the note in the requested mode."""
        self._verify_note_ready(note)

        if mode not in VALID_SUMMARY_MODES:
            mode = "quick"

        full_text = self._get_note_full_text(note)
        if not full_text:
            return {
                "mode": mode,
                "summary": "No content available in this note.",
                "key_takeaways": [],
                "based_on_note_only": True,
            }

        # Truncate for prompt
        text = full_text[:8000]
        prompt = NOTE_SUMMARY_PROMPT.format(note_text=text, mode=mode)

        try:
            result = self._gemini.generate_json(prompt, f"note_summary_{note.id}")
        except Exception as e:
            logger.error("note_summary_failed", note_id=note.id, error=str(e))
            result = {
                "mode": mode,
                "summary": "Unable to generate summary at this time.",
                "key_takeaways": [],
                "based_on_note_only": True,
            }
        result["note_id"] = note.id
        return result

    def generate_diagram(self, note: Note) -> Dict[str, Any]:
        """Generate a structured diagram representation from note content."""
        self._verify_note_ready(note)

        full_text = self._get_note_full_text(note)
        if not full_text:
            return {"diagram_type": "none", "title": "Empty note", "nodes": [], "edges": []}

        prompt = NOTE_DIAGRAM_PROMPT.format(note_text=full_text[:6000])
        try:
            result = self._gemini.generate_json(prompt, f"note_diagram_{note.id}")
        except Exception as e:
            logger.error("note_diagram_failed", note_id=note.id, error=str(e))
            result = {"diagram_type": "concept_map", "title": "Unable to generate diagram", "nodes": [], "edges": []}
        result["note_id"] = note.id
        return result

    def generate_flashcards(self, note: Note, count: int = 10) -> Dict[str, Any]:
        """Generate flashcards strictly from note content."""
        self._verify_note_ready(note)

        full_text = self._get_note_full_text(note)
        if not full_text:
            return {"flashcards": [], "total_count": 0, "note_id": note.id}

        prompt = NOTE_FLASHCARDS_PROMPT.format(note_text=full_text[:7000])
        try:
            result = self._gemini.generate_json(prompt, f"note_flashcards_{note.id}")
        except Exception as e:
            logger.error("note_flashcards_failed", note_id=note.id, error=str(e))
            result = {"flashcards": [], "total_count": 0}
        result["note_id"] = note.id
        return result

    def generate_quiz(self, note: Note, question_count: int = 10) -> Dict[str, Any]:
        """Generate quiz questions strictly from note content."""
        self._verify_note_ready(note)

        full_text = self._get_note_full_text(note)
        if not full_text:
            return {"quiz_questions": [], "total_questions": 0, "note_id": note.id}

        prompt = NOTE_QUIZ_PROMPT.format(note_text=full_text[:7000])
        try:
            result = self._gemini.generate_json(prompt, f"note_quiz_{note.id}")
        except Exception as e:
            logger.error("note_quiz_failed", note_id=note.id, error=str(e))
            result = {"quiz_questions": [], "total_questions": 0}
        result["note_id"] = note.id
        return result

    def get_key_concepts(self, note: Note) -> Dict[str, Any]:
        """Extract key concepts from note analysis."""
        from app.repositories.note_repository import NoteRepository
        analysis = NoteRepository.get_analysis(note.id)
        if analysis:
            return {
                "note_id": note.id,
                "key_concepts": analysis.key_concepts or [],
                "detected_topics": analysis.detected_topics or [],
                "source": "stored_analysis",
            }
        return {
            "note_id": note.id,
            "key_concepts": [],
            "detected_topics": [],
            "message": "Note analysis not yet available.",
        }

    def get_important_points(self, note: Note) -> Dict[str, Any]:
        """Return important points from note analysis."""
        from app.repositories.note_repository import NoteRepository
        analysis = NoteRepository.get_analysis(note.id)
        if analysis:
            return {
                "note_id": note.id,
                "important_points": analysis.important_points or [],
            }
        return {"note_id": note.id, "important_points": []}

    def _get_note_full_text(self, note: Note) -> str:
        """Extract full text from the note PDF (re-extraction for AI operations)."""
        try:
            from app.services.extraction_service import ExtractionService
            from app.services.cleaning_service import DocumentCleaningService
            extraction_svc = ExtractionService()
            cleaner = DocumentCleaningService()
            result = extraction_svc.extract(note.file_path)
            for page in result.pages:
                page.text = cleaner.clean_page_text(page.text, page.page_number)
            result.build_full_text()
            return result.full_text
        except Exception as e:
            logger.error("note_text_extraction_failed", note_id=note.id, error=str(e))
            return ""
