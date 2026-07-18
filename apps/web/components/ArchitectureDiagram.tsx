'use client';

import React from 'react';
import { ArrowRight, Server, Database, Cpu, ShieldAlert, Zap, Globe, Layers, Eye, Activity } from 'lucide-react';

interface DiagramProps {
  slug: string;
}

export default function ArchitectureDiagram({ slug }: DiagramProps) {
  if (slug === 'tracenest') {
    return (
      <div className="border border-white/10 bg-zinc-950 p-8 rounded-xl flex flex-col gap-6">
        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2 font-mono">// System Architecture Flow Diagram</h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-center w-full md:w-44 shrink-0">
            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-bold block">FastAPI Server</span>
            <span className="text-zinc-400 text-[10px]">App Event Loop</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0" />

          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center w-full md:w-48 shrink-0 relative">
            <ShieldAlert className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-bold block">TraceNest SDK</span>
            <span className="text-purple-300 text-[9px] block">PII Redactor</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0" />

          <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-center w-full md:w-48 shrink-0">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Async I/O Queue</span>
            <span className="text-zinc-400 text-[10px]">Non-Blocking Thread</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0" />

          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center w-full md:w-44 shrink-0">
            <Database className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Local Disk Files</span>
            <span className="text-zinc-400 text-[10px]">Size Rotating File</span>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-start gap-4 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold">Log-Viewer Stream UI Path:</span>
          <div className="flex items-center gap-2">
            <span>GET /tracenest/stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-emerald-400">Server-Sent Events (SSE)</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Interactive Stream Dashboard UI</span>
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'tenantmind-ai') {
    return (
      <div className="border border-white/10 bg-zinc-950 p-8 rounded-xl flex flex-col gap-6">
        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2 font-mono">// Multi-Tenant RAG Architecture Flow</h4>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-center w-full lg:w-44 shrink-0">
            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Next.js Client</span>
            <span className="text-zinc-400 text-[10px]">OIDC Auth Token</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-center w-full lg:w-48 shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Keycloak Gateway</span>
            <span className="text-zinc-400 text-[10px]">Tenant Scope Resolver</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center w-full lg:w-48 shrink-0">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-bold block">FastAPI Server</span>
            <span className="text-purple-300 text-[9px] block">RAG Query Router</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="flex flex-col gap-2 w-full lg:w-48 shrink-0">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
              <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[11px]">Qdrant Vector DB</span>
              <span className="text-zinc-500 text-[9px]">Isolated Namespaces</span>
            </div>
            <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-center">
              <Database className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[11px]">MongoDB Store</span>
              <span className="text-zinc-500 text-[9px]">Encrypted Tenant DB</span>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-start gap-4 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold">Celery Workers Pipeline:</span>
          <div className="flex items-center gap-2">
            <span>PDF Upload</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Redis Task Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-yellow-400 font-bold">Celery Ingestion Worker</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Qdrant Embeddings</span>
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'policybot') {
    return (
      <div className="border border-white/10 bg-zinc-950 p-8 rounded-xl flex flex-col gap-6">
        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2 font-mono">// MCP Code Compliance Audit Pipeline</h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-center w-full md:w-44 shrink-0">
            <Layers className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Developer Workspace</span>
            <span className="text-zinc-400 text-[10px]">Git Diff Commit Hook</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0" />

          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center w-full md:w-48 shrink-0">
            <Server className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Local MCP Server</span>
            <span className="text-zinc-400 text-[10px]">Secure Host Tools API</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0" />

          <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-center w-full md:w-48 shrink-0">
            <Cpu className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <span className="text-white font-bold block">LangChain Agent</span>
            <span className="text-zinc-400 text-[10px]">Syntax AST Evaluator</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0" />

          <div className="flex flex-col gap-2 w-full md:w-44 shrink-0">
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
              <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[10px]">Qdrant DB</span>
              <span className="text-zinc-500 text-[8px]">Rules Embeddings</span>
            </div>
            <div className="p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-center">
              <Database className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[10px]">SQLite Store</span>
              <span className="text-zinc-500 text-[8px]">Audit History Log</span>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold block mb-1">AST Analysis Engine Flow:</span>
          <span>PolicyBot registers the AST parser as a local tool. The agent evaluates the AST representation of code updates, matching nodes against prohibited imports or unauthenticated route mappings retrieved from Qdrant.</span>
        </div>
      </div>
    );
  }

  if (slug === 'tallyko') {
    return (
      <div className="border border-white/10 bg-zinc-950 p-8 rounded-xl flex flex-col gap-6">
        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2 font-mono">// Multi-Tenant POS Concurrency Ledger Flow</h4>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-center w-full lg:w-44 shrink-0">
            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-bold block">React Native client</span>
            <span className="text-zinc-400 text-[10px]">Offline POS registers</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center w-full lg:w-48 shrink-0">
            <Server className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Traefik Proxy SSL</span>
            <span className="text-zinc-400 text-[10px]">Subdomain Scope Router</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-center w-full lg:w-48 shrink-0">
            <Zap className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Redis Mutex Lock</span>
            <span className="text-zinc-400 text-[10px]">Checkout Wallet Mutex</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center w-full lg:w-44 shrink-0">
            <Database className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <span className="text-white font-bold block">PostgreSQL RLS</span>
            <span className="text-zinc-400 text-[10px]">Row-Level Security DB</span>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold block mb-1">Double-Entry Verification Lifecycle:</span>
          <span>When an order checkout commits, the Go service obtains a Redis mutex lock on the active store wallet. Once locked, it queries PostgreSQL which automatically filters visibility parameters under database level RLS configurations, logging atomic debit/credit values.</span>
        </div>
      </div>
    );
  }

  if (slug === 'agenthive') {
    return (
      <div className="border border-white/10 bg-zinc-950 p-8 rounded-xl flex flex-col gap-6">
        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2 font-mono">// Multi-Agent Orchestration Swarm Topology</h4>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-center w-full lg:w-44 shrink-0">
            <Layers className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Next.js Web UI</span>
            <span className="text-zinc-400 text-[10px]">Swarm Monitoring Console</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center w-full lg:w-48 shrink-0">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-bold block">FastAPI swarm API</span>
            <span className="text-zinc-400 text-[10px]">TOON Prompt Compactor</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-center w-full lg:w-48 shrink-0">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <span className="text-white font-bold block">Redis & Celery Queue</span>
            <span className="text-zinc-400 text-[10px]">Multi-Agent Run Workers</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="flex flex-col gap-2 w-full lg:w-44 shrink-0">
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
              <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[10px]">Postgres / pgvector</span>
              <span className="text-zinc-500 text-[8px]">Agent Memories</span>
            </div>
            <div className="p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-center">
              <Cpu className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[10px]">LLM Routing API</span>
              <span className="text-zinc-500 text-[8px]">Ollama / Gemini Hub</span>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold block mb-1">TOON Protocol Cost Savings:</span>
          <span>To minimize API invoice overhead, agent prompt states are mapped to Token-Optimized Object Notation (TOON) models inside background worker instances, reducing redundant string frames before dispatch.</span>
        </div>
      </div>
    );
  }

  if (slug === 'smart-hr-bot') {
    return (
      <div className="border border-white/10 bg-zinc-950 p-8 rounded-xl flex flex-col gap-6">
        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-2 font-mono">// AI Recruitment & Stateful Screening Loop</h4>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-center w-full lg:w-44 shrink-0">
            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-bold block">React Frontend</span>
            <span className="text-zinc-400 text-[10px]">Resume File Upload</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center w-full lg:w-48 shrink-0">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <span className="text-white font-bold block">FastAPI Parser</span>
            <span className="text-zinc-400 text-[10px]">Gemini Resume JSON Extractor</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-center w-full lg:w-48 shrink-0">
            <Activity className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <span className="text-white font-bold block">LangGraph Controller</span>
            <span className="text-zinc-400 text-[10px]">Stateful Interview Machine</span>
          </div>

          <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 lg:rotate-0" />

          <div className="flex flex-col gap-2 w-full lg:w-44 shrink-0">
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
              <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[10px]">SQLite Database</span>
              <span className="text-zinc-500 text-[8px]">Candidate Scores Log</span>
            </div>
            <div className="p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-center">
              <Layers className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-white font-bold block text-[10px]">Google Calendar</span>
              <span className="text-zinc-500 text-[8px]">Scheduler Integration</span>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 text-xs font-mono text-zinc-400">
          <span className="text-white font-bold block mb-1">Stateful Screening Lifecycle:</span>
          <span>LangGraph checkpoints candidates' conversational answers. Once the interview node finishes, the grading evaluation rubric generates qualification reports and maps follow-up meeting slots to calendar API schedules.</span>
        </div>
      </div>
    );
  }

  return null;
}
