# Vishwajit Knowledge Base for RAG and Chatbot

VISHWAJIT_KB = {
    "personal": {
        "name": "Vishwajit",
        "title": "Python Backend Engineer & AI System Designer",
        "brand": "Vishwajit Labs",
        "description": "Architects scalable backend engines, distributed agent nodes, custom model context protocol (MCP) servers, and performance-tuned infrastructure.",
        "skills_summary": "Python, FastAPI, Go, Docker, MongoDB Atlas, Redis, LangChain, RAG, MCP, Vector Databases (Chroma/Pinecone), System Design, CI/CD with GitHub Actions.",
        "github": "https://github.com/vishwajitvm",
        "linkedin": "https://linkedin.com/in/vishwajitvm",
        "email": "vishwajit@vishwajitvm.dev"
    },
    "experience": [
        {
            "role": "Lead Platform & AI Engineer",
            "company": "Vishwajit Labs",
            "period": "2024 - Present",
            "points": [
                "Built and launched TraceNest, a developer-first Python logging SDK & UI dashboard served from FastAPI applications.",
                "Architected TenantMind AI, an intelligent property management RAG engine with scoped Keycloak OIDC tenant isolation filters.",
                "Engineered Model Context Protocol (MCP) servers bridging local databases environments directly with LLMs."
            ]
        },
        {
            "role": "Backend Engineer",
            "company": "SaaS Platform Inc.",
            "period": "2022 - 2024",
            "points": [
                "Refactored legacy REST APIs to asynchronous FastAPI services, reducing server latency by 45%.",
                "Containerized complex microservices structures and managed orchestration profiles using Docker & Docker Compose."
            ]
        }
    ],
    "projects": [
        {
            "id": "tracenest",
            "name": "TraceNest",
            "type": "Telemetry / SDK",
            "description": "A developer-first, local-first logging SDK for Python applications that automatically handles creation, rotation, and retention of structured logs, complete with a built-in FastAPI log stream UI.",
            "tech_stack": ["Python", "FastAPI", "OpenTelemetry", "Uvicorn"],
            "architecture": "TraceNest logs to TraceNestLogs/ directory -> parses logs asynchronously -> renders real-time streams, filters, and theme options directly via an embedded UI endpoint (/tracenest) inside FastAPI.",
            "challenges": "Providing local-first structured logging with zero setup. Solved by writing custom non-blocking file rotation handlers with thread-safe file locks."
        },
        {
            "id": "tenantmind-ai",
            "name": "TenantMind AI",
            "type": "AI Property Management",
            "description": "A multi-tenant property management platform using Keycloak OIDC identities to enforce tenant database scopes, parsing PDF lease files via Celery queues, and routing semantic RAG prompts.",
            "tech_stack": ["Python", "FastAPI", "MongoDB", "Qdrant", "Keycloak", "Celery", "Redis"],
            "architecture": "FastAPI verifies Keycloak JWT -> filters tenant MongoDB context -> pulls semantic chunks from Qdrant vector db using tenant qualifiers namespaces -> synthesizes reply.",
            "challenges": "Secure data segmentation for multi-vendor properties. Solved by building custom FastAPI dependencies that enforce Keycloak OIDC tenant qualifiers at both database and vector search boundaries."
        },
        {
            "id": "policybot",
            "name": "PolicyBot",
            "type": "Compliance Agent",
            "description": "An AI-powered filesystem and compliance auditing agent utilizing Model Context Protocol (MCP) to verify repository changes against corporate governance standards.",
            "tech_stack": ["Python", "MCP", "LangChain", "Qdrant", "SQLite"],
            "architecture": "Developer triggers git hook -> Agent requests git diff files via MCP filesystem tools -> parses AST tree -> compares against compliance guidelines -> logs scores in SQLite.",
            "challenges": "Large repository scanning was slow. Solved by filtering files using git diff index boundaries prior to LLM submission."
        },
        {
            "id": "tallyko",
            "name": "Tallyko",
            "type": "Restaurant/Retail SaaS POS",
            "description": "A multi-tenant point-of-sale restaurant SaaS with Traefik SSL gateways, PostgreSQL Row-Level Security, Redis cache brokers, and MinIO object storage.",
            "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Redis", "Traefik", "React Native"],
            "architecture": "Mobile client sends gRPC/REST commands -> Nginx/Traefik forwards requests -> FastAPI verifies tenant session -> executes PostgreSQL queries isolated via RLS.",
            "challenges": "Mitigating database connection overhead across tenants. Solved using PostgreSQL connection pools combined with isolated schema spaces."
        },
        {
            "id": "agenthive",
            "name": "AgentHive",
            "type": "Multi-Agent Orchestrator",
            "description": "A Docker-first multi-agent platform for deploying, monitoring, and managing collaborative AI agent swarms from one advanced React dashboard, saving token costs using TOON prompt formats.",
            "tech_stack": ["Next.js", "FastAPI", "PostgreSQL", "pgvector", "Redis", "Celery"],
            "architecture": "Dashboard coordinates agents -> Celery handles background runs -> postgres with pgvector stores memory embeddings -> context injected via compact TOON prompt rules.",
            "challenges": "High context window costs during agent collaboration. Solved by replacing large JSON prompt trees with compacted key-value structures."
        },
        {
            "id": "smart-hr-bot",
            "name": "Smart HR Bot",
            "type": "AI Recruitment Assistant",
            "description": "AI recruitment assistant parsing PDF resumes, scheduling candidate calendar slots, simulating chats, and scoring candidates automatically.",
            "tech_stack": ["FastAPI", "React", "Google Gemini", "LangChain", "SQLite"],
            "architecture": "Frontend uploads PDF resume -> PDF service extracts text -> Gemini parser creates structured JSON profile -> interview service spawns calendar scheduler & logs ratings.",
            "challenges": "Automated evaluation bias. Solved by using multi-criteria scoring rubrics enforced in LLM system prompts."
        },
        {
            "id": "youtube-ai-chatbot",
            "name": "YouTube AI ChatBot",
            "type": "RAG Chatbot",
            "description": "RAG-based conversational assistant that ingest transcripts of YouTube videos, indexes them in Chroma DB, and answers user queries with timestamps.",
            "tech_stack": ["Python", "Chroma DB", "Gemini API", "FastAPI"],
            "architecture": "Ingest YouTube transcript -> chunk and embed -> store in Chroma -> query-retrieve chunks -> LLM synthesis.",
            "challenges": "Retrieving precise timestamps. Solved by preserving start offset metadata inside transcript vector embeddings."
        },
        {
            "id": "healthcare-management-system",
            "name": "Healthcare Management System",
            "type": "Healthcare Portal",
            "description": "Portal for scheduling doctor appointments, digital prescriptions registry, and medical records logging.",
            "tech_stack": ["Python", "Django", "PostgreSQL", "Bootstrap"],
            "architecture": "Relational DB links patient, doctor, and logs models -> server-side HTML rendering -> secure database queries.",
            "challenges": "HIPAA compliance and records isolation. Solved by building field-level encryption on sensitive columns."
        },
        {
            "id": "unicorn",
            "name": "Unicorn Stock Inventory",
            "type": "Inventory System",
            "description": "Equipment quote generator and catalog inventory management platform built for Unicorn Equipments.",
            "tech_stack": ["PHP", "Laravel", "MySQL", "TailwindCSS"],
            "architecture": "MVC architecture mapping product categories, quotations database, and customer orders.",
            "challenges": "Heavy catalog updates rendering speed. Solved using Redis query caches."
        }
    ],
    "future_ideas": [
        {
            "name": "Universal Auth SDK",
            "goal": "One pip-installable authentication package integrating session validation, MFA, and OAuth configurations directly into FastAPI apps with zero boilerplate.",
            "status": "Research Phase",
            "timeline": "2026",
            "architecture": "FastAPI middleware injecting Better Auth sessions. Stores tokens directly in Redis cache."
        }
    ]
}

def get_kb_context() -> str:
    """Formats the knowledge base into a text context for Gemini prompt injection."""
    context = "VISHWAJIT LABS PORTFOLIO KNOWLEDGE BASE:\n\n"
    
    # Personal
    p = VISHWAJIT_KB["personal"]
    context += f"About Vishwajit:\n- Name: {p['name']}\n- Title: {p['title']}\n- Brand: {p['brand']}\n- Bio: {p['description']}\n- Skills: {p['skills_summary']}\n- GitHub: {p['github']}\n- Email: {p['email']}\n\n"
    
    # Projects
    context += "Projects Details:\n"
    for proj in VISHWAJIT_KB["projects"]:
        context += f"- Project Name: {proj['name']} ({proj['type']})\n"
        context += f"  Description: {proj['description']}\n"
        context += f"  Tech Stack: {', '.join(proj['tech_stack'])}\n"
        context += f"  Architecture: {proj['architecture']}\n"
        context += f"  Key Challenge Solved: {proj['challenges']}\n\n"
        
    # Experience
    context += "Work History:\n"
    for exp in VISHWAJIT_KB["experience"]:
        context += f"- {exp['role']} at {exp['company']} ({exp['period']})\n"
        for pt in exp['points']:
            context += f"  * {pt}\n"
        context += "\n"
        
    return context
