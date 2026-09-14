"""
app/services/cleaning_service.py — Document text cleaning and normalisation.

Handles:
- Whitespace normalisation
- Broken line wrap repair
- Repeated header/footer removal
- OCR artifact removal
- Page-number noise removal
- Preservation of mathematical notation and question meaning
"""
from __future__ import annotations

import re
from app.logging_config import get_logger

logger = get_logger(__name__)


class DocumentCleaningService:
    """
    Cleans raw extracted text while preserving semantic content.
    Mathematical notation and question meaning are deliberately preserved.
    """

    # Common header/footer patterns in Indian university question papers
    _HEADER_FOOTER_PATTERNS = [
        r"^\s*\[.*?total\s*marks.*?\]\s*$",
        r"^\s*time\s*allowed\s*:.*$",
        r"^\s*roll\s*no\.?\s*:.*$",
        r"^\s*seat\s*no\.?\s*:.*$",
        r"^\s*\d+\s*/\s*\d+\s*$",  # Page X/Y
        r"^\s*page\s+\d+\s*$",
        r"^\s*-+\s*\d+\s*-+\s*$",  # --5--
    ]

    # OCR artifact patterns
    _OCR_ARTIFACTS = [
        r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]",  # Non-printable chars
        r"([|]{2,})",  # Multiple pipes (OCR for tables gone wrong)
        r"(_){4,}",    # Long underscore runs (form fields)
    ]

    def clean_page_text(self, text: str, page_number: int | None = None) -> str:
        """
        Clean text from a single page.
        """
        if not text:
            return ""

        # Remove non-printable characters (except newlines/tabs)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

        # Remove header/footer patterns
        lines = text.split("\n")
        cleaned_lines = []
        for line in lines:
            skip = False
            for pattern in self._HEADER_FOOTER_PATTERNS:
                if re.match(pattern, line, re.IGNORECASE):
                    skip = True
                    break
            if not skip:
                cleaned_lines.append(line)

        text = "\n".join(cleaned_lines)

        # Normalise whitespace (but preserve newlines for structure)
        text = re.sub(r"[ \t]+", " ", text)

        # Remove lines that are purely whitespace
        lines = [line.rstrip() for line in text.split("\n")]
        text = "\n".join(lines)

        # Collapse more than 2 consecutive blank lines into 2
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Fix broken line wraps: if a line ends without punctuation and the next
        # line starts with lowercase, join them
        text = self._repair_line_wraps(text)

        return text.strip()

    def clean_document_text(self, full_text: str) -> str:
        """Clean the full document text."""
        if not full_text:
            return ""
        text = full_text

        # Remove OCR artifacts
        for pattern in self._OCR_ARTIFACTS:
            text = re.sub(pattern, "", text)

        # Normalise unicode spaces
        text = re.sub(r"\u00a0", " ", text)

        # Collapse excessive whitespace
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{4,}", "\n\n\n", text)

        return text.strip()

    def _repair_line_wraps(self, text: str) -> str:
        """
        Join lines that appear to be broken mid-sentence.
        Preserves question numbering lines.
        """
        lines = text.split("\n")
        result = []
        i = 0
        while i < len(lines):
            line = lines[i]
            # If line doesn't end with sentence-terminating punctuation
            # and the next line starts with lowercase → join
            if (
                i + 1 < len(lines)
                and line
                and not re.search(r"[.?!:;)\]}\d]$", line.rstrip())
                and lines[i + 1]
                and lines[i + 1][0].islower()
                and not re.match(r"^\s*[qQ]\d|^\s*\d+[.)]\s", lines[i + 1])
            ):
                result.append(line + " " + lines[i + 1].lstrip())
                i += 2
            else:
                result.append(line)
                i += 1
        return "\n".join(result)

    def normalize_question_text(self, text: str) -> str:
        """
        Create a normalized version of question text for semantic comparison.
        Preserves semantic meaning but reduces superficial differences.
        """
        if not text:
            return ""

        # Lowercase
        normalized = text.lower()

        # Remove leading question numbering (Q1, 1., (a), etc.)
        normalized = re.sub(
            r"^[\s]*(?:q\.?\d+[\.\)]\s*)?(?:\([a-z]\)\s*)?", "", normalized, flags=re.MULTILINE
        )

        # Normalize punctuation (but preserve mathematical operators)
        normalized = re.sub(r"['`’‘]", "'", normalized)
        normalized = re.sub(r'["“”]', '"', normalized)

        # Collapse whitespace
        normalized = re.sub(r"\s+", " ", normalized)

        return normalized.strip()
