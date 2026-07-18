'use client';

import { useState, useEffect } from 'react';
import ThreeBackground from '@/components/ThreeBackground';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProjectsList from '@/components/ProjectsList';
import Timeline from '@/components/Timeline';
import SkillsGraph from '@/components/SkillsGraph';
import OSDashboard from '@/components/OSDashboard';
import Contact from '@/components/Contact';
import Terminal from '@/components/Terminal';
import CommandPalette from '@/components/CommandPalette';
import ChatBot from '@/components/ChatBot';

export default function Home() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Log visit to local backend analytics database
    const logVisit = async () => {
      try {
        await fetch('http://localhost:8000/api/analytics/log-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: window.location.pathname,
            referrer: document.referrer || 'direct',
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
          })
        });
      } catch (e) {
        console.warn('Visitor logging skipped. Local backend API offline.', e);
      }
    };
    logVisit();
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* 3D mesh particle grid canvas background */}
      <ThreeBackground />

      {/* Persistent global layout headers */}
      <Navbar 
        onTerminalToggle={() => setTerminalOpen(!terminalOpen)}
        onCommandPaletteToggle={() => setCommandPaletteOpen(!commandPaletteOpen)}
      />

      {/* Main hero display */}
      <Hero onTerminalToggle={() => setTerminalOpen(true)} />

      {/* Monorepo Projects Showcase */}
      <ProjectsList />

      {/* Skills Matrix Explorer */}
      <SkillsGraph />

      {/* Professional Timeline Tracker */}
      <Timeline />

      {/* Github open-source telemetry metrics */}
      <OSDashboard />

      {/* Contact pipeline & Socials */}
      <Contact />

      {/* Bottom overlay terminal, cmd palette, and vish ai helper bot */}
      <Terminal 
        isOpen={terminalOpen} 
        onClose={() => setTerminalOpen(false)} 
      />
      
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onTerminalToggle={() => setTerminalOpen(true)}
      />

      <ChatBot />

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40 text-center font-mono text-[10px] text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 VISHWAJIT_LABS. ALL RIGHTS RESERVED.</span>
          <span className="flex gap-4">
            <span>UPTIME: 99.9%</span>
            <span>KERNEL: v2.1.2-STABLE</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
