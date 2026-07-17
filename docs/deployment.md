# Deployment Strategy

The platform is designed to be fully automated and deployed to cloud infrastructure with minimal manual overhead.

## Deployment Target
- **Frontend (Next.js):** Deployed to **Vercel** for instant Edge rendering, page transitions, and image optimization.
- **Backend (FastAPI):** Deployed to **Railway** or **Render** in a Docker container.
- **Database:** Hosted on **MongoDB Atlas** (Shared Tier).
- **Caching:** Host on **Upstash Redis** or Railway Redis addon.\n