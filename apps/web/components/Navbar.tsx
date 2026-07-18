'use client';

import { useState, useEffect } from 'react';
import { Terminal, Command, Menu, X, Cpu } from 'lucide-react';

interface NavbarProps {
  onTerminalToggle: () => void;
  onCommandPaletteToggle: () => void;
}

export default function Navbar({ onTerminalToggle, onCommandPaletteToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      id="main-nav-bar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#030303]/80 backdrop-blur-md border-b border-white/5 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2 font-mono text-base tracking-widest text-zinc-100 hover:text-blue-400 transition-colors">
          <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
          <span>VISHWAJIT_LABS</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wider text-zinc-400">
          <a href="#projects" className="hover:text-zinc-100 transition-colors">PROJECTS</a>
          <a href="#skills" className="hover:text-zinc-100 transition-colors">SKILLS</a>
          <a href="#timeline" className="hover:text-zinc-100 transition-colors font-mono">TIMELINE</a>
          <a href="#github" className="hover:text-zinc-100 transition-colors">OPEN_SOURCE</a>
          <a href="#contact" className="hover:text-zinc-100 transition-colors">CONTACT</a>
        </nav>

        {/* Buttons & Tools */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            id="cmd-palette-btn"
            onClick={onCommandPaletteToggle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-white/10 bg-white/5 text-xs font-mono text-zinc-300 hover:bg-white/10 hover:text-zinc-100 transition-all cursor-pointer"
          >
            <Command className="w-4 h-4" />
            <span>CMD+K</span>
          </button>
          
          <button 
            id="terminal-toggle-btn"
            onClick={onTerminalToggle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-blue-500/20 bg-blue-500/5 text-xs font-mono text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>SHELL</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onCommandPaletteToggle}
            className="p-2 rounded-md border border-white/10 bg-white/5 text-zinc-300 hover:text-zinc-100"
          >
            <Command className="w-4.5 h-4.5" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md border border-white/10 bg-white/5 text-zinc-300 hover:text-zinc-100"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#030303]/95 border-b border-white/10 py-6 px-6 backdrop-blur-lg flex flex-col gap-5 text-base font-mono tracking-widest text-zinc-400">
          <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="hover:text-zinc-100 transition-colors">PROJECTS</a>
          <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="hover:text-zinc-100 transition-colors">SKILLS</a>
          <a href="#timeline" onClick={() => setMobileMenuOpen(false)} className="hover:text-zinc-100 transition-colors">TIMELINE</a>
          <a href="#github" onClick={() => setMobileMenuOpen(false)} className="hover:text-zinc-100 transition-colors">OPEN_SOURCE</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-zinc-100 transition-colors">CONTACT</a>
          <div className="h-px bg-white/5 my-2"></div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onTerminalToggle();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-md border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm hover:bg-blue-500/10 cursor-pointer"
            >
              <Terminal className="w-5 h-5" />
              <span>TERMINAL</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
