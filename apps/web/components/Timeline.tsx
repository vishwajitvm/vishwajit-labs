'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Code, Server, Brain, GitPullRequest, Box, ChevronRight, Zap } from 'lucide-react';

const timelineData = [
  {
    id: 'school',
    icon: GraduationCap,
    label: 'Academic Foundation',
    title: 'Computer Science Core',
    desc: 'Learned memory models, operating system concepts, computer networks, and object-oriented architectures.',
    details: 'Graduated with high honors, mastering algorithms design and relational databases SQL fundamentals.'
  },
  {
    id: 'python',
    icon: Code,
    label: 'Python Specialization',
    title: 'Advanced Scripting & Concurrency',
    desc: 'Mastered standard libraries, asynchronous frameworks (asyncio), decorators, generators, and packaging.',
    details: 'Wrote high-speed logs scrapers, CLI packages, and built tools optimizing complex batch operations.'
  },
  {
    id: 'backend',
    icon: Server,
    label: 'Backend Engineering',
    title: 'API Architectures & Databases',
    desc: 'Architected async FastAPI, Django services, worked with MongoDB Atlas, Redis Caches, and microservices dockerization.',
    details: 'Built highly-scalable systems serving transactional REST services with strict CORS constraints and JSON token validations.'
  },
  {
    id: 'ai',
    icon: Brain,
    label: 'AI & Agent Systems',
    title: 'RAG & Custom Agents',
    desc: 'Engineered complex multi-tenant RAG systems, vector embeddings search, semantic indexing, and model context protocol integrations.',
    details: 'Orchestrated Google Gemini models pipelines, injecting strict context filters to isolate multi-tenant vector clusters.'
  },
  {
    id: 'open-source',
    icon: GitPullRequest,
    label: 'Open Source',
    title: 'Collaborative Code & Developer Tools',
    desc: 'Created modules, SDK packages, custom caching proxies, and contribution utilities.',
    details: 'Contributed directly to dev infrastructure libraries, improving API parsing speeds and testing suite coverages.'
  },
  {
    id: 'sdk',
    icon: Box,
    label: 'SDK & Package Authoring',
    title: 'Telemetry & Auth Tooling',
    desc: 'Wrote pip-installable tracing modules, session validation middlewares, and local testing configurations.',
    details: 'Developed custom frameworks helping developer teams register systems logs with minimal configuration imports.'
  },
  {
    id: 'current',
    icon: Zap,
    label: 'Present State',
    title: 'System Designer & AI Integrator',
    desc: 'Orchestrating production workflows, setting up Docker Compose staging networks, and testing agent pipelines.',
    details: 'Actively designing high-performance proxies and developer-facing APIs.'
  }
];

export default function Timeline() {
  const [selectedNode, setSelectedNode] = useState<string | null>('current');

  return (
    <section id="timeline" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase mb-3">02 // TIMELINE_KERNELS</span>
        <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
          Architectural Engineering Roadmap
        </h2>
        <p className="text-zinc-500 text-xs mt-3 max-w-lg">
          Click any checkpoint in the execution path to inspect details of my engineering journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* SVG/Roadmap Layout */}
        <div className="lg:col-span-2 flex flex-col gap-4 relative pl-8 border-l border-white/10 py-2">
          {timelineData.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`relative flex items-center justify-between w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500/30 bg-blue-500/5 text-white' 
                    : 'border-white/5 bg-white/2 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                }`}
              >
                {/* Connecting Circle Anchor on left border */}
                <div className={`absolute -left-[38px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  isSelected 
                    ? 'border-blue-500 bg-[#030303] scale-110' 
                    : 'border-zinc-700 bg-[#030303]'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>

                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg border ${
                    isSelected ? 'border-blue-500/30 text-blue-400' : 'border-white/5 text-zinc-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{node.label}</span>
                    <h3 className="text-xs font-bold mt-0.5">{node.title}</h3>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card */}
        <div className="sticky top-28 p-8 border border-white/5 bg-zinc-950/60 backdrop-blur-md rounded-2xl min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const node = timelineData.find((n) => n.id === selectedNode);
                  if (!node) return null;
                  const Icon = node.icon;
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[9px] text-blue-400 tracking-wider uppercase font-semibold">Node Status: Active</span>
                          <h4 className="text-white text-sm font-bold mt-1">{node.title}</h4>
                        </div>
                      </div>

                      <div className="h-px bg-white/5 my-6"></div>

                      <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-mono">
                        {node.desc}
                      </p>

                      <div className="p-4 rounded-lg bg-white/2 border border-white/5 text-[10px] text-zinc-500 leading-relaxed">
                        <span className="text-white font-bold block mb-1">SYSTEM_RECORDS:</span>
                        {node.details}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
