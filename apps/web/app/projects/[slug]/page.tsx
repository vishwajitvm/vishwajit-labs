'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu, Database, Server, Settings, Play } from 'lucide-react';
import { useState } from 'react';
import { GithubIcon } from '@/components/icons/BrandIcons';

// Project specification dictionary containing custom mock SaaS designs
const projectDetails: Record<string, any> = {
  tracenest: {
    name: "TraceNest Telemetry",
    tagline: "Distributed Tracing & System Debugger",
    github: "https://github.com/vishwajitvm/tracenest",
    tech: ["Python", "FastAPI", "ClickHouse", "Redis", "OpenTelemetry"],
    challenges: "FastAPI event loops were getting bottlenecked under high log density. Vishwajit refactored the SDK to dump payloads asynchronously to an in-memory queue, which is batched and flushed to ClickHouse via background tasks.",
    snippet: `from tracenest.sdk import TraceNestFastAPI

app = FastAPI()

# Zero boilerplate initialization
app.add_middleware(
    TraceNestFastAPI,
    service_name="payment-gateway",
    collector_url="http://tracenest-collector.labs:4317"
)`,
    flow: [
      { step: "Client Request", desc: "Incoming request hits API Gateway with trace headers." },
      { step: "SDK Hook", desc: "TraceNest middleware starts a span and records database transaction IDs." },
      { step: "Memory Buffering", desc: "OpenTelemetry stats are written to local Redis buffers asynchronously." },
      { step: "ClickHouse Ingestion", desc: "Worker nodes drain buffers and batch-write to ClickHouse column database." }
    ],
    schema: "ClickHouse Table: traces (timestamp DateTime, trace_id UUID, span_id String, duration_ms Float64, service String, logs Map(String, String))"
  },
  'tenantmind-ai': {
    name: "TenantMind AI",
    tagline: "Multi-Tenant Enterprise RAG",
    github: "https://github.com/vishwajitvm/tenantmind-ai",
    tech: ["Python", "LangChain", "MongoDB", "Pinecone", "Gemini Pro"],
    challenges: "Preventing accidental context leaks across enterprise accounts. Resolved by enforcing strict multi-tenant authorization hooks at the query compilation layer, binding JWT company fields directly to dynamic Pinecone namespaces.",
    snippet: `from tenantmind.auth import get_tenant_namespace
from tenantmind.vector import query_vector_store

@app.post("/chat")
async def tenant_chat(prompt: str, user = Depends(get_current_user)):
    # Resolves namespace from encrypted user token
    namespace = get_tenant_namespace(user.company_id)
    
    docs = await query_vector_store(prompt, namespace=namespace)
    return generate_response(prompt, docs)`,
    flow: [
      { step: "Session Auth", desc: "User token identifies tenant corporate account scope." },
      { step: "Dynamic Namespace", desc: "Pinecone query retrieves vectors locked under corporate namespace key." },
      { step: "Context Extraction", desc: "Matching chunks are compiled into context parameters." },
      { step: "Secure Feed", desc: "Gemini synthesis returns secure response inside browser frame." }
    ],
    schema: "MongoDB Collections: users (company_id), documents (company_id, vector_reference_id, text)"
  },
  policybot: {
    name: "PolicyBot",
    tagline: "MCP Compliance Auditing Agent",
    github: "https://github.com/vishwajitvm/policybot",
    tech: ["Python", "Model Context Protocol", "SQLite", "LangChain"],
    challenges: "Scanning massive workspace repositories exceeded token budget guidelines. We optimized files scan actions by analyzing Git commit diff logs and indexing modified files first, decreasing LLM tokens by 80%.",
    snippet: `from policybot.mcp import MCPServer
from policybot.agent import ComplianceAgent

# Initializing custom MCP server tools
server = MCPServer(name="filesystem-auditor")

@server.tool
async def read_git_diff() -> str:
    return os.popen("git diff HEAD~1").read()`,
    flow: [
      { step: "Trigger Hook", desc: "Git action triggers agent on code merge request." },
      { step: "Diff Analysis", desc: "PolicyBot queries filesystem tools via Model Context Protocol." },
      { step: "Policy Audit", desc: "Agent parses AST (Abstract Syntax Tree) to check compliance guidelines." },
      { step: "Report Output", desc: "Compliance score is compiled and logged into SQLite ledger." }
    ],
    schema: "SQLite Schema: audit_runs (id INTEGER, commit_hash TEXT, rating TEXT, logs TEXT, created_at TIMESTAMP)"
  },
  tallyko: {
    name: "Tallyko Ledger",
    tagline: "Asynchronous Transaction Broker",
    github: "https://github.com/vishwajitvm/tallyko",
    tech: ["Go", "gRPC", "Redis", "PostgreSQL"],
    challenges: "Concurrency race conditions in double-entry bookkeeping ledgers. Solved by writing thread-safe Go worker rings protected by Redis distributed locks, ensuring wallets balances cannot slip into negative thresholds during concurrent checkouts.",
    snippet: `func (s *LedgerServer) Transfer(ctx context.Context, req *pb.TxPayload) (*pb.TxResponse, error) {
    // Acquire Redis mutex lock before writing balance sheet
    mutex := s.redis.NewMutex(req.WalletID)
    if err := mutex.Lock(); err != nil {
        return nil, status.Error(codes.Aborted, "lock failed")
    }
    defer mutex.Unlock()
    
    return s.db.ProcessTransaction(req)
}`,
    flow: [
      { step: "gRPC Payload", desc: "Transactional payload hits Go ledger endpoint." },
      { step: "Mutex Lock", desc: "Redis distributed locks wallet ID to isolate operation." },
      { step: "Balance Verify", desc: "System checks sender balance constraints inside DB." },
      { step: "Commit SQL", desc: "Double-entry records are written to PostgreSQL inside atomic transaction." }
    ],
    schema: "PostgreSQL: wallets (id SERIAL, balance NUMERIC), transactions (id SERIAL, from_wallet INTEGER, to_wallet INTEGER, amount NUMERIC)"
  },
  agenthive: {
    name: "AgentHive Platform",
    tagline: "Collaborative Multi-Agent Swarms Orchestrator",
    github: "https://github.com/vishwajitvm/AgentHive",
    tech: ["Next.js", "FastAPI", "pgvector", "Redis", "Celery"],
    challenges: "Agent messaging loop chains were exceeding prompt token size rules. Solved by formatting parameters into a compact key-value 'TOON' prompt configuration template instead of large raw JSON strings.",
    snippet: `from agenthive.prompts import compile_toon_prompt

# Compile lightweight key-value context prompt
prompt = compile_toon_prompt(
    agent_id="marketing-bot",
    context_data={"goals": "leads", "channel": "twitter"}
)`,
    flow: [
      { step: "Swarm Init", desc: "Dashboard boots agent threads." },
      { step: "Redis Queueing", desc: "Background task queue coordinates agent workflow tasks." },
      { step: "pgvector Indexing", desc: "Agent retrieves memory chunks from pgvector database." },
      { step: "Compact Output", desc: "Synthesis returned via space-optimized TOON tokens." }
    ],
    schema: "PostgreSQL Tables: agents (id SERIAL, name TEXT), memory_vectors (id SERIAL, agent_id INTEGER, embedding VECTOR(1536))"
  },
  'smart-hr-bot': {
    name: "Smart HR Bot",
    tagline: "AI Resume Evaluator & Interview Scheduler",
    github: "https://github.com/vishwajitvm/smart-hr-bot",
    tech: ["FastAPI", "React", "Google Gemini", "LangChain", "SQLite"],
    challenges: "Handling heavy PDF resume streams caused thread blockages. We engineered non-blocking PDF text parsers running inside background threads to separate log aggregation steps.",
    snippet: `from smarthr.parser import extract_pdf_data
from smarthr.ai import parse_resume_profile

@app.post("/upload")
async def upload_resume(file: UploadFile):
    text = await extract_pdf_data(file)
    profile = await parse_resume_profile(text)
    return {"status": "parsed", "profile": profile}`,
    flow: [
      { step: "PDF Upload", desc: "Candidate uploads PDF profile to FastAPI." },
      { step: "Gemini Parsing", desc: "System extracts structured user profile using Gemini model." },
      { step: "Criteria Score", desc: "LangChain chain evaluates resume metrics against criteria rubric." },
      { step: "Calendar Schedule", desc: "Automatic Google Calendar slot invite dispatched." }
    ],
    schema: "SQLite: candidates (id INTEGER, name TEXT, email TEXT, score FLOAT), interviews (id INTEGER, candidate_id INTEGER, scheduled_time TIMESTAMP)"
  }
};

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const project = projectDetails[slug];
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'code'>('architecture');

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-mono p-6">
        <div className="text-center">
          <h1 className="text-2xl text-red-500 mb-6">Project module not initialized</h1>
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors border-b border-zinc-400 text-sm">&lt; RETURN_TO_DASHBOARD</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] py-20 px-6 sm:px-12 font-mono">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-12">
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN_TO_SYSTEM_CONSOLE</span>
        </Link>

        {/* Hero Section */}
        <div className="border border-white/10 bg-white/2 rounded-2xl p-8 sm:p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs text-blue-400 tracking-widest uppercase font-semibold">Kernel Project Profile</span>
              <h1 className="text-4xl sm:text-5xl font-sans font-bold text-white tracking-tight mt-3">{project.name}</h1>
              <p className="text-zinc-300 text-base mt-4 leading-relaxed">{project.tagline}</p>
            </div>
            <a 
              href={project.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-zinc-200 text-sm hover:bg-white/10 hover:text-white transition-all cursor-pointer font-semibold"
            >
              <GithubIcon className="w-5 h-5" />
              <span>SOURCE_CODE</span>
            </a>
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border border-white/10 bg-white/2 rounded-xl">
            <span className="text-xs text-zinc-400 tracking-wider font-semibold uppercase block mb-3">PROJECT_SPECS</span>
            <div className="flex gap-2 flex-wrap">
              {project.tech.map((t: string) => (
                <span key={t} className="px-2.5 py-1 rounded border border-blue-500/20 bg-blue-500/5 text-xs text-blue-400 font-bold">{t}</span>
              ))}
            </div>
          </div>
          
          <div className="p-6 border border-white/10 bg-white/2 rounded-xl md:col-span-2">
            <span className="text-xs text-zinc-400 tracking-wider font-semibold uppercase block mb-3">ENGINEERING_CHALLENGE</span>
            <p className="text-sm text-zinc-300 leading-relaxed">{project.challenges}</p>
          </div>
        </div>

        {/* Interactive Spec explorer */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/2 mb-12">
          <div className="flex border-b border-white/10 bg-zinc-950/50 p-2">
            <button 
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold cursor-pointer ${activeTab === 'architecture' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Server className="w-4 h-4" />
              <span>SYSTEM_FLOW</span>
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold cursor-pointer ${activeTab === 'database' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Database className="w-4 h-4" />
              <span>DATABASE_SCHEMA</span>
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold cursor-pointer ${activeTab === 'code' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Settings className="w-4 h-4" />
              <span>CODE_SNIPPET</span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'architecture' && (
              <div className="flex flex-col gap-6">
                {project.flow.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full border border-blue-500/30 bg-blue-500/5 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">{idx + 1}</div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{item.step}</h4>
                      <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'database' && (
              <pre className="bg-zinc-950 p-6 rounded-lg border border-white/15 text-xs text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                {project.schema}
              </pre>
            )}

            {activeTab === 'code' && (
              <pre className="bg-zinc-950 p-6 rounded-lg border border-white/15 text-xs text-blue-400 leading-relaxed overflow-x-auto whitespace-pre font-mono">
                {project.snippet}
              </pre>
            )}
          </div>
        </div>

        {/* Video Placeholder */}
        <div className="border border-white/10 bg-white/2 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
          <div className="absolute inset-0 bg-zinc-950/50 flex flex-col items-center justify-center p-6">
            <div className="w-14 h-14 rounded-full border border-white/15 bg-white/5 flex items-center justify-center mb-4 text-white hover:scale-105 transition-transform cursor-pointer">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
            <h4 className="text-white text-base font-semibold">Video walk-through pending release</h4>
            <p className="text-zinc-400 text-xs mt-3 max-w-sm leading-relaxed">System components and logging streams are mock visualized under standard interactive screens.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
