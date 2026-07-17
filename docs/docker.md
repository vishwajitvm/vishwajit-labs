# Docker Implementation

To achieve complete parity between development and production, the entire monorepo is dockerized.

## Images
1. **Dockerfile.web:** Multi-stage build compiling Next.js.
2. **Dockerfile.api:** Installs python dependencies, copies api package, and boots Uvicorn inside a lightweight Alpine/Slim image.

## Compose Setup
- Runs MongoDB, Redis, API, and Web concurrently.
- Nginx maps incoming traffic (`/` to web, `/api` to api).\n