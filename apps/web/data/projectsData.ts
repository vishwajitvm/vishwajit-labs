export interface TechChoice {
  name: string;
  icon: string;
  description: string;
  whyChosen: string;
}

export interface ConfigItem {
  filename: string;
  language: string;
  content: string;
}

export interface SecurityPerformanceItem {
  title: string;
  content: string;
}

export interface DeploymentStep {
  step: string;
  cmd: string;
  description: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  desc: string;
  payload?: string;
  response?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  detail: string;
}

export interface FlowStep {
  step: string;
  desc: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  tagline: string;
  github: string;
  intro: string;
  coreConcept: string;
  overview: string;
  architecture: string;
  techChoices: TechChoice[];
  configs: ConfigItem[];
  securityPerformance: SecurityPerformanceItem[];
  deploymentSteps: DeploymentStep[];
  apis: ApiEndpoint[];
  features: FeatureItem[];
  logging: string;
  schema: string;
  flow: FlowStep[];
}

export const projectsData: Record<string, ProjectDetail> = {
  tracenest: {
    id: "tracenest",
    name: "TraceNest Telemetry",
    tagline: "Developer-First Logging SDK & FastAPI Stream UI",
    github: "https://github.com/vishwajitvm/tracenest",
    intro: "TraceNest is a developer-first, zero-dependency logging infrastructure library and telemetry dashboard designed specifically for Python and FastAPI systems. Traditionally, setting up structured logging, managing file rotation, cleaning up old records, and building dashboards to read local files requires hours of boilerplate configuration. TraceNest solves this by acting as a complete, drop-in logging infrastructure layer. It operates entirely on an asynchronous, non-blocking model, ensuring that recording system events or errors never blocks the primary Python event loop. Out of the box, it formats log files, manages rolling retention policies, redacts credentials, and hosts an embedded log-streaming UI directly inside the running application.",
    coreConcept: "Instead of forcing developers to configure log handlers or deploy massive ELK logs clusters locally, TraceNest acts as an embedded library that routes log statements asynchronously. It handles the entire logging lifecycle, keeping local storage clean and exposing a local web UI served directly from the application.",
    overview: "TraceNest replaces complex log configurations with a single drop-in import, giving developers immediate structured logging, size-based rotation, retention caps, and a beautiful log search UI without any external servers dependency.",
    architecture: "TraceNest operates on an asynchronous queue model. When the application issues a log statement, the TraceNest SDK processes it, redacts sensitive keys via custom regex matchers, and pushes the payload to a thread-safe in-memory queue. A background worker drains the queue and writes logs to local disk directories. When FastAPI is loaded, an embedded HTTP route is exposed to serve real-time log streams directly via Server-Sent Events (SSE).",
    techChoices: [
      { name: "Python Core", icon: "code", description: "Standard Logging Framework", whyChosen: "Natively written in Python, utilizing standard library logging handlers, local thread-safe file locks, and custom AST patterns to intercept log calls with zero configuration overhead." },
      { name: "FastAPI Middleware", icon: "cpu", description: "Automatic Request Interception", whyChosen: "Injected directly into the API request lifecycle. It automatically measures request duration, parses client IP geo-headers, records HTTP status codes, and links errors to structured trace records." },
      { name: "OpenTelemetry Standard", icon: "layers", description: "Trace Propagation Standards", whyChosen: "Standardizes log spans and trace contexts. This ensures that as applications scale, developers can export logs directly to Prometheus, Jaeger, or Grafana without changing a line of code." },
      { name: "Uvicorn ASGI", icon: "server", description: "High-Performance ASGI Server", whyChosen: "Serves the FastAPI app and hosts real-time SSE telemetry feeds efficiently under high concurrent connection loads." },
      { name: "Docker Containerization", icon: "layers", description: "Standardized Dev/Staging environments", whyChosen: "Wraps TraceNest services and demo apps in Docker, making setup, testing, and deployment consistent across local developer setups and cloud staging platforms." },
      { name: "Local Disk Storage", icon: "database", description: "Zero-dependency logs persistence", whyChosen: "Persists log metrics directly to disk, enforcing size limits and rotation schedules to prevent storage exhaustion without requiring complex database instances." },
      { name: "Redis Caching Broker", icon: "zap", description: "Rate Limiting & Log Volatility Control", whyChosen: "Utilized for sliding-window rate limit checks on error logs ingestion, preventing logs flood attacks during system loops." },
      { name: "ClickHouse Integration", icon: "database", description: "High-Speed Analytics DB", whyChosen: "Provides log indexing for analytical queries. When developers export data, ClickHouse allows quick querying across billions of rows." }
    ],
    configs: [
      {
        filename: "tracenest.json",
        language: "json",
        content: `{
  "service_name": "payment-api",
  "log_dir": "TraceNestLogs",
  "max_file_size_mb": 25,
  "retention_days": 30,
  "redact_keys": ["password", "token", "jwt", "authorization", "secret_key"]
}`
      }
    ],
    securityPerformance: [
      { title: "Recursive Redaction Engine", content: "Scans nested dictionaries, tuples, and raw strings to replace sensitive authentication tokens and database URLs with '[REDACTED]' before disk writes." },
      { title: "Lock-Free Concurrency", content: "Utilizes non-blocking memory buffers and a background worker thread to execute file writes, preventing event loop blockages in async frameworks." }
    ],
    deploymentSteps: [
      { step: "Install Package", cmd: "pip install tracenest", description: "Download and install the telemetry SDK directly from PyPI." },
      { step: "Configure Middleware", cmd: "app.add_middleware(TraceNestMiddleware)", description: "Hook TraceNest into your FastAPI application setup." },
      { step: "Launch Application", cmd: "uvicorn main:app --reload", description: "Start development server; logs are created under TraceNestLogs/ directory." }
    ],
    apis: [
      { method: "GET", path: "/tracenest", desc: "Serves the embedded HTML/React log viewer dashboard." },
      { method: "GET", path: "/tracenest/stream", desc: "Server-Sent Events endpoint streaming real-time log payloads to the UI." }
    ],
    features: [
      { title: "Day-wise Rotation", description: "Log files are split by date and size limit automatically.", detail: "Rotates logs when they reach 25MB, moving old files to an archive directory." },
      { title: "Live Streaming Console", description: "Interactive browser dashboard.", detail: "Displays real-time logs with level toggles, regex search, and emerald/ruby/amethyst theme variations." },
      { title: "FastAPI Autoparse", description: "Native request and exception tracking.", detail: "Automatically logs incoming headers, query params, status codes, and unhandled exception traces." }
    ],
    logging: "TraceNest logs itself using native python logging with a fallback path. Telemetry traces capture execution duration, queue backlog sizes, and disk write errors to prevent log loss.",
    schema: "Local file path: TraceNestLogs/YYYY-MM-DD.log (JSON stream format with fields: timestamp, level, trace_id, span_id, message, and metadata)",
    flow: [
      { step: "Logger Invocation", desc: "The application code calls logger.info() or logger.error() passing trace metadata." },
      { step: "Credential Redaction", desc: "Recursive scanner evaluates keys and masks authorization tokens." },
      { step: "Queue Buffering", desc: "Formatted JSON payload is pushed onto the thread-safe background log queue." },
      { step: "Disk Flush & Archive", desc: "The background thread batches log entries and writes them to local disk files, rotating if limits are exceeded." }
    ]
  },
  'tenantmind-ai': {
    id: "tenantmind-ai",
    name: "TenantMind AI",
    tagline: "Multi-Tenant Enterprise Property Management RAG",
    github: "https://github.com/vishwajitvm/tenantmind-ai",
    intro: "TenantMind AI is an enterprise-grade property management portal powered by Retrieval-Augmented Generation (RAG). It enables landlords, property managers, and tenants to query lease agreements, utility allocations, and billing history in natural language. The core challenge of enterprise SaaS is security: TenantMind AI implements a multi-tenant authorization framework that isolates document data at the identity, database, and vector space layers, ensuring that no tenant can ever access or retrieve another tenant's files.",
    coreConcept: "To prevent cross-tenant data leaks during AI vector query retrieval, TenantMind AI integrates Keycloak OIDC tokens validation to determine organizational scopes on every query, executing semantic searches strictly inside tenant Qdrant namespaces.",
    overview: "Landlords can upload PDFs of leases and utility bills. Celery workers parse text, and tenants query the document search engine safely, receiving grounded responses with citations of their specific lease conditions.",
    architecture: "The backend is an async FastAPI service. Users authenticate via Keycloak, yielding a JWT. When query tasks are executed, the JWT context is parsed, extracting the tenant organization ID. Document chunks are stored inside tenant-isolated Qdrant namespaces. Celery workers handle PDF file ingestion and embeddings calculation behind a Redis cache queue.",
    techChoices: [
      { name: "FastAPI & Python", icon: "cpu", description: "High-Performance REST Gateway", whyChosen: "Acts as the high-speed async backend API gateway, handling file uploads, user validation dependencies, and AI orchestration." },
      { name: "Keycloak (OIDC)", icon: "shield", description: "OIDC Identity & RBAC Provider", whyChosen: "Centralized OpenID Connect identity provider that manages secure tenant scopes, JWT generation, and Role-Based Access Control (RBAC)." },
      { name: "Qdrant Vector DB", icon: "database", description: "Tenant Namespace Vector Index", whyChosen: "Indexes document chunks. Uses Qdrant logical namespaces to partition vector collections by tenant, preventing cross-tenant semantic searches." },
      { name: "MongoDB", icon: "database", description: "Application Metadata Store", whyChosen: "Flexible document store for managing dynamic properties, tickets, and user access records." },
      { name: "MinIO / S3 Object Storage", icon: "layers", description: "Secure PDF Document Repository", whyChosen: "MinIO serves as a high-speed, local-first S3-compatible object store, hosting lease agreements and bills safely. It helps isolate document assets." },
      { name: "Celery Task Queue", icon: "activity", description: "Asynchronous Background Ingestion", whyChosen: "Offloads intensive tasks like PDF extraction, text chunking, and vector embedding calculations from the main request thread." },
      { name: "Redis Cache Broker", icon: "zap", description: "Distributed Locks & Message Broker", whyChosen: "Serves as the high-speed message broker for Celery tasks, tracking job progress and managing locks." },
      { name: "Docker & Compose", icon: "layers", description: "Multi-Service Container Orchestration", whyChosen: "Orchestrates MongoDB, Qdrant, Redis, Keycloak, and Celery worker services under isolated Docker networks to mirror production cloud environments." }
    ],
    configs: [
      {
        filename: "keycloak.json",
        language: "json",
        content: `{
  "realm": "tenantmind-enterprise",
  "auth-server-url": "http://keycloak.labs:8080/auth",
  "ssl-required": "external",
  "resource": "tenant-api-client",
  "verify-token-audience": true
}`
      }
    ],
    securityPerformance: [
      { title: "JWT-Scoped Namespace Isolation", content: "Keycloak tokens are validated at the API dependency layer, binding the tenant's organization ID directly to the Qdrant query filter context." },
      { title: "Encrypted Documents Upload", content: "Document assets are encrypted at rest using AES-256 before storage in MongoDB." }
    ],
    deploymentSteps: [
      { step: "Boot Containers", cmd: "docker compose up --build -d", description: "Deploy FastAPI, Keycloak, Qdrant, MongoDB, and Redis nodes." },
      { step: "Configure Realm", cmd: "python scripts/setup_keycloak.py", description: "Setup the enterprise realm, client credentials, and tenant groups." },
      { step: "Upload Lease Agreement", cmd: "curl -X POST /api/v1/documents", description: "Upload a PDF lease file to index embeddings for RAG." }
    ],
    apis: [
      { method: "POST", path: "/api/v1/documents/upload", desc: "Uploads a lease document PDF for background ingestion." },
      { method: "POST", path: "/api/v1/chat/query", desc: "Executes a semantic vector query bounded by tenant JWT scope." }
    ],
    features: [
      { title: "Scoped Vector Search", description: "Queries are filtered by tenant ID namespaces.", detail: "Ensures that candidates cannot retrieve document chunks belonging to other properties." },
      { title: "Asynchronous PDF Ingestion", description: "Document parser queue.", detail: "Uses PyPDF and Gemini Embeddings model to index uploaded leases asynchronously." },
      { title: "Multi-Model Fallbacks", description: "AI gateway routing.", detail: "Switches query targets dynamically from Gemini to OpenAI or Ollama in case of API failure." }
    ],
    logging: "Traces API endpoints latency and LLM token usage metrics per query, logging results into MongoDB telemetry collections.",
    schema: "MongoDB Collections: tenants (id, name, created_at), documents (id, tenant_id, file_path, qdrant_namespace), chat_history (id, tenant_id, user_id, messages_list)",
    flow: [
      { step: "Token Authentication", desc: "User submits an AI query; FastAPI extracts the tenant organization ID from the Keycloak JWT." },
      { step: "Vector Search", desc: "Prompts are embedded and searched within the corresponding tenant's namespace in Qdrant." },
      { step: "Prompt Composition", desc: "The matching document chunks are retrieved and compiled into a secure prompt context." },
      { step: "LLM Generation", desc: "Gemini synthesizes the response, complete with citations of the source paragraphs." }
    ]
  },
  policybot: {
    id: "policybot",
    name: "PolicyBot Agent",
    tagline: "MCP-Powered Code Compliance Auditing swarm",
    github: "https://github.com/vishwajitvm/policybot",
    intro: "PolicyBot is an AI-powered code auditing agent designed to run directly within software development workflows. By leveraging the Model Context Protocol (MCP), PolicyBot connects LLM agents directly with local repository filesystems. It automatically scans Git commits, parses Abstract Syntax Trees (AST) to verify code structures, and evaluates changes against organizational security and design standards.",
    coreConcept: "PolicyBot uses Model Context Protocol (MCP) servers to bridge AI models with local developer tools securely, avoiding the need to expose sensitive repository source code to third-party servers.",
    overview: "Developers run git hooks that trigger the PolicyBot agent. The agent queries filesystem resources via MCP, retrieves compliance rules from a Qdrant semantic store, and evaluates code changes, logging outcomes in SQLite.",
    architecture: "PolicyBot runs as a command-line utility or background daemon. It registers an MCP server that exposes tools (read_file, git_diff, search_rules). The LLM agent uses these tools to inspect code diffs, queries policy vectors inside Qdrant, and logs compliance scores directly to SQLite.",
    techChoices: [
      { name: "Model Context Protocol (MCP)", icon: "terminal", description: "AI-System Resource Bridge", whyChosen: "Standardizes secure tool access for AI models, allowing them to read code and Git status safely on the developer's machine." },
      { name: "LangChain Agent", icon: "cpu", description: "AI Orchestration Loop", whyChosen: "Manages stateful tool calls, parses execution history, and structures evaluation prompts." },
      { name: "Qdrant Vector DB", icon: "database", description: "Compliance Policies Store", whyChosen: "Indices company regulations and coding standards for semantic search during audits." },
      { name: "SQLite Database", icon: "database", description: "Local Run Ledger", whyChosen: "Minimal, serverless database setup that records audit histories and compliance statistics locally." },
      { name: "Git CLI Hook Integrator", icon: "code", description: "VCS Trigger Interface", whyChosen: "Directly integrates into git workflow hooks. This calculates changed line indexes and limits analysis to active commit files." },
      { name: "Docker Environment", icon: "layers", description: "Sandboxed execution framework", whyChosen: "Docker encapsulates the MCP daemon and environment runtimes, securing target workspace volumes during analysis." },
      { name: "Python AST Library", icon: "code", description: "Syntax Analysis Analyzer", whyChosen: "Provides Abstract Syntax Tree scanning tools to inspect Python code structures, helping identify raw queries or unannotated endpoints before the runtime phase." },
      { name: "MinIO storage integration", icon: "layers", description: "Reference guidelines storage", whyChosen: "MinIO caches target compliance PDF reports and rules lists for vector indexing tasks." }
    ],
    configs: [
      {
        filename: "policybot.yaml",
        language: "yaml",
        content: `mcp_server:
  host: "127.0.0.1"
  port: 8585
audit_rules:
  allow_raw_sql: false
  require_auth_decorators: true
  blocked_imports: ["os.system", "subprocess.Popen"]
vector_store:
  collection: "compliance-policies"`
      }
    ],
    securityPerformance: [
      { title: "Git Diff Pre-Filtering", content: "To optimize token costs, the agent only reads files listed in the git commit diff index rather than scanning the entire codebase directory." },
      { title: "Local Filesystem Boundaries", content: "MCP tools enforce strict sandboxing, preventing the LLM from executing filesystem write commands on system files." }
    ],
    deploymentSteps: [
      { step: "Install Package", cmd: "pip install policybot-agent", description: "Install the agent packages and MCP server dependencies." },
      { step: "Initialize Config", cmd: "policybot init", description: "Generates default policy configuration files and setups the local SQLite ledger." },
      { step: "Run Auditor", cmd: "policybot run --commit", description: "Audits the latest git commit differences against active compliance guidelines." }
    ],
    apis: [
      { method: "mcp/listTools", path: "listTools", desc: "Lists tools (read_git_diff, scan_ast, get_policies) exposed to the AI client." },
      { method: "mcp/callTool", path: "callTool", desc: "Invokes a specific tool to read workspace data or index compliance guidelines." }
    ],
    features: [
      { title: "MCP Filesystem Integrations", description: "Exposes directory and git diff search tools to the model.", detail: "Standardizes how the agent reads files, tracks logs, and parses commit histories." },
      { title: "AST Parse Verification", description: "Python syntax parser.", detail: "Queries python AST trees directly to flag unsafe raw SQL queries, missing decorators, or plain-text secrets." },
      { title: "Git Pre-Commit Hook", description: "Automatic code checker.", detail: "Can be added to project git hooks, blocking commit attempts if compliance checks fail." }
    ],
    logging: "Logs tool execution logs, git commit metadata, and compliance scores directly to SQLite.",
    schema: "SQLite Schema: audit_runs (id INTEGER PRIMARY KEY, commit_hash TEXT, file_path TEXT, score REAL, logs TEXT, created_at TIMESTAMP)",
    flow: [
      { step: "Trigger Audit", desc: "Developer initiates commit, triggering PolicyBot hook." },
      { step: "MCP File Scan", desc: "The agent reads modified files and git logs using MCP filesystem tools." },
      { step: "Semantic Check", desc: "PolicyBot queries Qdrant to retrieve relevant corporate coding guidelines." },
      { step: "Log SQLite", desc: "Saves the run results to SQLite and returns the compliance score." }
    ]
  },
  tallyko: {
    id: "tallyko",
    name: "Tallyko SaaS POS",
    tagline: "Multi-Tenant Point-of-Sale Ledger Engine",
    github: "https://github.com/vishwajitvm/tallyko",
    intro: "Tallyko is a multi-vendor restaurant and retail Point-of-Sale (POS) and inventory SaaS platform. It handles transactions, billing, inventory, and bookkeeping ledger entries across multiple independent store locations. It isolates vendor data, protects database performance during peak hours, and prevents balance discrepancies using a double-entry accounting engine.",
    coreConcept: "A multi-tenant system requires strict isolation to prevent cross-vendor data visibility, combined with high-speed transactional locks to prevent wallet double-spending during concurrent sales events.",
    overview: "Tallyko provides vendors with isolated logical workspace environments via PostgreSQL Row-Level Security, running under Traefik gateways, with Redis distributed mutex locks to protect transaction commits.",
    architecture: "Mobile and web POS clients send orders to a Traefik SSL router. Traefik forwards the payload to FastAPI backends. The backend resolves the tenant scope, locks the corresponding store wallet in Redis, and sets session variables in PostgreSQL. PostgreSQL RLS policies automatically filter database queries by tenant ID.",
    techChoices: [
      { name: "Go Lang & gRPC", icon: "code", description: "High-Performance Transactional Ledger", whyChosen: "Handles concurrent order calculations, ledger updates, and fast, low-latency API transactions." },
      { name: "PostgreSQL Database", icon: "database", description: "Relational Ledger Data Store", whyChosen: "Ensures ACID transactional guarantees while supporting native RLS (Row-Level Security) policies to isolate tenant data." },
      { name: "Redis distributed lock manager", icon: "zap", description: "Atomic checkout Mutex controller", whyChosen: "Acquires distributed locks on store wallets, preventing concurrency race conditions during simultaneous checkouts." },
      { name: "Traefik SSL Proxy Router", icon: "server", description: "Dynamic Subdomain Traffic Router", whyChosen: "Routes incoming subdomain traffic to separate tenant instances and manages SSL certificates dynamically." },
      { name: "Docker Compose environment", icon: "layers", description: "Containerized Microservices stack", whyChosen: "Orchestrates PostgreSQL, Redis, Traefik, Go backend, and Python FastAPI helper containers across isolated virtual developer networks." },
      { name: "MinIO integration", icon: "layers", description: "Merchant catalog assets storage", whyChosen: "MinIO serves catalog and product assets locally. This isolates files and reduces dependency on external cloud storage." },
      { name: "React Native POS", icon: "layers", description: "Cross-platform mobile POS register", whyChosen: "Enables offline-first, mobile POS functionality for checkout clerks, syncing with the backend Go engine when online." },
      { name: "WatermelonDB & SQLite", icon: "database", description: "Offline register client cache", whyChosen: "Saves inventory and billing logs locally on React Native register devices, ensuring business continuity during internet drops." }
    ],
    configs: [
      {
        filename: "traefik.yml",
        language: "yaml",
        content: `providers:
  docker:
    exposedByDefault: false
entryPoints:
  websecure:
    address: ":443"
certificatesResolvers:
  letsencrypt:
    acme:
      email: "vishwajit@vishwajitvm.dev"
      storage: "acme.json"`
      }
    ],
    securityPerformance: [
      { title: "PostgreSQL Row-Level Security", content: "Prevents data leaks by isolating database rows based on the current database connection session parameters." },
      { title: "Sliding-Window Rate Limiting", content: "Uses Redis to block DDoS and brute force checkout attempts, keeping APIs responsive during high-traffic periods." }
    ],
    deploymentSteps: [
      { step: "Launch Infrastructure", cmd: "docker compose up -d", description: "Deploys PostgreSQL, Redis, Traefik, and FastAPI application nodes." },
      { step: "Run Migrations", cmd: "make migrate", description: "Applies database schemas and RLS policies to the PostgreSQL database." },
      { step: "Setup Subdomains", cmd: "curl -X POST /api/v1/tenants", description: "Registers a new vendor store subdomain in the Traefik router." }
    ],
    apis: [
      { method: "POST", path: "/api/v1/orders/checkout", desc: "Submits order calculations and executes ledger transactions." },
      { method: "GET", path: "/api/v1/inventory/items", desc: "Retrieves inventory lists filtered by the active tenant ID." }
    ],
    features: [
      { title: "Row-Level Security (RLS)", description: "Isolates tenant tables.", detail: "Enforces data separation natively in PostgreSQL, preventing cross-tenant data access." },
      { title: "Offline-First Mobile App", description: "React Native client.", detail: "Uses local WatermelonDB caching, auto-syncing when internet access returns." },
      { title: "Distributed Mutual Exclusion", description: "Uses Redis locks to secure wallet balances.", detail: "Enforces atomic transactions, maintaining database integrity during concurrent operations." }
    ],
    logging: "Structured logging via TraceNest logs database execution metrics, order processing latency, and ledger error occurrences.",
    schema: "PostgreSQL Tables: tenants (id, domain), catalog_items (id, tenant_id, price), orders (id, tenant_id, total), ledger_entries (id, tenant_id, debit_acc, credit_acc, value)",
    flow: [
      { step: "Order Checkout", desc: "Clerk submits an order from the React Native mobile POS." },
      { step: "Redis Lock", desc: "FastAPI acquires a distributed lock on the store's inventory ID in Redis." },
      { step: "Session Setup", desc: "The database connection sets the current tenant ID inside the PostgreSQL session variables." },
      { step: "Ledger Update", desc: "PostgreSQL checks RLS policies and writes double-entry ledger logs." }
    ]
  },
  agenthive: {
    id: "agenthive",
    name: "AgentHive Platform",
    tagline: "Docker-First Multi-Agent Swarm orchestrator",
    github: "https://github.com/vishwajitvm/AgentHive",
    intro: "AgentHive is an open-source, containerized orchestration platform designed to build, deploy, monitor, and run collaborative AI agent swarms. It allows users to orchestrate complex multi-agent workflows, run local LLMs (via Ollama), and monitor token costs directly from a single web dashboard.",
    coreConcept: "Agent swarms require asynchronous step tracking, model failover gateways, and cost-reduction mechanisms to prevent high LLM token consumption.",
    overview: "AgentHive coordinates multiple agent workers, storing execution traces in PostgreSQL, using pgvector for memory lookup, and running long-running jobs via Redis and Celery queues.",
    architecture: "AgentHive uses a Next.js front-end and a FastAPI backend. Celery workers handle agent execution loops, writing run states and memory embeddings to PostgreSQL (with pgvector). Prompt templates are compressed into key-value 'TOON' (Token-Optimized Object Notation) formats to reduce context size.",
    techChoices: [
      { name: "Next.js (React)", icon: "layers", description: "Orchestration Control UI", whyChosen: "Enables real-time tracking of multi-agent reasoning steps, tool invocation metrics, and token cost dashboards." },
      { name: "FastAPI Backend", icon: "cpu", description: "Agent swarms configuration API", whyChosen: "Async gateway that handles task requests, API keys, and coordination parameters." },
      { name: "PostgreSQL & pgvector", icon: "database", description: "Configuration & Memory database", whyChosen: "Stores system config metadata, while pgvector provides semantic storage for agent context memories." },
      { name: "Celery Task workers", icon: "activity", description: "Asynchronous Agent Loops", whyChosen: "Celery and Redis handle long-running agent execution loops asynchronously, keeping the UI responsive." },
      { name: "Redis cache & broker", icon: "zap", description: "Celery Queue Broker", whyChosen: "Acts as the Celery task queue broker and stores transient execution logs." },
      { name: "Ollama Integration", icon: "terminal", description: "Local LLM Execution Engine", whyChosen: "Enables hosting and querying open-source models (like Llama 3) locally, reducing API costs during development." },
      { name: "MinIO integration", icon: "layers", description: "Document Cache Engine", whyChosen: "MinIO stores source files and documents for rag-assisted agent reasoning." },
      { name: "Docker Containerization", icon: "layers", description: "Isolated Agent Sandboxing", whyChosen: "Docker manages nextjs, fastapi, pgvector, redis, and celery worker instances within isolated developer environments." }
    ],
    configs: [
      {
        filename: "agenthive.env",
        language: "shell",
        content: `POSTGRES_URI=postgresql://postgres:postgres@db:5432/agenthive
REDIS_URL=redis://redis:6379/0
PRIMARY_LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_API_URL=http://ollama:11434`
      }
    ],
    securityPerformance: [
      { title: "TOON Prompt Optimization", content: "Replaces verbose JSON prompts with compressed key-value structures, saving up to 40% in token costs." },
      { title: "Celery Concurrency Controls", content: "Caps concurrent agent runs using Celery queue limits to prevent system memory overload." }
    ],
    deploymentSteps: [
      { step: "Boot Services", cmd: "docker compose up -d", description: "Deploys Next.js, FastAPI, PostgreSQL, Redis, and Ollama containers." },
      { step: "Apply DB Migrations", cmd: "celery -A tasks worker --loglevel=info", description: "Launches celery task workers to handle agent workflows." },
      { step: "Register Agents", cmd: "curl -X POST /api/agents", description: "Registers a new agent tool definition from the dashboard." }
    ],
    apis: [
      { method: "POST", path: "/api/swarm/dispatch", desc: "Launches a multi-agent workflow task in the background." },
      { method: "GET", path: "/api/swarm/traces", desc: "Retrieves tool logs and step run history for active swarms." }
    ],
    features: [
      { title: "TOON Prompt Optimization", description: "Replaces verbose JSON prompts with compressed structures.", detail: "Saves up to 40% in LLM token costs, reducing context window overhead." },
      { title: "Interactive Swarm Monitor", description: "Real-time task tracker.", detail: "Dashboard displays agent reasoning steps, tool calls, and run times in real-time." },
      { title: "Database LLM Routing", description: "Customizable LLM routing rules.", detail: "Configure routing policies and switch models (e.g. Gemini, OpenAI, Ollama) on the fly." }
    ],
    logging: "Agent runs, execution steps, tool calls, and LLM queries are logged directly to PostgreSQL.",
    schema: "PostgreSQL Tables: agent_runs (id, session_id, agent_name, status, logs), agent_memories (id, agent_name, content, embedding VECTOR(1536))",
    flow: [
      { step: "Swarm Boot", desc: "User triggers a workflow from the Next.js dashboard." },
      { step: "Task Queued", desc: "FastAPI sends the agent execution loop task to Redis and Celery." },
      { step: "Memory Recall", desc: "The agent queries pgvector to retrieve relevant past memories." },
      { step: "Orchestrated Action", desc: "The agent executes tools, evaluates outputs, and logs steps to PostgreSQL." }
    ]
  },
  'smart-hr-bot': {
    id: "smart-hr-bot",
    name: "Smart HR Assistant",
    tagline: "AI Resume Evaluator & Automated Interviewer",
    github: "https://github.com/vishwajitvm/smart-hr-bot",
    intro: "Smart HR Bot is an AI-powered recruitment platform designed to automate the screening phase of hiring. It parses PDF resumes into structured JSON profiles, evaluates candidates against job descriptions, conducts interactive mock screening interviews, and coordinates calendar scheduling.",
    coreConcept: "HR departments waste hours manually reviewing resumes and coordinating initial screening calls. Smart HR Bot was built to automate this stage. It uses LangGraph state machines to conduct multi-turn, structured technical screening chats with candidates.",
    overview: "Smart HR Bot extracts text from uploaded PDF resumes, parses candidate profiles using Google Gemini, evaluates qualifications, conducts screening interviews, and schedules calendar events.",
    architecture: "Smart HR Bot is built with a FastAPI backend and a React frontend. Candidates upload their resumes, and the backend extracts text and parses it into JSON. LangGraph manages the state of the mock interview chat, while Google Calendar integrations handle scheduling for candidates who pass.",
    techChoices: [
      { name: "FastAPI Backend", icon: "cpu", description: "Core Request Router", whyChosen: "Enables fast file uploads, asynchronous processing, and clean integrations with LLM libraries." },
      { name: "Google Gemini Pro", icon: "brain", description: "Structured Resume parser", whyChosen: "Provides fast structured JSON parsing and responsive, low-latency interview chats." },
      { name: "LangGraph Framework", icon: "activity", description: "Stateful Screening Machine", whyChosen: "Manages stateful multi-turn interview conversations, tracking candidate progress." },
      { name: "SQLite Database", icon: "database", description: "Lightweight Profile Storage", whyChosen: "Lightweight, zero-administration database for storing candidate profiles and scores." },
      { name: "Docker Containerization", icon: "layers", description: "Local development packaging", whyChosen: "Wraps API routers, PDF processors, and database variables in container setups, ensuring consistent staging deployments." },
      { name: "MinIO Storage Integration", icon: "layers", description: "Ingested Resumes cache", whyChosen: "MinIO caches uploaded resume PDFs locally, keeping document assets isolated and secure." },
      { name: "pdfplumber parser", icon: "file", description: "Resume Text Ingestor", whyChosen: "Extracts text blocks and table arrays from PDFs before parsing them into structured JSON profiles with Gemini." },
      { name: "Google Calendar API", icon: "layers", description: "Calendar Slot Organizer", whyChosen: "Integrates directly with Google Calendar to schedule interviews for candidates who pass evaluation checks." }
    ],
    configs: [
      {
        filename: "config.py",
        language: "python",
        content: `DATABASE_URL = "sqlite:///./smarthr.db"
GEMINI_MODEL = "gemini-1.5-pro"
CALENDAR_API_KEY = "your_google_calendar_api_key"
EVALUATION_RUBRIC = {
    "technical_skills": 0.4,
    "experience": 0.4,
    "communication": 0.2
}`
      }
    ],
    securityPerformance: [
      { title: "Structured PII Redaction", content: "Redacts sensitive contact information (like phone numbers or physical addresses) from resumes during evaluation stages." },
      { title: "Stateful Interview Checkpointing", content: "LangGraph preserves interview state, allowing candidates to resume chats if they get disconnected." }
    ],
    deploymentSteps: [
      { step: "Install Dependencies", cmd: "pip install -r requirements.txt", description: "Installs FastAPI, LangGraph, and Google Gemini dependencies." },
      { step: "Database Initialization", cmd: "python -m app.db init", description: "Creates SQLite databases tables." },
      { step: "Start FastAPI Backend", cmd: "uvicorn app.main:app --port 8000", description: "Launches the application server." }
    ],
    apis: [
      { method: "POST", path: "/api/candidates/upload", desc: "Uploads a PDF resume to extract structured JSON." },
      { method: "POST", path: "/api/interview/chat", desc: "Processes candidate responses in the active interview state." }
    ],
    features: [
      { title: "Structured PDF Parser", description: "Resume text extraction.", detail: "Automatically extracts work history, tech skills, and education from resumes into standardized JSON profiles." },
      { title: "Stateful Chat Interviews", description: "Interactive candidate chats.", detail: "Conducts adaptive screening interviews, asking follow-up questions based on the candidate's answers." },
      { title: "Auto-Scheduling", description: "Google Calendar synchronization.", detail: "Automatically schedules next-round interviews on Google Calendar for candidates who pass the evaluation." }
    ],
    logging: "TraceNest logs API endpoint latencies, candidate upload counts, and LLM processing exceptions.",
    schema: "SQLite Tables: candidates (id, name, skills, parsed_json), chat_logs (id, candidate_id, speaker, message), evaluations (id, candidate_id, score, summary)",
    flow: [
      { step: "Resume Ingestion", desc: "Candidate uploads their resume; FastAPI extracts text and parses it into JSON." },
      { step: "Interview Simulation", desc: "LangGraph state machine conducts the screening chat, generating follow-up questions." },
      { step: "Evaluation Rubric", desc: "The agent scores the interview responses against the role requirements." },
      { step: "Auto Invitation", desc: "If the candidate passes, the system creates a calendar invite for the next round." }
    ]
  }
};
