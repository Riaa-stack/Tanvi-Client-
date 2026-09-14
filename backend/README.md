# EduArchive AI 2.0 — Production Backend

EduArchive AI 2.0 is an enterprise-grade academic intelligence backend built with Flask, SQLAlchemy 2.x, Alembic, PostgreSQL, ChromaDB, Google Gemini, and Sentence Transformers. It provides structured question-paper ingestion, deterministic and OCR document processing, question classification, vector-grounded RAG search, multi-year historical trend intelligence, and strictly note-isolated student study tools.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Flask REST API Layer                          │
│  /auth  •  /teacher  •  /student  •  /notes  •  /rag  •  /chat  •  /health
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                             Service Layer                              │
│  AuthService   • PaperProcessingService • PaperAnalysisService         │
│  NoteAIService • HistoricalService      • RAGService • GeminiService   │
└──────────┬────────────────────────┬──────────────────────┬─────────────┘
           │                        │                      │
┌──────────┴──────────┐  ┌──────────┴──────────┐  ┌────────┴─────────────┐
│    PostgreSQL DB    │  │  ChromaDB Vectors   │  │   Google Gemini API  │
│  17 Relational DDL  │  │  3 Isolated Stores  │  │   JSON-Structured    │
│  Tables & Audits    │  │  Chunks & Questions │  │   Grounded Reasoning │
└─────────────────────┘  └─────────────────────┘  └──────────────────────┘
```

---

## Key Features

1. **Teacher Question Paper Management**:
   - Secure PDF upload with magic byte inspection and SHA-256 deduplication.
   - Asynchronous 7-stage processing pipeline: `VALIDATING` → `EXTRACTING` → `OCR_PROCESSING` → `STRUCTURING` → `EMBEDDING` → `ANALYZING` → `HISTORICAL_UPDATE` → `READY`.
   - Teacher dashboard with real-time paper status and statistics.

2. **Student Paper Intelligence**:
   - Discover and search across processed question papers filtered by year, branch, semester, and subject.
   - Advanced full-text and metadata question search across papers.
   - AI paper analysis covering topic frequencies, difficulty breakdowns, marks distribution, and revision suggestions.

3. **Multi-Year Historical Intelligence**:
   - Scoped academic aggregation (`University + College + Branch + Semester + Subject`).
   - Vector similarity question repetition clustering across exam years.
   - Evidence-level classification (`NONE`, `LOW`, `MEDIUM`, `HIGH`) with curriculum-based fallback when insufficient papers exist.

4. **Isolated Note Intelligence**:
   - Student note upload and background vectorization.
   - **Strict Grounding Guarantee**: Note Q&A, summaries (quick, detailed, exam), key concept extraction, diagram node/edge generation, flashcards, and quizzes use *exclusively* the selected note content.

5. **Grounded RAG Pipeline**:
   - Dual retrieval: Document chunks + structured question vectors with cosine similarity.
   - Evidence sufficiency evaluation preventing hallucinations.
   - Full citation attribution in AI answers.

---

## Quickstart & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 14+ (or Docker)
- Tesseract OCR (Optional, required for scanned PDFs)

### 1. Clone & Environment Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and Gemini API Key:
# DATABASE_URL=postgresql://eduarchive:password@localhost:5432/eduarchive_db
# GEMINI_API_KEY=your-gemini-api-key
```

### 3. Database Migration & Seeding
```bash
# Run database migrations
alembic upgrade head

# Seed initial curriculum and test users
flask seed

# (Optional) Verify system health diagnostics
flask verify-system
```

### 4. Run Development Server
```bash
python run.py
# Server starts at http://localhost:5000
```

---

## Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| **Teacher** | `teacher@eduarchive.ai` | `TeacherPassword123!` |
| **Student** | `student@eduarchive.ai` | `StudentPassword123!` |

---

## API Endpoints Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login` | Authenticate & receive JWT tokens | Public |
| `POST` | `/refresh` | Refresh access token | Refresh JWT |
| `POST` | `/logout` | Revoke active access token | Bearer JWT |
| `GET` | `/me` | Get current authenticated user profile | Bearer JWT |

### Teacher Paper Ingestion (`/api/v1/teacher`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/papers` | Upload and process paper PDF | Teacher |
| `GET` | `/papers` | List teacher's uploaded papers | Teacher |
| `GET` | `/papers/<id>` | Get paper details | Teacher |
| `GET` | `/papers/<id>/analysis` | Get AI analysis for paper | Teacher |
| `DELETE` | `/papers/<id>` | Delete paper & remove vectors | Teacher |
| `POST` | `/papers/<id>/retry-processing` | Retry failed processing | Teacher |
| `GET` | `/dashboard` | Teacher dashboard statistics | Teacher |

### Student Discovery & Intelligence (`/api/v1/student`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/papers` | List ready question papers | Student |
| `GET` | `/papers/<id>` | Get paper with questions | Student |
| `GET` | `/papers/<id>/status` | Poll paper processing state | Student |
| `GET` | `/papers/<id>/analysis` | Get AI analysis for paper | Student |
| `GET` | `/papers/<id>/questions` | Filter extracted questions | Student |
| `GET` | `/papers/<id>/study-guide` | Get grounded study guide | Student |
| `GET` | `/subjects` | List academic subjects | Student |
| `GET` | `/historical/<academic_scope_id>` | Historical multi-year trends | Student |
| `GET` | `/questions/search` | Search questions across corpus | Student |

### Note Intelligence (`/api/v1/notes`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Upload student note PDF | Student |
| `GET` | `/` | List student's notes | Student |
| `GET` | `/<id>` | Get note details | Student |
| `DELETE` | `/<id>` | Delete note and vector chunks | Student |
| `GET` | `/<id>/status` | Poll note processing state | Student |
| `GET` | `/<id>/analysis` | Get stored note analysis | Student |
| `POST` | `/<id>/query` | Ask question *strictly* from note | Student |
| `POST` | `/<id>/summary` | Summarize note (quick/detailed/exam) | Student |
| `GET` | `/<id>/key-concepts` | Extract key definitions & concepts | Student |
| `GET` | `/<id>/important-points` | Extract key exam points | Student |
| `GET` | `/<id>/diagram` | Generate concept diagram nodes/edges | Student |
| `GET` | `/<id>/flashcards` | Generate revision flashcards | Student |
| `GET` | `/<id>/quiz` | Generate self-assessment quiz | Student |

### RAG & Chat (`/api/v1/rag`, `/api/v1/chat`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/rag/query` | Direct vector RAG query | Authenticated |
| `POST` | `/chat/sessions` | Create conversational chat session | Authenticated |
| `GET` | `/chat/sessions` | List user's chat sessions | Authenticated |
| `GET` | `/chat/sessions/<id>` | Get session history | Authenticated |
| `POST` | `/chat/sessions/<id>/messages` | Send message with RAG grounding | Authenticated |
| `POST` | `/chat/ask` | One-shot grounded QA | Authenticated |

### Health & Diagnostics (`/api/v1/health`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Liveness health check | Public |
| `GET` | `/detailed` | Diagnostics for DB, ChromaDB, Gemini, Embeddings | Public |

---

## Running the Automated Test Suite

```bash
pytest
```
Test suite includes tests for:
- Authentication & JWT token revocation
- Teacher uploads & RBAC validation
- Student discovery & READY status guarantees
- Note-only QA isolation and prompt constraints
- RAG retrieval, citations, and fallback logic
- Historical topic & unit aggregation
- Document cleaning & regex question extraction
- System health checks

---

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Check service logs
docker-compose logs -f backend
```
