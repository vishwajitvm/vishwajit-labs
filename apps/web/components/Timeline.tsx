'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, Award, ChevronRight } from 'lucide-react';

const experienceData = [
  {
    id: 'beelogical',
    icon: Briefcase,
    label: 'Nov 2022 – Jun 2026',
    company: 'Bee Logical Software Solutions',
    role: 'Lead / Full Stack Developer',
    location: 'Pune, India',
    desc: 'Served as a core developer delivering production platforms end-to-end. Built SmartHR, an AI-powered candidate interview automation system, alongside SetBot (property booking platform) and Bella Canvas (3D product customization & e-commerce).',
    details: [
      'Architected end-to-end AI interview pipelines using LangChain and LangGraph for stateful multi-turn conversation loops.',
      'Designed RAG systems that parse job descriptions and candidate profile details to generate targeted role questions.',
      'Received the company\'s Outstanding Performance Award (November 2024) for engineering contributions.'
    ]
  },
  {
    id: 'webreinvent',
    icon: Briefcase,
    label: 'Jul 2022 – Oct 2022',
    company: 'WebReinvent',
    role: 'Software Developer',
    location: 'New Delhi, India',
    desc: 'Contributed directly to core software applications, debugging REST endpoint controllers, optimizing backend databases queries, and cleaning legacy code bases.',
    details: [
      'Refactored API endpoint integrations, improving query retrieval times and error handling.',
      'Partnered closely with product teams to scope development blueprints and debug production issues.'
    ]
  },
  {
    id: 'blubrandz',
    icon: Briefcase,
    label: 'Aug 2021 – Jun 2022',
    company: 'BluBrandz Technologies Pvt Ltd',
    role: 'Full Stack Developer',
    location: 'New Delhi, India',
    desc: 'Built hospital management system (Angle Fertility), event manager platform (Aragma), and Unicorn Equipments with a Laravel admin dashboard.',
    details: [
      'Built a hospital management system (Angle Fertility) to digitize patient records, appointment bookings, and clinical workflows.',
      'Developed event management system (Aragma - House Party Management) for planning, expenditure tracking, and staff management.',
      'Built equipment management system (Unicorn Equipments) with a Laravel-based admin dashboard to manage listed machinery.'
    ]
  },
  {
    id: 'education',
    icon: GraduationCap,
    label: '2015 – 2018',
    company: 'Panjab University',
    role: 'Bachelor of Science',
    location: 'Chandigarh, India',
    desc: 'Completed undergraduate degree focusing on mathematics, science fundamentals, logical structures, and relational paradigms.',
    details: [
      'Earned Bachelor of Science, grounding logical workflows, core coding practices, and algorithms.',
      'Engaged directly with database schemas, math proofs, and computational problem solving.'
    ]
  }
];

export default function Timeline() {
  const [selectedWork, setSelectedWork] = useState<string | null>('beelogical');

  const selectedData = experienceData.find((w) => w.id === selectedWork) || experienceData[0];
  const Icon = selectedData.icon;

  return (
    <section id="timeline" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-3">03 // WORK_HISTORY</span>
        <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white">
          Professional Log Timeline
        </h2>
        <p className="text-zinc-400 font-mono text-sm mt-4 max-w-xl leading-relaxed">
          Select an execution checkpoint node to view role scopes, production achievements, and technical contributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Navigation nodes */}
        <div className="lg:col-span-2 flex flex-col gap-4 relative pl-8 border-l border-white/10 py-2">
          {experienceData.map((node) => {
            const NodeIcon = node.icon;
            const isSelected = selectedWork === node.id;
            
            return (
              <button
                key={node.id}
                onClick={() => setSelectedWork(node.id)}
                className={`relative flex items-center justify-between w-full p-4 sm:p-5 rounded-xl border transition-all text-left cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500/30 bg-blue-500/5 text-white' 
                    : 'border-white/5 bg-white/2 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                }`}
              >
                {/* Connector dot */}
                <div className={`absolute -left-[38px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  isSelected 
                    ? 'border-blue-500 bg-[#030303] scale-110' 
                    : 'border-zinc-700 bg-[#030303]'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>

                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg border ${
                    isSelected ? 'border-blue-500/30 text-blue-400' : 'border-white/5 text-zinc-500'
                  }`}>
                    <NodeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-semibold">{node.label}</span>
                    <h3 className="text-sm font-bold mt-1 text-white">{node.role} at {node.company}</h3>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Details Card */}
        <div className="sticky top-28 p-8 border border-white/10 bg-zinc-950/60 backdrop-blur-md rounded-2xl min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedData.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-blue-400 tracking-wider uppercase font-semibold">{selectedData.location}</span>
                  <h4 className="text-white text-base font-bold mt-1 font-sans">{selectedData.role}</h4>
                </div>
              </div>

              <div className="h-px bg-white/10 my-6"></div>

              <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-mono">
                {selectedData.desc}
              </p>

              <div className="flex flex-col gap-3">
                <span className="text-white font-bold text-xs font-mono uppercase tracking-widest block">SYSTEM_LOGS:</span>
                <ul className="list-disc pl-4 text-xs text-zinc-400 flex flex-col gap-2 font-mono leading-relaxed">
                  {selectedData.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
