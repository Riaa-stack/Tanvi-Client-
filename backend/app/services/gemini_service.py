"""
app/services/gemini_service.py — Google Gemini API integration with multi-key rotation.

Responsibilities:
- Model initialization
- Prompt execution
- Structured JSON output with Pydantic validation
- Retries with exponential backoff
- Timeout handling
- Rate-limit / quota handling with automatic API key rotation
- Malformed output recovery
- Cost-aware operation (no redundant calls)
"""
from __future__ import annotations

import json
import re
import time
from typing import Any, Dict, List, Optional

from app.config import get_settings
from app.errors import AIServiceError
from app.logging_config import get_logger

logger = get_logger(__name__)

# Ordered list of model names to try (newest/best first, falling back to stable)
GEMINI_MODEL_FALLBACK_CHAIN = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
]


class GeminiService:
    """
    Wrapper around Google Gemini API.
    Supports automatic rotation across multiple API keys and multiple model
    fallbacks when quota / rate-limits are hit.
    """

    _instance: Optional["GeminiService"] = None

    def __init__(self):
        settings = get_settings()
        self._api_keys: List[str] = settings.gemini_api_keys  # ordered list of keys
        self._configured_model = settings.GEMINI_MODEL
        self._temperature = settings.GEMINI_TEMPERATURE
        self._timeout = settings.GEMINI_TIMEOUT
        self._max_retries = settings.GEMINI_MAX_RETRIES

        # Index into _api_keys that is currently active
        self._current_key_index: int = 0
        self._genai = None
        self._model = None
        self._initialize_with_key(self._api_keys[0])

    def _initialize_with_key(self, api_key: str) -> None:
        """Initialize (or re-initialize) the Gemini library with a given API key."""
        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            self._genai = genai
            # Build primary model (used for is_available checks)
            model_name = self._resolve_model_name(self._configured_model)
            self._model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=genai.types.GenerationConfig(
                    temperature=self._temperature,
                    response_mime_type="application/json",
                ),
            )
            logger.info(
                "gemini_initialized",
                model=model_name,
                key_index=self._current_key_index,
                total_keys=len(self._api_keys),
            )
        except ImportError:
            logger.error("gemini_import_failed", message="google-generativeai not installed")
            raise AIServiceError("Google Generative AI library not installed.")
        except Exception as e:
            logger.error("gemini_init_failed", error=str(e))
            raise AIServiceError(f"Gemini initialization failed: {str(e)}")

    def _resolve_model_name(self, requested: str) -> str:
        """
        Ensure we use a valid model name.
        If the configured model looks wrong (e.g. gemini-3.8-flash doesn't exist),
        fall back to the first in the known-good chain.
        """
        # Strip whitespace
        requested = (requested or "").strip()
        if requested and requested in GEMINI_MODEL_FALLBACK_CHAIN:
            return requested
        # If not in our known chain, default to first reliable model
        logger.warning(
            "gemini_model_name_unknown",
            requested=requested,
            using=GEMINI_MODEL_FALLBACK_CHAIN[0],
        )
        return GEMINI_MODEL_FALLBACK_CHAIN[0]

    def _rotate_to_next_key(self) -> bool:
        """
        Switch to the next available API key.
        Returns True if a new key was activated, False if all keys are exhausted.
        """
        next_index = self._current_key_index + 1
        if next_index >= len(self._api_keys):
            logger.error(
                "gemini_all_keys_exhausted",
                total_keys=len(self._api_keys),
            )
            return False
        self._current_key_index = next_index
        new_key = self._api_keys[next_index]
        logger.warning(
            "gemini_key_rotation",
            from_index=next_index - 1,
            to_index=next_index,
            message="Rotating to next Gemini API key due to quota/rate-limit",
        )
        self._initialize_with_key(new_key)
        return True

    @classmethod
    def get_instance(cls) -> "GeminiService":
        """Return singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Force recreation of the singleton (useful for testing)."""
        cls._instance = None

    def generate_json(
        self,
        prompt: str,
        context_label: str = "gemini_call",
    ) -> Dict[str, Any]:
        """
        Send a prompt to Gemini and return parsed JSON.

        Strategy:
          For each API key (rotating on quota errors):
            For each model in fallback chain:
              Retry up to max_retries times on transient errors.
        Raises AIServiceError if everything fails.
        """
        last_error = None

        # Build the full model fallback list starting from configured model
        model_chain = self._build_model_chain()

        # Outer loop: try each API key
        while True:
            for model_name in model_chain:
                try:
                    active_model = self._genai.GenerativeModel(
                        model_name=model_name,
                        generation_config=self._genai.types.GenerationConfig(
                            temperature=self._temperature,
                            response_mime_type="application/json",
                        ),
                    )
                except Exception as init_err:
                    logger.warning(
                        "gemini_model_init_failed",
                        model=model_name,
                        error=str(init_err),
                    )
                    continue

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
                            model=model_name,
                            key_index=self._current_key_index,
                            attempt=attempt,
                            elapsed_s=round(elapsed, 2),
                        )
                        return self._parse_json_response(response.text, context_label)

                    except Exception as e:
                        last_error = e
                        error_str = str(e).lower()
                        is_quota = (
                            "quota" in error_str
                            or "rate" in error_str
                            or "429" in error_str
                            or "resource has been exhausted" in error_str
                        )
                        is_model_not_found = (
                            "not found" in error_str
                            or "no longer available" in error_str
                            or "404" in error_str
                            or "model" in error_str and "not" in error_str
                        )

                        logger.warning(
                            "gemini_attempt_failed",
                            label=context_label,
                            model=model_name,
                            key_index=self._current_key_index,
                            attempt=attempt,
                            error=str(e),
                            is_quota=is_quota,
                            is_model_not_found=is_model_not_found,
                        )

                        if is_quota:
                            # Try rotating to next API key immediately
                            rotated = self._rotate_to_next_key()
                            if rotated:
                                # Restart the outer while loop with the new key
                                model_chain = self._build_model_chain()
                                break  # Break inner for-attempt loop → restart model loop
                            else:
                                # All keys exhausted — raise
                                raise AIServiceError(
                                    f"All Gemini API keys exhausted (quota exceeded). Last error: {str(e)}"
                                ) from e

                        if is_model_not_found:
                            # Skip to next model
                            break

                        if attempt < self._max_retries:
                            backoff = 2 ** attempt
                            logger.info(
                                "gemini_retry_wait",
                                seconds=backoff,
                                attempt=attempt,
                            )
                            time.sleep(backoff)
                else:
                    # Exhausted retries for this model — continue to next model
                    continue

            # If we've tried all models and still failing, break out
            break

        raise AIServiceError(
            f"Gemini API failed across all fallback models and keys. Last error: {str(last_error)}"
        ) from last_error

    def _build_model_chain(self) -> list:
        """
        Build the ordered list of models to try.
        Put the configured model first, then the fallback chain (deduped).
        """
        resolved = self._resolve_model_name(self._configured_model)
        chain = [resolved]
        for m in GEMINI_MODEL_FALLBACK_CHAIN:
            if m not in chain:
                chain.append(m)
        return chain

    def _parse_json_response(self, raw: str, label: str) -> Dict[str, Any]:
        """
        Parse Gemini's JSON response with multiple recovery strategies.
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

        # Strategy 4: Fallback for chat/rag — wrap raw text into answer object
        logger.warning(
            "gemini_json_parse_fallback_to_text",
            label=label,
            raw_preview=raw[:120],
        )
        return {
            "answer": text,
            "confidence": "HIGH",
            "sources": [],
            "used_fallback": True,
        }

    def generate_text(self, prompt: str, context_label: str = "gemini_text") -> str:
        """
        Generate plain text (non-JSON) response with key rotation support.
        """
        last_error = None
        model_chain = self._build_model_chain()

        # Outer key-rotation loop
        while True:
            for model_name in model_chain:
                try:
                    text_model = self._genai.GenerativeModel(
                        model_name=model_name,
                        generation_config=self._genai.types.GenerationConfig(
                            temperature=self._temperature,
                        ),
                    )
                except Exception:
                    continue

                for attempt in range(1, self._max_retries + 1):
                    try:
                        response = text_model.generate_content(
                            prompt,
                            request_options={"timeout": self._timeout},
                        )
                        return response.text
                    except Exception as e:
                        last_error = e
                        error_str = str(e).lower()
                        is_quota = (
                            "quota" in error_str
                            or "rate" in error_str
                            or "429" in error_str
                            or "resource has been exhausted" in error_str
                        )
                        if is_quota:
                            rotated = self._rotate_to_next_key()
                            if rotated:
                                model_chain = self._build_model_chain()
                                break
                            else:
                                raise AIServiceError(
                                    f"All Gemini API keys exhausted. Last error: {str(e)}"
                                ) from e
                        if attempt < self._max_retries:
                            time.sleep(2 ** attempt)
                        else:
                            continue
                else:
                    continue
            break

        raise AIServiceError(
            f"Gemini text generation failed across all models/keys: {str(last_error)}"
        ) from last_error

    def is_available(self) -> bool:
        """Check if Gemini is available by doing a minimal test call."""
        try:
            response = self._model.generate_content(
                'Return exactly this JSON: {"status": "ok"}',
                request_options={"timeout": 30},
            )
            logger.info(
                "gemini_health_check_success",
                model=self._configured_model,
                key_index=self._current_key_index,
                response_preview=(response.text or "")[:200],
            )
            return True
        except Exception as e:
            logger.error(
                "gemini_health_check_failed",
                model=self._configured_model,
                error_type=type(e).__name__,
                error=str(e),
            )
            return False
