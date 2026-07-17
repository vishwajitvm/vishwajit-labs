# API Documentation

The FastAPI backend exposes endpoints structured for AI integration, contact notifications, open-source telemetry, and visitor tracking.

## Core Endpoints

### 1. AI Assistant
- `POST /api/chat`
  - Request: `{ "message": "What projects use RAG?" }`
  - Response: Server-Sent Events (SSE) stream returning Gemini response chunks referencing knowledge bases.

### 2. AI Playground
- `POST /api/playground/rag` - Executes custom Mini RAG query.
- `POST /api/playground/summarize` - Summarizes code / logs.
- `POST /api/playground/review` - Provides detailed code review.

### 3. Open Source Telemetry
- `GET /api/github/stats` - Fetchescached contribution graphs, stars, commits.
- `GET /api/pypi/stats` - Fetches download logs for custom Python packages.

### 4. Admin & Messages
- `POST /api/contact` - Receives messages and stores to MongoDB collection `messages`.
- `GET /api/admin/analytics` - Pulls visitor logs, resume download records, and system latency.\n