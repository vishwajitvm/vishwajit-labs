'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Brain, Server, Database, Cloud } from 'lucide-react';

const skillCategories = [
  {
    id: 'languages',
    label: 'Programming Languages',
    icon: Code,
    skills: [
      { name: 'Python', level: '95%', desc: 'Advanced concurrency, asyncio, decorators, packaging, and profiling.' },
      { name: 'TypeScript / JavaScript', level: '90%', desc: 'Modern ES6+, Next.js, React context, and state managers.' },
      { name: 'PHP', level: '85%', desc: 'Laravel MVC frameworks, request lifecycles, and database ORMs.' },
      { name: 'SQL', level: '90%', desc: 'Complex joins, indexing, query planning, and RLS constraint rules.' }
    ]
  },
  {
    id: 'ai_llm',
    label: 'AI / LLM Engineering',
    icon: Brain,
    skills: [
      { name: 'Retrieval-Augmented Generation (RAG)', level: '95%', desc: 'Dynamic vector indexing, metadata namespaces filtering, and citations scoring.' },
      { name: 'LangChain & LangGraph', level: '90%', desc: 'Agentic state graphs, checkpointing engines, and multi-agent loops.' },
      { name: 'Multi-Provider LLM Routing', level: '90%', desc: 'Automatic fallbacks, latency logging, and cost routing across Gemini/OpenAI/Ollama.' },
      { name: 'AI Agents & MCP', level: '95%', desc: 'Model Context Protocol server configurations linking system tools safely.' }
    ]
  },
  {
    id: 'backend',
    label: 'Backend Development',
    icon: Server,
    skills: [
      { name: 'FastAPI', level: '95%', desc: 'Async REST endpoints, Pydantic validation schemas, and custom dependencies.' },
      { name: 'Celery & Redis Workers', level: '90%', desc: 'Background queue task brokers, job caching, and sliding-window rate limiters.' },
      { name: 'Node.js & Express.js', level: '85%', desc: 'REST API architectures, middleware structures, and authentication layers.' },
      { name: 'Laravel (PHP)', level: '85%', desc: 'Multi-stage database migrations, console scheduling commands, and secure routes.' }
    ]
  },
  {
    id: 'databases',
    label: 'Databases & Vector Stores',
    icon: Database,
    skills: [
      { name: 'PostgreSQL & pgvector', level: '90%', desc: 'High-performance relational transactions and vector embeddings similarity search.' },
      { name: 'Qdrant & MongoDB', level: '95%', desc: 'Multi-tenant collections isolation, schema designs, and high-dimension semantic indexes.' },
      { name: 'Redis Cache', level: '90%', desc: 'In-memory key-value data structures, session stores, and distributed mutex locking.' }
    ]
  },
  {
    id: 'devops',
    label: 'DevOps, Security & Cloud',
    icon: Cloud,
    skills: [
      { name: 'Docker & Docker Compose', level: '95%', desc: 'Multi-stage builds, alpine runtime minimization, and isolated staging configs.' },
      { name: 'OAuth / OIDC (Keycloak)', level: '90%', desc: 'Authentication brokers, JSON Web Token validation, and Role-Based Access Control (RBAC).' },
      { name: 'Nginx & Traefik', level: '90%', desc: 'Reverse proxies, routing rules, SSL termination, and rate limit implementations.' },
      { name: 'Observability & CI/CD', level: '85%', desc: 'Prometheus, Grafana, Loki tracking, and GitHub Actions deploy pipelines.' }
    ]
  }
];

export default function SkillsGraph() {
  const [activeCategory, setActiveCategory] = useState('languages');
  const [hoveredSkill, setHoveredSkill] = useState<{ name: string; desc: string } | null>(null);

  const selectedCategory = skillCategories.find(cat => cat.id === activeCategory) || skillCategories[0];
  const CategoryIcon = selectedCategory.icon;

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-3">02 // TECHNICAL_SKILLS</span>
        <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white">
          Technical Capabilities Matrix
        </h2>
        <p className="text-zinc-400 font-mono text-sm mt-4 max-w-xl leading-relaxed">
          Select a category sub-system to explore specific skills parameters, competencies, and system integration details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Category Selector Tabs */}
        <div className="flex flex-col gap-3">
          {skillCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setHoveredSkill(null);
                }}
                className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-500/30 bg-blue-500/5 text-white'
                    : 'border-white/5 bg-white/2 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                }`}
              >
                <div className={`p-2.5 rounded-lg border ${
                  isActive ? 'border-blue-500/30 text-blue-400' : 'border-white/5 text-zinc-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-sans">{category.label}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Node Status: Online</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Skill Level Bars */}
        <div className="lg:col-span-2 border border-white/10 bg-white/2 p-8 rounded-2xl min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400">
                <CategoryIcon className="w-6 h-6" />
              </div>
              <h3 className="text-white text-lg font-bold font-sans">{selectedCategory.label}</h3>
            </div>

            <div className="flex flex-col gap-6">
              {selectedCategory.skills.map((skill) => (
                <div 
                  key={skill.name}
                  onMouseEnter={() => setHoveredSkill({ name: skill.name, desc: skill.desc })}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="group flex flex-col gap-2 cursor-help"
                >
                  <div className="flex justify-between items-center text-sm font-mono text-zinc-300 group-hover:text-white transition-colors">
                    <span>{skill.name}</span>
                    <span className="text-blue-400 font-bold">{skill.level}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: skill.level }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Console Panel */}
          <div className="mt-8 p-6 border border-white/5 bg-zinc-950/60 rounded-xl min-h-[100px] flex flex-col justify-center font-mono">
            {hoveredSkill ? (
              <div>
                <span className="text-xs text-blue-400 font-bold uppercase block mb-1">SPEC_EXPLORER // {hoveredSkill.name}</span>
                <p className="text-zinc-300 text-sm leading-relaxed mt-2">{hoveredSkill.desc}</p>
              </div>
            ) : (
              <p className="text-zinc-500 text-xs text-center">[Hover over any capability line to inspect technical system specifications]</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
