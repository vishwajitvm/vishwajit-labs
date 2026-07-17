'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Terminal, Download, ArrowRight, User } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onTerminalToggle: () => void;
}

export default function CommandPalette({ isOpen, onClose, onTerminalToggle }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const paletteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
          // Find standard palette activator logic
          // Trigger callbacks
          // Force state update
          document.getElementById('cmd-palette-btn')?.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    { id: 'proj-tracenest', name: 'Open TraceNest project details', category: 'Projects', action: () => window.location.href = '/projects/tracenest' },
    { id: 'proj-tenantmind', name: 'Open TenantMind AI project details', category: 'Projects', action: () => window.location.href = '/projects/tenantmind-ai' },
    { id: 'proj-policybot', name: 'Open PolicyBot compliance agent details', category: 'Projects', action: () => window.location.href = '/projects/policybot' },
    { id: 'proj-tallyko', name: 'Open Tallyko transaction ledger details', category: 'Projects', action: () => window.location.href = '/projects/tallyko' },
    { id: 'cmd-terminal', name: 'Boot developer terminal shell', category: 'System Tools', action: () => { onClose(); onTerminalToggle(); } },
    { id: 'cmd-resume', name: 'Download resume package PDF', category: 'System Tools', action: () => { window.open('/assets/resume.pdf', '_blank'); onClose(); } },
    { id: 'sec-skills', name: 'Scroll to skills topology network', category: 'Navigation', action: () => { document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }); onClose(); } },
    { id: 'sec-arch', name: 'Scroll to system design flows mapping', category: 'Navigation', action: () => { document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }); onClose(); } },
    { id: 'sec-contact', name: 'Scroll to database contact forms', category: 'Navigation', action: () => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); onClose(); } }
  ];

  const filteredItems = items.filter(
    (item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-6 bg-black/60 backdrop-blur-sm font-mono"
      onClick={onClose}
    >
      <div 
        ref={paletteRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg border border-white/10 bg-zinc-950/95 rounded-xl overflow-hidden shadow-2xl"
      >
        {/* Search bar input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Type command name to query console..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-zinc-200 text-xs focus:ring-0 p-0 m-0 font-mono"
            autoFocus
          />
        </div>

        {/* Query Results listing */}
        <div className="max-h-60 overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-white/5 hover:text-white text-zinc-400 text-[10px] text-left transition-all cursor-pointer"
                  id={`cmd-palette-item-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    {item.category === 'System Tools' ? (
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    ) : item.category === 'Projects' ? (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[8px] border border-white/10 px-2 py-0.5 rounded text-zinc-500 uppercase">{item.category}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-600 text-xs">
              No matching system components found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
