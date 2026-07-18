'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Cpu, Database, Server, Settings, Play, ShieldAlert, CheckCircle, 
  Info, HelpCircle, Code as CodeIcon, Zap, ShieldCheck, Activity, 
  Terminal as TermIcon, FileText, Layers, Brain 
} from 'lucide-react';
import { useState } from 'react';
import { GithubIcon } from '@/components/icons/BrandIcons';
import { projectsData } from '@/data/projectsData';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';

// Icon mapping dictionary
const iconMap: Record<string, any> = {
  code: CodeIcon,
  cpu: Cpu,
  database: Database,
  server: Server,
  settings: Settings,
  play: Play,
  shield: ShieldCheck,
  zap: Zap,
  activity: Activity,
  terminal: TermIcon,
  file: FileText,
  layers: Layers,
  brain: Brain
};

type TabType = 'overview' | 'architecture' | 'tech' | 'features' | 'security' | 'api' | 'config';

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const project = projectsData[slug];
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-mono p-6">
        <div className="text-center">
          <h1 className="text-3xl text-red-500 mb-6 font-sans font-bold">Project Spec Module Not Found</h1>
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors border-b border-zinc-400 text-sm font-mono">&lt; RETURN_TO_SYSTEM_CONSOLE</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] py-20 px-4 sm:px-12 font-mono">
      <div className="max-w-6xl mx-auto">
        
        {/* Return Button */}
        <Link href="/" className="inline-flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors text-sm mb-12">
          <ArrowLeft className="w-5 h-5" />
          <span>RETURN_TO_SYSTEM_CONSOLE</span>
        </Link>

        {/* Hero Card */}
        <div className="border border-white/10 bg-white/2 rounded-2xl p-8 sm:p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs text-blue-400 tracking-widest uppercase font-semibold block mb-3">System Specifications File</span>
              <h1 className="text-4xl sm:text-5xl font-sans font-bold text-white tracking-tight leading-tight">{project.name}</h1>
              <p className="text-zinc-300 text-base mt-4 leading-relaxed max-w-2xl">{project.tagline}</p>
            </div>
            <a 
              href={project.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 bg-white/5 text-zinc-200 text-sm hover:bg-white/10 hover:text-white transition-all cursor-pointer font-bold shrink-0"
            >
              <GithubIcon className="w-5 h-5" />
              <span>SOURCE_CODE</span>
            </a>
          </div>
        </div>

        {/* 7-Tab Navigation Grid */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 bg-zinc-950/40 p-2 rounded-xl mb-12">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span>OVERVIEW</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'architecture' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>ARCHITECTURE & DIAGRAM</span>
          </button>

          <button 
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tech' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4 text-yellow-400" />
            <span>TECH STACK & WHY</span>
          </button>

          <button 
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'features' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>FEATURES & LOGS</span>
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>SECURITY & PERF</span>
          </button>

          <button 
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'api' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span>APIs & SCHEMAS</span>
          </button>

          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'config' ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-zinc-300" />
            <span>CONFIGS & RUN</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
              <div className="p-8 border border-white/10 bg-white/2 rounded-2xl flex flex-col gap-5">
                <div className="flex items-center gap-2.5 text-blue-400">
                  <Info className="w-5.5 h-5.5" />
                  <span className="text-sm uppercase font-bold tracking-wider">Introduction</span>
                </div>
                <p className="text-zinc-200 text-sm leading-relaxed font-sans">{project.intro}</p>
                <p className="text-zinc-200 text-sm leading-relaxed border-t border-white/10 pt-5 mt-2 font-sans">
                  <strong className="text-white block mb-2 uppercase text-xs tracking-wider">Project Overview:</strong>
                  {project.overview}
                </p>
              </div>

              <div className="p-8 border border-white/10 bg-white/2 rounded-2xl flex flex-col gap-5">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <HelpCircle className="w-5.5 h-5.5" />
                  <span className="text-sm uppercase font-bold tracking-wider">Core Concept</span>
                </div>
                <p className="text-zinc-200 text-sm leading-relaxed font-sans">{project.coreConcept}</p>
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-zinc-400 mt-2 leading-relaxed">
                  <strong className="text-white block mb-2 uppercase tracking-widest">Architect Design Philosophy:</strong>
                  This system is designed with a focus on local-first operational autonomy, strict multi-tenant isolation barriers, and minimizing computing overhead.
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM ARCHITECTURE & DIAGRAM */}
          {activeTab === 'architecture' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-5.5 h-5.5 text-purple-400" />
                  <span>System Architecture Spec</span>
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed font-sans mb-8">{project.architecture}</p>
                
                {/* Visual SVG block diagrams */}
                <ArchitectureDiagram slug={slug} />
              </div>

              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6">Interactive Request Lifecycle Sequence</h3>
                <div className="flex flex-col gap-6">
                  {project.flow.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full border border-blue-500/30 bg-blue-500/5 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">{idx + 1}</div>
                      <div>
                        <h4 className="text-white text-base font-bold font-sans">{item.step}</h4>
                        <p className="text-zinc-300 text-sm mt-1 leading-relaxed font-sans">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TECH STACK & WHY */}
          {activeTab === 'tech' && (
            <div className="border border-white/10 bg-white/2 p-8 sm:p-12 rounded-2xl animate-fadeIn">
              <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-8 flex items-center gap-2.5">
                <Cpu className="w-6 h-6 text-blue-400" />
                <span>Tech Stack & Integration Rationale</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.techChoices.map((item, idx) => {
                  const TechIcon = iconMap[item.icon] || CodeIcon;
                  return (
                    <div key={idx} className="p-6 border border-white/10 bg-zinc-950/60 rounded-xl flex gap-4 items-start hover:border-blue-500/20 transition-all">
                      <div className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-blue-400 shrink-0">
                        <TechIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white text-base font-bold font-sans mb-2 uppercase tracking-wide">{item.name}</h4>
                        <p className="text-zinc-400 text-xs text-zinc-500 mb-1">{item.description}</p>
                        <p className="text-zinc-200 text-sm leading-relaxed font-mono">{item.whyChosen}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEATURES & LOGS */}
          {activeTab === 'features' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-8 flex items-center gap-2.5">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <span>Key Features & Capabilities</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.features.map((feature, idx) => (
                    <div key={idx} className="p-6 border border-white/10 bg-zinc-950/40 rounded-xl flex gap-4 items-start">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
                      <div>
                        <h4 className="text-white text-base font-bold font-sans mb-2">{feature.title}</h4>
                        <p className="text-zinc-300 text-sm mt-1 leading-relaxed font-sans mb-2">{feature.description}</p>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed font-sans border-t border-white/5 pt-2">{feature.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2.5">
                  <FileText className="w-5.5 h-5.5 text-yellow-500" />
                  <span>Logging & Observability Spec</span>
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed font-sans">{project.logging}</p>
              </div>
            </div>
          )}

          {/* SECURITY & PERFORMANCE */}
          {activeTab === 'security' && (
            <div className="border border-white/10 bg-white/2 p-8 sm:p-12 rounded-2xl animate-fadeIn">
              <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-8 flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-red-400" />
                <span>Security & Performance Enforcement</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.securityPerformance.map((item, idx) => (
                  <div key={idx} className="p-6 border border-white/10 bg-zinc-950/60 rounded-xl">
                    <h4 className="text-white text-base font-bold font-sans mb-2">{item.title}</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed font-sans">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APIs & SCHEMAS */}
          {activeTab === 'api' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-8 flex items-center gap-2.5">
                  <Server className="w-6 h-6 text-cyan-400" />
                  <span>API Gateway Specifications</span>
                </h3>
                <div className="flex flex-col gap-4">
                  {project.apis.map((api, idx) => (
                    <div key={idx} className="p-5 border border-white/10 bg-zinc-950/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded font-bold font-mono ${
                          api.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>{api.method}</span>
                        <span className="text-white text-sm font-bold font-mono">{api.path}</span>
                      </div>
                      <p className="text-zinc-300 text-sm font-sans">{api.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2.5">
                  <Database className="w-5.5 h-5.5 text-blue-400" />
                  <span>Data Models & Storage Schemas</span>
                </h3>
                <pre className="bg-zinc-950 p-6 rounded-lg border border-white/15 text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                  {project.schema}
                </pre>
              </div>
            </div>
          )}

          {/* CONFIGS & DEPLOYMENT */}
          {activeTab === 'config' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-8 flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span>Deployment Workflow</span>
                </h3>
                <div className="flex flex-col gap-6">
                  {project.deploymentSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-center text-yellow-400 text-sm font-bold shrink-0">{idx + 1}</div>
                      <div className="flex-1">
                        <h4 className="text-white text-base font-bold font-sans">{step.step}</h4>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed font-sans">{step.description}</p>
                        <pre className="bg-zinc-950 px-4 py-2.5 rounded border border-white/10 text-xs text-yellow-400 mt-2 font-mono overflow-x-auto select-all">
                          {step.cmd}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
                <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2.5">
                  <Settings className="w-5.5 h-5.5 text-zinc-300" />
                  <span>Configuration Files</span>
                </h3>
                <div className="flex flex-col gap-6">
                  {project.configs.map((config, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <span className="text-xs text-zinc-400 block font-bold font-mono">// File: {config.filename}</span>
                      <pre className="bg-zinc-950 p-6 rounded-lg border border-white/15 text-xs sm:text-sm text-blue-400 leading-relaxed overflow-x-auto whitespace-pre font-mono">
                        {config.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Video Placeholder */}
        <div className="border border-white/10 bg-white/2 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden mt-12">
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
