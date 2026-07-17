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
                "Built and launched TraceNest, a distributed tracing SDK and telemetry dashboard handling up to 10M events per day.",
                "Architected TenantMind AI, a multi-tenant enterprise RAG engine with scoped database access filters.",
                "Engineered Model Context Protocol (MCP) servers bridging local dev database environments directly with LLMs."
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
            "description": "Distributed tracing SDK and dashboard for FastAPI & Microservices. Simplifies telemetry monitoring for distributed backends.",
            "tech_stack": ["Python", "FastAPI", "Redis", "ClickHouse", "OpenTelemetry"],
            "architecture": "SDK hooks into FastAPI middlewares -> streams OpenTelemetry data asynchronously to a high-speed broker -> parsed & written to ClickHouse -> React dashboard queries ClickHouse for live waterfall graphs.",
            "challenges": "Handling massive throughput without blocking event loops. Solved by writing an asynchronous in-memory log buffer queue draining to worker processes."
        },
        {
            "id": "tenantmind-ai",
            "name": "TenantMind AI",
            "type": "AI Platform",
            "description": "Multi-tenant RAG engine with strict tenant isolation, customizable vector databases, and modular agent plugins.",
            "tech_stack": ["Python", "FastAPI", "MongoDB Atlas", "Pinecone", "LangChain", "Gemini Pro"],
            "architecture": "Tenant JWT identifies scope -> queries Pinecone namespaces dynamically -> constructs prompt with namespace vectors -> forwards context to Gemini with system guardrails.",
            "challenges": "Data leakage prevention across tenants. Solved by building custom middleware injecting namespace qualifiers directly into MongoDB & Pinecone clients."
        },
        {
            "id": "policybot",
            "name": "PolicyBot",
            "type": "AI Agent",
            "description": "Compliance-checking AI agent leveraging Model Context Protocol (MCP) to verify code updates against corporate governance specs.",
            "tech_stack": ["Python", "MCP", "LangChain", "SQLite"],
            "architecture": "Agent accesses filesystem/db using MCP tool calls -> parses python files -> compares against stored policy trees -> outputs compliance report.",
            "challenges": "Large contexts causing latency. Solved by pre-filtering code changes using Git diff logs prior to LLM submission."
        },
        {
            "id": "tallyko",
            "name": "Tallyko",
            "type": "System Infrastructure",
            "description": "High-performance event ledger broker written in Go, resolving race conditions in transactional double-entry systems.",
            "tech_stack": ["Go", "Redis", "PostgreSQL", "gRPC"],
            "architecture": "gRPC endpoints accept transaction payloads -> processed through ring buffer -> Redis locks lock wallets -> updates committed to PG.",
            "challenges": "Ensuring strict transaction ordering. Solved using atomic Redis scripts combined with distributed locks."
        }
    ],
    "future_ideas": [
        {
            "name": "Universal Auth SDK",
            "goal": "One pip-installable authentication package integrating session validation, MFA, and OAuth configurations directly into FastAPI apps with zero boilerplate.",
            "status": "Research Phase",
            "timeline": "2026",
            "architecture": "FastAPI middleware injecting Better Auth sessions. Stores tokens directly in Redis cache."
        },
        {
            "name": "Future Agent Framework",
            "goal": "A lightweight Python agent orchestrator built for low latency micro-tasks with native MCP capabilities.",
            "status": "Design Phase",
            "timeline": "2026"
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
        
    # Future ideas
    context += "Future Engineering Roadmap:\n"
    for idea in VISHWAJIT_KB["future_ideas"]:
        context += f"- Product: {idea['name']}\n"
        context += f"  Goal: {idea['goal']}\n"
        context += f"  Status: {idea['status']} (Target: {idea['timeline']})\n\n"
        
    return context
