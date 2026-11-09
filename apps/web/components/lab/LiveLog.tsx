'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getLines, log, metrics, request, send, setChaos, setMonkeyVisible, subscribe } from '@/lib/chaos';

const empty: ReturnType<typeof getLines> = [];

export default function LiveLog() {
  const lines = useSyncExternalStore(subscribe, getLines, () => empty);
  const [open, setOpen] = useState(true);
  const [, force] = useState(0);
  const [rps, setRps] = useState(120);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [lines, open]);
  useEffect(() => {
    if (window.innerWidth < 1200) setOpen(false);
    const id = setInterval(() => { setRps(100 + Math.round(Math.random() * 70)); force((n) => n + 1); }, 1000);
    return () => clearInterval(id);
  }, []);

  // every interaction on the page shows up as a request in the logs
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      request('GET', url.origin === location.origin ? url.pathname + url.hash : url.hostname + url.pathname);
    };
    const seen = new WeakMap<Element, number>();
    const onOver = (e: MouseEvent) => {
      const s = (e.target as Element).closest('[data-svc]');
      if (!s) return;
      const now = Date.now();
      if ((seen.get(s) || 0) > now - 6000) return;
      seen.set(s, now);
      log('INFO', `cache HIT key=${s.getAttribute('data-svc')} (0.3ms)`);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('mouseover', onOver);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) request('GET', `/#${e.target.id}`); }), { threshold: 0.35 });
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('mouseover', onOver); io.disconnect(); };
  }, []);

  const up = Math.floor((Date.now() - metrics.started) / 1000);
  const uptime = `${Math.floor(up / 60)}m ${up % 60}s`;
  const errRate = metrics.requests ? ((metrics.errors / Math.max(1, metrics.requests + 40)) * 100).toFixed(1) : '0.0';

  return (
    <aside className={`livelog ${open ? 'open' : ''}`}>
      <button className="ll-head" onClick={() => setOpen(!open)}>
        <i className={metrics.chaos ? 'chaos' : ''} />
        <b>prod · observability</b>
        <span>{rps} req/s · {errRate}% err · up {uptime}</span>
        <em>{open ? '–' : '+'}</em>
      </button>
      {open && (
        <>
          <div className="ll-stats">
            <div><small>requests</small><b>{metrics.requests + 1200}</b></div>
            <div><small>errors</small><b className="bad">{metrics.errors}</b></div>
            <div><small>auto-recoveries</small><b className="good">{metrics.recoveries}</b></div>
          </div>
          <div className="ll-lines" ref={box}>
            {lines.map((l) => (
              <div key={l.id} className={`ll ${l.level}`}><span>{l.t}</span><b>{l.level}</b><p>{l.msg}</p></div>
            ))}
          </div>
          <div className="ll-actions">
            <button onClick={() => send('feed')} title="Drop a banana for the monkey">🍌 Feed</button>
            <button onClick={() => send('chaos-now')} title="Run a chaos experiment right now">💥 Break something</button>
            <button onClick={() => send('send-request')} title="Trace a request through the system">▶ Trace</button>
            <label className="switch" title="Turn chaos experiments on or off">
              <input type="checkbox" checked={metrics.chaos} onChange={(e) => { setChaos(e.target.checked); force((n) => n + 1); }} />
              <span>chaos</span>
            </label>
            <label className="switch" title="Show or hide the monkey">
              <input type="checkbox" checked={metrics.monkeyVisible} onChange={(e) => { setMonkeyVisible(e.target.checked); force((n) => n + 1); }} />
              <span>🐒</span>
            </label>
          </div>
        </>
      )}
    </aside>
  );
}
