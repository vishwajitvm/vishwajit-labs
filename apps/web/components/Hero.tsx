'use client';

import { motion } from 'framer-motion';
import { Terminal, Download, ArrowRight, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GithubIcon, LinkedinIcon } from '@/components/icons/BrandIcons';

interface HeroProps {
  onTerminalToggle: () => void;
}

export default function Hero({ onTerminalToggle }: HeroProps) {
  const [typedText, setTypedText] = useState('');
  const phrase = "I build scalable backend systems, AI platforms, developer SDKs, and production-ready software.";
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + phrase.charAt(index));
      index++;
      if (index >= phrase.length) {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadResume = async () => {
    try {
      await fetch('/api/analytics/log-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_type: 'resume_pdf', source: 'hero_button' })
      });
    } catch (e) {
      console.warn('Logging download failed, downloading directly.', e);
    }
    // direct download path link
    window.open('/assets/resume.pdf', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 overflow-hidden">
      {/* Glow follows card grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center z-10">
        
        {/* Hacker Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-[10px] font-mono tracking-widest text-blue-400 mb-6 uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>System status: Online</span>
        </motion.div>

        {/* Huge Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-sans font-bold tracking-tight text-white mb-6 leading-tight"
        >
          Hi, I&apos;m <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Vishwajit</span>.
        </motion.h1>

        {/* Dynamic Typing Text */}
        <div className="min-h-[60px] max-w-2xl text-zinc-400 text-sm sm:text-lg font-mono mb-8 leading-relaxed">
          <span>{typedText}</span>
          <span className="w-2 h-4 bg-blue-500 inline-block ml-1 animate-pulse" />
        </div>

        {/* Stack Tags */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 text-[10px] font-mono tracking-wider text-zinc-500 mb-12"
        >
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/2">PYTHON</span>
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/2">AI</span>
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/2">FASTAPI</span>
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/2">RAG</span>
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/2">OPEN SOURCE</span>
          <span className="px-2.5 py-1 rounded border border-white/5 bg-white/2">SYSTEM DESIGN</span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-4 w-full"
        >
          <a 
            href="#projects" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#030303] text-xs font-mono tracking-wider hover:bg-zinc-200 transition-all font-semibold cursor-pointer"
          >
            <span>EXPLORE_WORK</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button 
            onClick={handleDownloadResume}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-xs font-mono tracking-wider hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>RESUME</span>
          </button>

          <button 
            onClick={onTerminalToggle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-mono tracking-wider hover:bg-blue-500/10 hover:text-blue-300 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>DEV_SHELL</span>
          </button>
        </motion.div>

        {/* Social Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center gap-6 mt-16 text-zinc-500"
        >
          <a href="https://github.com/vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" id="social-github">
            <GithubIcon className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com/in/vishwajitvm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" id="social-linkedin">
            <LinkedinIcon className="w-5 h-5" />
          </a>
          <a href="#contact" className="hover:text-white transition-colors" id="social-contact">
            <MessageSquare className="w-5 h-5" />
          </a>
        </motion.div>

      </div>

      {/* Floating interactive card demo preview */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 animate-bounce pointer-events-none hidden md:block">
        <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to inspect core kernel</span>
      </div>
    </section>
  );
}
