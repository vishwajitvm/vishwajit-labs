'use client';

import Link from 'next/link';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { STACK_ICONS, STACK_LAYERS, STACK_TIPS } from '@/data/stackIcons';

/* ---------------------------------------------------------------- shared hover helpers */
function spotlight(e: ReactMouseEvent<HTMLElement>) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  el.style.setProperty('--mx', `${x}px`); el.style.setProperty('--my', `${y}px`);
  el.style.transform = `perspective(900px) rotateY(${(x / r.width - 0.5) * 9}deg) rotateX(${-(y / r.height - 0.5) * 9}deg) translateY(-4px)`;
}
function unspot(e: ReactMouseEvent<HTMLElement>) { e.currentTarget.style.transform = ''; }
function magnet(e: ReactMouseEvent<HTMLElement>) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px) scale(1.06)`;
}
function unmagnet(e: ReactMouseEvent<HTMLElement>) { e.currentTarget.style.transform = ''; }

function Head({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <div className="sec-head">
      <p className="kicker">{kicker}</p>
      <h2 className="sec-title" data-perch>{title}</h2>
      <p className="lede">{lede}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- overview */
const STATS = [
  { n: '5+', l: 'years shipping backends', c: '#818cf8' },
  { n: '24', l: 'products & projects built', c: '#22d3ee' },
  { n: '244', l: 'API operations I run solo at SPNX', c: '#34d399' },
  { n: '3/3', l: 'security audits (VAPT) passed', c: '#f472b6' },
];
export function Overview() {
  return (
    <section id="about" className="lab-sec" data-svc="overview-svc">
      <Head kicker="system overview" title="The person behind the uptime"
        lede="I’m a backend and AI engineer from New Delhi. For 5+ years I’ve built the part of apps you don’t see — APIs, databases, queues and AI agents — for hiring, real estate, finance, retail and civic-tech companies. I care about one thing above all: systems that keep working when something goes wrong." />
      <div className="stats">
        {STATS.map((s) => (
          <div key={s.l} className="stat card-lab" data-break data-perch data-hide style={{ ['--c' as string]: s.c }} onMouseMove={spotlight} onMouseLeave={unspot}>
            <b>{s.n}</b><span>{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- services (projects) */
interface Svc { id: string; name: string; desc: string; metrics: string[]; tech: string; href: string; cta: string; c: string; external?: boolean }
const SERVICES: Svc[] = [
  { id: 'devflow-svc', name: 'DevFlow-AI', desc: 'Self-hosted AI code review, auto-fix and CI/CD for GitHub & GitLab. Every write is gated; every run is sandboxed.', metrics: ['132 endpoints', '502 tests', '9 agent roles'], tech: 'FastAPI · Celery · Postgres · Redis · MCP · Ollama', href: 'https://github.com/vishwajitvm/DevFlow-AI', cta: 'View code', c: '#f59e0b', external: true },
  { id: 'tallyko-svc', name: 'Tallyko POS', desc: 'Multi-tenant billing for restaurants and shops, with an offline-first mobile app that never double-bills.', metrics: ['38 tables · RLS', '400+ tests', 'offline-first'], tech: 'FastAPI · PostgreSQL · Redis · React Native', href: '/projects/tallyko', cta: 'Read the case study', c: '#34d399' },
  { id: 'tracenest-svc', name: 'TraceNest', desc: 'Zero-dependency, thread-safe Python logging SDK that masks secrets and ships with a live log viewer.', metrics: ['on PyPI', '18 releases', '0 deps'], tech: 'Python · FastAPI middleware', href: '/projects/tracenest', cta: 'Read the case study', c: '#818cf8' },
  { id: 'hopline-svc', name: 'Hopline', desc: 'Peer-to-peer, end-to-end encrypted file transfer in the browser, on desktop and from the CLI.', metrics: ['10 GB in 57s', 'AES-256-GCM', '3 platforms'], tech: 'WebRTC · Node.js · React · Electron', href: 'https://hopline.onrender.com', cta: 'Try it live', c: '#22d3ee', external: true },
  { id: 'tenantmind-svc', name: 'TenantMind AI', desc: 'Property-management AI where every tenant’s data, vectors and prompts stay completely isolated.', metrics: ['DB per tenant', 'Keycloak JWT', 'LLM fallback'], tech: 'FastAPI · MongoDB · Qdrant · Celery', href: '/projects/tenantmind-ai', cta: 'Read the case study', c: '#a78bfa' },
  { id: 'agenthive-svc', name: 'AgentHive', desc: 'A multi-agent platform: an LLM router configured from the database, 40 tools with per-agent allow-lists.', metrics: ['40 tools', 'pgvector memory', 'ReAct agents'], tech: 'FastAPI · PostgreSQL · pgvector · Next.js', href: '/projects/agenthive', cta: 'Read the case study', c: '#f472b6' },
  { id: 'policybot-svc', name: 'PolicyBot', desc: 'Hybrid RAG over company policies — vector + keyword search, freshness-aware ranking, citations.', metrics: ['hybrid search', 'citations', 'confidence scores'], tech: 'FastAPI · Qdrant · LangGraph', href: '/projects/policybot', cta: 'Read the case study', c: '#60a5fa' },
  { id: 'repomind-svc', name: 'RepoMind', desc: 'Ask any GitHub repository a question in plain English; answers cite the exact file and line.', metrics: ['AST chunking', '9 LLM providers', 'file:line cites'], tech: 'LangGraph · Qdrant · FastAPI · React', href: 'https://github.com/vishwajitvm/RepoMind', cta: 'View code', c: '#e879f9', external: true },
  { id: 'smarthr-svc', name: 'Smart HR', desc: 'An AI interviewer that screens candidates and runs stateful first-round interviews (built at Bee Logical).', metrics: ['LangGraph', 'RAG on JDs', 'auto-scoring'], tech: 'FastAPI · LangChain · Gemini · MongoDB', href: '/projects/smart-hr-bot', cta: 'Read the case study', c: '#fb7185' },
];
function Spark({ c, seed }: { c: string; seed: number }) {
  const pts = Array.from({ length: 24 }, (_, i) => `${i * 5},${(18 - Math.abs(Math.sin(i * 0.9 + seed) * 9) - ((i * 7 + seed * 13) % 5)).toFixed(1)}`).join(' ');
  return <svg className="spark" viewBox="0 0 115 22" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={c} strokeWidth="1.6" /></svg>;
}
export function Services() {
  return (
    <section id="projects" className="lab-sec">
      <Head kicker="services in production" title="Things I’ve built"
        lede="Each project is a live service. Hover for a spotlight, click to open it — and keep an eye on the monkey: if it crashes one, watch it recover." />
      <div className="svc-grid">
        {SERVICES.map((s, i) => {
          const inner = (
            <>
              <div className="svc-top"><code>{s.id}</code><span className="health" data-health>healthy</span></div>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <div className="pills">{s.metrics.map((m) => <span key={m}>{m}</span>)}</div>
              <Spark c={s.c} seed={i + 1} />
              <div className="svc-foot"><span>{s.tech}</span><b>{s.cta} →</b></div>
            </>
          );
          const common = { className: 'svc card-lab', 'data-svc': s.id, 'data-break': '', 'data-hide': '', 'data-push': '', 'data-perch': '',
            style: { ['--c' as string]: s.c }, onMouseMove: spotlight, onMouseLeave: unspot };
          return s.external
            ? <a key={s.id} href={s.href} target="_blank" rel="noopener" {...common}>{inner}</a>
            : <Link key={s.id} href={s.href} {...common}>{inner}</Link>;
        })}
      </div>
      <p className="more-note">Also in the lab: <a href="https://github.com/vishwajitvm/LokTathya" target="_blank" rel="noopener">LokTathya</a> (civic data + grounded AI), <a href="https://github.com/vishwajitvm/OmniShell" target="_blank" rel="noopener">OmniShell</a> (plain-English OS automation) and <a href="https://github.com/vishwajitvm" target="_blank" rel="noopener">more on GitHub →</a></p>
    </section>
  );
}

/* ---------------------------------------------------------------- stack (skills) */
const LAYER_COLORS: Record<string, string> = { frontend: '#38bdf8', backend: '#818cf8', ai: '#a78bfa', data: '#34d399', security: '#f472b6', platform: '#fbbf24', tools: '#94a3b8' };
export function Stack() {
  return (
    <section id="skills" className="lab-sec">
      <Head kicker="architecture layers" title="My stack, top to bottom"
        lede="From what users see down to what keeps it running. Hover a tool to see where I’ve used it — and guard them, the monkey likes to steal these." />
      <div className="layers">
        {STACK_LAYERS.map((L) => (
          <div key={L.key} className="layer" data-svc={`${L.key}-layer`} style={{ ['--c' as string]: LAYER_COLORS[L.key] }}>
            <div className="layer-name" data-perch><b>{L.label}</b><span>{L.sub}</span></div>
            <div className="chips">
              {L.items.map((name: string) => {
                const ic = STACK_ICONS[name];
                return (
                  <span key={name} className="chip-lab" data-chip={name} data-push data-tip={STACK_TIPS[name]} onMouseMove={magnet} onMouseLeave={unmagnet}>
                    {ic?.svg ? <svg viewBox={ic.vb} className="ico" dangerouslySetInnerHTML={{ __html: ic.svg }} /> : <span className="ico emoji">{ic?.emoji}</span>}
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- experience as deploy history */
const RELEASES = [
  { v: 'v4.0', org: 'SPNX', role: 'Backend Developer', where: 'Noida', when: 'Oct 2026 – now', tag: 'live', c: '#a78bfa',
    notes: ['Sole backend developer on FLO, an EU VAT-registration platform', '244 API operations across 34 NestJS modules, 63 Prisma models', 'Workflow engine where each country’s process is configuration, not code', 'Microsoft Entra ID sign-in, RBAC with 4 roles & 21 permissions — passed 3 security audits'] },
  { v: 'v3.0', org: 'Bee Logical Software Solutions', role: 'Full Stack Developer', where: 'Pune', when: 'Nov 2022 – Jun 2026', tag: '🏆 award', c: '#34d399',
    notes: ['Outstanding Performance Award, November 2024', 'SmartHR: LangGraph AI interviews + RAG over job descriptions', 'SetBot booking APIs with JWT + RBAC · Bella Canvas 3D design backend', 'Also MahaEseva, Havu, Firmway and Telosa'] },
  { v: 'v2.0', org: 'WebReinvent', role: 'Software Developer', where: 'New Delhi', when: 'Jul – Oct 2022', tag: 'shipped', c: '#22d3ee',
    notes: ['Features, backend modules, APIs and fixes for VaahCMS, an open-source Laravel + Vue CMS'] },
  { v: 'v1.0', org: 'BluBrandz Technologies', role: 'Full Stack Developer', where: 'New Delhi', when: 'Aug 2021 – Jun 2022', tag: 'init', c: '#818cf8',
    notes: ['First production apps: Angle Fertility (hospital management), Aragma (events) and Unicorn Equipments (machinery tracking)'] },
];
export function DeployHistory() {
  return (
    <section id="timeline" className="lab-sec">
      <Head kicker="deploy history" title="Where I’ve shipped"
        lede="Four releases so far. Every one went to production — and stayed there." />
      <div className="releases">
        {RELEASES.map((r) => (
          <div key={r.v} className="release card-lab" data-svc={`${r.org.split(' ')[0].toLowerCase()}-release`} data-break data-hide data-perch
            style={{ ['--c' as string]: r.c }} onMouseMove={spotlight} onMouseLeave={unspot}>
            <div className="rel-top"><code>{r.v}</code><span className="tag">{r.tag}</span><span className="health" data-health>healthy</span></div>
            <h3>{r.org}</h3>
            <p className="rel-role">{r.role} · {r.where} · <i>{r.when}</i></p>
            <ul>{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
