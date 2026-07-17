import os

# Define folders
folders = [
    "apps/web",
    "apps/api",
    "packages/ui",
    "packages/types",
    "packages/config",
    "packages/utils",
    "docker",
    "nginx",
    "docs",
    "scripts",
    ".github/workflows",
    "public",
    "assets"
]

# Create directories
for folder in folders:
    os.makedirs(folder, exist_ok=True)
    print(f"Created folder: {folder}")

# Base configurations
env_example = """# General
PORT=3000
NODE_ENV=development

# Backend fastapi
API_URL=http://localhost:8000
SECRET_KEY=super-secret-key-change-in-production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vishwajit_labs
MONGODB_DB_NAME=vishwajit_labs

# Redis Cache
REDIS_URL=redis://localhost:6379/0

# Gemini API (For Vish AI Chat & AI Playground)
GEMINI_API_KEY=your-gemini-api-key

# GitHub API Token (Optional, avoids rate limits)
GITHUB_TOKEN=your-github-personal-access-token

# Better Auth (NextJS Auth)
BETTER_AUTH_SECRET=your-better-auth-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Cloudinary (Image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Emails
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL_TO=vishwajit@vishwajitvm.dev

# Sentry & Posthog
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
"""

docker_compose = """version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/vishwajit_labs
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  mongo_data:
  redis_data:
"""

makefile = """.PHONY: setup dev build docker-up docker-down

setup:
	@echo "Installing monorepo dependencies..."
	npm install
	@echo "Setting up backend virtual environment..."
	python -m venv apps/api/venv
	. apps/api/venv/bin/activate && pip install -r apps/api/requirements.txt

dev:
	@echo "Starting development environment..."
	npx concurrently \\
		"npm run dev --workspace=apps/web" \\
		"cd apps/api && uvicorn main:app --reload --port 8000"

build:
	@echo "Building frontend and backend..."
	npm run build --workspace=apps/web

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down
"""

license_text = """MIT License

Copyright (c) 2026 Vishwajit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

contributing_text = """# Contributing to Vishwajit Labs

Thank you for your interest in contributing to Vishwajit Labs! As an open-source AI platform and engineering portfolio, contributions of all kinds are welcome—whether you are fixing bugs, proposing new features, or improving documentation.

## Development Workflow

1. Fork the repository and create your branch from `main`.
2. Install dependencies using `npm install` at the root.
3. Set up the local backend using Python 3.11+ and create a `.env` file.
4. Keep code format consistent:
   - Frontend: `npm run lint` and Prettier format.
   - Backend: Use Black/Ruff for formatting.
5. Create a pull request detailing the changes and links to issues.
"""

package_json = """{
  "name": "vishwajit-labs-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
"""

nginx_conf = """user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
"""

# Write base files
files = {
    ".env.example": env_example,
    "docker-compose.yml": docker_compose,
    "Makefile": makefile,
    "LICENSE": license_text,
    "CONTRIBUTING.md": contributing_text,
    "package.json": package_json,
    "nginx/nginx.conf": nginx_conf
}

for filepath, content in files.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")
    print(f"Created file: {filepath}")

# Documentation files to write
docs_dict = {}

docs_dict["docs/folder_structure.md"] = """# Folder Structure

This project uses an optimized monorepo architecture separating the Next.js frontend, FastAPI backend, and shared libraries:

```
vishwajit-labs/
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend
│   └── api/                     # FastAPI Backend service
├── packages/
│   ├── ui/                      # Shared styling tokens & components
│   ├── types/                   # TypeScript interfaces (shared types)
│   ├── config/                  # ESLint, Tailwind configs
│   └── utils/                   # General utility modules
├── docker/                      # Production and staging Dockerfiles
├── nginx/                       # Reverse proxy configuration
├── docs/                        # Complete technical documentation
└── scripts/                     # Automated setup and deployment scripts
```
"""

docs_dict["docs/architecture.md"] = """# System Architecture

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
3. **Caching Layer:** Redis is deployed to cache GitHub contributions, PyPI release information, and AI assistant query vectors, keeping response times low (<50ms).
"""

docs_dict["docs/backend.md"] = """# Backend Services (FastAPI)

The backend layer is written in Python using **FastAPI** to showcase robust system design, SDK integration, and advanced AI techniques (RAG, Agents).

## Core Technologies
- **FastAPI:** High-performance web framework for APIs.
- **Motor:** Non-blocking async driver for MongoDB.
- **Redis-py:** Async cache client.
- **Pydantic v2:** Strong type parsing and settings validation.
- **Google Generative AI SDK:** Gemini orchestration.

## Service Setup
The backend utilizes dependency injection for DB clients, Redis connections, and auth session verification, allowing rapid mock validation and high unit test coverage.
"""

docs_dict["docs/frontend.md"] = """# Frontend Client (Next.js 15)

The frontend is a futuristic, terminal-equipped Web application designed to provide recruiters with a fluid, OS-like interface.

## Key Technologies
- **Next.js 15 (App Router):** Provides server-side rendering (SSR) and optimized image processing.
- **TailwindCSS:** Modern CSS framework utilizing glassmorphism and deep dark space styling.
- **Framer Motion & GSAP:** Powers smooth layout morphing, canvas particle nodes, scroll triggers, and terminal text reveals.
- **Three.js (React Three Fiber / Drei):** Renders the interactive 3D hero grid background and floating particle nodes.
- **Lenis:** Smooth scrolling wrapper ensuring uniform scrolling physics across engines.
"""

docs_dict["docs/api.md"] = """# API Documentation

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
- `GET /api/admin/analytics` - Pulls visitor logs, resume download records, and system latency.
"""

docs_dict["docs/deployment.md"] = """# Deployment Strategy

The platform is designed to be fully automated and deployed to cloud infrastructure with minimal manual overhead.

## Deployment Target
- **Frontend (Next.js):** Deployed to **Vercel** for instant Edge rendering, page transitions, and image optimization.
- **Backend (FastAPI):** Deployed to **Railway** or **Render** in a Docker container.
- **Database:** Hosted on **MongoDB Atlas** (Shared Tier).
- **Caching:** Host on **Upstash Redis** or Railway Redis addon.
"""

docs_dict["docs/docker.md"] = """# Docker Implementation

To achieve complete parity between development and production, the entire monorepo is dockerized.

## Images
1. **Dockerfile.web:** Multi-stage build compiling Next.js.
2. **Dockerfile.api:** Installs python dependencies, copies api package, and boots Uvicorn inside a lightweight Alpine/Slim image.

## Compose Setup
- Runs MongoDB, Redis, API, and Web concurrently.
- Nginx maps incoming traffic (`/` to web, `/api` to api).
"""

docs_dict["docs/database.md"] = """# Database & Caching Schemas

The database uses MongoDB for persistency and Redis for transient caching.

## MongoDB Collections
- `users`: Credentials, OAuth profiles, roles (Admin).
- `projects`: Dynamic portfolio projects with metrics and roadmaps.
- `messages`: Submitted contacts.
- `visitors`: Anonymized analytics showing geo-IP, browser, session length.
- `chat_logs`: Conversation histories between visitors and VISH AI.
- `downloads`: Tracks resume downloads (timestamp, source).

## Redis Schema
- `github:stats`: JSON string representing cached Git activity (expires: 6 hours).
- `pypi:stats`: JSON string of library download stats (expires: 12 hours).
- `rate_limit:<ip>`: Incrementing integer for rate limits (expires: 60s).
"""

docs_dict["docs/animations.md"] = """# Animation & Interaction Guidelines

Every movement on the page must feel clean, sleek, and premium—drawing comparisons to Apple, Stripe, or Vercel.

## Guidelines
1. **Interactive Hover:** Card components tilt using Framer Motion or GSAP based on real-time mouse coordinate calculations.
2. **Lenis Scroll:** All page sections transition smoothly. Parallax grids react to viewport offset rates.
3. **SVG Morphing:** Timeline lines draw and connect nodes dynamically as the recruiter scrolls.
4. **Three.js Particles:** Floating vertices represent neural connections in the background, rotating gently and snapping toward the cursor position.
"""

docs_dict["docs/performance.md"] = """# Performance Optimization

Targeting 100/100 Lighthouse performance metrics via:
- Dynamic imports for complex Three.js models.
- Image optimization via NextJS Image component.
- API response caching via Redis.
- CSS/JS minification and code-splitting.
"""

docs_dict["docs/seo.md"] = """# Search Engine Optimization (SEO)

- **Semantic HTML:** Strict usage of header tags (`h1`, `h2`, `h3`), article blocks, and nav wrappers.
- **Meta-tags:** Dynamic Open Graph (OG) tags generated on-the-fly for project landing pages.
- **Sitemaps:** Automatically generated `sitemap.xml` listing dynamic routes.
"""

docs_dict["docs/security.md"] = """# Security Design

- **Better Auth:** Secure token handling, anti-XSS cookies, and secure login states.
- **FastAPI Middleware:** CORS origins restricted to matching domains, rate-limiting handlers preventing DDoS.
- **Environment Safety:** Absolute segregation of secrets. No local tokens checked in.
"""

docs_dict["docs/authentication.md"] = """# Authentication Flow

Uses **Better Auth** linked with OAuth2 providers (Google & GitHub) for admin verification.
A mock developer login is compiled for local testing to allow immediate access to the dashboard.
"""

docs_dict["docs/roadmap.md"] = """# Product Roadmap

- **Q3 2026:** Launch core site and custom RAG VISH AI.
- **Q4 2026:** Publish custom MCP (Model Context Protocol) server templates.
- **Q1 2027:** Roll out SaaS project live previews and interactive terminal simulations.
"""

docs_dict["docs/future_features.md"] = """# Future Features

- Custom CLI (`pip install vishwajit-labs`) tool matching the website terminal.
- Advanced SDK architecture showcases.
- Dedicated blog database utilizing markdown parsing.
"""

docs_dict["docs/developer_guide.md"] = """# Developer Guide

## System Setup
1. Clone repo: `git clone https://github.com/vishwajitvm/vishwajit-labs.git`
2. Install npm modules: `npm install`
3. Spin up docker container components: `make docker-up`
4. Write code, trigger tests, and push.
"""

docs_dict["docs/testing.md"] = """# Testing Suite

- **Frontend:** Playwright validation for core interactivity and Terminal input commands.
- **Backend:** `pytest` validating FastAPIs endpoints, Mongo mocks, and Gemini responses.
"""

docs_dict["docs/cicd.md"] = """# CI/CD Workflows

GitHub Actions will execute:
1. **Linter:** ESLint, Black, and Ruff check formatting on push.
2. **Builder:** Next.js compile check.
3. **Tester:** Automated pytest suite validation.
4. **Deployer:** Railway and Vercel triggers matching main branch merges.
"""

docs_dict["docs/admin_panel.md"] = """# Admin Panel Features

Protected administrative UI (`/admin`) for:
- Viewing real-time visitor analytics.
- Reviewing contact and newsletter messages.
- Replying directly to messages via email.
- Inspecting Gemini API token usage and latency logs.
"""

docs_dict["docs/mongodb.md"] = """# MongoDB Configuration

Using dynamic indices for tracking fast collections (e.g., `visitors` indexing `visited_at` and `session_id`). Connects via Motor client.
"""

docs_dict["docs/github_integration.md"] = """# GitHub API Integration

Uses GitHub's GraphQL API to extract star history, commit density, and repo language percentages. Cached inside Redis to prevent rate limits.
"""

docs_dict["docs/vercel_deployment.md"] = """# Vercel Deployment

Configured with Next.js environment bindings, automatic branch preview builds, and edge routes.
"""

docs_dict["docs/railway_deployment.md"] = """# Railway Deployment

Automated Dockerfile detection, environment injection, and Redis addon orchestration.
"""

docs_dict["docs/env_variables.md"] = """# Environment Variables Reference

See `.env.example` for details on env configurations.
"""

docs_dict["docs/troubleshooting.md"] = """# Troubleshooting Guide

- **Redis connection error:** Ensure Redis service is running locally (`docker-compose up redis`).
- **Gemini API Key missing:** Ensure the `GEMINI_API_KEY` is present in local environment variables.
"""

for filepath, content in docs_dict.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")
    print(f"Created doc file: {filepath}")

# Create root README.md
readme_content = """# Vishwajit Labs: AI OS Portfolio Platform

Welcome to **Vishwajit Labs** (vishwajit-labs) — a premium, AI-focused engineering portfolio platform. The site functions as a virtual "AI Operating System", highlighting capabilities in Python backend engineering, AI system design, developer SDKs, and platform architecture.

## Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS, Framer Motion, GSAP, Three.js
- **Backend:** FastAPI (Python), Motor (MongoDB Client)
- **Caching:** Redis
- **Database:** MongoDB
- **AI Core:** Gemini Generative AI (RAG, Agent system)
- **Deployment:** Vercel & Railway/Render

## Folder Structure
For a detailed layout, check [Folder Structure](file:///docs/folder_structure.md).

## Getting Started
To boot the full stack locally:
```bash
make setup
make dev
```
To run via Docker:
```bash
make docker-up
```

## System Documentation
All docs are detailed in the `docs/` folder:
- [System Architecture](file:///docs/architecture.md)
- [Backend Services](file:///docs/backend.md)
- [Frontend Client](file:///docs/frontend.md)
- [API Documentation](file:///docs/api.md)
- [Deployment Strategy](file:///docs/deployment.md)
- [Docker Configuration](file:///docs/docker.md)
"""

with open("README.md", "w", encoding="utf-8") as f:
    f.write(readme_content.strip() + "\\n")
print("Created README.md")

print("Monorepo files and documentation initialized successfully!")
