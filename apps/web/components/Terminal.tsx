'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Terminal({ isOpen, onClose }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Welcome to VISH OS v2.0.6 Kernel Boot...',
    'System initialization successful. Type "help" to list available commands.',
    ''
  ]);
  const [minimized, setMinimized] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && !minimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, minimized]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory = [...history, `root@vishwajit-labs:~$ ${cmd}`];

    if (!trimmed) {
      setHistory([...newHistory, '']);
      return;
    }

    const parts = trimmed.split(/\s+/);
    const mainCommand = parts[0];
    const subCommand = parts[1];
    let response = '';

    switch (mainCommand) {
      case 'help':
        response = 
          'Available commands:\n' +
          '  whoami     - Displays active developer roles & capabilities\n' +
          '  projects   - Lists primary backend & AI infrastructure models\n' +
          '  resume     - Downloads developer resume (specify: "resume ai" or "resume fullstack")\n' +
          '  github     - Returns github repository link\n' +
          '  contact    - Explains message submission routes\n' +
          '  clear      - Flushes terminal buffer history\n' +
          '  sudo hire  - Grants root system developer clearance';
        break;
      case 'whoami':
        response = 
          'Name: Vishwajit\n' +
          'Profile: Python Backend Engineer, AI Engineer (RAG/Agents), Platform Architect\n' +
          'Core Focus: High-performance async microservices, LLM network tools, robust caching layers.';
        break;
      case 'projects':
        response = 
          'TraceNest    - Distributed tracing SDK for async FastAPI logs\n' +
          'TenantMind   - Multi-tenant vector RAG pipelines manager\n' +
          'PolicyBot    - Code audit agent using Model Context Protocol (MCP)\n' +
          'Tallyko      - High-performance double-entry Go ledger engine\n' +
          'Type "projects" inside browser or click cards for database architectures.';
        break;
      case 'resume':
        if (subCommand === 'ai') {
          response = 'Initiating AI Engineering resume download sequence...';
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
          fetch(`${apiUrl}/api/analytics/log-download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_type: 'resume_ai', source: 'terminal' })
          }).catch(() => {});
          window.open('/assets/resume-ai.pdf', '_blank');
        } else if (subCommand === 'fullstack') {
          response = 'Initiating Full Stack resume download sequence...';
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
          fetch(`${apiUrl}/api/analytics/log-download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_type: 'resume_fullstack', source: 'terminal' })
          }).catch(() => {});
          window.open('/assets/resume-fullstack.pdf', '_blank');
        } else {
          response = 'Please specify resume version: "resume ai" or "resume fullstack"';
        }
        break;
      case 'github':
        response = 'Redirecting to: https://github.com/vishwajitvm';
        window.open('https://github.com/vishwajitvm', '_blank');
        break;
      case 'contact':
        response = 'System contact pathways: Scroll to page footer, fill form, or email vishwajit@vishwajitvm.dev.';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'sudo':
        if (subCommand === 'hire') {
          response = 
            '*** SECURITY ACCESS GRANTED ***\n' +
            'Redirecting to contact pipeline immediately. Let\'s build platforms together!';
          setTimeout(() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            onClose();
          }, 1500);
        } else {
          response = 'bash: sudo: permission denied';
        }
        break;
      default:
        response = `bash: command not found: ${trimmed}. Type "help" for a list of valid modules.`;
    }

    setHistory([...newHistory, response, '']);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 w-full max-w-lg border border-white/10 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden font-mono text-xs text-green-400 transition-all ${
        minimized ? 'h-10' : 'h-80'
      }`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-white/5 select-none">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
          <span>VISH_OS_TERMINAL</span>
        </span>
        <div className="flex gap-2 text-zinc-500 hover:text-zinc-300">
          <button onClick={() => setMinimized(!minimized)} className="hover:text-white">
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onClose} className="hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Screen content */}
      {!minimized && (
        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-4 h-[calc(100%-40px)] flex flex-col justify-between overflow-y-auto cursor-text"
        >
          <div className="flex-1 overflow-y-auto mb-2 space-y-1">
            {history.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {line}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <div className="flex items-center gap-1 text-zinc-400 shrink-0">
            <span>root@vishwajit-labs:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-green-400 focus:ring-0 p-0 m-0 font-mono text-xs"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
