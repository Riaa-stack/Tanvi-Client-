"""
app/services/extraction_service.py — PDF text extraction using PyMuPDF and pdfplumber.

Handles:
- Text PDFs (native extraction preferred)
- Scanned PDFs (detected and routed to OCR)
- Mixed PDFs
- Page-level extraction with ordering preservation
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List

from app.logging_config import get_logger

logger = get_logger(__name__)


@dataclass
class PageContent:
    """Content extracted from a single PDF page."""
    page_number: int
    text: str
    is_ocr: bool = False
    word_count: int = 0
    char_count: int = 0

    def __post_init__(self):
        self.word_count = len(self.text.split())
        self.char_count = len(self.text)


@dataclass
class ExtractionResult:
    """Result of full PDF extraction."""
    pages: List[PageContent] = field(default_factory=list)
    full_text: str = ""
    page_count: int = 0
    needs_ocr: bool = False
    ocr_pages: List[int] = field(default_factory=list)
    extraction_method: str = "native"

    def build_full_text(self) -> str:
        parts = []
        for page in self.pages:
            parts.append(f"\n--- Page {page.page_number} ---\n{page.text}")
        self.full_text = "\n".join(parts)
        return self.full_text


class ExtractionService:
    """
    Extracts text from PDF files.
    Automatically decides between native extraction and OCR per page.
    """

    # Minimum chars-per-page threshold to consider native extraction sufficient
    MIN_CHARS_PER_PAGE = 50
    MIN_TEXT_DENSITY = 0.05  # chars per pixel equivalent

    def extract(self, file_path: str) -> ExtractionResult:
        """
        Extract text from a PDF file.
        Returns an ExtractionResult with per-page content.
        """
        from app.config import get_settings
        result = ExtractionResult()

        try:
            import fitz  # PyMuPDF

            doc = fitz.open(file_path)
            result.page_count = len(doc)

            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                text = text.strip()

                page_content = PageContent(
                    page_number=page_num + 1,
                    text=text,
                    is_ocr=False,
                )

                # Determine if this page needs OCR
                if self._needs_ocr(text, page):
                    result.needs_ocr = True
                    result.ocr_pages.append(page_num + 1)
                    page_content.is_ocr = True

                result.pages.append(page_content)

            doc.close()
            result.extraction_method = "native"
            result.build_full_text()
            logger.info(
                "extraction_complete",
                file_path=file_path,
                page_count=result.page_count,
                needs_ocr=result.needs_ocr,
                ocr_pages_count=len(result.ocr_pages),
            )
            return result

        except Exception as e:
            logger.error("extraction_failed", file_path=file_path, error=str(e))
            raise RuntimeError(f"PDF extraction failed: {str(e)}") from e

    def _needs_ocr(self, text: str, page) -> bool:
        """
        Determine if a page needs OCR.
        A page needs OCR if it has very little extractable text
        (likely a scanned image).
        """
        from app.config import get_settings
        threshold = get_settings().OCR_TEXT_DENSITY_THRESHOLD

        if not text or len(text.strip()) < self.MIN_CHARS_PER_PAGE:
            # Check if the page actually has image content
            try:
                image_list = page.get_images(full=False)
                if image_list:
                    return True
            except Exception:
                pass
            return len(text.strip()) < self.MIN_CHARS_PER_PAGE

        return False

    def extract_with_pdfplumber(self, file_path: str) -> ExtractionResult:
        """
        Alternative extraction using pdfplumber (better for tables/structured content).
        """
        import pdfplumber

        result = ExtractionResult()
        result.extraction_method = "pdfplumber"

        try:
            with pdfplumber.open(file_path) as pdf:
                result.page_count = len(pdf.pages)
                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    text = text.strip()
                    page_content = PageContent(
                        page_number=page_num + 1,
                        text=text,
                        is_ocr=False,
                    )
                    if self._needs_ocr_simple(text):
                        result.needs_ocr = True
                        result.ocr_pages.append(page_num + 1)
                        page_content.is_ocr = True
                    result.pages.append(page_content)

            result.build_full_text()
            return result
        except Exception as e:
            logger.error("pdfplumber_extraction_failed", error=str(e))
            raise RuntimeError(f"pdfplumber extraction failed: {str(e)}") from e

    def _needs_ocr_simple(self, text: str) -> bool:
        return len(text.strip()) < self.MIN_CHARS_PER_PAGE
