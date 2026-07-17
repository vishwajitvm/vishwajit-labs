# CI/CD Workflows

GitHub Actions will execute:
1. **Linter:** ESLint, Black, and Ruff check formatting on push.
2. **Builder:** Next.js compile check.
3. **Tester:** Automated pytest suite validation.
4. **Deployer:** Railway and Vercel triggers matching main branch merges.\n