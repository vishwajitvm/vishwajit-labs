'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Cpu, Layers, ShieldCheck, Database, Bot, Users } from 'lucide-react';

const mainProjects = [
  {
    id: 'tracenest',
    name: 'TraceNest',
    tagline: 'Distributed Tracing & Logging SDK',
    description: 'Developer-first logging infrastructure served from FastAPI apps. Automatically handles log rotation and retention limits with zero setup overhead.',
    tech: ['Python', 'FastAPI', 'OpenTelemetry', 'Uvicorn'],
    icon: Cpu,
    color: 'from-blue-500/20 via-cyan-500/10 to-transparent'
  },
  {
    id: 'tenantmind-ai',
    name: 'TenantMind AI',
    tagline: 'Multi-Tenant Enterprise Property RAG',
    description: 'Intelligent property management platform with tenant-isolated MongoDB queries and Qdrant semantic vectors segmentation via Keycloak JWT scopes.',
    tech: ['Python', 'FastAPI', 'MongoDB', 'Qdrant', 'Keycloak'],
    icon: Layers,
    color: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  },
  {
    id: 'policybot',
    name: 'PolicyBot',
    tagline: 'MCP Compliance Auditing Agent',
    description: 'Continuous compliance audit agent querying codebase repositories using Model Context Protocol (MCP) filesystem tools, saving tokens via Git diff filters.',
    tech: ['Python', 'MCP', 'LangChain', 'Qdrant', 'SQLite'],
    icon: ShieldCheck,
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    id: 'tallyko',
    name: 'Tallyko POS',
    tagline: 'Multi-Tenant Restaurant POS Platform',
    description: 'High-performance multi-vendor restaurant Point-of-Sale SaaS using PostgreSQL Row-Level Security, Redis cache brokers, and MinIO object storage.',
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Traefik'],
    icon: Database,
    color: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  {
    id: 'agenthive',
    name: 'AgentHive',
    tagline: 'Multi-Agent Deploy & Monitor Swarm',
    description: 'Docker-first collaborative AI agents controller. Tracks token usage, coordinates background Celery tasks, and limits prompt context size using compact TOON schemas.',
    tech: ['Next.js', 'FastAPI', 'pgvector', 'Redis', 'Celery'],
    icon: Bot,
    color: 'from-pink-500/20 via-rose-500/10 to-transparent'
  },
  {
    id: 'smart-hr-bot',
    name: 'Smart HR Bot',
    tagline: 'AI Recruitment & Interview Scheduler',
    description: 'Recruitment assistant parsing PDF resumes into profiles, triggering candidate interview simulation chats, and scheduling calendar slots automatically.',
    tech: ['FastAPI', 'React', 'Google Gemini', 'LangChain', 'SQLite'],
    icon: Users,
    color: 'from-violet-500/20 via-fuchsia-500/10 to-transparent'
  }
];

const secondaryProjects = [
  {
    name: 'YouTube AI ChatBot',
    description: 'RAG system chunking and searching YouTube video transcripts at precise timestamps using Chroma DB.',
    tech: ['Python', 'Chroma DB', 'Gemini API']
  },
  {
    name: 'Healthcare Management System',
    description: 'Secure records registry and appointment scheduler featuring field-level database encryption profiles.',
    tech: ['Python', 'Django', 'PostgreSQL']
  },
  {
    name: 'Unicorn Stock Inventory',
    description: 'Equipment quotations catalog search engine and inventory tracker mapped with Laravel Redis caches.',
    tech: ['PHP', 'Laravel', 'MySQL']
  }
];

export default function ProjectsList() {
  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-3">01 // PRODUCTION_SYSTEMS</span>
        <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white">
          Active Infrastructure & AI Systems
        </h2>
        <p className="text-zinc-400 font-mono text-sm mt-4 max-w-xl leading-relaxed">
          Click any running module to inspect its live system design schemas, database relationships, and configurations.
        </p>
      </div>

      {/* Main projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {mainProjects.map((project, index) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative glow-card h-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-30 transition-opacity duration-500 group-hover:opacity-60`} />

              <div className="relative p-8 flex flex-col justify-between h-full z-10">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-zinc-100 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="p-2 rounded-full border border-white/5 bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 cursor-pointer"
                      id={`project-link-${project.id}`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </Link>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase font-semibold">{project.tagline}</span>
                  <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                  <p className="text-zinc-300 text-sm mt-4 leading-relaxed font-mono">{project.description}</p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span 
                      key={t}
                      className="px-2.5 py-1 border border-white/10 bg-white/5 rounded text-xs font-mono text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0 cursor-pointer" aria-label={`View ${project.name}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary projects index */}
      <div className="border border-white/5 bg-white/2 rounded-2xl p-8 sm:p-12">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider font-mono">Other Open Source Repositories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryProjects.map((repo) => (
            <div key={repo.name} className="p-6 border border-white/5 bg-zinc-950/40 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-white text-base font-bold font-sans">{repo.name}</h4>
                <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-mono">{repo.description}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {repo.tech.map((t) => (
                  <span key={t} className="px-2 py-0.5 border border-white/5 bg-white/2 rounded text-[10px] font-mono text-zinc-500">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
