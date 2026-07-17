'use client';

import { useState } from 'react';
import { ArrowRight, Server, Database, Brain, RefreshCw, Layers } from 'lucide-react';

const archData = [
  {
    id: 'nginx',
    name: 'Reverse Proxy',
    tech: 'Nginx Container',
    stats: 'Uptime: 99.9% | active conns: 42',
    logs: [
      'nginx: [info] 192.168.1.5 - GET /api/github/stats HTTP/1.1 (200 OK)',
      'nginx: [info] 127.0.0.1 - POST /api/contact HTTP/1.1 (201 Created)',
      'nginx: [info] 192.168.1.12 - GET /api/chat/stream HTTP/1.1 (SSE Active)'
    ]
  },
  {
    id: 'api',
    name: 'API Service Engine',
    tech: 'FastAPI (Python Async)',
    stats: 'Worker threads: 4 | Average latency: 24ms',
    logs: [
      'fastapi: [info] Processing github stats request from caching router.',
      'fastapi: [info] Contact schema verification passed (Pydantic).',
      'fastapi: [info] Spawning GenerativeModel thread pool for VISH AI stream.'
    ]
  },
  {
    id: 'cache',
    name: 'Caching Layer',
    tech: 'Redis (In-Memory Key/Value)',
    stats: 'Hits: 884 | Misses: 24 (97.3% ratio)',
    logs: [
      'redis: [info] Cache HIT for key "github:stats". Returned immediately.',
      'redis: [info] Cache MISS for key "pypi:stats". Querying PyPI API...',
      'redis: [info] Rate limit token refreshed for Client-IP.'
    ]
  },
  {
    id: 'db',
    name: 'Primary Database',
    tech: 'MongoDB Atlas (NoSQL)',
    stats: 'Active connection pool: 8 | Writes: 420',
    logs: [
      'mongodb: [info] Inserted document into "visitors" logs collection.',
      'mongodb: [info] Inserted message ID: 64b8d7ef23... (contact form).',
      'mongodb: [info] Quered analytics collections for page statistics.'
    ]
  },
  {
    id: 'gemini',
    name: 'AI Agent Service',
    tech: 'Gemini Pro / Flash SDK',
    stats: 'Context tokens limit: 1M | model version: 1.5',
    logs: [
      'gemini: [info] Synthesizing response utilizing vector context inputs.',
      'gemini: [info] Running system safety settings checks.',
      'gemini: [info] Pushing text response chunk stream to API.'
    ]
  }
];

export default function ArchitectureExplorer() {
  const [selectedBlock, setSelectedBlock] = useState<string>('api');

  const activeBlock = archData.find((b) => b.id === selectedBlock) || archData[0];

  return (
    <section id="architecture" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase mb-3">04 // KERNEL_FLOWS</span>
        <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
          System Architecture Explorer
        </h2>
        <p className="text-zinc-500 text-xs mt-3 max-w-lg">
          Click on any architectural pipeline segment to inspect its running metrics and console output.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Visual Map */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center p-8 border border-white/5 bg-white/2 rounded-2xl min-h-[300px]">
          {/* Nginx Block */}
          <button 
            onClick={() => setSelectedBlock('nginx')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border w-36 h-28 transition-all cursor-pointer ${selectedBlock === 'nginx' ? 'border-blue-500 bg-blue-500/5 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-[#09090b] text-zinc-400 hover:border-zinc-700'}`}
          >
            <Server className="w-5 h-5 mb-2" />
            <span className="text-[11px] font-bold text-center">Nginx Proxy</span>
          </button>
          
          <ArrowRight className="text-zinc-700 w-5 h-5 hidden sm:block rotate-90 sm:rotate-0" />

          {/* API Block */}
          <button 
            onClick={() => setSelectedBlock('api')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border w-36 h-28 transition-all cursor-pointer ${selectedBlock === 'api' ? 'border-blue-500 bg-blue-500/5 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-[#09090b] text-zinc-400 hover:border-zinc-700'}`}
          >
            <Layers className="w-5 h-5 mb-2" />
            <span className="text-[11px] font-bold text-center">FastAPI Engine</span>
          </button>

          <ArrowRight className="text-zinc-700 w-5 h-5 hidden sm:block rotate-90 sm:rotate-0" />

          <div className="flex flex-col gap-4">
            {/* Redis Block */}
            <button 
              onClick={() => setSelectedBlock('cache')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border w-36 h-20 transition-all cursor-pointer ${selectedBlock === 'cache' ? 'border-blue-500 bg-blue-500/5 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-[#09090b] text-zinc-400 hover:border-zinc-700'}`}
            >
              <RefreshCw className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-bold text-center">Redis Cache</span>
            </button>

            {/* MongoDB Block */}
            <button 
              onClick={() => setSelectedBlock('db')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border w-36 h-20 transition-all cursor-pointer ${selectedBlock === 'db' ? 'border-blue-500 bg-blue-500/5 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-[#09090b] text-zinc-400 hover:border-zinc-700'}`}
            >
              <Database className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-bold text-center">MongoDB Atlas</span>
            </button>

            {/* Gemini Block */}
            <button 
              onClick={() => setSelectedBlock('gemini')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border w-36 h-20 transition-all cursor-pointer ${selectedBlock === 'gemini' ? 'border-blue-500 bg-blue-500/5 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-[#09090b] text-zinc-400 hover:border-zinc-700'}`}
            >
              <Brain className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-bold text-center">Gemini AI</span>
            </button>
          </div>
        </div>

        {/* Live Terminal Log Viewer */}
        <div className="flex flex-col border border-white/10 bg-zinc-950 rounded-2xl h-[300px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-zinc-900/50">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">{activeBlock.name} Status</span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase block mb-1">Specs: {activeBlock.tech}</span>
              <span className="text-[10px] text-blue-400 block mb-4">{activeBlock.stats}</span>
              <div className="h-px bg-white/5 my-2"></div>
              <span className="text-[9px] text-zinc-500 block mb-2">Live Console Stream:</span>
              <div className="flex flex-col gap-2 font-mono text-[9px] text-zinc-400">
                {activeBlock.logs.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap select-all">
                    {log}
                  </div>
                ))}
              </div>
            </div>
            <span className="text-[8px] text-zinc-600 block text-right font-mono">[Status: Running]</span>
          </div>
        </div>
      </div>
    </section>
  );
}
