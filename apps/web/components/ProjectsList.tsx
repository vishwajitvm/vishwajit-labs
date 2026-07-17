'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Cpu, Layers, ShieldCheck, Database } from 'lucide-react';

const projectsData = [
  {
    id: 'tracenest',
    name: 'TraceNest',
    tagline: 'Distributed Tracing & Telemetry Dashboard',
    description: 'Distributed tracing SDK and dashboard built for FastAPI and microservices. Tracks queries and request logs with near-zero overhead.',
    tech: ['Python', 'FastAPI', 'Redis', 'ClickHouse'],
    icon: Cpu,
    color: 'from-blue-500/20 via-cyan-500/10 to-transparent'
  },
  {
    id: 'tenantmind-ai',
    name: 'TenantMind AI',
    tagline: 'Multi-Tenant Enterprise RAG Platform',
    description: 'RAG platform with strict document and vector tenant isolation, supporting custom pipelines and model routing.',
    tech: ['Python', 'LangChain', 'MongoDB', 'Pinecone'],
    icon: Layers,
    color: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  },
  {
    id: 'policybot',
    name: 'PolicyBot',
    tagline: 'Compliance Auditing Agent with MCP',
    description: 'An AI-powered filesystem and compliance verification agent utilizing Model Context Protocol to execute real-time code checks.',
    tech: ['Python', 'MCP', 'LangChain', 'SQLite'],
    icon: ShieldCheck,
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    id: 'tallyko',
    name: 'Tallyko',
    tagline: 'High-Performance Event Ledger Broker',
    description: 'Go-based thread-safe balance transactional ledger using Redis locks to secure heavy ledger operations.',
    tech: ['Go', 'Redis', 'PostgreSQL', 'gRPC'],
    icon: Database,
    color: 'from-amber-500/20 via-orange-500/10 to-transparent'
  }
];

export default function ProjectsList() {
  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="flex flex-col mb-16">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase mb-3">01 // PRODUCTION_SYSTEMS</span>
        <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
          Active Infrastructure & AI Projects
        </h2>
        <p className="text-zinc-500 font-mono text-xs mt-3 max-w-lg">
          Click any module to inspect its system design specs, schema diagrams, and interactive dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projectsData.map((project, index) => {
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
              {/* Background gradient glow */}
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

                  <span className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase">{project.tagline}</span>
                  <h3 className="text-xl font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                  <p className="text-zinc-400 text-xs mt-4 leading-relaxed font-mono">{project.description}</p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span 
                      key={t}
                      className="px-2 py-0.5 border border-white/5 bg-white/2 rounded text-[9px] font-mono text-zinc-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Cover Link for whole card */}
                <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0 cursor-pointer" aria-label={`View ${project.name}`} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
