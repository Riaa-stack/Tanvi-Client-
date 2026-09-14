"""
app/prompts/note_prompts.py — Gemini prompts for student note intelligence.

CRITICAL: All note prompts MUST explicitly instruct Gemini to use ONLY
the provided note content. No outside knowledge allowed.
"""
from __future__ import annotations


NOTE_ANALYSIS_PROMPT = """
You are an academic note analyzer. Your task is to analyze the provided student note.

CRITICAL CONSTRAINT: Answer ONLY from the provided note text.
Do NOT use outside knowledge. Do NOT add information not in the note.

NOTE CONTENT:
{note_text}

Analyze and return ONLY valid JSON:

{{
  "key_concepts": [
    {{
      "concept": "...",
      "definition": "...",
      "page_reference": null
    }}
  ],
  "important_points": [
    "Point extracted from note..."
  ],
  "summary": {{
    "quick": "One paragraph quick summary from note...",
    "detailed": "Detailed summary from note...",
    "exam": "Exam-focused bullet points from note..."
  }},
  "detected_topics": ["Topic from note..."],
  "detected_units": ["Unit X" or null]
}}
"""


NOTE_QA_PROMPT = """
You are an AI assistant answering questions from a specific student note.

ABSOLUTE CONSTRAINT:
- You MUST answer ONLY from the provided note content below.
- If the answer is NOT in the note, you MUST say: "That information is not available in the selected note."
- Do NOT use outside knowledge, textbooks, or general knowledge.
- Do NOT hallucinate page numbers or content not in the note.

NOTE CONTENT:
{note_context}

QUESTION: {question}

SOURCE NOTE ID: {note_id}

Respond with ONLY valid JSON:
{{
  "answer": "...",
  "found_in_note": true,
  "source_chunks": [
    {{
      "chunk_text": "...",
      "page_number": null,
      "confidence": 0.9
    }}
  ],
  "confidence": 0.9,
  "note_id": "{note_id}"
}}

If not found in note:
{{
  "answer": "That information is not available in the selected note.",
  "found_in_note": false,
  "source_chunks": [],
  "confidence": 0.0,
  "note_id": "{note_id}"
}}
"""


NOTE_SUMMARY_PROMPT = """
You are an academic summarizer. Summarize the provided note content.

CONSTRAINT: Use ONLY the provided note. Do NOT add external knowledge.

NOTE CONTENT:
{note_text}

MODE: {mode}
(quick = 1 paragraph, detailed = comprehensive, exam = bullet points for revision)

Return ONLY valid JSON:
{{
  "mode": "{mode}",
  "summary": "...",
  "key_takeaways": ["..."],
  "based_on_note_only": true
}}
"""


NOTE_DIAGRAM_PROMPT = """
You are an academic diagram generator. Create a structured diagram representation
from the provided note content.

CONSTRAINT: Use ONLY concepts present in the note. Do NOT invent relationships
or concepts not explicitly mentioned in the note.

NOTE CONTENT:
{note_text}

Return ONLY valid JSON representing a diagram:
{{
  "diagram_type": "concept_map|flowchart|hierarchy|timeline",
  "title": "...",
  "nodes": [
    {{
      "id": "n1",
      "label": "...",
      "type": "concept|process|decision",
      "description": "from note: ..."
    }}
  ],
  "edges": [
    {{
      "from": "n1",
      "to": "n2",
      "label": "..."
    }}
  ],
  "note": "Diagram generated exclusively from selected note content."
}}
"""


NOTE_FLASHCARDS_PROMPT = """
You are a flashcard generator for academic study.

CONSTRAINT: Generate flashcards ONLY from the provided note content.
Do NOT add concepts not in the note.

NOTE CONTENT:
{note_text}

Return ONLY valid JSON:
{{
  "flashcards": [
    {{
      "id": 1,
      "front": "Question or term...",
      "back": "Answer from note...",
      "topic": "...",
      "difficulty": "easy|medium|hard"
    }}
  ],
  "total_count": 10,
  "based_on_note_only": true
}}
"""


NOTE_QUIZ_PROMPT = """
You are a quiz generator for academic study.

CONSTRAINT: Generate quiz questions ONLY from the provided note content.
Do NOT add questions about topics not covered in the note.
Every answer must be verifiable from the note.

NOTE CONTENT:
{note_text}

Return ONLY valid JSON:
{{
  "quiz_questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "explanation": "From note: ...",
      "topic": "...",
      "difficulty": "easy|medium|hard"
    }}
  ],
  "total_questions": 10,
  "based_on_note_only": true
}}
"""


RAG_ANSWER_PROMPT = """
You are an academic AI assistant for EduArchive.

TASK: Answer the student's question using ONLY the provided context.

EVIDENCE RULES:
- Answer ONLY from the provided context below.
- If the context contains the answer, provide it with source citations.
- If the context does NOT contain sufficient evidence, state: "I don't have enough processed historical papers to establish a reliable answer."
- Do NOT invent historical statistics (e.g., how many times a question appeared).
- Do NOT claim frequency/repetition data you were not given.

CONTEXT FROM DATABASE AND VECTOR STORE:
{context}

STUDENT QUESTION: {question}

SCOPE: {scope_description}

Return ONLY valid JSON:
{{
  "answer": "...",
  "evidence_used": true,
  "confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT",
  "sources": [
    {{
      "type": "question|chunk|analysis",
      "paper_id": "...",
      "paper_title": "...",
      "year": 2024,
      "question_number": "Q4(b)",
      "page": 5,
      "similarity": 0.89
    }}
  ],
  "used_fallback": false,
  "fallback_reason": null
}}
"""
