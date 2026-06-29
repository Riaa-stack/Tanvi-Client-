"""Base Agent — abstract class every agent must extend."""
import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"agent.{name}")
        self._start_time: Optional[float] = None

    @abstractmethod
    def run(self, context: Dict[str, Any]) -> Dict[str, Any]: ...

    def _success(self, data: Any) -> Dict:
        return {"status": "success", "agent": self.name, "data": data}

    def _error(self, message: str, detail: Any = None) -> Dict:
        self.logger.error(f"[{self.name}] FAILED: {message}", extra={"detail": str(detail)})
        return {"status": "error", "agent": self.name, "message": message, "detail": str(detail) if detail else None}

    def _start_timer(self) -> None:
        self._start_time = time.time()

    def _elapsed_ms(self) -> int:
        return int((time.time() - self._start_time) * 1000) if self._start_time else 0

    def _log_completion(self, records_processed: int = 0) -> None:
        self.logger.info(f"[{self.name}] completed in {self._elapsed_ms()}ms | records={records_processed}")
