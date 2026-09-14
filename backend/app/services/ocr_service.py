"""
app/services/ocr_service.py — Tesseract OCR integration.

Only invoked when native PDF extraction yields insufficient text.
Processes individual pages that are flagged as needing OCR.
"""
from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import List

from app.config import get_settings
from app.logging_config import get_logger
from app.services.extraction_service import ExtractionResult, PageContent

logger = get_logger(__name__)


class OCRService:
    """
    Wraps Tesseract OCR for scanned PDF page processing.
    Pages are rendered to images then processed by Tesseract.
    """

    def __init__(self):
        settings = get_settings()
        self._enabled = settings.OCR_ENABLED
        if settings.TESSERACT_CMD:
            import pytesseract
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    def process_extraction_result(
        self, result: ExtractionResult, file_path: str
    ) -> ExtractionResult:
        """
        Apply OCR to pages flagged as needing it.
        Updates the ExtractionResult in place and returns it.
        """
        if not self._enabled:
            logger.warning("ocr_disabled", file_path=file_path)
            return result

        if not result.ocr_pages:
            return result

        logger.info(
            "ocr_starting",
            file_path=file_path,
            ocr_pages=result.ocr_pages,
        )

        try:
            import fitz
            import pytesseract
            from PIL import Image

            doc = fitz.open(file_path)

            for page_content in result.pages:
                if page_content.page_number not in result.ocr_pages:
                    continue

                page_idx = page_content.page_number - 1
                page = doc[page_idx]

                # Render page to image at 300 DPI
                mat = fitz.Matrix(300 / 72, 300 / 72)
                pix = page.get_pixmap(matrix=mat, alpha=False)

                with tempfile.NamedTemporaryFile(
                    suffix=".png", delete=False
                ) as tmp_img:
                    tmp_img_path = tmp_img.name
                    pix.save(tmp_img_path)

                try:
                    img = Image.open(tmp_img_path)
                    # Apply OCR
                    ocr_text = pytesseract.image_to_string(
                        img,
                        lang="eng",
                        config="--psm 6",  # Assume uniform block of text
                    )
                    page_content.text = ocr_text.strip()
                    page_content.is_ocr = True
                    page_content.word_count = len(ocr_text.split())
                    page_content.char_count = len(ocr_text)
                    logger.info(
                        "ocr_page_complete",
                        page_number=page_content.page_number,
                        chars_extracted=page_content.char_count,
                    )
                finally:
                    os.unlink(tmp_img_path)

            doc.close()

        except ImportError as e:
            logger.error(
                "ocr_dependency_missing",
                error=str(e),
                message="pytesseract or Pillow not installed",
            )
            # Don't fail — return with whatever we have
        except Exception as e:
            logger.error("ocr_failed", file_path=file_path, error=str(e))
            raise RuntimeError(f"OCR processing failed: {str(e)}") from e

        # Rebuild full text after OCR
        result.build_full_text()
        result.extraction_method = "native+ocr"
        logger.info("ocr_complete", file_path=file_path, pages_processed=len(result.ocr_pages))
        return result
