'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type MouseEvent as RME } from 'react';
import { STACK_LAYERS, STACK_TIPS } from '@/data/stackIcons';
import { Icon } from '@/components/v3/Icon';
import ProjectDetail from '@/components/v3/ProjectDetail';
export { Icon };
import { WORK, flatStack, type Work } from '@/data/work';
import { JOBS } from '@/data/journey';
import { log, request, send } from '@/lib/chaos';

const API = () => process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';

/* ---------- tiny interaction helpers ---------- */
function tilt(e: RME<HTMLElement>) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--rx', `${-y * 8}deg`); el.style.setProperty('--ry', `${x * 10}deg`);
  el.style.setProperty('--gx', `${(x + 0.5) * 100}%`); el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
}
function untilt(e: RME<HTMLElement>) { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); }

/* ---------- nav ---------- */
export function Nav() {
  const [small, setSmall] = useState(false);
  useEffect(() => { const f = () => setSmall(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  return (
    <nav className={`nav ${small ? 'small' : ''}`}>
      <a href="#top" className="logo" aria-label="Back to top">VM</a>
      <div className="links">
        <a href="#about">About</a><a href="#work">Work</a><a href="#timeline">Journey</a><a href="#skills">Toolbox</a><a href="#github">GitHub</a>
      </div>
      <a href="#contact" className="btn btn-orange nav-cta pop">Let’s talk</a>
    </nav>
  );
}

/* ---------- marquee ---------- */
export function Marquee() {
  const names = ['Python', 'FastAPI', 'NestJS', 'PostgreSQL', 'Redis', 'Docker', 'LangGraph', 'MCP', 'Qdrant', 'Celery', 'Node.js', 'React', 'Next.js', 'MongoDB', 'Azure', 'AWS', 'Grafana', 'OpenTelemetry', 'Ollama', 'Prisma', 'Keycloak', 'GitHub Actions'];
  const row = names.map((n) => <span key={n} className="mq-item"><Icon name={n} size={22} />{n}</span>);
  return (
    <div className="marquee" aria-label="Technologies I use">
      <div className="mq-track">{row}{row}</div>
    </div>
  );
}

/* ---------- about (bento) ---------- */
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date()));
    f(); const id = setInterval(f, 15000); return () => clearInterval(id);
  }, []);
  return <b className="clock">{t || '—'}</b>;
}
export function About() {
  return (
    <section id="about" className="sec">
      <p className="eyebrow">About</p>
      <h2 className="h2" data-perch>Engineer of the boring parts <span className="scribble">that matter</span>.</h2>
      <div className="bento">
        <div className="tile t-intro" data-break data-hide data-perch onMouseMove={tilt} onMouseLeave={untilt}>
          <span className="wave">👋</span>
          <p>I’m <b>Vishwajit VM</b>, a backend &amp; AI engineer from New Delhi. For 5+ years I’ve built the part of apps you don’t see — APIs, databases, queues and AI agents — for hiring, real estate, finance, retail and civic-tech teams.</p>
          <p>I obsess over one thing: <mark>systems that keep working when something goes wrong.</mark></p>
        </div>
        <div className="tile t-num c-butter" data-break data-perch onMouseMove={tilt} onMouseLeave={untilt}><b>5+</b><span>years shipping to production</span></div>
        <div className="tile t-now c-lilac" data-break data-hide data-perch onMouseMove={tilt} onMouseLeave={untilt}>
          <small>Right now</small><b>Backend Developer @ SPNX</b>
          <span>Sole backend for an EU VAT platform — 244 endpoints, 3/3 security audits passed.</span>
          <a href="https://fsvat.spnx.ai/" target="_blank" rel="noopener">fsvat.spnx.ai ↗</a>
        </div>
        <div className="tile t-award c-peach" data-break data-perch onMouseMove={tilt} onMouseLeave={untilt}><span className="big">🏆</span><b>Outstanding Performance Award</b><span>Bee Logical · Nov 2024</span></div>
        <div className="tile t-clock c-sky" data-perch onMouseMove={tilt} onMouseLeave={untilt}><small>In New Delhi it’s</small><Clock /><span>IST · happy to overlap with your team</span></div>
        <div className="tile t-open c-mint" data-break data-perch onMouseMove={tilt} onMouseLeave={untilt}>
          <span className="pulse" /><b>Open to freelance &amp; contract work</b><a href="#contact">Let’s talk →</a>
        </div>
        <div className="tile t-monkey" data-perch onMouseMove={tilt} onMouseLeave={untilt}>
          <span className="big">🐒</span><b>Heads-up: a Chaos Monkey lives here.</b>
          <span>It breaks things on purpose, so you can watch the site recover. Grab it, throw it — or bribe it.</span>
          <button className="btn btn-paper pop" onClick={() => send('feed')}>🍌 Feed the monkey</button>
        </div>
      </div>
    </section>
  );
}

/* ---------- work + modal ---------- */
function Modal({ w, onClose, onNav }: { w: Work; onClose: () => void; onNav: (d: number) => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onNav(1); if (e.key === 'ArrowLeft') onNav(-1); };
    addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose, onNav]);
  return (
    <div className="modal-bg" onClick={onClose} role="dialog" aria-modal="true" aria-label={w.name}>
      <div className="modal wide" style={{ ['--c' as string]: w.color }} onClick={(e) => e.stopPropagation()}>
        <button className="m-x" onClick={onClose} aria-label="Close">✕</button>
        <ProjectDetail key={w.id} w={w} />
        <div className="m-share"><Link className="btn btn-paper pop" href={`/projects/${w.id}`}>Open as a full page →</Link></div>
        <div className="m-nav"><button onClick={() => onNav(-1)}>← Previous</button><button onClick={() => onNav(1)}>Next →</button></div>
      </div>
    </div>
  );
}
export function WorkGrid() {
  const [filter, setFilter] = useState<'all' | 'product' | 'client' | 'freelance'>('all');
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => WORK.filter((w) => filter === 'all' || w.kind === filter), [filter]);
  const openAt = (i: number) => { setOpen(i); request('GET', `/projects/${list[i].id}`); };
  return (
    <section id="work" className="sec">
      <p className="eyebrow">Selected work</p>
      <h2 className="h2" data-perch>Things I’ve built <span className="scribble">&amp; shipped</span>.</h2>
      <div className="filters">
        {([['all', `Everything · ${WORK.length}`], ['product', 'My products'], ['freelance', 'Freelance'], ['client', 'Client & company work']] as const).map(([k, l]) => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="grid">
        {list.map((w, i) => (
          <button key={w.id} className={`card ${w.featured ? 'feat' : ''}`} style={{ ['--c' as string]: w.color }}
            data-svc={w.id} data-break data-hide data-push data-perch onMouseMove={tilt} onMouseLeave={untilt} onClick={() => openAt(i)}>
            <span className="c-top"><span className="c-emoji">{w.emoji}</span><span className="c-kind">{w.kind === 'product' ? 'my product' : w.kind === 'freelance' ? 'freelance' : w.org}</span><span className="health" data-health>healthy</span></span>
            <span className="c-name">{w.name}</span>
            <span className="c-tag">{w.tagline}</span>
            {w.stats && <span className="c-stats">{w.stats.map((s) => <i key={s}>{s}</i>)}</span>}
            <span className="c-foot"><span className="c-stack">{flatStack(w).slice(0, 5).map((s) => <Icon key={s} name={s} size={18} />)}</span><b>Open ↗</b></span>
          </button>
        ))}
      </div>
      {open !== null && list[open] && (
        <Modal w={list[open]} onClose={() => setOpen(null)} onNav={(d) => setOpen((o) => (o === null ? null : (o + d + list.length) % list.length))} />
      )}
    </section>
  );
}

/* ---------- journey ---------- */
export function Journey() {
  const [open, setOpen] = useState(0);
  return (
    <section id="timeline" className="sec">
      <p className="eyebrow">Journey</p>
      <h2 className="h2" data-perch>Four teams, many clients. <span className="scribble">Zero boring weeks</span>.</h2>
      <div className="jobs">
        {JOBS.map((j, i) => (
          <div key={j.org} className={`job ${open === i ? 'open' : ''}`} style={{ ['--c' as string]: j.color }} data-break data-hide data-perch
            onClick={() => setOpen(open === i ? -1 : i)}>
            <div className="job-row">
              <span className="job-years">{j.years}</span>
              <span className="job-org">{j.org}<small>{j.role} · {j.where}</small></span>
              <span className="job-badge">{j.badge}</span>
              <span className="job-plus">{open === i ? '−' : '+'}</span>
            </div>
            <div className="job-body"><ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul></div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- toolbox ---------- */
const LAYER_COLOR: Record<string, string> = { frontend: '#9FD0FF', backend: '#B9A6FF', ai: '#FF8FB1', data: '#9FE8C8', security: '#FFB59A', platform: '#FFE07A', tools: '#E8E2D6' };
export function Toolbox() {
  return (
    <section id="skills" className="sec">
      <p className="eyebrow">Toolbox</p>
      <h2 className="h2" data-perch>Tools I reach for <span className="scribble">daily</span>.</h2>
      <p className="lede">Hover a tool to see where I’ve used it. (Keep an eye on them — the monkey steals these.)</p>
      <div className="toolbox">
        {STACK_LAYERS.map((L) => (
          <div key={L.key} className="tb-group" style={{ ['--c' as string]: LAYER_COLOR[L.key] }}>
            <h3 data-perch>{L.label}<small>{L.sub}</small></h3>
            <div className="tb-chips">
              {L.items.map((n: string) => (
                <span key={n} className="chip" data-chip={n} data-push data-tip={STACK_TIPS[n]}><Icon name={n} size={18} />{n}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- live GitHub ---------- */
interface Repo { name: string; html_url: string; description: string | null; stargazers_count: number; language: string | null; pushed_at: string }
export function GitHubLive() {
  const [user, setUser] = useState<{ public_repos: number; followers: number } | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [chartOk, setChartOk] = useState(true);
  useEffect(() => {
    fetch('https://api.github.com/users/vishwajitvm').then((r) => r.ok ? r.json() : null).then(setUser).catch(() => {});
    fetch('https://api.github.com/users/vishwajitvm/repos?sort=pushed&per_page=6').then((r) => r.ok ? r.json() : []).then((d) => Array.isArray(d) && setRepos(d)).catch(() => {});
  }, []);
  return (
    <section id="github" className="sec">
      <p className="eyebrow">Open source</p>
      <h2 className="h2" data-perch>Live from <span className="scribble">GitHub</span>.</h2>
      <div className="gh">
        <div className="gh-stats">
          <div className="tile c-butter" data-perch><b>{user?.public_repos ?? '—'}</b><span>public repositories</span></div>
          <div className="tile c-mint" data-perch><b>{user?.followers ?? '—'}</b><span>followers</span></div>
          <a className="tile c-lilac gh-cta" href="https://github.com/vishwajitvm" target="_blank" rel="noopener"><b>@vishwajitvm</b><span>Follow on GitHub ↗</span></a>
        </div>
        {chartOk && <div className="gh-chart tile"><img src="https://ghchart.rshah.org/FF5B1F/vishwajitvm" alt="GitHub contribution chart" onError={() => setChartOk(false)} /></div>}
        <div className="gh-repos">
          {repos.map((r) => (
            <a key={r.name} href={r.html_url} target="_blank" rel="noopener" className="repo" data-push>
              <b>{r.name}</b><span>{r.description || 'No description yet'}</span>
              <small>{r.language || 'code'} · ★ {r.stargazers_count} · updated {new Date(r.pushed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- contact ---------- */
export function ContactBlock() {
  const [f, setF] = useState({ name: '', email: '', company: '', job: '', budget: '', message: '', resume_url: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState('sending');
    try {
      const res = await fetch(`${API()}/api/contact/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      if (!res.ok) throw new Error();
      setState('sent'); log('OK', 'POST /api/contact 201 — message delivered ✉️');
    } catch { setState('error'); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <section id="contact" className="sec">
      <div className="contact" data-perch>
        <div className="ct-left">
          <p className="eyebrow">Contact</p>
          <h2 className="h2">Got a backend that <span className="scribble">needs to stay up</span>?</h2>
          <p className="lede">Freelance, contract or a full-time role — tell me what you’re building. I reply to every message.</p>
          <button className="mail pop" onClick={async () => { try { await navigator.clipboard.writeText('vishwajitmall50@gmail.com'); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { location.href = 'mailto:vishwajitmall50@gmail.com'; } }}>
            vishwajitmall50@gmail.com <span>{copied ? 'copied ✓' : 'click to copy'}</span>
          </button>
          <div className="socials">
            <a href="https://www.linkedin.com/in/vishwajit-vm-179a61149" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href="https://github.com/vishwajitvm" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="https://hashnode.com/@Vishwajitvm" target="_blank" rel="noopener">Hashnode ↗</a>
            <a href="https://www.twitter.com/VishwajitVm" target="_blank" rel="noopener">X ↗</a>
            <a href="https://pypi.org/user/vishwajitvm/" target="_blank" rel="noopener">PyPI ↗</a>
          </div>
        </div>
        {state === 'sent' ? (
          <div className="ct-form sent"><span className="big">🎉</span><b>Message received!</b><p>Thanks — I’ll get back to you soon.</p></div>
        ) : (
          <form className="ct-form" onSubmit={submit}>
            <label>Your name<input required value={f.name} onChange={set('name')} placeholder="Ada Lovelace" /></label>
            <label>Email<input required type="email" value={f.email} onChange={set('email')} placeholder="ada@company.com" /></label>
            <div className="row2">
              <label>Company<input value={f.company} onChange={set('company')} placeholder="Optional" /></label>
              <label>Budget<select value={f.budget} onChange={set('budget')}><option value="">Optional</option><option>Under $2k</option><option>$2k – $10k</option><option>$10k+</option><option>Full-time role</option></select></label>
            </div>
            <label>What are you building?<textarea required rows={4} value={f.message} onChange={set('message')} placeholder="A few lines about the project…" /></label>
            <button className="btn btn-orange pop" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message →'}</button>
            {state === 'error' && <p className="err">Couldn’t reach the server — email me directly at vishwajitmall50@gmail.com.</p>}
          </form>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wordmark" aria-hidden="true">VISHWAJIT</div>
      <div className="f-row"><span>© 2026 Vishwajit VM · New Delhi</span><span>Built with Next.js, Three.js &amp; one very naughty monkey 🐒</span><a href="#top">Back to top ↑</a></div>
    </footer>
  );
}
