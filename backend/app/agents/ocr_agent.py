"""
OCR Agent — Extract raw text from PDF.
Tries digital extraction first (pdfplumber); falls back to Tesseract OCR if quality is low.
"""
import logging
from typing import Dict, Any, List

from app.agents.base_agent import BaseAgent
from app.constants import ProcessingStatus
from app.repositories.paper_repository import PaperRepository

logger = logging.getLogger(__name__)
DIGITAL_QUALITY_THRESHOLD = 100  # avg chars per page


class OCRAgent(BaseAgent):
    def __init__(self):
        super().__init__("ocr_agent")
        self._paper_repo = PaperRepository()

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        self._start_timer()
        paper_id: str = context.get("paper_id")
        file_path: str = context.get("file_path")

        if not file_path:
            return self._error("file_path not provided in context.")

        raw_text = ""
        page_texts: List[str] = []
        is_ocr_used = False
        quality_score = 1.0

        # Step 1 — Digital text extraction via pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text() or ""
                    page_texts.append(text)
            raw_text = "\n\n".join(page_texts)
            total_chars = sum(len(t) for t in page_texts)
            page_count = len(page_texts)
            avg_chars = total_chars / page_count if page_count else 0
            self.logger.info(f"pdfplumber: {page_count} pages, avg_chars={avg_chars:.0f}")

            if avg_chars >= DIGITAL_QUALITY_THRESHOLD:
                is_ocr_used = False
            else:
                raise ValueError(f"Low text density ({avg_chars:.0f} chars/page) — triggering OCR.")

        except Exception as e:
            self.logger.warning(f"Digital extraction insufficient: {e}. Falling back to OCR.")
            # Step 2 — OCR fallback using PyMuPDF + pytesseract
            try:
                raw_text, page_texts, quality_score = self._ocr_extract(file_path)
                is_ocr_used = True
            except Exception as ocr_err:
                self.logger.error(f"OCR extraction failed: {ocr_err}")
                if paper_id:
                    self._paper_repo.update_processing_status(paper_id, ProcessingStatus.FAILED.value)
                return self._error("OCR failed: could not extract readable text from PDF", ocr_err)

        # Step 3 — Update Paper record
        if paper_id:
            from app.models.paper import Paper
            from app.extensions import db
            paper = Paper.query.get(paper_id)
            if paper:
                paper.extracted_text = raw_text
                paper.page_count = len(page_texts)
                paper.processing_status = ProcessingStatus.OCR_COMPLETE.value
                db.session.commit()

        self.logger.info(
            f"OCR complete: is_ocr={is_ocr_used}, quality={quality_score:.3f}, "
            f"pages={len(page_texts)}, chars={len(raw_text)}"
        )
        self._log_completion(len(page_texts))

        context["raw_text"] = raw_text
        context["page_texts"] = page_texts
        context["is_ocr_used"] = is_ocr_used
        context["quality_score"] = quality_score
        return self._success({
            "raw_text_length": len(raw_text),
            "page_count": len(page_texts),
            "is_ocr_used": is_ocr_used,
            "quality_score": quality_score,
        })

    def _ocr_extract(self, file_path: str):
        import fitz  # PyMuPDF
        import pytesseract
        from pytesseract import Output
        from PIL import Image
        import numpy as np
        import io

        doc = fitz.open(file_path)
        page_texts = []
        all_confidences = []

        for page in doc:
            # Render at 300 DPI
            mat = fitz.Matrix(300 / 72, 300 / 72)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            pil_img = Image.open(io.BytesIO(img_bytes)).convert("L")  # grayscale

            # Otsu binarization
            img_array = np.array(pil_img)
            threshold = img_array.mean()
            binary = (img_array > threshold).astype(np.uint8) * 255
            binarized = Image.fromarray(binary)

            # OCR with word-level confidence
            data = pytesseract.image_to_data(binarized, output_type=Output.DICT, config="--psm 6")
            text_parts = []
            for i, word in enumerate(data["text"]):
                conf = int(data["conf"][i])
                if conf > 0 and word.strip():
                    text_parts.append(word)
                    all_confidences.append(conf)
            page_texts.append(" ".join(text_parts))

        raw_text = "\n\n".join(page_texts)
        quality_score = (sum(all_confidences) / len(all_confidences) / 100.0) if all_confidences else 0.0
        return raw_text, page_texts, quality_score
