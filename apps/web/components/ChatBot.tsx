'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm VISH AI, Vishwajit's portfolio assistant. Ask me anything about his projects, experience, backend systems, or RAG frameworks!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerChat = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMessage } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // API stream target
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: newMessages.slice(0, -1) // pass past context
        })
      });

      if (!response.ok) {
        throw new Error('API down');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      if (!reader) {
        throw new Error('No reader stream');
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      let accumulatedResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse Server-Sent Events (SSE) data: {chunk}
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataContent = line.slice(6).trim();
            if (dataContent === '[DONE]') {
              break;
            }
            accumulatedResponse += dataContent;
            
            // Update last message
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: 'model',
                content: accumulatedResponse
              };
              return updated;
            });
          }
        }
      }

    } catch (e) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "Sorry, my API cluster appears offline. You can test inputs in the AI Playground or consult documentation maps directly!" }
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerChat(input);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-mono">
      {/* Launch Circle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer"
          id="vish-ai-chatbot-btn"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      {/* Floating conversational card */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[400px] border border-white/10 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-zinc-950">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>VISH_AI_KERNELS</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversations stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 items-start ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'model' && (
                  <div className="p-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`p-3 rounded-xl border text-[10px] leading-relaxed max-w-[80%] ${
                  msg.role === 'user'
                    ? 'border-white/10 bg-white/5 text-zinc-200 rounded-tr-none'
                    : 'border-white/5 bg-[#09090b] text-zinc-300 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center text-[10px] text-zinc-500 pl-8 font-mono">
                <span className="animate-pulse">Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick recommendations */}
          <div className="px-4 py-2 border-t border-white/5 bg-zinc-950/40 flex flex-wrap gap-1.5 shrink-0">
            <button 
              onClick={() => triggerChat("Tell me about TraceNest")} 
              className="px-2 py-1 rounded border border-white/5 bg-white/2 text-[8px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              TraceNest
            </button>
            <button 
              onClick={() => triggerChat("What projects use RAG?")} 
              className="px-2 py-1 rounded border border-white/5 bg-white/2 text-[8px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              RAG Projects
            </button>
            <button 
              onClick={() => triggerChat("Tell me about Tallyko")} 
              className="px-2 py-1 rounded border border-white/5 bg-white/2 text-[8px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Tallyko Go Ledger
            </button>
          </div>

          {/* Input field */}
          <form 
            onSubmit={handleSubmit}
            className="p-3 border-t border-white/5 bg-zinc-950 flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask Vish AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-[10px] text-zinc-200 focus:outline-none focus:border-blue-500/30 font-mono"
            />
            <button 
              type="submit" 
              className="p-1.5 rounded-lg bg-white text-[#030303] hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
