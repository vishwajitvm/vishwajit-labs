# Folder Structure

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
```\n