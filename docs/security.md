# Security Design

- **Better Auth:** Secure token handling, anti-XSS cookies, and secure login states.
- **FastAPI Middleware:** CORS origins restricted to matching domains, rate-limiting handlers preventing DDoS.
- **Environment Safety:** Absolute segregation of secrets. No local tokens checked in.\n