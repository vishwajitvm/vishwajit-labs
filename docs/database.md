# Database & Caching Schemas

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
- `rate_limit:<ip>`: Incrementing integer for rate limits (expires: 60s).\n