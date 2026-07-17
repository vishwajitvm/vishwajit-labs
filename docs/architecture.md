# System Architecture

Vishwajit Labs is built as a high-performance, containerized web platform that feels like an **AI Operating System**.

```
             ┌─────────────────────────┐
             │    Client Web Browser   │
             └────────────┬────────────┘
                          │ (HTTP/WS)
                          ▼
             ┌─────────────────────────┐
             │       Nginx Proxy       │
             └─────┬─────────────┬─────┘
                   │             │
        (Static/SSR)             │ (REST / SSE)
                   ▼             ▼
      ┌────────────────┐     ┌─────────────────┐
      │ Next.js Web App│     │  FastAPI Backend │
      │   (Port 3000)  │     │   (Port 8000)   │
      └────────────────┘     └────────┬────────┘
                                      │
                 ┌────────────────────┴───┬─────────────────────┐
                 ▼                        ▼                     ▼
        ┌────────────────┐       ┌────────────────┐    ┌─────────────────┐
        │  Redis Cache   │       │ MongoDB Atlas  │    │ Gemini AI API   │
        │ (Session/Rate) │       │  (Data Store)  │    │ (Agents & RAG)  │
        └────────────────┘       └────────────────┘    └─────────────────┘
```

## Key Architectural Decisions
1. **Separation of Concerns:** Client rendering, static generation (Next.js SSR/ISR), and Heavy AI / DB query processing (FastAPI) are isolated for modularity.
2. **AI Layer Integration:** System calls to Gemini (RAG, Chat, Summarization) are proxies via FastAPI to hide API tokens, cache prompts, and parse streams.
3. **Caching Layer:** Redis is deployed to cache GitHub contributions, PyPI release information, and AI assistant query vectors, keeping response times low (<50ms).\n