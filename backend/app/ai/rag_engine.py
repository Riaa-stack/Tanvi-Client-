"""
RAG Engine — Retrieval-Augmented Generation pipeline for AI chat.
Retrieves relevant questions from ChromaDB, builds context window,
maintains conversation history in Redis, calls LLM, returns response.
"""
import json
import logging
import uuid
from typing import List, Dict, Generator, Optional

from app.ai.llm_client import LLMClient
from app.ai.embedding_client import EmbeddingClient
from app.ai.prompt_templates import AI_CHAT_PROMPT

logger = logging.getLogger(__name__)

MAX_CONTEXT_QUESTIONS = 5
MAX_CHAT_HISTORY_TURNS = 10
REDIS_TTL = 3600  # 1 hour


class RAGEngine:
    """Retrieval-Augmented Generation pipeline for subject-contextual AI chat."""

    def __init__(self):
        self._llm = LLMClient(temperature=0.3, max_tokens=1024)

    def chat(self, user_message: str, subject_id: str, session_id: str, user_id: str) -> Dict:
        from app.extensions import get_redis_chat, get_chroma_client
        from app.models.subject import Subject
        from app.models.question import Question

        # 1. Sanitize
        user_message = user_message.strip()[:2000]
        if not user_message:
            return {"reply": "Please enter a message.", "session_id": session_id, "sources": []}

        # 2. Load conversation history from Redis
        history = self._get_history(user_id, session_id)

        # 3. Get subject info
        subject = Subject.query.get(subject_id)
        subject_name = subject.name if subject else "your subject"
        subject_code = subject.code if subject else "UNKNOWN"

        # 4. Embed user message and query Chroma
        embedding = EmbeddingClient.get_instance().encode_single(user_message)
        chroma = get_chroma_client()
        context_questions = []
        sources = []
        try:
            results = chroma.query(
                subject_code=subject_code,
                query_embedding=embedding,
                n_results=MAX_CONTEXT_QUESTIONS,
                where={"subject_id": subject_id} if subject_id else None,
            )
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            context_questions = docs
            sources = [m.get("question_id", "") for m in metas]
        except Exception as e:
            logger.warning(f"Chroma query failed, proceeding without context: {e}")

        # 5. Build context string
        context_str = "\n\n".join([f"Q{i+1}: {q}" for i, q in enumerate(context_questions)])
        if not context_str:
            context_str = "No specific past questions available for this query."

        # 6. Build messages from history + current message
        from langchain_core.messages import HumanMessage, AIMessage
        lc_history = []
        for turn in history[-MAX_CHAT_HISTORY_TURNS:]:
            if turn["role"] == "user":
                lc_history.append(HumanMessage(content=turn["content"]))
            else:
                lc_history.append(AIMessage(content=turn["content"]))

        # Format the system + human message via prompt template
        prompt_messages = AI_CHAT_PROMPT.format_messages(
            subject_name=subject_name,
            context_questions=context_str,
            user_message=user_message,
        )
        # Inject history before the human message
        if lc_history and len(prompt_messages) >= 2:
            prompt_messages = [prompt_messages[0]] + lc_history + [prompt_messages[-1]]

        # 7. Call LLM
        reply = self._llm.invoke_with_retry(prompt_messages, max_retries=2)

        # 8. Save new turn to Redis
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": reply})
        self._save_history(user_id, session_id, history)

        return {
            "reply": reply,
            "session_id": session_id,
            "context_questions": context_questions,
            "sources": sources,
        }

    def chat_stream(self, user_message: str, subject_id: str, session_id: str,
                    user_id: str) -> Generator[str, None, None]:
        """Yield LLM tokens for SSE streaming."""
        from app.extensions import get_chroma_client
        from app.models.subject import Subject

        user_message = user_message.strip()[:2000]
        subject = Subject.query.get(subject_id)
        subject_name = subject.name if subject else "your subject"
        subject_code = subject.code if subject else "UNKNOWN"

        embedding = EmbeddingClient.get_instance().encode_single(user_message)
        chroma = get_chroma_client()
        context_questions = []
        try:
            results = chroma.query(subject_code=subject_code, query_embedding=embedding, n_results=MAX_CONTEXT_QUESTIONS)
            context_questions = results.get("documents", [[]])[0]
        except Exception:
            pass

        context_str = "\n\n".join([f"Q{i+1}: {q}" for i, q in enumerate(context_questions)]) or "No context available."
        history = self._get_history(user_id, session_id)

        from langchain_core.messages import HumanMessage, AIMessage
        lc_history = [HumanMessage(content=t["content"]) if t["role"] == "user" else AIMessage(content=t["content"])
                      for t in history[-MAX_CHAT_HISTORY_TURNS:]]

        prompt_messages = AI_CHAT_PROMPT.format_messages(
            subject_name=subject_name, context_questions=context_str, user_message=user_message)
        if lc_history and len(prompt_messages) >= 2:
            prompt_messages = [prompt_messages[0]] + lc_history + [prompt_messages[-1]]

        full_reply = ""
        for token in self._llm.stream(prompt_messages):
            full_reply += token
            yield token

        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": full_reply})
        self._save_history(user_id, session_id, history)

    def clear_session(self, session_id: str) -> None:
        from app.extensions import get_redis_chat
        redis = get_redis_chat()
        # We store by pattern; clear all keys matching this session
        for key in redis.scan_iter(f"chat:*:{session_id}"):
            redis.delete(key)

    def _get_history(self, user_id: str, session_id: str) -> List[Dict]:
        try:
            from app.extensions import get_redis_chat
            redis = get_redis_chat()
            key = f"chat:{user_id}:{session_id}"
            data = redis.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Could not load chat history from Redis: {e}")
        return []

    def _save_history(self, user_id: str, session_id: str, history: List[Dict]) -> None:
        try:
            from app.extensions import get_redis_chat
            redis = get_redis_chat()
            key = f"chat:{user_id}:{session_id}"
            trimmed = history[-MAX_CHAT_HISTORY_TURNS * 2:]  # keep last N turns (each turn = 2 messages)
            redis.setex(key, REDIS_TTL, json.dumps(trimmed))
        except Exception as e:
            logger.warning(f"Could not save chat history to Redis: {e}")
