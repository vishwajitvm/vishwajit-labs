// Projects shown on the portfolio. Descriptions follow the LinkedIn Projects section.
export type Kind = 'product' | 'client';
export interface Work {
  id: string;
  name: string;
  tagline: string;
  kind: Kind;
  org: string;
  when?: string;
  emoji: string;
  color: string;
  summary: string;
  bullets: string[];
  stack: string[];
  stats?: string[];
  links: { live?: string; code?: string; pypi?: string };
  featured?: boolean;
}

export const WORK: Work[] = [
  {
    id: 'devflow-ai', name: 'DevFlow-AI', tagline: 'AI code review, auto-fix & CI/CD', kind: 'product', org: 'My product', emoji: '🤖', color: '#FFE07A', featured: true,
    summary: 'A self-hosted AI code review, auto-fix and CI/CD platform for GitHub and GitLab — the AI never changes a repository without permission.',
    bullets: [
      '132 API endpoints, 31 database tables, 30 Celery background tasks and 17 Docker services.',
      'A framework-free tool-calling agent loop for 9 roles (analyst, fixer, code reviewer, security reviewer…) with JSON-schema-validated output, token budgets and AST checks.',
      'An LLM router across 90 free models from 10 providers, with cool-downs on rate limits and a local Ollama fallback.',
      'An MCP gateway: every GitHub / GitLab write goes through 57 allow-listed tools, one-time keys and a deny-by-default go / ask / stop rules engine.',
      'Reviews run in no-network, read-only Docker sandboxes; OpenTelemetry tracing into Grafana with dashboards and alerts as code.',
      '392 unit tests, 67 API end-to-end tests and 43 Playwright tests in GitHub Actions and GitLab CI.',
    ],
    stack: ['Python', 'FastAPI', 'Celery', 'PostgreSQL', 'Redis', 'MCP', 'Ollama', 'Next.js', 'Docker', 'OpenTelemetry', 'Grafana'],
    stats: ['132 endpoints', '9 agent roles', '502 tests'],
    links: { code: 'https://github.com/vishwajitvm/DevFlow-AI' },
  },
  {
    id: 'eu-vat-platform', name: 'EU VAT Registration Platform', tagline: 'Sole backend developer · live in production', kind: 'client', org: 'SPNX', when: 'Oct 2026 – now', emoji: '💶', color: '#B9A6FF', featured: true,
    summary: 'A staff workspace and client portal that runs EU VAT registrations for overseas businesses. I’m the sole backend developer.',
    bullets: [
      '244 REST endpoints across 34 NestJS modules and 63 database models (PostgreSQL 17 + Prisma 7).',
      'A data-driven workflow engine that runs each country’s registration process as versioned data — the same rules decide which actions each user can take.',
      'Microsoft Entra ID (OIDC) sign-in, Postgres-backed sessions with CSRF protection, and role-based access with 4 roles and 21 permissions.',
      'Azure Blob Storage, Azure Key Vault (AES-256-GCM), virus scanning, Microsoft Graph email and Adobe Acrobat Sign — each behind a clean adapter.',
      'A background worker on a Postgres transactional outbox running 15 scheduled jobs, plus an append-only audit log, optimistic locking, idempotency keys and RFC 9457 errors.',
      'Passed 3 rounds of external security testing (VAPT); 63 Jest test files and a 24-suite end-to-end API harness.',
    ],
    stack: ['NestJS', 'PostgreSQL', 'Prisma', 'Microsoft Entra ID', 'Azure', 'Jest'],
    stats: ['244 endpoints', '3/3 VAPT passed', '15 scheduled jobs'],
    links: { live: 'https://fsvat.spnx.ai/' },
  },
  {
    id: 'hopline', name: 'Hopline', tagline: 'Encrypted peer-to-peer file transfer', kind: 'product', org: 'My product', emoji: '📡', color: '#9FD0FF', featured: true,
    summary: 'Send files directly between devices — browser, desktop (Windows, macOS, Linux) and command line — encrypted end to end.',
    bullets: [
      'A Node.js WebSocket signaling server and a WebRTC protocol sending 64 KiB frames over up to 4 parallel connections, with flow control, SHA-256 verification and resume.',
      'Encrypted TCP transfer for the CLI and desktop app (CPace PAKE, HKDF, AES-256-GCM): 10 GiB sent in 56.8 seconds.',
      'An Electron desktop app and a React 19 + Vite web app.',
      'Signaling server and TURN relay hardened with rate limits and brute-force throttling.',
      '90 automated tests, 4 rounds of security testing with every finding fixed, and installers for 3 operating systems.',
    ],
    stack: ['Node.js', 'WebSockets', 'React', 'Vite', 'Electron', 'AES-256', 'Docker', 'GitHub Actions'],
    stats: ['10 GiB in 56.8s', '3 platforms', '90 tests'],
    links: { live: 'https://hopline.onrender.com', code: 'https://github.com/vishwajitvm/Hopline' },
  },
  {
    id: 'tallyko', name: 'Tallyko', tagline: 'Multi-tenant restaurant & retail POS', kind: 'product', org: 'My product', emoji: '🧾', color: '#9FE8C8', featured: true,
    summary: 'A point-of-sale platform that lets many restaurants and stores run billing, inventory and kitchen orders from one shared system.',
    bullets: [
      'A multi-tenant FastAPI backend supporting shared and dedicated-database tenancy, with Redis-cached tenant resolution.',
      'JWT authentication, Redis sliding-window rate limiting and a structured global exception layer.',
      'An offline-first mobile client (React Native + WatermelonDB) for billing, inventory, kitchen display and CRM.',
    ],
    stack: ['FastAPI', 'PostgreSQL', 'Redis', 'React Native'],
    stats: ['multi-tenant', 'offline-first', '400+ tests'],
    links: { code: 'https://github.com/vishwajitvm/Tallyko' },
  },
  {
    id: 'tracenest', name: 'TraceNest', tagline: 'Python logging SDK on PyPI', kind: 'product', org: 'My product', emoji: '🪺', color: '#FFB59A', featured: true,
    summary: 'A zero-dependency, thread-safe logging library for Python / FastAPI apps — rotation, retention and automatic secret masking.',
    bullets: [
      'Day-wise rotation, retention enforcement and background buffered flushing.',
      'A secret-redaction engine that recursively masks credentials, tokens and database URLs in strings, dicts and nested structures.',
      'Published on PyPI for other developers to use.',
    ],
    stack: ['Python', 'FastAPI'],
    stats: ['on PyPI', '0 dependencies', 'thread-safe'],
    links: { pypi: 'https://pypi.org/project/tracenest/', code: 'https://github.com/vishwajitvm/TraceNest' },
  },
  {
    id: 'repomind', name: 'RepoMind', tagline: 'Ask any repo, get cited answers', kind: 'product', org: 'My product', emoji: '🧠', color: '#FF8FB1',
    summary: 'An assistant that answers questions about any GitHub repository and cites the exact file and line it used.',
    bullets: [
      'A LangGraph workflow behind a FastAPI API combining vector search with live GitHub API lookups.',
      'AST-based code chunking, so search works on whole functions and classes.',
      'Qdrant vector search, LLM fallback across 9 providers with local Ollama, a React UI and LangSmith tracing.',
    ],
    stack: ['Python', 'FastAPI', 'LangGraph', 'Qdrant', 'React', 'Ollama'],
    stats: ['AST chunking', '9 LLM providers', 'file:line citations'],
    links: { code: 'https://github.com/vishwajitvm/RepoMind' },
  },
  {
    id: 'agenthive', name: 'AgentHive', tagline: 'Multi-agent orchestration platform', kind: 'product', org: 'My product', emoji: '🐝', color: '#FFE07A',
    summary: 'A platform for building AI agents that reason step by step, choose tools and carry out multi-step tasks on their own.',
    bullets: [
      'A ReAct-style agent loop with step-by-step reasoning, tool calls and full run / step / tool-call audit logs.',
      'A database-configurable LLM router (Gemini, Ollama, OpenAI, Groq, Hugging Face) with per-policy retry and fallback.',
      'A tool system (file I/O, PDF parsing, web search, object storage, code execution, transcripts) with per-agent allow-lists.',
    ],
    stack: ['FastAPI', 'PostgreSQL', 'pgvector', 'Celery', 'Redis', 'Docker'],
    stats: ['ReAct agents', '5 LLM providers', 'tool allow-lists'],
    links: { code: 'https://github.com/vishwajitvm/AgentHive' },
  },
  {
    id: 'smart-hr-bot', name: 'SmartHR', tagline: 'AI interview platform', kind: 'client', org: 'Bee Logical', emoji: '🎙️', color: '#9FD0FF',
    summary: 'An AI system that conducts and scores first-round candidate interviews automatically, cutting manual screening work.',
    bullets: [
      'An end-to-end AI interview pipeline: LangChain for orchestration, LangGraph for stateful multi-turn conversations.',
      'RAG pipelines over job descriptions and role requirements to generate role-specific questions.',
      'Agent-based evaluation that scores answers against criteria and writes structured interview reports.',
    ],
    stack: ['Python', 'FastAPI', 'LangChain', 'LangGraph', 'Gemini', 'MongoDB'],
    links: {},
  },
  {
    id: 'tenantmind-ai', name: 'TenantMind-AI', tagline: 'Multi-tenant AI property management', kind: 'product', org: 'My product', emoji: '🏢', color: '#B9A6FF',
    summary: 'Property-management teams query lease documents in plain language and automate tenant workflows — each organisation’s data kept isolated.',
    bullets: [
      'A multi-tenant FastAPI backend with Keycloak OpenID Connect and per-tenant request context.',
      'A multi-provider LLM gateway (Gemini, Groq, OpenRouter, Ollama) logging latency and token usage per call.',
      'A RAG endpoint over per-tenant Qdrant collections for lease-document grounding.',
    ],
    stack: ['FastAPI', 'MongoDB', 'Keycloak', 'Qdrant', 'Celery'],
    links: { code: 'https://github.com/vishwajitvm/TenantMind-AI' },
  },
  {
    id: 'policybot', name: 'PolicyBot', tagline: 'RAG Q&A over internal documents', kind: 'product', org: 'My product', emoji: '📚', color: '#9FE8C8',
    summary: 'Answers natural-language questions about internal documents by retrieving the right passages and citing sources.',
    bullets: [
      'An end-to-end RAG pipeline: vector + keyword retrieval, candidate merging, freshness-aware resolution, citations and confidence scoring.',
      'Per-query execution tracing, persisting every pipeline stage to MongoDB for debugging and evaluation.',
      'A pluggable vector-store interface (Qdrant implemented; Pinecone, Chroma and Atlas scaffolded).',
    ],
    stack: ['FastAPI', 'MongoDB', 'Qdrant', 'LangGraph'],
    links: { code: 'https://github.com/vishwajitvm/PolicyBot' },
  },
  {
    id: 'omnishell', name: 'OmniShell', tagline: 'Plain English → OS workflows, with approval', kind: 'product', org: 'My product', emoji: '🐚', color: '#FFB59A',
    summary: 'Turns plain-English requests into workflows on Linux, macOS and Windows, with a human approval step before anything risky runs.',
    bullets: [
      'A FastAPI service routing requests across 19 capability types with one LiteLLM planning call returning Pydantic-validated JSON.',
      'LLM fallback across 6 providers with error classification and per-model cool-downs.',
      'A PostgreSQL job scheduler (FOR UPDATE SKIP LOCKED, heartbeat leases, expiring SHA-256 approval tokens) and a cross-platform executor with 16 risk rules.',
    ],
    stack: ['Python', 'FastAPI', 'LiteLLM', 'PostgreSQL', 'Redis', 'NestJS', 'Docker'],
    links: { code: 'https://github.com/vishwajitvm/OmniShell' },
  },
  {
    id: 'loktathya', name: 'LokTathya', tagline: 'Civic data platform for India', kind: 'product', org: 'My product', emoji: '🗺️', color: '#9FD0FF',
    summary: 'A civic data platform for India built on maps and public data.',
    bullets: ['A FastAPI backend on PostgreSQL / PostGIS with 50 tables.', 'A Next.js frontend.', 'A GitHub Actions pipeline running migrations and 76 automated tests.'],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Next.js', 'GitHub Actions'],
    links: { code: 'https://github.com/vishwajitvm/LokTathya' },
  },
  {
    id: 'fittrack-ai', name: 'FitTrack-AI', tagline: 'Nutrition from a meal photo', kind: 'product', org: 'My project', emoji: '🥗', color: '#9FE8C8',
    summary: 'Take a photo of a meal and get its nutrition — grounded in real food databases rather than model guesses.',
    bullets: ['Meal recognition from a photo using vision LLMs.', 'Nutrition values grounded in USDA FoodData Central and Open Food Facts.', 'A Next.js frontend on a FastAPI backend.'],
    stack: ['Python', 'FastAPI', 'Next.js'],
    links: { code: 'https://github.com/vishwajitvm/FitTrack-AI' },
  },
  {
    id: 'bella-canvas', name: 'Bella Canvas', tagline: '3D product customisation & e-commerce', kind: 'client', org: 'Bee Logical', emoji: '👕', color: '#FF8FB1',
    summary: 'A 3D configurator that lets sportswear brands and customers design jerseys and uniforms, built into a Shopify storefront.',
    bullets: [
      'Led backend architecture and data modelling for a multi-stage design lifecycle (base → template → session → product → item).',
      'The full REST API for designs, panels and assets, plus Shopify product and order sync.',
      'An AWS S3 asset pipeline serving UV-mapped textures for real-time 3D rendering.',
    ],
    stack: ['Laravel', 'PHP', 'Vue', 'AWS', 'MySQL'],
    links: { live: 'https://www.bellacanvas.com/' },
  },
  {
    id: 'havu', name: 'Havu', tagline: 'Events-based dating platform', kind: 'client', org: 'Bee Logical', emoji: '💜', color: '#B9A6FF',
    summary: 'An events-based dating platform. I built the admin portal for events, users, cities and venues.',
    bullets: ['Admin portal for managing events, users, cities and venues.', 'Role-based access for the admin team.', 'Multi-city event scheduling.'],
    stack: ['React', 'GraphQL', 'AWS'],
    links: { live: 'https://havusocial.com/' },
  },
  {
    id: 'mahaeseva', name: 'MahaEseva.com', tagline: 'Online rent agreements for India', kind: 'client', org: 'Bee Logical', emoji: '🏠', color: '#FFE07A',
    summary: 'Lets people across India create and e-sign government-compliant rent agreements online.',
    bullets: ['Admin and customer portals for creating and e-signing rent agreements.', 'Online payments and biometric verification.', 'Role-based access and lead management for the operations team.'],
    stack: ['Laravel', 'PHP', 'MySQL'],
    links: {},
  },
  {
    id: 'setbot', name: 'SetBot', tagline: 'Property & venue booking platform', kind: 'client', org: 'Bee Logical', emoji: '🗓️', color: '#9FE8C8',
    summary: 'A booking platform for studios, hostels, restaurants and shops.',
    bullets: ['REST APIs for listings, bookings and admin reports, with JWT and role-based access for 4 roles.', 'A booking engine with real-time slot validation and offer rules that stays correct under concurrent bookings.', 'The API layer used by the Angular frontend.'],
    stack: ['Node.js', 'Express', 'TypeScript', 'MySQL', 'Angular', 'JWT'],
    links: {},
  },
  {
    id: 'vaahcms', name: 'VaahCMS', tagline: 'Open-source Laravel CMS', kind: 'client', org: 'WebReinvent', emoji: '🧩', color: '#FFB59A',
    summary: 'An open-source content management system built on Laravel and Vue.js.',
    bullets: ['Built new features across the CMS.', 'Fixed bugs in its REST APIs and MySQL data models.'],
    stack: ['Laravel', 'PHP', 'Vue', 'MySQL', 'REST'],
    links: { live: 'https://vaah.dev/cms' },
  },
  {
    id: 'unicorn-equipments', name: 'Unicorn Equipments', tagline: 'Equipment tracking dashboard', kind: 'client', org: 'BluBrandz', emoji: '🚜', color: '#9FD0FF',
    summary: 'An equipment management system for a machinery business.',
    bullets: ['A Laravel admin dashboard for listing equipment.', 'Tracking and maintenance records for each machine.'],
    stack: ['Laravel', 'PHP', 'MySQL'],
    links: { live: 'https://unicornequipments.com/' },
  },
];

export const workById = (id: string) => WORK.find((w) => w.id === id);
