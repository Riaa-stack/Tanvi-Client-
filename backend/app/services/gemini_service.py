"""
app/services/gemini_service.py — Google Gemini API integration.

Responsibilities:
- Model initialization
- Prompt execution
- Structured JSON output with Pydantic validation
- Retries with exponential backoff
- Timeout handling
- Rate-limit handling
- Malformed output recovery
- Cost-aware operation (no redundant calls)
"""
from __future__ import annotations

import json
import re
import time
from typing import Any, Dict, Optional, Type, TypeVar

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from app.config import get_settings
from app.errors import AIServiceError
from app.logging_config import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


class GeminiService:
    """
    Wrapper around Google Gemini API.
    Uses structured JSON output with validation.
    """

    _instance: Optional["GeminiService"] = None

    def __init__(self):
        settings = get_settings()
        self._model_name = settings.GEMINI_MODEL
        self._temperature = settings.GEMINI_TEMPERATURE
        self._timeout = settings.GEMINI_TIMEOUT
        self._max_retries = settings.GEMINI_MAX_RETRIES
        self._api_key = settings.GEMINI_API_KEY
        self._model = None
        self._initialize()

    def _initialize(self) -> None:
        """Initialize the Gemini model."""
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            self._genai = genai
            self._model = genai.GenerativeModel(
                model_name=self._model_name,
                generation_config=genai.types.GenerationConfig(
                    temperature=self._temperature,
                    response_mime_type="application/json",
                ),
            )
            logger.info("gemini_initialized", model=self._model_name)
        except ImportError:
            logger.error("gemini_import_failed", message="google-generativeai not installed")
            raise AIServiceError("Google Generative AI library not installed.")
        except Exception as e:
            logger.error("gemini_init_failed", error=str(e))
            raise AIServiceError(f"Gemini initialization failed: {str(e)}")

    @classmethod
    def get_instance(cls) -> "GeminiService":
        """Return singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def generate_json(
        self,
        prompt: str,
        context_label: str = "gemini_call",
    ) -> Dict[str, Any]:
        """
        Send a prompt to Gemini and return parsed JSON.
        Automatically retries and fails over to backup models on transient/quota errors.
        Raises AIServiceError if all retries and fallback models are exhausted.
        """
        fallback_models = [
            self._model_name,
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]
        # Deduplicate while preserving order
        unique_models = []
        for m in fallback_models:
            if m and m not in unique_models:
                unique_models.append(m)

        last_error = None
        for current_model_name in unique_models:
            active_model = self._genai.GenerativeModel(
                model_name=current_model_name,
                generation_config=self._genai.types.GenerationConfig(
                    temperature=self._temperature,
                    response_mime_type="application/json",
                ),
            )

            for attempt in range(1, self._max_retries + 1):
                try:
                    start = time.time()
                    response = active_model.generate_content(
                        prompt,
                        request_options={"timeout": self._timeout},
                    )
                    elapsed = time.time() - start
                    logger.info(
                        "gemini_response_received",
                        label=context_label,
                        model=current_model_name,
                        attempt=attempt,
                        elapsed_s=round(elapsed, 2),
                    )
                    return self._parse_json_response(response.text, context_label)

                except Exception as e:
                    last_error = e
                    error_str = str(e).lower()
                    is_rate_limit = "quota" in error_str or "rate" in error_str or "429" in error_str
                    is_timeout = "timeout" in error_str or "deadline" in error_str

                    logger.warning(
                        "gemini_attempt_failed",
                        label=context_label,
                        model=current_model_name,
                        attempt=attempt,
                        error=str(e),
                        is_rate_limit=is_rate_limit,
                        is_timeout=is_timeout,
                    )

                    if is_rate_limit:
                        # Fail over immediately to next model on quota exhaustion
                        logger.info("gemini_quota_failover", from_model=current_model_name)
                        break

                    if attempt < self._max_retries:
                        backoff = 2 ** attempt
                        logger.info("gemini_retry_wait", seconds=backoff, attempt=attempt)
                        time.sleep(backoff)

        raise AIServiceError(
            f"Gemini API failed across all fallback models: {str(last_error)}"
        ) from last_error

    def _parse_json_response(self, raw: str, label: str) -> Dict[str, Any]:
        """
        Parse Gemini's JSON response with recovery strategies.
        """
        if not raw or not raw.strip():
            raise AIServiceError(f"Gemini returned empty response for {label}.")

        text = raw.strip()

        # Strategy 1: Direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Strategy 2: Extract JSON from markdown code block
        code_block = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if code_block:
            try:
                return json.loads(code_block.group(1))
            except json.JSONDecodeError:
                pass

        # Strategy 3: Find the largest JSON object in the response
        brace_start = text.find("{")
        brace_end = text.rfind("}")
        if brace_start != -1 and brace_end != -1:
            candidate = text[brace_start : brace_end + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

        # All strategies failed
        logger.error(
            "gemini_json_parse_failed",
            label=label,
            raw_preview=raw[:200],
        )
        raise AIServiceError(
            f"Gemini returned malformed JSON for {label}. "
            "Cannot safely use this response."
        )

    def generate_text(self, prompt: str, context_label: str = "gemini_text") -> str:
        """
        Generate plain text (non-JSON) response.
        """
        for attempt in range(1, self._max_retries + 1):
            try:
                # Use a text-mode model for non-JSON responses
                text_model = self._genai.GenerativeModel(
                    model_name=self._model_name,
                    generation_config=self._genai.types.GenerationConfig(
                        temperature=self._temperature,
                    ),
                )
                response = text_model.generate_content(
                    prompt,
                    request_options={"timeout": self._timeout},
                )
                return response.text
            except Exception as e:
                if attempt < self._max_retries:
                    time.sleep(2 ** attempt)
                else:
                    raise AIServiceError(
                        f"Gemini text generation failed: {str(e)}"
                    ) from e

    def is_available(self) -> bool:
        """Check if Gemini is available by doing a minimal test call."""
        try:
            response = self._model.generate_content(
                'Return exactly this JSON: {"status": "ok"}',
                request_options={"timeout": 30},
            )
            logger.info(
                "gemini_health_check_success",
                model=self._model_name,
                response_preview=(response.text or "")[:200],
            )
            return True
        except Exception as e:
            logger.error(
                "gemini_health_check_failed",
                model=self._model_name,
                error_type=type(e).__name__,
                error=str(e),
        )
            return False
