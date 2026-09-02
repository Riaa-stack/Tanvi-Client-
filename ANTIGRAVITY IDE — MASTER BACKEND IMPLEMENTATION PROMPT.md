# ANTIGRAVITY IDE — MASTER BACKEND IMPLEMENTATION PROMPT
## EduArchive AI 2.0 — Complete Production Backend

You are the primary senior backend architect, Python engineer, AI/ML engineer, database architect, RAG engineer, document-processing engineer, security engineer, and QA engineer responsible for implementing the **ENTIRE production-ready backend** of **EduArchive AI 2.0**.

You are working inside an existing software repository.

Your responsibility is NOT to create a prototype, mock backend, partial implementation, architectural demo, or collection of placeholder files.

Your responsibility is to **inspect the existing repository, understand what already exists, preserve useful work, correct architectural problems, and implement the complete backend system described below.**

---

# 0. NON-NEGOTIABLE DIRECTIVE

Build the backend completely.

There must be:

- NO dummy functions
- NO placeholder implementations
- NO fake API responses
- NO mock database data
- NO hardcoded AI answers
- NO simulated processing
- NO fake RAG responses
- NO TODO implementations
- NO `pass` where real implementation is required
- NO "implement later"
- NO "future enhancement" for required functionality
- NO dead endpoints
- NO routes that return static JSON pretending to work
- NO fake ChromaDB results
- NO fake Gemini responses
- NO incomplete service classes
- NO missing imports
- NO circular architecture
- NO undocumented required environment variables
- NO missing migrations
- NO missing validation
- NO missing error handling
- NO missing database relationships
- NO missing processing stages
- NO missing AI functionality
- NO missing RAG functionality
- NO missing historical analysis
- NO missing notes intelligence
- NO hidden manual steps for required functionality

Every feature described in this prompt must be implemented.

If an existing implementation already performs a required function correctly, reuse/refactor it instead of unnecessarily duplicating it.

---

# 1. FIRST ACTION — COMPLETE REPOSITORY AUDIT

Before writing substantial code:

1. Inspect the entire repository.
2. Inspect all existing backend files.
3. Inspect frontend API expectations if available.
4. Inspect existing configuration.
5. Inspect `.env.example`.
6. Inspect existing database models.
7. Inspect migrations.
8. Inspect authentication.
9. Inspect existing AI modules.
10. Inspect document-processing modules.
11. Inspect ChromaDB integration.
12. Inspect Gemini integration.
13. Inspect existing routes/controllers.
14. Inspect existing schemas.
15. Inspect existing utilities.
16. Inspect tests.
17. Inspect startup scripts.
18. Inspect Docker configuration.
19. Inspect README/documentation.

Create an internal implementation map before modifying the repository.

Identify:

- what already works
- what is incomplete
- what is broken
- what is duplicated
- what conflicts with this specification
- what must be rewritten
- what can be reused
- what is missing

Do NOT blindly overwrite working code.

---

# 2. PROJECT DEFINITION

Project:

**EduArchive AI 2.0**

EduArchive AI is an AI-powered academic intelligence platform for:

- question-paper management
- academic document processing
- OCR
- question extraction
- question classification
- topic detection
- difficulty analysis
- marks distribution
- historical comparison
- repeated-question detection
- academic trends
- study recommendations
- RAG-powered academic search
- AI academic assistant
- student notes intelligence
- note-grounded Q&A
- summarization
- diagrams
- flashcards
- quizzes
- teacher document management
- student Paper Vault
- processing tracking
- institutional/curriculum-aware fallback intelligence

The backend must support the complete lifecycle from:

```text
Authentication
        ↓
Metadata collection
        ↓
PDF upload
        ↓
Validation
        ↓
Text extraction
        ↓
OCR when necessary
        ↓
Document structuring
        ↓
Question extraction
        ↓
Question normalization
        ↓
Question classification
        ↓
Topic/unit detection
        ↓
Difficulty analysis
        ↓
Marks analysis
        ↓
Chunking
        ↓
Embeddings
        ↓
ChromaDB persistence
        ↓
Gemini analysis
        ↓
Database persistence
        ↓
Historical corpus analysis
        ↓
READY
        ↓
Student/Teacher access
        ↓
RAG / AI Intelligence
```

---

# 3. TECHNOLOGY REQUIREMENTS

Use the following stack unless an existing repository implementation requires a compatible equivalent.

## Backend

- Python 3.11+
- Flask
- Flask-JWT-Extended
- SQLAlchemy 2.x
- Alembic
- PostgreSQL
- Pydantic / Pydantic Settings
- Marshmallow only if genuinely required by existing architecture; do not unnecessarily mix validation frameworks

## AI

- Google Gemini API
- LangChain where useful
- Sentence Transformers
- local/compatible embedding model
- structured Gemini JSON output

Gemini is the primary LLM.

Do NOT make OpenRouter the primary LLM.

---

# 4. ABSOLUTELY FORBIDDEN INFRASTRUCTURE

Do NOT introduce:

- Celery
- Redis
- RabbitMQ
- Kafka
- Elasticsearch
- unnecessary message brokers

Redis and Celery are explicitly forbidden for this project.

Do not add them merely for asynchronous processing.

---

# 5. VECTOR DATABASE

Use:

**ChromaDB**

ChromaDB must be a real persistent vector database, not an in-memory fake.

Create logical collections/namespaces such as:

```text
papers_chunks
papers_questions
notes_chunks
```

You may create additional collections where architecturally justified.

The vector architecture must prevent:

- note data entering paper RAG
- paper data entering note-only RAG
- one student's private notes becoming visible to another student
- cross-document contamination

Every vector record must contain meaningful metadata.

---

# 6. DATABASE

Use PostgreSQL.

Use SQLAlchemy 2.x.

Use Alembic migrations.

Never rely on automatic table creation in production.

Development startup may optionally support controlled initialization, but production must use migrations.

---

# 7. EXACT USER ROLES

There are ONLY TWO application roles:

```text
TEACHER
STUDENT
```

Do not create an Admin role unless explicitly requested later.

Do not expose teacher functionality to students.

Do not expose student private notes to teachers.

Implement strict authorization.

---

# 8. AUTHENTICATION

Implement complete authentication.

Required:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

Registration must require:

- name
- email
- password
- role

Validate role against:

```text
TEACHER
STUDENT
```

Passwords must be securely hashed.

Never store plaintext passwords.

JWT must contain sufficient identity information.

Implement:

- access tokens
- refresh tokens
- token expiration
- invalid token handling
- revoked/logout handling if architecture supports token revocation
- protected routes
- role-based authorization decorators/middleware

Authentication errors must not leak sensitive information.

---

# 9. DATABASE MODEL ARCHITECTURE

Implement proper normalized models.

At minimum implement:

## User

Fields:

```text
id
name
email
password_hash
role
created_at
updated_at
last_login_at
is_active
```

---

## Subject

```text
id
name
code
university
created_at
updated_at
```

---

## Branch

```text
id
name
code
created_at
updated_at
```

---

## Semester

```text
id
number
name
```

---

## Academic Scope

Represent the academic grouping used for historical intelligence.

Scope should include at minimum:

```text
university
college
branch
semester
subject
```

Year must NOT define the historical corpus.

Year is paper metadata.

This is critical.

Historical analysis must group papers belonging to the same academic scope.

---

# 10. QUESTION PAPER MODEL

Create a complete `Paper` model.

Minimum fields:

```text
id
teacher_id
title
original_filename
stored_filename
file_path
file_size
mime_type
year
semester_id
branch_id
subject_id
academic_scope_id
status
processing_stage
processing_progress
processing_message
uploaded_at
processing_started_at
processed_at
failed_at
failure_reason
checksum
page_count
language
created_at
updated_at
```

Statuses:

```text
UPLOADED
VALIDATING
EXTRACTING
OCR_PROCESSING
STRUCTURING
EMBEDDING
ANALYZING
READY
FAILED
```

---

# 11. PAPER OWNERSHIP

Teachers can upload papers.

Teachers can see/manage papers they are authorized to manage.

Students can see all papers that have:

```text
status = READY
```

Students must NEVER see:

- partially processed papers
- failed papers
- internal processing errors
- private filesystem paths
- internal storage implementation details

---

# 12. PAPER UPLOAD

Teacher upload endpoint:

```text
POST /api/teacher/papers
```

Multipart form must accept:

```text
file
title
year
semester
subject
branch
college
university
```

Validate:

- file exists
- PDF MIME type
- extension
- reasonable file size
- metadata completeness
- year format/range
- valid semester
- valid subject
- valid branch
- valid academic scope

Calculate file checksum.

Use checksum to help identify duplicate uploads.

Do not trust the client-provided filename.

Generate secure storage filenames.

Never construct filesystem paths directly from user-controlled filenames.

---

# 13. PAPER PROCESSING — CRITICAL REQUIREMENT

Paper processing is NOT a user-visible background operation.

After upload, the user must remain in a processing state until processing is complete.

The paper must NOT become available in Paper Vault until:

```text
PDF validated
+
text extracted/OCR completed
+
questions structured
+
questions normalized
+
questions embedded
+
ChromaDB persisted
+
Gemini analysis completed
+
database records persisted
+
historical intelligence updated when applicable
```

Only then:

```text
status = READY
```

The frontend should be able to display:

```text
VALIDATING
EXTRACTING
OCR_PROCESSING
STRUCTURING
EMBEDDING
ANALYZING
READY
```

with:

- progress percentage
- current stage
- human-readable message
- elapsed time if available
- retry possibility on failure

---

# 14. PROCESSING ARCHITECTURE

Do NOT use Celery.

Do NOT use Redis.

The backend must expose processing progress through a reliable mechanism.

Preferred architecture:

The upload request initiates controlled processing and exposes progress through persistent DB state.

Implement:

```text
PaperProcessingService
```

which orchestrates:

```text
validate()
extract()
ocr()
structure()
normalize()
classify()
chunk()
embed()
persist_vectors()
analyze()
update_historical()
finalize()
```

Each stage must update database state.

The system must be recoverable after failures.

Never mark a paper READY before every mandatory stage succeeds.

---

# 15. PROCESSING STATUS API

Implement:

```text
GET /api/papers/{paper_id}/processing-status
```

Response must contain:

```json
{
  "paper_id": "...",
  "status": "EMBEDDING",
  "stage": "EMBEDDING",
  "progress": 72,
  "message": "Generating embeddings...",
  "is_ready": false,
  "is_failed": false,
  "failure_reason": null
}
```

When ready:

```json
{
  "status": "READY",
  "progress": 100,
  "is_ready": true,
  "is_failed": false
}
```

When failed:

```json
{
  "status": "FAILED",
  "is_ready": false,
  "is_failed": true,
  "failure_reason": "..."
}
```

---

# 16. RETRY PROCESSING

Implement:

```text
POST /api/papers/{paper_id}/retry-processing
```

Only authorized users can retry.

Retry must not create duplicate:

- questions
- chunks
- embeddings
- analysis
- historical occurrences

Use idempotent processing.

---

# 17. PDF STORAGE

Implement a proper document storage abstraction.

Example:

```text
StorageService
LocalStorageService
```

The architecture must make storage replaceable later.

Store:

- original PDF
- secure path
- metadata

Never expose raw local filesystem paths to clients.

Provide secure download/read endpoints.

---

# 18. PDF EXTRACTION

Use:

- PyMuPDF
- pdfplumber where appropriate

Extraction must preserve:

- page number
- text
- document ordering

Represent pages internally.

Handle:

- text PDFs
- scanned PDFs
- mixed PDFs

---

# 19. OCR

Use Tesseract OCR where native extraction is insufficient.

Implement OCR detection logic.

For example:

```text
if extracted_text_quality < threshold:
    OCR
else:
    native extraction
```

Do not blindly OCR every document if avoidable.

OCR must preserve page association.

Handle:

- rotated pages where practical
- noisy OCR
- blank pages
- malformed PDFs

---

# 20. DOCUMENT CLEANING

Implement:

```text
DocumentCleaningService
```

Normalize:

- whitespace
- broken line wraps
- repeated headers
- repeated footers
- OCR artifacts
- unnecessary symbols
- page-number noise

Do not destroy meaningful mathematical notation.

Do not blindly remove punctuation.

Preserve question meaning.

---

# 21. QUESTION EXTRACTION

Implement real question extraction.

Extract:

- question number
- question text
- marks
- section
- unit
- topic
- subtopic
- question type
- difficulty
- page number

Handle formats such as:

```text
Q1
1.
1)
(a)
Q.1
Question 1
```

Handle subquestions:

```text
Q2(a)
Q2(b)
```

Do not merge unrelated questions.

---

# 22. QUESTION DATABASE

Create:

`paper_questions`

Minimum:

```text
id
paper_id
question_number
parent_question_id
question_text
normalized_text
marks
section
unit
topic
subtopic
difficulty
question_type
page_number
created_at
updated_at
```

Question types can include:

```text
THEORY
NUMERICAL
CONCEPTUAL
DESCRIPTIVE
DEFINITION
DERIVATION
PROGRAMMING
DIAGRAM
SHORT_ANSWER
LONG_ANSWER
MIXED
UNKNOWN
```

---

# 23. QUESTION NORMALIZATION

Create normalized representations for semantic comparison.

Normalization should:

- lowercase
- normalize whitespace
- remove irrelevant numbering
- normalize punctuation where safe
- preserve semantic terms
- preserve mathematical meaning where possible

Store both:

```text
original question
normalized question
```

Never replace original source text.

---

# 24. QUESTION CLASSIFICATION

For every question determine:

- topic
- subtopic
- unit
- difficulty
- question type
- marks
- conceptual category

Use deterministic logic where possible and Gemini where semantic interpretation is necessary.

Store structured outputs.

Do not use free-form unvalidated Gemini responses.

---

# 25. GEMINI INTEGRATION

Create a dedicated:

```text
GeminiService
```

Responsibilities:

- model initialization
- prompt execution
- JSON structured output
- retries
- timeout handling
- rate-limit handling
- malformed-output handling
- logging
- token/cost awareness where available

API key must come from environment variables.

Never hardcode credentials.

---

# 26. GEMINI CONFIGURATION

Environment variables must be documented.

Example:

```text
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_TEMPERATURE=
GEMINI_TIMEOUT=
GEMINI_MAX_RETRIES=
```

Use safe defaults where appropriate.

Do not commit secrets.

---

# 27. STRUCTURED AI OUTPUT

Gemini must return structured JSON wherever possible.

Validate responses using Pydantic models.

If Gemini returns malformed JSON:

1. attempt safe parsing
2. optionally retry with corrective prompt
3. validate
4. fail gracefully if still invalid

Never silently convert invalid AI output into fake data.

---

# 28. PAPER AI ANALYSIS

Every processed paper must receive AI analysis.

Implement:

```text
PaperAnalysisService
```

Analyze:

### Topics

Identify:

- major topics
- subtopics
- topic frequency
- topic importance

### Difficulty

Analyze:

- easy
- medium
- hard
- overall distribution

### Marks

Analyze:

- marks distribution
- high-weight questions
- section distribution
- unit-wise marks

### Question patterns

Identify:

- conceptual questions
- numerical patterns
- repeated phrasing
- derivations
- long-answer patterns
- short-answer patterns

### Study recommendations

Generate:

- important topics
- study priority
- recommended order
- preparation strategy

### Potential questions

Generate patterns based on evidence.

Never claim that a generated question is guaranteed to appear.

Use language such as:

```text
Potentially Important
Historically Important Pattern
High-Importance Topic
Likely Pattern Based on Historical Evidence
```

---

# 29. PAPER ANALYSIS MODEL

Create:

`paper_analysis`

Store structured JSON fields such as:

```text
paper_id
topic_analysis
difficulty_analysis
mark_distribution
unit_distribution
question_type_distribution
repetition_analysis
study_recommendations
potential_questions
exam_trends
generated_at
model_name
analysis_version
```

---

# 30. HISTORICAL INTELLIGENCE — CRITICAL RULE

Historical intelligence is available only when there are at least:

```text
2 READY papers
```

for the same academic scope:

```text
university
+
college
+
branch
+
semester
+
subject
```

Year does NOT define the corpus.

---

# 31. HISTORICAL STATE

### Zero papers

No historical intelligence.

Student Study Intelligence may use Gemini fallback scoped to:

```text
Sant Gadge Baba Amravati University
Ram Meghe College
```

and the requested:

- branch
- semester
- subject
- year

The system must clearly label this as curriculum-aware fallback.

---

### One paper

Enable:

- paper-level analysis
- topics
- difficulty
- marks
- question classification

Do NOT claim:

- repeated questions
- historical frequency
- historical trends
- multi-year repetition

UI/API should communicate:

```text
Historical comparison requires at least two papers.
```

---

### Two or more papers

Unlock:

- repeated questions
- frequency
- topic frequency
- unit importance
- marks trends
- difficulty trends
- historical patterns
- study recommendations
- potential question patterns

---

# 32. DYNAMIC HISTORICAL RECOMPUTATION

This is mandatory.

Suppose a subject has:

```text
Paper A
Paper B
Paper C
Paper D
```

Historical analysis must be based on all four.

If a fifth paper becomes READY:

```text
Paper E
```

the historical analysis must dynamically update.

Do NOT keep stale historical intelligence.

After every newly READY paper:

1. determine academic scope
2. fetch all READY papers in that scope
3. include new paper
4. compare questions
5. detect semantic repetition
6. update topic frequency
7. update unit importance
8. update marks distribution
9. update difficulty trends
10. update historical patterns
11. update recommendations
12. update potential patterns
13. persist new analysis version

---

# 33. DO NOT REPROCESS EVERYTHING THROUGH GEMINI

Do not blindly send every historical paper to Gemini every time.

Instead:

```text
new question
      ↓
embedding similarity
      ↓
candidate matching questions
      ↓
similarity threshold
      ↓
Gemini verification when necessary
      ↓
repetition cluster
      ↓
aggregate historical statistics
```

Use vector similarity for candidate generation.

Use Gemini only where semantic verification is beneficial.

---

# 34. REPETITION DETECTION

Implement semantic repetition detection.

Do not require exact string matches.

Examples:

```text
Explain normalization in DBMS.
```

and

```text
What is normalization? Explain its normal forms.
```

may belong to the same conceptual cluster.

Store:

```text
repetition_group
canonical_question
occurrence_count
importance
similarity_score
```

And occurrence records:

```text
group_id
question_id
paper_id
year
similarity_score
```

---

# 35. HISTORICAL ANALYSIS MODEL

Create:

`subject_historical_analysis`

Store:

```text
id
academic_scope_id
papers_included
topic_frequency
question_frequency
repetition_clusters
unit_importance
marks_distribution
difficulty_trends
question_type_trends
historical_trends
study_recommendations
potential_patterns
analysis_version
generated_at
```

Ensure historical analysis is reproducible.

---

# 36. PAPER VAULT

Student endpoint:

```text
GET /api/student/papers
```

Only return READY papers.

Filtering:

```text
year
semester
subject
branch
college
university
```

Pagination required.

Sorting required.

Do not load the entire database unnecessarily.

---

# 37. PAPER DETAILS

Endpoint:

```text
GET /api/student/papers/{paper_id}
```

Return:

- metadata
- processing state
- question list
- available intelligence
- analysis summary

Never expose:

- internal paths
- secrets
- internal stack traces

---

# 38. PAPER READING

Implement a secure PDF access endpoint.

The frontend will use this for the left-side PDF reader.

Ensure authorization.

The backend should support:

- PDF streaming
- range requests where practical
- correct content type
- safe access

---

# 39. STUDENT PAPER INTELLIGENCE

For a selected paper, provide intelligence endpoints/services for:

```text
Overview
Important Topics
Repeated Questions
What To Study
Mark Distribution
Difficulty
Exam Trends
Potential Questions
Ask AI
```

The backend must provide structured responses.

---

# 40. IMPORTANT TOPICS

Return:

- topic
- importance score
- question count
- marks contribution
- associated questions
- associated page numbers
- supporting evidence

The frontend must be able to highlight corresponding questions.

---

# 41. QUESTION HIGHLIGHTING

Backend responses should provide enough metadata to identify source questions.

For example:

```json
{
  "question_id": "...",
  "question_number": "Q4(b)",
  "page_number": 5,
  "topic": "Normalization"
}
```

Never fabricate page numbers.

---

# 42. REPEATED QUESTIONS

For a selected paper, return:

- repeated question group
- canonical concept
- frequency
- years
- papers
- matching questions
- similarity confidence
- importance

Also return recommended related papers from the database.

---

# 43. RELATED PAPER RECOMMENDATIONS

When a student views a question or repeated-question cluster, recommend relevant papers based on:

- same subject
- same branch
- same semester
- same academic scope
- relevant topics
- historical overlap

Never recommend failed/unprocessed papers.

---

# 44. STUDY INTELLIGENCE

Endpoint:

```text
POST /api/student/study-intelligence
```

Input:

```text
year
semester
subject
branch
college
university
```

Behavior:

### If sufficient processed historical data exists:

Use database + ChromaDB/RAG first.

### If insufficient historical data:

Use Gemini fallback.

Fallback must explicitly scope itself to:

```text
Sant Gadge Baba Amravati University
Ram Meghe College
```

The generated result must never pretend to be based on historical papers that do not exist.

---

# 45. STUDY INTELLIGENCE RESPONSE

Must support:

1. Important topics
2. Repeated questions where evidence exists
3. Difficulty level/distribution
4. Unit-wise importance
5. Potential question patterns
6. Recommended study order
7. Marks strategy
8. Exam preparation insights

If historical data is unavailable, clearly distinguish:

```text
Historical evidence
```

from:

```text
Curriculum-aware AI guidance
```

---

# 46. RAG ARCHITECTURE

Implement strict RAG-first behavior.

Pipeline:

```text
user query
      ↓
intent/context detection
      ↓
metadata scope extraction
      ↓
database filtering
      ↓
vector retrieval
      ↓
evidence sufficiency evaluation
      ↓
grounded answer
```

Only if evidence is insufficient should fallback Gemini be considered.

---

# 47. RAG SOURCE PRIORITY

Priority:

```text
PostgreSQL structured facts
        ↓
ChromaDB retrieved chunks/questions
        ↓
Paper analysis
        ↓
Historical analysis
        ↓
Gemini fallback
```

Never allow Gemini to invent historical facts.

---

# 48. HISTORICAL FACT SAFETY

If user asks:

> How many times did this question appear?

Answer only from database/vector evidence.

If insufficient evidence:

```text
I don't have enough processed historical papers to establish a reliable frequency.
```

Do NOT make up a number.

---

# 49. RAG QUERY ENDPOINT

Implement:

```text
POST /api/rag/query
```

Request:

```json
{
  "query": "...",
  "scope": {
    "subject_id": "...",
    "branch_id": "...",
    "semester_id": "...",
    "year": 2025
  }
}
```

Return:

- answer
- sources
- confidence/evidence level
- related questions
- related papers
- metadata
- whether fallback was used

---

# 50. ASK EDUARCHIVE CHATBOT

Implement:

```text
POST /api/chat/message
```

Support:

- sessions
- message history
- context
- citations/source references
- grounded answers

Store:

`chat_sessions`

and:

`chat_messages`

A chatbot response should identify its evidence.

---

# 51. CHAT CONTEXT

Maintain context without allowing scope contamination.

If the user is discussing a selected subject/paper, use that context.

If user changes context, update retrieval scope.

Never allow unrelated papers to contaminate a scoped answer.

---

# 52. SOURCE ATTRIBUTION

RAG responses should identify sources such as:

```text
Paper: DBMS May 2025
Question: Q4(b)
Page: 5
Year: 2025
```

The frontend must be able to navigate to source content.

---

# 53. STUDENT NOTES

Students can upload notes.

Endpoint:

```text
POST /api/notes
```

Student provides:

```text
title
PDF
```

---

# 54. NOTE MODEL

Create:

`notes`

Fields:

```text
id
student_id
title
original_filename
stored_filename
file_path
file_size
mime_type
status
processing_stage
processing_progress
processing_message
page_count
uploaded_at
processed_at
failed_at
failure_reason
checksum
created_at
updated_at
```

---

# 55. NOTE PROCESSING

Notes must go through the same complete processing pipeline:

```text
validation
↓
extraction
↓
OCR
↓
cleaning
↓
chunking
↓
embedding
↓
ChromaDB
↓
note analysis
↓
database persistence
↓
READY
```

Notes must not become selectable before READY.

---

# 56. NOTE PROCESSING STATUS

Implement:

```text
GET /api/notes/{note_id}/processing-status
POST /api/notes/{note_id}/retry-processing
```

Same principles as papers.

---

# 57. NOTE VECTOR ISOLATION

Use a separate ChromaDB collection:

```text
notes_chunks
```

Every note chunk must contain:

```text
note_id
student_id
page_number
chunk_index
```

Retrieval must always filter by:

```text
student_id
+
selected_note_id
```

---

# 58. NOTE AI — STRICT GROUNDING

This requirement is absolute.

When a student selects one note:

The Note AI may use ONLY:

```text
the selected note
```

It must NOT use:

- other notes
- question papers
- historical papers
- database academic knowledge
- general web knowledge
- unrelated Gemini knowledge

If the selected note does not contain the answer:

```text
That information is not available in the selected note.
```

Do not hallucinate.

---

# 59. NOTE AI ENDPOINT

Implement:

```text
POST /api/notes/{note_id}/query
```

Input:

```json
{
  "query": "Explain normalization from this note."
}
```

Return:

- answer
- source chunks
- page numbers
- confidence/evidence
- note ID

---

# 60. NOTE AI FEATURES

Implement backend support for:

### Summarize

Modes:

```text
quick
detailed
exam
```

### Ask Questions

Question answering strictly from note.

### Create Diagram

Generate a structured diagram representation based only on the note.

Do not invent concepts not present in the note.

### Key Concepts

Extract key concepts.

### Important Points

Extract important points.

### Flashcards

Generate flashcards only from selected note.

### Quiz Me

Generate quiz questions only from selected note.

---

# 61. NOTE API

Implement:

```text
GET    /api/notes
GET    /api/notes/{id}
DELETE /api/notes/{id}
GET    /api/notes/{id}/analysis
POST   /api/notes/{id}/query
POST   /api/notes/{id}/summarize
POST   /api/notes/{id}/diagram
POST   /api/notes/{id}/flashcards
POST   /api/notes/{id}/quiz
```

All endpoints require STUDENT role.

Students may access only their own notes.

---

# 62. NOTE ANALYSIS

Store:

- key concepts
- important points
- summary
- detected topics
- detected units
- study insights where appropriate

Do not expose unrelated academic information.

---

# 63. CHUNKING

Implement robust chunking.

Chunks should preserve:

- page number
- section
- question number when applicable
- document ID
- ownership
- semantic context

Avoid arbitrary chunks that split a question incorrectly where possible.

Use overlap where beneficial.

Make chunk configuration environment-controlled.

---

# 64. EMBEDDING SERVICE

Create:

```text
EmbeddingService
```

Responsibilities:

- model loading
- batch embeddings
- normalization
- retries
- metadata
- deterministic configuration

Do not regenerate embeddings unnecessarily.

Use content hashes to support idempotency.

---

# 65. CHROMA PERSISTENCE

Create:

```text
VectorStoreService
```

Responsibilities:

- initialize ChromaDB
- collections
- add documents
- update documents
- delete documents
- similarity search
- metadata filtering
- collection health checks

Implement real persistence.

---

# 66. VECTOR METADATA

Paper vectors must contain:

```text
document_type=paper
paper_id
question_id
academic_scope_id
subject_id
branch_id
semester_id
year
page_number
```

Note vectors must contain:

```text
document_type=note
note_id
student_id
page_number
chunk_index
```

---

# 67. DATABASE + VECTOR CONSISTENCY

Do not mark records READY if:

- database transaction failed
- ChromaDB persistence failed
- embeddings failed
- analysis failed

Implement rollback/cleanup where possible.

If partial vectors exist after failure, retry must safely replace/reconcile them.

---

# 68. TRANSACTION MANAGEMENT

Use proper SQLAlchemy transactions.

Avoid partially committed states.

Critical operations should follow:

```text
process
validate
persist
commit
```

Do not commit half-complete processing as READY.

---

# 69. ERROR HANDLING

Implement centralized error handling.

Return consistent API format:

```json
{
  "success": false,
  "error": {
    "code": "PAPER_PROCESSING_FAILED",
    "message": "Unable to process the uploaded paper."
  }
}
```

Do not expose stack traces to clients.

Log detailed exceptions server-side.

---

# 70. LOGGING

Implement structured logging.

Log:

- request ID
- user ID when available
- route
- duration
- processing stage
- document ID
- AI failures
- vector failures
- DB failures

Never log:

- passwords
- JWT secrets
- API keys
- sensitive raw documents unnecessarily

---

# 71. API RESPONSE STANDARD

Create consistent success/error schemas.

Example:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

Use appropriate HTTP codes.

Examples:

```text
200
201
400
401
403
404
409
422
429
500
```

---

# 72. VALIDATION

Validate all incoming data.

Validate:

- email
- passwords
- enums
- IDs
- pagination
- filtering
- file type
- file size
- metadata
- query lengths
- note ownership
- paper ownership

Never trust frontend validation.

---

# 73. SECURITY

Implement:

- password hashing
- JWT validation
- authorization
- secure file handling
- path traversal protection
- filename sanitization
- MIME validation
- size limits
- SQL injection protection via SQLAlchemy
- safe error messages
- CORS configuration
- rate limiting where practical
- request size limits

Do not expose internal filesystem structure.

---

# 74. CORS

Configure CORS using environment variables.

Example:

```text
FRONTEND_URL=
CORS_ORIGINS=
```

Do not use unrestricted `*` in production.

---

# 75. CONFIGURATION

Create centralized configuration.

Example categories:

```text
APP
DATABASE
JWT
GEMINI
CHROMA
STORAGE
OCR
EMBEDDINGS
PROCESSING
CORS
LOGGING
```

Use environment variables.

Provide:

```text
.env.example
```

with every required variable documented.

Never include real credentials.

---

# 76. RECOMMENDED PROJECT STRUCTURE

Adapt to existing repository if appropriate, but achieve equivalent separation.

Suggested:

```text
backend/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   ├── errors.py
│   ├── logging_config.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── teacher_routes.py
│   │   ├── student_routes.py
│   │   ├── paper_routes.py
│   │   ├── note_routes.py
│   │   ├── rag_routes.py
│   │   ├── chat_routes.py
│   │   └── health_routes.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── branch.py
│   │   ├── semester.py
│   │   ├── academic_scope.py
│   │   ├── paper.py
│   │   ├── paper_question.py
│   │   ├── paper_analysis.py
│   │   ├── repetition.py
│   │   ├── historical_analysis.py
│   │   ├── note.py
│   │   ├── chat.py
│   │   └── ...
│   │
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   │   ├── auth/
│   │   ├── papers/
│   │   ├── notes/
│   │   ├── processing/
│   │   ├── extraction/
│   │   ├── ocr/
│   │   ├── embeddings/
│   │   ├── vectors/
│   │   ├── ai/
│   │   ├── rag/
│   │   └── historical/
│   │
│   ├── prompts/
│   ├── utils/
│   └── middleware/
│
├── migrations/
├── tests/
├── storage/
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── run.py
└── README.md
```

Do not create files merely because they appear in this example.

Every file must have a real purpose and real implementation.

---

# 77. REPOSITORY LAYER

Use repositories where beneficial.

Implement repositories for:

- users
- papers
- questions
- notes
- subjects
- academic scopes
- analyses
- chat
- historical data

Do not put giant database queries directly inside route handlers.

---

# 78. SERVICE LAYER

Business logic belongs in services.

Routes should primarily:

```text
validate request
authorize
call service
return response
```

Do not create 1000-line route files.

---

# 79. PROMPT MANAGEMENT

Store Gemini prompts separately.

Create prompt templates for:

```text
question_extraction
question_classification
topic_detection
difficulty_analysis
paper_analysis
historical_verification
study_intelligence
rag_answer
note_summary
note_qa
note_diagram
note_flashcards
note_quiz
```

Prompts must explicitly define:

- role
- task
- input
- constraints
- output schema
- hallucination rules

---

# 80. FALLBACK PROMPT — SGBAU / RAM MEGHE

The fallback academic prompt must explicitly state that the request concerns:

```text
Sant Gadge Baba Amravati University (SGBAU)
Ram Meghe College
```

It must also receive:

```text
branch
semester
subject
requested year
```

The prompt must instruct Gemini:

- do not fabricate historical papers
- do not claim a question repeated unless provided evidence
- distinguish curriculum knowledge from historical evidence
- clearly state uncertainty
- produce study guidance rather than fake historical statistics

---

# 81. AI HALLUCINATION CONTROL

Every AI service must follow:

```text
Evidence first.
Structured data second.
Historical database third.
LLM fallback only when permitted.
```

AI must never invent:

- historical frequency
- paper existence
- year
- marks
- page number
- source
- repetition count

---

# 82. HISTORICAL EVIDENCE LEVELS

Implement internal evidence levels:

```text
NONE
LOW
MEDIUM
HIGH
```

or an equivalent structured confidence model.

Historical claims must be tied to actual records.

---

# 83. PAGINATION

All list endpoints must support:

```text
page
page_size
```

with safe maximum page size.

Return:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

# 84. FILTERING

Paper Vault filters:

```text
year
subject
branch
semester
college
university
```

Support combinations.

Use indexed database columns.

---

# 85. DATABASE INDEXES

Add appropriate indexes for:

- user email
- paper status
- paper year
- subject
- branch
- semester
- academic scope
- paper checksum
- note student ID
- note status
- question paper ID
- historical scope

Use unique constraints where appropriate.

---

# 86. DATA INTEGRITY

Add foreign keys.

Add cascade rules carefully.

Deleting a paper must clean up:

- questions
- chunks
- analysis
- repetition occurrences
- vector records

Deleting a note must clean up:

- note chunks
- analysis
- vector records

Do not accidentally delete unrelated records.

---

# 87. PAPER DELETION

Teacher must be able to delete papers they own/manage if this feature exists in the current UX.

Deletion must:

1. authorize
2. remove vector records
3. remove dependent DB data
4. remove physical file
5. commit transaction

Handle partial failures safely.

---

# 88. NOTE DELETION

Student can delete their own notes.

Perform complete cleanup.

---

# 89. HEALTH ENDPOINTS

Implement:

```text
GET /api/health
GET /api/health/database
GET /api/health/chroma
GET /api/health/ai
```

Do not expose secrets.

Health endpoints should distinguish:

```text
healthy
degraded
unhealthy
```

where useful.

---

# 90. API DOCUMENTATION

Expose OpenAPI/Swagger documentation.

Document:

- authentication
- request schemas
- response schemas
- errors
- multipart uploads
- processing status
- RAG
- notes
- historical analysis

Every endpoint must be documented.

---

# 91. TESTING

Create real tests.

Minimum categories:

## Authentication

- registration
- duplicate email
- login
- invalid password
- token
- role authorization

## Papers

- upload
- invalid file
- metadata validation
- processing
- READY state
- FAILED state
- retry
- access control

## Extraction

- text PDF
- scanned PDF
- OCR
- malformed document

## Questions

- extraction
- normalization
- marks
- topic
- difficulty

## Historical

- zero papers
- one paper
- two papers
- repeated questions
- four papers
- new paper added
- historical recalculation

## RAG

- grounded answer
- insufficient evidence
- historical frequency
- metadata filtering
- source attribution

## Notes

- upload
- processing
- note-only RAG
- cross-note isolation
- ownership
- summarize
- quiz
- flashcards
- diagram

## Security

- unauthorized paper access
- unauthorized note access
- path traversal
- invalid JWT
- role violations

---

# 92. TEST FIXTURES

Create realistic test fixtures.

Do NOT use fake production responses.

Mocks are acceptable only for external dependencies in unit tests, such as Gemini, OCR, or ChromaDB, provided the actual production implementations exist.

Integration tests should exercise real components where practical.

---

# 93. IDEMPOTENCY

Processing must be safe to retry.

Use:

- checksums
- content hashes
- unique constraints
- deterministic vector IDs
- upsert semantics

Avoid duplicate vectors/questions/analysis after retry.

---

# 94. CONCURRENCY SAFETY

Prevent the same paper from being processed multiple times simultaneously.

Implement processing locks/state checks.

For example:

```text
if paper already PROCESSING:
    reject duplicate processing request
```

Use database-safe mechanisms where appropriate.

---

# 95. PERFORMANCE

Optimize:

- database queries
- pagination
- embeddings batching
- vector retrieval
- Gemini calls
- repeated historical analysis

Do not sacrifice correctness for premature optimization.

Avoid N+1 queries.

Use eager loading/selectinload where appropriate.

---

# 96. AI COST CONTROL

Do not unnecessarily call Gemini multiple times for identical content.

Use deterministic stored analyses.

Do not re-run paper-level analysis unless:

- processing version changes
- explicit reanalysis
- necessary data changed

Historical aggregation should rely primarily on structured data.

---

# 97. VERSIONING

Track:

```text
processing_version
analysis_version
embedding_model
embedding_version
```

This enables future migrations/reprocessing.

---

# 98. PROCESSING AUDIT TRAIL

Create a processing record/history if useful.

Track:

```text
stage
started_at
completed_at
status
message
error
```

This allows debugging failed papers.

---

# 99. NO PREMATURE READY STATE

This is one of the most important rules.

A paper is READY only when:

```text
PDF stored
AND
PDF extracted/OCR'd
AND
questions structured
AND
questions persisted
AND
chunks generated
AND
embeddings generated
AND
ChromaDB persisted
AND
AI analysis persisted
AND
historical analysis updated when applicable
```

Anything less:

```text
NOT READY
```

---

# 100. PAPER PROCESSING PROGRESS

Suggested progress:

```text
VALIDATING          0–10%
EXTRACTING         10–25%
OCR_PROCESSING     25–40%
STRUCTURING        40–55%
EMBEDDING          55–70%
ANALYZING          70–90%
HISTORICAL_UPDATE  90–98%
FINALIZING         98–100%
READY              100%
```

Progress values can be adjusted based on actual work.

Never fake progress.

Progress must correspond to real processing stages.

---

# 101. STUDENT DASHBOARD DATA

Provide APIs capable of powering:

- number of available papers
- recent papers
- subjects
- branches
- semesters
- historical intelligence availability
- recommended study topics
- recent notes

Do not hardcode dashboard statistics.

---

# 102. TEACHER DASHBOARD DATA

Provide APIs capable of powering:

- uploaded papers
- processing states
- successful papers
- failed papers
- recent uploads
- subject distribution
- processing status

All statistics must come from the database.

---

# 103. ANALYTICS

Implement useful analytics services.

Examples:

```text
papers by subject
papers by year
papers by branch
question frequency
topic frequency
marks distribution
difficulty distribution
repetition frequency
```

These must be calculated from real records.

---

# 104. SUBJECT INTELLIGENCE ENDPOINT

Provide a backend endpoint for historical subject intelligence, for example:

```text
GET /api/student/subjects/{subject_id}/intelligence
```

It should return historical analysis only if sufficient papers exist.

Otherwise return an explicit insufficient-history state.

---

# 105. QUESTION SEARCH

Implement structured question search.

Example:

```text
GET /api/student/questions/search?q=normalization
```

Search should support:

- keyword search
- metadata filtering
- semantic search where useful

Results must identify their source paper.

---

# 106. MARKS-BASED QUERIES

RAG/backend must support questions such as:

```text
Show me all 10-mark questions.
```

```text
What topics usually carry 8 marks?
```

```text
Which units have the highest marks?
```

These answers should come from structured DB data whenever possible.

---

# 107. YEAR-BASED QUERIES

Support:

```text
questions from 2023
questions from 2024
questions from 2025
compare 2024 and 2025
```

Use DB filtering.

---

# 108. TOPIC-BASED QUERIES

Support:

```text
questions about normalization
questions on DBMS transactions
questions about operating systems scheduling
```

Use topic metadata + vector retrieval.

---

# 109. RELATED QUESTIONS

Return semantically related questions.

Every result must have source metadata.

---

# 110. SOURCE GROUNDING

Every RAG response should internally retain retrieved evidence.

Recommended structure:

```json
{
  "answer": "...",
  "evidence": [
    {
      "type": "question",
      "paper_id": "...",
      "question_id": "...",
      "page": 4,
      "similarity": 0.89
    }
  ]
}
```

---

# 111. FALLBACK DECISION ENGINE

Create:

```text
RAGDecisionService
```

It determines:

```text
database evidence sufficient?
vector evidence sufficient?
historical evidence available?
fallback allowed?
```

Do not bury this logic inside GeminiService.

---

# 112. AI PROMPT SAFETY

Prompts must explicitly instruct Gemini:

```text
Never invent evidence.
Never invent historical frequency.
Never invent source documents.
Never claim unsupported repetition.
Use only provided context when the task requires grounding.
```

---

# 113. NOTE PROMPT SAFETY

Note prompts must state:

```text
You are answering exclusively from the selected note.
Do not use outside knowledge.
If the answer is absent from the supplied note context, say so.
```

---

# 114. HISTORICAL PROMPT SAFETY

Historical analysis prompts must receive actual historical records.

Gemini may summarize/interpret supplied evidence.

It must not independently invent the historical dataset.

---

# 115. FILE SECURITY

Implement:

- secure random file names
- allowed extensions
- allowed MIME
- file size limit
- PDF signature validation where practical
- directory isolation
- no executable uploads
- no path traversal

---

# 116. CLEANUP

If processing fails:

- preserve failure record
- cleanup temporary files
- cleanup incomplete vectors
- do not mark READY

Provide retry.

---

# 117. TEMPORARY FILE MANAGEMENT

Use temporary directories for:

- OCR intermediate files
- extracted images
- processing artifacts

Clean them after successful/failing processing.

---

# 118. RESOURCE MANAGEMENT

Use context managers for:

- PDF files
- database sessions
- temporary files
- HTTP clients

Do not leak file handles.

---

# 119. ASYNC VS SYNC

Flask may remain synchronous.

Do not introduce complex async infrastructure merely for architecture aesthetics.

The priority is:

```text
correctness
reliability
observability
maintainability
```

---

# 120. FRONTEND CONTRACT

Even though you are building the backend, ensure APIs are designed for the frontend UX.

The frontend requires:

### Teacher

```text
login
dashboard
upload
metadata form
processing screen
paper vault
paper analysis
```

### Student

```text
login
dashboard
paper vault
filters
paper reader
AI intelligence tabs
study intelligence
Ask EduArchive
notes
note reader
note AI
```

Return predictable structured data.

---

# 121. API BLUEPRINT ORGANIZATION

Organize Flask Blueprints logically.

Suggested:

```text
auth_bp
teacher_bp
student_bp
paper_bp
note_bp
rag_bp
chat_bp
health_bp
```

Avoid circular imports.

---

# 122. DEPENDENCY MANAGEMENT

Create a clean:

```text
requirements.txt
```

Pin or constrain versions responsibly.

Include all actual dependencies.

Do not include unused libraries.

Do not include Celery or Redis.

---

# 123. DOCKER

Create production-capable Docker configuration.

Services should include only what is required, such as:

```text
backend
postgres
```

ChromaDB can use persistent local storage unless a separate service is genuinely required.

Do not introduce unnecessary infrastructure.

---

# 124. PERSISTENT STORAGE

Docker volumes must preserve:

- PostgreSQL data
- ChromaDB data
- uploaded PDFs

---

# 125. DATABASE MIGRATIONS

Create Alembic migrations for every model.

Verify:

```text
alembic upgrade head
```

works from a clean database.

---

# 126. SEED DATA

Do NOT insert fake question papers.

If seed data is required, only seed:

- static academic reference data
- subjects/branches/semesters where appropriate

Do not fabricate historical papers.

---

# 127. SAMPLE DEVELOPMENT DATA

If sample PDFs are required for testing, clearly separate them from production data.

Do not silently load them.

---

# 128. ENVIRONMENT

Create:

```text
.env.example
```

including all required variables.

Example:

```text
FLASK_ENV
SECRET_KEY
JWT_SECRET_KEY

DATABASE_URL

GEMINI_API_KEY
GEMINI_MODEL

CHROMA_PERSIST_DIRECTORY

UPLOAD_DIRECTORY
MAX_UPLOAD_SIZE

OCR_ENABLED
TESSERACT_CMD

EMBEDDING_MODEL

CORS_ORIGINS

PAPER_PROCESSING_TIMEOUT
GEMINI_TIMEOUT
```

Document every variable.

---

# 129. README

Create a complete backend README containing:

1. Architecture
2. Prerequisites
3. Python version
4. PostgreSQL setup
5. Virtual environment
6. Installation
7. Environment variables
8. Gemini setup
9. Tesseract setup
10. ChromaDB setup
11. Database migration
12. Startup
13. API documentation
14. Processing pipeline
15. RAG architecture
16. Historical intelligence logic
17. Notes architecture
18. Testing
19. Docker
20. Troubleshooting

Do not document features that do not actually exist.

---

# 130. STARTUP

Provide reliable startup.

Example:

```text
python run.py
```

or equivalent.

Startup must:

- validate configuration
- initialize extensions
- register blueprints
- initialize Chroma
- initialize logging
- expose health endpoint

Do not automatically destroy existing databases.

---

# 131. OBSERVABILITY

At minimum expose:

```text
health
processing status
structured logs
request IDs
failure reasons
```

---

# 132. PROCESSING FAILURE MESSAGES

Failures should be human-readable.

Examples:

```text
PDF could not be read.
OCR failed.
Question extraction failed.
Embedding generation failed.
AI analysis failed.
Historical analysis failed.
```

Do not expose internal stack traces.

---

# 133. API ERROR CODES

Create stable codes such as:

```text
AUTH_INVALID_CREDENTIALS
AUTH_UNAUTHORIZED
AUTH_FORBIDDEN
VALIDATION_ERROR
FILE_INVALID
FILE_TOO_LARGE
PAPER_NOT_FOUND
PAPER_NOT_READY
PAPER_PROCESSING_FAILED
NOTE_NOT_FOUND
NOTE_ACCESS_DENIED
RAG_INSUFFICIENT_EVIDENCE
AI_SERVICE_ERROR
VECTOR_STORE_ERROR
DATABASE_ERROR
```

---

# 134. NO HALLUCINATED ANALYTICS

If there are no papers:

Do not return:

```text
Most repeated question: ...
```

If there is only one paper:

Do not return:

```text
This question appeared 3 times historically.
```

If there are two papers:

Only report repetitions supported by those papers.

---

# 135. HISTORICAL RECOMMENDATION LOGIC

Historical recommendations should be based on:

- repetition
- topic frequency
- marks
- units
- recency
- difficulty
- question types

Do not simply ask Gemini:

> What should the student study?

Provide structured evidence first.

---

# 136. POTENTIAL QUESTION GENERATION

Potential questions must be derived from:

- historical patterns
- important topics
- question structures
- marks patterns

Label them clearly as predictions/potential patterns.

Never state:

```text
This will definitely appear.
```

---

# 137. COLLEGE SCOPE

The application is designed around:

```text
Ram Meghe College
```

and:

```text
Sant Gadge Baba Amravati University
```

The architecture should nevertheless keep university/college configurable in the database.

Do not hardcode all academic data throughout the codebase.

---

# 138. DATA MODEL RELATIONSHIPS

Ensure proper relationships:

```text
User
 ├── Papers
 └── Notes

Paper
 ├── Questions
 ├── Chunks
 ├── Analysis
 └── Historical occurrences

AcademicScope
 ├── Subject
 ├── Branch
 ├── Semester
 ├── College
 └── University

HistoricalAnalysis
 └── AcademicScope

Note
 ├── Chunks
 └── Analysis
```

---

# 139. API VERSIONING

Use:

```text
/api/v1/
```

unless existing repository conventions require otherwise.

Keep the versioning consistent.

---

# 140. FINAL API INVENTORY

Ensure implementation covers at minimum:

## Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Teacher

```text
POST /api/v1/teacher/papers
GET  /api/v1/teacher/papers
GET  /api/v1/teacher/papers/{id}
GET  /api/v1/teacher/papers/{id}/analysis
DELETE /api/v1/teacher/papers/{id}
POST /api/v1/teacher/papers/{id}/retry-processing
```

## Student Paper Vault

```text
GET /api/v1/student/papers
GET /api/v1/student/papers/{id}
GET /api/v1/student/papers/{id}/analysis
GET /api/v1/student/papers/{id}/pdf
GET /api/v1/student/papers/{id}/intelligence
```

## Processing

```text
GET /api/v1/papers/{id}/processing-status
GET /api/v1/notes/{id}/processing-status
```

## Study Intelligence

```text
POST /api/v1/student/study-intelligence
```

## Questions

```text
GET /api/v1/student/questions/search
```

## Historical Intelligence

```text
GET /api/v1/student/subjects/{id}/intelligence
```

## RAG

```text
POST /api/v1/rag/query
```

## Chat

```text
POST /api/v1/chat/sessions
GET  /api/v1/chat/sessions
GET  /api/v1/chat/sessions/{id}
POST /api/v1/chat/sessions/{id}/messages
```

## Notes

```text
POST   /api/v1/notes
GET    /api/v1/notes
GET    /api/v1/notes/{id}
DELETE /api/v1/notes/{id}
GET    /api/v1/notes/{id}/analysis
POST   /api/v1/notes/{id}/query
POST   /api/v1/notes/{id}/summarize
POST   /api/v1/notes/{id}/diagram
POST   /api/v1/notes/{id}/flashcards
POST   /api/v1/notes/{id}/quiz
POST   /api/v1/notes/{id}/retry-processing
```

## Health

```text
GET /api/v1/health
GET /api/v1/health/database
GET /api/v1/health/chroma
GET /api/v1/health/ai
```

Adjust endpoint names if existing frontend contracts require different naming, but preserve equivalent functionality.

---

# 141. IMPLEMENTATION ORDER

Implement in this order:

## Phase 1

Repository audit.

## Phase 2

Configuration and application factory.

## Phase 3

Database models and migrations.

## Phase 4

Authentication and authorization.

## Phase 5

Storage and file handling.

## Phase 6

PDF extraction and OCR.

## Phase 7

Question structuring and normalization.

## Phase 8

Embedding and ChromaDB.

## Phase 9

Gemini integration.

## Phase 10

Paper analysis.

## Phase 11

Historical intelligence.

## Phase 12

RAG.

## Phase 13

Chatbot.

## Phase 14

Student notes.

## Phase 15

Note-only RAG.

## Phase 16

Processing status/retry/recovery.

## Phase 17

Analytics.

## Phase 18

Security hardening.

## Phase 19

Tests.

## Phase 20

Docker/documentation.

## Phase 21

Complete end-to-end audit.

Do not stop after any phase.

---

# 142. DEFINITION OF DONE

The backend is NOT complete until all of these work:

### Authentication

- Teacher registration
- Student registration
- Login
- JWT
- Role authorization

### Teacher

- PDF upload
- Metadata
- Storage
- Processing
- Paper Vault
- Analysis

### Processing

- extraction
- OCR
- structuring
- question extraction
- normalization
- chunking
- embeddings
- ChromaDB
- Gemini
- persistence
- historical update

### Historical

- 0 papers
- 1 paper
- 2+ papers
- repetition detection
- frequency
- topic trends
- unit trends
- marks trends
- difficulty trends
- dynamic recomputation

### Student

- Paper Vault
- filters
- paper reader
- intelligence
- related papers
- Study Intelligence
- Ask EduArchive

### RAG

- metadata filtering
- vector retrieval
- evidence evaluation
- grounded answers
- source attribution
- fallback behavior

### Notes

- upload
- processing
- PDF reader support
- note-only RAG
- summary
- Q&A
- diagrams
- key concepts
- flashcards
- quiz

### Security

- auth
- authorization
- file security
- note isolation
- paper isolation
- input validation

### Infrastructure

- PostgreSQL
- Alembic
- ChromaDB
- Gemini
- environment configuration
- Docker
- health checks
- logging

### Quality

- tests
- documentation
- error handling
- retry
- idempotency
- concurrency protection

---

# 143. FINAL AUDIT — MANDATORY

After implementation, perform a full repository audit.

Search the entire backend for:

```text
TODO
FIXME
pass
NotImplemented
mock
dummy
placeholder
fake
hardcoded
simulate
coming soon
```

Every occurrence must be reviewed.

Required production functionality must not contain placeholders.

Then verify:

- every import
- every route
- every model
- every schema
- every service
- every repository
- every migration
- every environment variable
- every dependency
- every endpoint
- every external integration
- every error handler

---

# 144. END-TO-END TEST

Actually test the complete workflow conceptually and, where environment permits, automatically:

```text
Teacher registers
        ↓
Teacher logs in
        ↓
Teacher uploads PDF + metadata
        ↓
Paper enters VALIDATING
        ↓
Extraction
        ↓
OCR if necessary
        ↓
Question extraction
        ↓
Question normalization
        ↓
Topic/classification
        ↓
Chunking
        ↓
Embeddings
        ↓
ChromaDB
        ↓
Gemini analysis
        ↓
Paper analysis persistence
        ↓
Historical corpus update
        ↓
READY
        ↓
Student logs in
        ↓
Student sees Paper Vault
        ↓
Student filters papers
        ↓
Student opens paper
        ↓
PDF + intelligence
        ↓
Student asks RAG question
        ↓
Database/vector retrieval
        ↓
Grounded answer
```

Then:

```text
Student uploads notes
        ↓
Processing
        ↓
READY
        ↓
Student opens note
        ↓
Note-only AI
        ↓
Question
        ↓
Retrieval ONLY from selected note
        ↓
Grounded answer
```

---

# 145. HISTORICAL END-TO-END TEST

Explicitly test this scenario:

```text
Upload Paper 1
→ no historical repetition

Upload Paper 2
→ historical analysis becomes available

Upload Paper 3
→ analysis includes Papers 1,2,3

Upload Paper 4
→ analysis includes Papers 1,2,3,4

Upload Paper 5
→ analysis automatically includes Papers 1–5
```

Verify:

- repetition groups change correctly
- frequencies change correctly
- topic importance changes
- marks trends change
- recommendations change
- potential patterns change

No stale historical result is allowed.

---

# 146. NOTE ISOLATION TEST

Create:

```text
Student A
Note A
Note B
```

Ask a question about Note A.

Verify retrieval cannot access Note B.

Then create Student B.

Verify Student B cannot access Student A's notes.

This is mandatory.

---

# 147. RAG HALLUCINATION TEST

Ask:

> How many times did X appear historically?

when only one paper exists.

The answer MUST NOT contain a fabricated count.

Ask a question that does not exist in a selected note.

The answer MUST say that the information is unavailable in the selected note.

---

# 148. FINAL DELIVERABLE

When finished, provide a concise implementation report containing:

```text
Backend architecture
Implemented modules
Database models
API endpoints
AI modules
RAG architecture
Historical intelligence
Notes intelligence
Processing pipeline
Security
Tests
Environment variables
Startup command
Docker command
Known limitations
```

Do not claim something is implemented if it is not.

---

# 149. CRITICAL ENGINEERING PRINCIPLE

Do not optimize for number of files.

Optimize for:

```text
correctness
maintainability
security
testability
observability
extensibility
AI grounding
data integrity
```

---

# 150. FINAL COMMAND

Now begin.

First audit the repository.

Then create an implementation plan based on the existing codebase.

Then implement the backend completely.

Do not stop after generating architecture documents.

Do not stop after creating models.

Do not stop after creating routes.

Do not stop after creating skeleton services.

Actually implement every service.

Actually connect every layer.

Actually connect:

```text
Route
→ Schema
→ Service
→ Repository
→ Database
→ AI/Vector services
→ Response
```

Verify that every feature is wired end-to-end.

If existing code conflicts with this specification, refactor it.

If existing code is correct, reuse it.

If functionality is missing, implement it.

If a dependency is unnecessary, remove it.

Do not introduce Celery or Redis.

Do not create an Admin role.

Do not expose unprocessed documents.

Do not fabricate historical intelligence.

Do not allow note RAG to access anything outside the selected note.

Do not allow Gemini to invent database facts.

Do not mark documents READY prematurely.

Do not leave TODOs.

Do not leave placeholders.

Do not leave broken imports.

Do not leave dead routes.

Do not leave unimplemented methods.

Do not leave incomplete migrations.

Do not leave undocumented environment variables.

Do not leave required functionality disconnected.

**EduArchive AI 2.0 backend must be fully functional from authentication through document processing, AI analysis, historical intelligence, RAG, chatbot, notes intelligence, persistence, security, testing, and deployment.**

**Treat this as a production implementation, not a prototype.**