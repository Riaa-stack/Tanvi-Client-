"""
LLM Client — LangChain + OpenRouter wrapper with retry, fallback, streaming, and cost tracking.
"""
import logging
import os
import time
from typing import List, Union, Dict, Generator, Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import json

logger = logging.getLogger(__name__)

# Approximate cost per 1M tokens in USD (for logging only, not billing)
COST_TABLE: Dict[str, Dict[str, float]] = {
    "anthropic/claude-3-haiku": {"input": 0.25, "output": 1.25},
    "mistralai/mistral-7b-instruct": {"input": 0.07, "output": 0.07},
}


class LLMClient:
    DEFAULT_MODEL = "anthropic/claude-3-haiku"
    FALLBACK_MODEL = "mistralai/mistral-7b-instruct"

    def __init__(self, model: str = None, temperature: float = 0.1,
                 max_tokens: int = 2000, timeout: int = 30):
        self._model = model or self.DEFAULT_MODEL
        self._temperature = temperature
        self._max_tokens = max_tokens
        self._timeout = timeout
        self._llm = self._build_llm(self._model)

    def _build_llm(self, model: str) -> ChatOpenAI:
        return ChatOpenAI(
            base_url=os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=os.environ.get("OPENROUTER_API_KEY", ""),
            model=model,
            temperature=self._temperature,
            max_tokens=self._max_tokens,
            timeout=self._timeout,
        )

    def invoke_with_retry(self, messages: List, max_retries: int = 3,
                          parse_json: bool = False) -> Union[str, dict]:
        """Call LLM with exponential backoff. Falls back to FALLBACK_MODEL on exhaustion."""
        last_error = None
        for attempt in range(max_retries):
            try:
                t0 = time.time()
                response = self._llm.invoke(messages)
                elapsed_ms = int((time.time() - t0) * 1000)
                content = response.content

                # Token usage logging
                usage = getattr(response, "usage_metadata", None)
                if usage:
                    input_tokens = getattr(usage, "input_tokens", 0)
                    output_tokens = getattr(usage, "output_tokens", 0)
                    cost = self.estimate_cost(input_tokens, output_tokens, self._model)
                    logger.info(f"LLM [{self._model}] | attempt={attempt+1} | {elapsed_ms}ms | "
                                f"in={input_tokens} out={output_tokens} | ~${cost:.5f}")

                if parse_json:
                    try:
                        # Strip markdown code fences if present
                        text = content.strip()
                        if text.startswith("```"):
                            text = text.split("```")[1]
                            if text.startswith("json"):
                                text = text[4:]
                        return json.loads(text.strip())
                    except (json.JSONDecodeError, IndexError) as je:
                        logger.warning(f"JSON parse failed on attempt {attempt+1}: {je}")
                        last_error = je
                        continue

                return content

            except Exception as e:
                wait = 2 ** attempt
                logger.warning(f"LLM attempt {attempt+1} failed: {e}. Retrying in {wait}s...")
                last_error = e
                time.sleep(wait)

        # Fallback model
        logger.warning(f"All {max_retries} retries exhausted. Trying fallback model {self.FALLBACK_MODEL}...")
        try:
            fallback_llm = self._build_llm(self.FALLBACK_MODEL)
            response = fallback_llm.invoke(messages)
            content = response.content
            if parse_json:
                text = content.strip()
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                return json.loads(text.strip())
            return content
        except Exception as fe:
            logger.error(f"Fallback model also failed: {fe}")
            raise RuntimeError(f"LLM failed after {max_retries} retries and fallback: {last_error}") from fe

    def stream(self, messages: List) -> Generator[str, None, None]:
        """Yield tokens for Server-Sent Events streaming."""
        try:
            for chunk in self._llm.stream(messages):
                if chunk.content:
                    yield chunk.content
        except Exception as e:
            logger.error(f"LLM stream error: {e}")
            raise

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Rough cost estimate in USD (for logging only)."""
        rates = COST_TABLE.get(model, {"input": 0.1, "output": 0.1})
        return (input_tokens * rates["input"] + output_tokens * rates["output"]) / 1_000_000
