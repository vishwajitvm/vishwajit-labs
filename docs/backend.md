# Backend Services (FastAPI)

The backend layer is written in Python using **FastAPI** to showcase robust system design, SDK integration, and advanced AI techniques (RAG, Agents).

## Core Technologies
- **FastAPI:** High-performance web framework for APIs.
- **Motor:** Non-blocking async driver for MongoDB.
- **Redis-py:** Async cache client.
- **Pydantic v2:** Strong type parsing and settings validation.
- **Google Generative AI SDK:** Gemini orchestration.

## Service Setup
The backend utilizes dependency injection for DB clients, Redis connections, and auth session verification, allowing rapid mock validation and high unit test coverage.\n