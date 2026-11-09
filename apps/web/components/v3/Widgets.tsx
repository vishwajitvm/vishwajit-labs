'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { bus, getLines, metrics, send, setChaos, setMonkeyVisible, subscribe, type LogLine } from '@/lib/chaos';

/* ---------- Ask my AI: streams from the existing backend /api/chat/stream ---------- */
type Msg = { role: 'user' | 'model'; content: string };
const SUGGESTIONS = ['What does Vishwajit build?', 'Tell me about DevFlow-AI', 'Is he available for freelance?', 'What’s his tech stack?'];

export function AskAI() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'model', content: 'Hi! I’m Vishwajit’s AI assistant. Ask me about his projects, experience or availability ✨' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { const o = () => setOpen(true); bus.addEventListener('open-chat', o); return () => bus.removeEventListener('open-chat', o); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const ask = async (text: string) => {
    if (!text.trim() || busy) return;
    const next = [...msgs, { role: 'user' as const, content: text }];
    setMsgs(next); setInput(''); setBusy(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
      const res = await fetch(`${api}/api/chat/stream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history: next.slice(0, -1) }) });
      if (!res.ok || !res.body) throw new Error('down');
      const reader = res.body.getReader(); const dec = new TextDecoder();
      let acc = '';
      setMsgs((m) => [...m, { role: 'model', content: '' }]);
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6).trim();
          if (d === '[DONE]') break;
          acc += d;
          setMsgs((m) => { const u = [...m]; u[u.length - 1] = { role: 'model', content: acc }; return u; });
        }
      }
    } catch {
      setMsgs((m) => [...m, { role: 'model', content: 'My AI backend is napping right now 😴 — email Vishwajit at vishwajitmall50@gmail.com and he’ll answer personally.' }]);
    } finally { setBusy(false); }
  };

  return (
    <>
      <button className={`ai-fab pop ${open ? 'hide' : ''}`} onClick={() => setOpen(true)}>✨ Ask my AI</button>
      {open && (
        <div className="ai-panel">
          <div className="ai-head"><span className="ai-dot" /><b>Vishwajit’s AI</b><small>usually answers in seconds</small><button onClick={() => setOpen(false)} aria-label="Close chat">✕</button></div>
          <div className="ai-msgs">
            {msgs.map((m, i) => <div key={i} className={`ai-msg ${m.role}`}>{m.content || '…'}</div>)}
            {busy && msgs[msgs.length - 1].role === 'user' && <div className="ai-msg model typing"><i /><i /><i /></div>}
            <div ref={end} />
          </div>
          {msgs.length < 3 && <div className="ai-sugg">{SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>}
          <form className="ai-input" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…" />
            <button disabled={busy}>↑</button>
          </form>
        </div>
      )}
    </>
  );
}

/* ---------- Monkey panel: event toasts + controls ---------- */
const empty: LogLine[] = [];
const ICON: Record<string, string> = { ERROR: '💥', WARN: '⚠️', OK: '✅', CHAOS: '🐒', INFO: '•' };
export function MonkeyPanel() {
  const lines = useSyncExternalStore(subscribe, getLines, () => empty);
  const [, force] = useState(0);
  const [toasts, setToasts] = useState<LogLine[]>([]);
  const seen = useRef(0);
  useEffect(() => {
    const fresh = lines.filter((l) => l.id > seen.current && l.level !== 'INFO' && !/^(GET|POST|PUT|DELETE) \//.test(l.msg));
    if (lines.length) seen.current = lines[lines.length - 1].id;
    if (!fresh.length) return;
    setToasts((t) => [...t, ...fresh].slice(-3));
    const ids = fresh.map((f) => f.id);
    const timer = setTimeout(() => setToasts((t) => t.filter((x) => !ids.includes(x.id))), 4200);
    return () => clearTimeout(timer);
  }, [lines]);
  return (
    <div className="mk">
      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.level}`}><span>{ICON[t.level]}</span>{t.msg}</div>)}
      </div>
      <div className="mk-bar">
        <span className="mk-title">🐒 Chaos Monkey</span>
        <button onClick={() => send('feed')} title="Drop a banana">🍌</button>
        <button onClick={() => send('chaos-now')} title="Let it break something now">💥</button>
        <button className={metrics.chaos ? 'on' : ''} onClick={() => { setChaos(!metrics.chaos); force((n) => n + 1); }} title="Chaos on / off">{metrics.chaos ? 'chaos on' : 'chill'}</button>
        <button onClick={() => { setMonkeyVisible(!metrics.monkeyVisible); force((n) => n + 1); }} title="Show / hide the monkey">{metrics.monkeyVisible ? '🙈' : '👀'}</button>
      </div>
    </div>
  );
}
