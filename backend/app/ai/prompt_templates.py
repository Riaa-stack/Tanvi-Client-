"""
Prompt Templates — LangChain ChatPromptTemplate instances.
Each template is a module-level constant. Version strings are in comments above.
"""
from langchain_core.prompts import ChatPromptTemplate

# ── v1.0 ────────────────────────────────────────────────────────────────────
QUESTION_EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an expert academic exam parser. Extract every question and sub-question "
     "from the provided exam paper text. Output a JSON array only — no explanation, no markdown, no preamble.\n"
     "Each item must have: {{\"number\": \"1a\", \"text\": \"...\", \"marks\": 10, \"part\": \"A\"}}\n"
     "Rules:\n"
     "- Include ALL questions and sub-questions.\n"
     "- Exclude headers, instructions, roll-number fields, and administrative text.\n"
     "- If marks are not found, set marks to null.\n"
     "- Return a valid JSON array. No markdown code fences."),
    ("human", "Paper text:\n\n{raw_text}\n\nExam type: {exam_type}\nTotal marks: {total_marks}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
TOPIC_CLASSIFICATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an academic topic classifier. Classify the given exam question to exactly ONE topic "
     "from the provided syllabus list. Output JSON only — no explanation.\n"
     "Format: {{\"topic_name\": \"...\", \"unit_number\": 1, \"confidence\": 0.92, \"rationale\": \"...\"}}\n"
     "Rules:\n"
     "- You MUST choose only from the provided syllabus topics.\n"
     "- If genuinely ambiguous, pick the closest match and lower confidence.\n"
     "- confidence is a float 0.0–1.0."),
    ("human",
     "Question: {question_text}\n\nMarks: {marks}\n\n"
     "Syllabus topics (JSON):\n{syllabus_json}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
DIFFICULTY_ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an exam difficulty assessor. Classify the given question as Easy, Medium, or Hard "
     "based on cognitive demand, depth of knowledge required, and marks allocated.\n"
     "Output JSON only: {{\"difficulty\": \"medium\", \"confidence\": 0.85}}\n"
     "difficulty must be exactly one of: easy, medium, hard (lowercase)."),
    ("human", "Question: {question_text}\nMarks: {marks}\nQuestion type: {question_type}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
PROBABILITY_PREDICTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an expert exam pattern analyst. Based on the historical frequency data provided, "
     "predict the probability (0.0–1.0) that each topic will appear in the next exam.\n"
     "Output a JSON array only:\n"
     "[{{\"topic_id\": \"...\", \"probability\": 0.85, \"rationale\": \"...\", "
     "\"factors\": [\"appeared 4 of last 5 years\", \"high marks weightage\"]}}]\n"
     "Consider: frequency, recency, marks weightage, gaps since last appearance."),
    ("human", "Subject: {subject_name}\n\nHistorical trend data (JSON):\n{trend_json}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
EXPECTED_QUESTION_GENERATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an expert academic question generator. Generate practice questions for the given topic.\n"
     "IMPORTANT: Every generated question MUST include the exact disclaimer string in the 'disclaimer' field.\n"
     "Output a JSON array only:\n"
     "[{{\"question\": \"...\", \"estimated_marks\": 10, \"difficulty\": \"medium\", "
     "\"disclaimer\": \"AI Generated Practice Question — Not an actual exam question\"}}]\n"
     "Rules:\n"
     "- Generate {count} questions.\n"
     "- Difficulty must be: easy, medium, or hard.\n"
     "- The disclaimer field must be exactly: 'AI Generated Practice Question — Not an actual exam question'"),
    ("human",
     "Topic: {topic_name}\nUnit: {unit_title}\nSubject: {subject_name}\n"
     "Target difficulty: {difficulty}\nEstimated marks: {marks}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
DEPENDENCY_GRAPH_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are a curriculum expert. Given a list of topics, identify prerequisite relationships "
     "— which topic must be understood before another can be learned.\n"
     "Output a JSON array only:\n"
     "[{{\"topic\": \"Normalization\", \"prerequisites\": [\"Relational Model\", \"Functional Dependencies\"]}}]\n"
     "Rules:\n"
     "- Only include relationships where the prerequisite is in the provided list.\n"
     "- A topic with no prerequisites should have an empty prerequisites array.\n"
     "- Be conservative — only include clear, strong dependencies."),
    ("human", "Subject: {subject_name}\n\nTopics list:\n{topics_list}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
SEARCH_EXPLAIN_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an academic assistant. Given a student's search query and matching exam questions, "
     "provide a brief, helpful 2–3 sentence analysis of what these questions test and how to prepare."),
    ("human",
     "Student query: {query}\n\nMatching questions:\n{questions_text}"),
])

# ── v1.0 ────────────────────────────────────────────────────────────────────
AI_CHAT_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are an intelligent academic tutor for the subject '{subject_name}'. "
     "You help students understand concepts, clarify doubts, and prepare for exams.\n"
     "You have access to the following relevant past exam questions as context:\n\n"
     "{context_questions}\n\n"
     "Guidelines:\n"
     "- Be concise, clear, and pedagogically helpful.\n"
     "- Reference the exam questions when relevant.\n"
     "- If you don't know something, say so honestly.\n"
     "- Do not fabricate exam questions or marks."),
    ("human", "{user_message}"),
])
