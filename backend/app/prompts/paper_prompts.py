"""
app/prompts/paper_prompts.py — Gemini prompts for question paper analysis.

All prompts explicitly:
- State the role and task
- Define the input
- State constraints (hallucination prevention)
- Define the output schema
"""
from __future__ import annotations


QUESTION_CLASSIFICATION_PROMPT = """
You are an expert academic question classifier for Indian university question papers (SGBAU/similar).

Your task: Classify each question and extract structured information.

INPUT:
{questions_json}

SUBJECT: {subject}
BRANCH: {branch}
SEMESTER: {semester}

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON. No preamble. No explanation.
- For each question, provide:
  - question_number: the original number
  - topic: the main academic topic (be specific, e.g., "Normalization in DBMS", not just "DBMS")
  - subtopic: sub-area if applicable
  - unit: unit number if determinable from topic (e.g., "Unit 3")
  - difficulty: "EASY" | "MEDIUM" | "HARD"
  - question_type: one of ["THEORY", "NUMERICAL", "CONCEPTUAL", "DESCRIPTIVE", "DEFINITION", "DERIVATION", "PROGRAMMING", "DIAGRAM", "SHORT_ANSWER", "LONG_ANSWER", "MIXED", "UNKNOWN"]
  - marks: float or null

CONSTRAINTS:
- Do NOT invent topics that are not related to the subject.
- Do NOT hallucinate marks if not provided in the question text.
- Base difficulty on marks, question type, and academic depth required.
- If topic is unclear, use "UNKNOWN".
- Return EXACTLY this JSON structure:

{{
  "classified_questions": [
    {{
      "question_number": "Q1",
      "topic": "...",
      "subtopic": "...",
      "unit": "...",
      "difficulty": "MEDIUM",
      "question_type": "DESCRIPTIVE",
      "marks": 10.0
    }}
  ]
}}
"""


PAPER_ANALYSIS_PROMPT = """
You are an expert academic analyst for Indian university question papers.

Your task: Analyze this question paper and produce structured intelligence.

PAPER DETAILS:
- Subject: {subject}
- Branch: {branch}  
- Semester: {semester}
- Year: {year}
- University: {university}

QUESTIONS:
{questions_json}

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON. No preamble. No explanation.
- Produce an analysis with these exact keys:

CONSTRAINTS:
- Do NOT invent questions that are not in the input.
- Do NOT claim historical repetition based on a single paper.
- Use cautious language for potential questions: "Potentially Important", "Likely based on paper structure", NOT "Will appear in exam".
- Base all analysis strictly on the provided questions.
- If a section has 0 questions, do not hallucinate statistics for it.

{{
  "topic_analysis": {{
    "major_topics": [
      {{
        "topic": "...",
        "frequency": 3,
        "marks_contribution": 20,
        "importance": "HIGH",
        "question_ids": []
      }}
    ],
    "topic_count": 5
  }},
  "difficulty_analysis": {{
    "easy": 2,
    "medium": 5,
    "hard": 3,
    "distribution_percentage": {{"easy": 20, "medium": 50, "hard": 30}}
  }},
  "mark_distribution": {{
    "by_section": {{}},
    "by_unit": {{}},
    "total_marks": 100,
    "high_weight_questions": []
  }},
  "unit_distribution": {{
    "Unit 1": {{"marks": 0, "question_count": 0}},
    "Unit 2": {{"marks": 0, "question_count": 0}}
  }},
  "question_type_distribution": {{
    "THEORY": 0, "NUMERICAL": 0, "DESCRIPTIVE": 0, "DEFINITION": 0,
    "DERIVATION": 0, "PROGRAMMING": 0, "DIAGRAM": 0, "SHORT_ANSWER": 0,
    "LONG_ANSWER": 0, "MIXED": 0, "UNKNOWN": 0
  }},
  "study_recommendations": [
    {{
      "priority": 1,
      "topic": "...",
      "reason": "...",
      "suggested_time": "..."
    }}
  ],
  "potential_questions": [
    {{
      "question": "...",
      "label": "Potentially Important",
      "basis": "appears multiple times in this paper structure",
      "topic": "...",
      "estimated_marks": 10
    }}
  ],
  "exam_trends": {{
    "overall_trend": "...",
    "insights": ["..."]
  }}
}}
"""


HISTORICAL_ANALYSIS_PROMPT = """
You are an expert academic historian analyzing question paper trends.

Your task: Analyze historical patterns across multiple papers and produce structured intelligence.

ACADEMIC SCOPE:
- University: {university}
- College: {college}
- Branch: {branch}
- Semester: {semester}
- Subject: {subject}

HISTORICAL DATA PROVIDED:
Number of papers: {paper_count}
Years covered: {years}

TOPIC FREQUENCY DATA (from database):
{topic_frequency_json}

REPETITION CLUSTERS (from semantic analysis):
{repetition_clusters_json}

MARKS DISTRIBUTION DATA:
{marks_data_json}

DIFFICULTY TREND DATA:
{difficulty_data_json}

CONSTRAINTS — THIS IS MANDATORY:
- Base ALL analysis on the provided data above.
- Do NOT invent historical patterns not present in the data.
- Do NOT claim a question repeated if it's not in the repetition_clusters data.
- Do NOT claim frequency counts beyond what the data shows.
- Use precise language: "Based on {paper_count} analyzed papers..."
- If evidence is low (< 2 papers), state this limitation explicitly.

OUTPUT: Valid JSON only, no preamble:

{{
  "historical_trends": {{
    "summary": "Based on {paper_count} papers analyzed...",
    "key_observations": ["..."],
    "data_quality": "LOW|MEDIUM|HIGH"
  }},
  "study_recommendations": [
    {{
      "priority": 1,
      "topic": "...",
      "reason": "Appeared in X of {paper_count} papers",
      "historical_support": true
    }}
  ],
  "potential_patterns": [
    {{
      "pattern": "...",
      "label": "Historically Important Pattern",
      "evidence": "appeared in X papers",
      "confidence": "MEDIUM"
    }}
  ]
}}
"""


FALLBACK_STUDY_INTELLIGENCE_PROMPT = """
You are an academic advisor for Sant Gadge Baba Amravati University (SGBAU) / Ram Meghe College.

IMPORTANT: You do NOT have access to actual historical question papers for this subject.
You must NOT:
- Invent historical question patterns
- Claim questions have appeared multiple times
- Fabricate frequency statistics
- Pretend to have paper data you don't have

You DO have:
- Knowledge of typical university syllabi
- Understanding of subject fundamentals
- General exam preparation guidance

REQUEST:
- Branch: {branch}
- Semester: {semester}
- Subject: {subject}
- Year requested: {year}

Provide curriculum-aware study guidance. Clearly label everything as "Curriculum-Based Guidance" not "Historical Evidence".

OUTPUT: Valid JSON only:
{{
  "data_source": "curriculum_fallback",
  "disclaimer": "This guidance is based on typical SGBAU curriculum knowledge, NOT on analyzed historical question papers.",
  "important_topics": [
    {{
      "topic": "...",
      "reason": "Core curriculum topic",
      "suggested_marks_importance": "HIGH|MEDIUM|LOW",
      "is_evidence_based": false
    }}
  ],
  "study_strategy": [
    {{
      "recommendation": "...",
      "type": "curriculum_guidance"
    }}
  ],
  "disclaimer_for_students": "These are general study suggestions based on subject curriculum, not historical exam data."
}}
"""


PAPER_FLASHCARDS_PROMPT = """
You are an expert academic study aid generator. Generate high-yield active-recall flashcards for university students based on the provided subject exam questions and curriculum topics.

SUBJECT: {subject}
BRANCH: {branch}
SEMESTER: {semester}

TOPICS & QUESTIONS:
{content_context}

REQUIREMENTS:
- Generate {count} high-yield, conceptually precise flashcards.
- Front: A clear, exam-relevant question, definition request, or key concept.
- Back: A concise, authoritative, step-by-step or definition-based explanation.
- Each card must be strictly relevant to the provided subject and syllabus.
- Difficulty: "EASY", "MEDIUM", or "HARD".

OUTPUT: Return ONLY valid JSON with this exact structure:
{{
  "flashcards": [
    {{
      "id": 1,
      "front": "...",
      "back": "...",
      "concept": "...",
      "unit": "...",
      "difficulty": "MEDIUM"
    }}
  ],
  "total_count": {count}
}}
"""


PAPER_QUIZ_PROMPT = """
You are an expert exam quiz creator. Create a high-quality, exam-oriented practice quiz with multiple-choice questions based on the provided subject exam questions and syllabus topics.

SUBJECT: {subject}
BRANCH: {branch}
SEMESTER: {semester}

TOPICS & QUESTIONS:
{content_context}

REQUIREMENTS:
- Generate {count} multiple-choice practice questions.
- Each question must have exactly 4 plausible options (A, B, C, D).
- One unambiguously correct answer (specify "A", "B", "C", or "D" and the full text).
- A crystal-clear explanation showing why the answer is correct and why other options are incorrect.
- difficulty: "EASY", "MEDIUM", or "HARD".

OUTPUT: Return ONLY valid JSON with this exact structure:
{{
  "quiz_questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A) ...",
      "explanation": "...",
      "topic": "...",
      "unit": "...",
      "difficulty": "MEDIUM"
    }}
  ],
  "total_questions": {count}
}}
"""
