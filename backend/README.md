# AI Academic Intelligence Platform (AAIP) — Backend

Production-grade Flask + Celery backend for the AAIP platform. This system ingests university previous-year question papers, extracts text via OCR, and uses LLMs to classify, map, and predict questions.

## Architecture

- **Web Framework**: Flask (App Factory Pattern)
- **Database**: PostgreSQL (SQLAlchemy ORM, Alembic Migrations)
- **Task Queue**: Celery (Redis Broker & Backend)
- **Vector DB**: ChromaDB (Running on `localhost:8000`)
- **LLM/AI**: LangChain + OpenRouter (`anthropic/claude-3-haiku` & `mistralai/mistral-7b-instruct`)
- **Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`)

## Features

- JWT Authentication & RBAC (Admin vs Student)
- Rate Limiting via Redis
- Asynchronous Paper Processing Pipeline:
  1. File Ingestion & Validation
  2. OCR & Text Extraction (pdfplumber / PyMuPDF + Tesseract)
  3. Question Extraction (LLM)
  4. Topic Classification & Syllabus Mapping (LLM + Fuzzy Match)
  5. Vector Embedding (ChromaDB + PostgreSQL)
  6. Difficulty Analysis (LLM)
  7. Trend Aggregation
  8. Unsupervised Clustering (K-Means)
- Analytics (Unit weightage, prediction scores, topic trends)
- Semantic Search & RAG Chatbot

## Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL
- Redis
- ChromaDB Server
- Tesseract OCR (`sudo apt install tesseract-ocr` or Windows equivalent)

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start ChromaDB locally
chroma run --path ./chroma_data --host localhost --port 8000
```

### 2. Configuration

Copy `.env.example` to `.env` and fill in the values:

```env
FLASK_ENV=development
SECRET_KEY=super-secret-key
JWT_SECRET_KEY=super-secret-jwt-key
DATABASE_URL=postgresql://user:pass@localhost:5432/aaip
REDIS_HOST=localhost
REDIS_PORT=6379
OPENROUTER_API_KEY=your_key_here
```

### 3. Database Initialization

```bash
# Create migration repository if not exists (already done via phase 3)
flask db init 

# Generate migration and apply to DB
flask db migrate -m "Initial schema"
flask db upgrade
```

### 4. Running the Services

You need three terminal windows to run the complete stack:

**Terminal 1: Flask API Server**
```bash
python wsgi.py
# Server runs on http://localhost:5000
```

**Terminal 2: Celery Worker**
```bash
# macOS/Linux
celery -A celery_worker.celery worker --loglevel=info -Q paper_processing,analytics,embeddings,predictions

# Windows (Use gevent pool)
pip install gevent
celery -A celery_worker.celery worker --loglevel=info --pool=gevent -Q paper_processing,analytics,embeddings,predictions
```

**Terminal 3: ChromaDB Server**
```bash
chroma run --path ./chroma_data --host localhost --port 8000
```

## Directory Structure

```text
app/
├── agents/       # AI Pipeline agents (Ingestion, OCR, LLM classification)
├── ai/           # LLM clients, Embeddings, Prompts, RAG engine
├── api/          # Blueprints and route definitions (Auth, Papers, Chat, etc.)
├── middlewares/  # Rate limiting, JWT blocklist
├── models/       # SQLAlchemy ORM models
├── repositories/ # Database access layer
├── services/     # Business logic orchestration
├── tasks/        # Celery background tasks
├── utils/        # Error handlers, JSON wrappers
```

## Project Status

All 12 phases of the implementation plan have been completed. The backend is ready for API consumption.
