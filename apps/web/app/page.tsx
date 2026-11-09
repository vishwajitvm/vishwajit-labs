'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import OSDashboard from '@/components/OSDashboard';
import Contact from '@/components/Contact';
import Terminal from '@/components/Terminal';
import CommandPalette from '@/components/CommandPalette';
import ChatBot from '@/components/ChatBot';
import HeroSystem from '@/components/lab/HeroSystem';
import { Overview, Services, Stack, DeployHistory } from '@/components/lab/Sections';

// Purely client-side, interactive layers (WebGL overlay + live log panel).
const ChaosMonkey = dynamic(() => import('@/components/lab/ChaosMonkey'), { ssr: false });
const LiveLog = dynamic(() => import('@/components/lab/LiveLog'), { ssr: false });

export default function Home() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Log the visit to the backend analytics database (unchanged behaviour).
    const logVisit = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
        await fetch(`${apiUrl}/api/analytics/log-visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: window.location.pathname,
            referrer: document.referrer || 'direct',
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
          }),
        });
      } catch (e) {
        console.warn('Visitor logging skipped. Backend API offline.', e);
      }
    };
    logVisit();
  }, []);

  return (
    <main className="lab-main relative min-h-screen">
      <Navbar
        onTerminalToggle={() => setTerminalOpen(!terminalOpen)}
        onCommandPaletteToggle={() => setCommandPaletteOpen(!commandPaletteOpen)}
      />

      <HeroSystem onTerminal={() => setTerminalOpen(true)} />
      <Overview />
      <Services />
      <Stack />
      <DeployHistory />
      <OSDashboard />
      <Contact />

      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onTerminalToggle={() => setTerminalOpen(true)}
      />
      <ChatBot />
      <LiveLog />
      <ChaosMonkey />

      <footer className="py-12 border-t border-white/5 bg-black/40 text-center font-mono text-[11px] text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 Vishwajit VM · Vishwajit Labs</span>
          <span className="flex gap-4">
            <span>uptime 99.9%</span>
            <span>chaos experiments survived: ∞</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
