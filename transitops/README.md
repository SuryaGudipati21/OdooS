# TransitOps — Smart Transport Operations Platform

Hackathon build. See `TransitOps_Complete_Roadmap.md` (shared separately) for the
full hour-by-hour plan, file ownership, and tool stack.

## Setup

### Backend
```
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
docker compose up -d       # starts Postgres
alembic upgrade head       # once migrations exist
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

### Frontend
```
cd frontend
npm install
npm run dev
```

## Team Notes
- Each person's status update goes below, keep it short.

### Dev A — Backend Core
(update here)

### Dev B — Trip Engine
(update here)

### Dev C — Frontend Core
(update here)

### Dev D — Dashboard / Reports / DevOps
(update here)
