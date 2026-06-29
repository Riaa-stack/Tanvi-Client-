# AI Academic Intelligence Platform (AAIP)

AAIP is a next-generation academic intelligence platform that allows universities and students to extract deep insights from previous year question papers using semantic search and AI models.

## Architecture

This is a full-stack monorepo consisting of:
- **Frontend**: React 19 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Python 3.11 + Flask + SQLAlchemy + openrouter.ai (Gemini/Claude/GPT)
- **Database**: PostgreSQL (Relational) + ChromaDB (Vector) + Redis (Queueing/Caching)

## Production Deployment (Docker Compose)

The easiest way to run the entire stack in production (or locally for testing) is using Docker Compose.

### Prerequisites
- Docker Engine and Docker Compose installed.

### Setup Instructions

1. **Configure Environment Variables**
   Navigate to the `backend` folder and create a `.env` file based on the template:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Open `backend/.env` and fill in your actual keys, especially your `OPENROUTER_API_KEY`.

2. **Run Docker Compose**
   From the root of this project (where this README is located), run:
   ```bash
   docker-compose up --build -d
   ```

   This single command will:
   - Start the **PostgreSQL** database and wait for it to be healthy.
   - Start the **Redis** server.
   - Start **ChromaDB**.
   - Build and start the **Flask API** (running on port 5000), which will automatically run database migrations on startup.
   - Build the **React Frontend** using Vite, and serve the static files via an Alpine **Nginx** server (running on port 80). Nginx is also configured to proxy `/api` requests to the Flask backend.

3. **Access the Application**
   - Frontend UI: `http://localhost`
   - Backend API: `http://localhost:5000/api`

### Managing the Containers

- View logs for all services:
  ```bash
  docker-compose logs -f
  ```
- View logs for a specific service (e.g., backend):
  ```bash
  docker-compose logs -f backend
  ```
- Stop the application:
  ```bash
  docker-compose down
  ```
- Stop and wipe all data volumes (DB, Vectors, Uploads):
  ```bash
  docker-compose down -v
  ```

## Local Development (Without Docker)

If you prefer to run the development servers directly on your host machine for active coding:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
flask db upgrade
python run.py
```

### Frontend
```bash
cd aaip-frontend
npm install
npm run dev
```

*Note: For local development without Docker, you will still need to have PostgreSQL, Redis, and ChromaDB running natively or via separate Docker commands.*
