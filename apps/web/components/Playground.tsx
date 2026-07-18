'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, FileText, Code2, AlertTriangle, HelpCircle } from 'lucide-react';

const tasks = [
  { id: 'rag', name: 'Mini RAG', icon: HelpCircle, placeholder: 'Enter system query... e.g. "TraceNest"', prompt: 'Query the embedded database indices.' },
  { id: 'summarize', name: 'Mini Summarizer', icon: FileText, placeholder: 'Paste long text/logs to summarize here...', prompt: 'Consolidate input paragraphs.' },
  { id: 'review', name: 'Code Reviewer', icon: Code2, placeholder: 'Paste Python/Go/TS snippet to review...', prompt: 'Analyze code security & structure.' },
  { id: 'log_analyzer', name: 'Log Analyzer', icon: AlertTriangle, placeholder: 'Paste traceback / server error outputs here...', prompt: 'Pinpoint system runtime errors.' }
];

export default function Playground() {
  const [activeTask, setActiveTask] = useState('rag');
  const [inputText, setInputText] = useState('');
  const [queryText, setQueryText] = useState('');
  const [resultConsole, setResultConsole] = useState('[Ready. Launch task to execute system compiler...]');

  const mutation = useMutation({
    mutationFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
      const res = await fetch(`${apiUrl}/api/playground`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: activeTask,
          content: inputText,
          query: activeTask === 'rag' ? queryText : ''
        })
      });
      if (!res.ok) {
        throw new Error('Failed to run task');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResultConsole(data.result);
    },
    onError: (err) => {
      setResultConsole(`[Error executing task: ${err.message}]`);
    }
  });

  const handleRun = () => {
    setResultConsole('[System compiling and invoking model hooks...]');
    mutation.mutate();
  };

  return (
    <section id="playground" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase mb-3">06 // AI_PLAYGROUND</span>
        <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
          Interactive AI Playground
        </h2>
        <p className="text-zinc-500 text-xs mt-3 max-w-lg">
          Direct sandbox links to our Gemini runtime modules. Try out backend tracing features instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input parameters panel */}
        <div className="p-8 border border-white/5 bg-white/2 rounded-2xl flex flex-col gap-6">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Select micro-agent module</span>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    setActiveTask(task.id);
                    setInputText('');
                    setQueryText('');
                    setResultConsole('[Ready. Launch task to execute system compiler...]');
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    activeTask === task.id
                      ? 'border-blue-500/30 bg-blue-500/5 text-blue-400'
                      : 'border-white/5 bg-white/2 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-bold tracking-wider">{task.name}</span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-white/5 my-2"></div>

          {activeTask === 'rag' && (
            <div className="flex flex-col gap-2">
              <label htmlFor="rag-query-input" className="text-[9px] text-zinc-400 uppercase tracking-wider">Search query vector</label>
              <input
                id="rag-query-input"
                type="text"
                placeholder="Query database... e.g. 'TraceNest'"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="playground-source-textarea" className="text-[9px] text-zinc-400 uppercase tracking-wider">Source Content Payload</label>
            <textarea
              id="playground-source-textarea"
              rows={5}
              placeholder={tasks.find((t) => t.id === activeTask)?.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 resize-none font-mono"
            />
          </div>

          <button
            id="run-playground-task-btn"
            onClick={handleRun}
            disabled={mutation.isPending || (!inputText && activeTask !== 'rag')}
            className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white hover:bg-zinc-200 text-[#030303] text-xs font-bold font-mono tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>EXECUTE_COMPILER</span>
          </button>
        </div>

        {/* Output console */}
        <div className="flex flex-col border border-white/10 bg-zinc-950 rounded-2xl h-[380px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-zinc-900/50">
            <span className="text-[9px] text-zinc-400 font-bold uppercase">Console output debugger</span>
            <span className="text-[8px] text-zinc-600">active thread ID: {activeTask.toUpperCase()}_ENV</span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto text-[10px] text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
            {resultConsole}
          </div>
        </div>
      </div>
    </section>
  );
}
