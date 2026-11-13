'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import type { Work } from '@/data/work';
import { Icon } from '@/components/v3/Icon';

export const kindLabel = (w: Work) =>
  w.kind === 'product' ? 'My product'
    : w.kind === 'oss' ? `Open source · ${w.org}`
      : w.kind === 'freelance' ? 'Freelance project'
        : `Built at ${w.org}`;

const TABS: [string, string][] =[['overview', 'Overview'], ['problem', 'Problem'], ['features', 'What it does'], ['architecture', 'Architecture'], ['stack', 'Tech stack'], ['built', 'What I built'], ['decisions', 'Decisions']];

export function ArchDiagram({ w }: { w: Work }) {
  return (
    <div className="arch" style={{ ['--c' as string]: w.color }}>
      {w.arch.tiers.map((t, i) => (
        <Fragment key={t.name}>
          <div className="tier">
            <span className="tier-name">{t.name}</span>
            <div className="tier-nodes">
              {t.nodes.map((n) => <div key={n.label} className="node"><b>{n.label}</b>{n.sub && <small>{n.sub}</small>}</div>)}
            </div>
          </div>
          {i < w.arch.tiers.length - 1 && <div className="tier-link" aria-hidden="true"><i style={{ animationDelay: `${i * 0.35}s` }} /></div>}
        </Fragment>
      ))}
    </div>
  );
}

export default function ProjectDetail({ w, header = true }: { w: Work; header?: boolean }) {
  const [active, setActive] = useState('overview');
  const root = useRef<HTMLDivElement>(null);
  const tabs = TABS.filter(([k]) => k !== 'decisions' || (w.challenges && w.challenges.length));

  useEffect(() => {
    const els = tabs.map(([k]) => root.current?.querySelector(`[data-sec="${k}"]`)).filter(Boolean) as Element[];
    const io = new IntersectionObserver((es) => {
      const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.getAttribute('data-sec') || 'overview');
    }, { rootMargin: '-20% 0px -65% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [w.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (k: string) => root.current?.querySelector(`[data-sec="${k}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div ref={root} className="pd" style={{ ['--c' as string]: w.color }}>
      {header && (
        <div className="m-head">
          <span className="m-emoji">{w.emoji}</span>
          <div>
            <p className="m-kind">{kindLabel(w)}{w.when ? ` · ${w.when}` : ''} <span className="pd-status">{w.status}</span></p>
            <h3>{w.name}</h3>
            <p className="m-tag">{w.tagline}</p>
          </div>
        </div>
      )}

      <nav className="pd-tabs" aria-label="Jump to section">
        {tabs.map(([k, l]) => <button key={k} className={active === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>)}
      </nav>

      <section data-sec="overview" className="pd-sec">
        <p className="pd-lead">{w.overview}</p>
        {w.stats && <div className="m-stats">{w.stats.map((s) => <span key={s}>{s}</span>)}</div>}
        <p className="pd-aud"><b>Built for:</b> {w.audience}</p>
        <div className="m-links">
          {w.links.live && <a className="btn btn-orange pop" href={w.links.live} target="_blank" rel="noopener">Visit live site ↗</a>}
          {w.links.code && <a className="btn btn-ink pop" href={w.links.code} target="_blank" rel="noopener">View code ↗</a>}
          {w.links.docs && <a className="btn btn-orange pop" href={w.links.docs} target="_blank" rel="noopener">Read the docs ↗</a>}
          {w.links.pypi && <a className="btn btn-paper pop" href={w.links.pypi} target="_blank" rel="noopener">On PyPI ↗</a>}
          {w.links.npm && <a className="btn btn-paper pop" href={w.links.npm} target="_blank" rel="noopener">On npm ↗</a>}
          {!w.links.live && !w.links.code && !w.links.pypi && !w.links.npm && !w.links.docs && <span className="pd-private">🔒 Private client codebase — details shared with permission</span>}
        </div>
        {w.packages && w.packages.length > 0 && (
          <div className="pd-pkgs">
            <h4 className="pd-h">Packages on npm</h4>
            <ul>
              {w.packages.map((p) => (
                <li key={p.name}><a href={p.url} target="_blank" rel="noopener"><code>{p.name}</code> ↗</a><span>{p.note}</span></li>
              ))}
            </ul>
          </div>
        )}
        <p className="pd-scroll">↓ Scroll to explore the problem, architecture and stack</p>
      </section>

      <section data-sec="problem" className="pd-sec">
        <div className="pd-two">
          <div className="pd-box rose"><span className="pd-ic">😩</span><h4>The problem</h4><p>{w.problem}</p></div>
          <div className="pd-box mint"><span className="pd-ic">💡</span><h4>Why it matters</h4><p>{w.why}</p></div>
        </div>
      </section>

      <section data-sec="features" className="pd-sec">
        <h4 className="pd-h">What you can do with it</h4>
        <div className="pd-caps">
          {w.capabilities.map((c, i) => <div key={c} className="pd-cap"><b>{String(i + 1).padStart(2, '0')}</b><span>{c}</span></div>)}
        </div>
      </section>

      <section data-sec="architecture" className="pd-sec">
        <h4 className="pd-h">How it’s built</h4>
        <p className="pd-note">A simplified view of the architecture — follow the dots as a request moves down the layers.</p>
        <ArchDiagram w={w} />
        <h4 className="pd-h">A request, step by step</h4>
        <ol className="pd-flow">{w.arch.flow.map((f) => <li key={f}>{f}</li>)}</ol>
      </section>

      <section data-sec="stack" className="pd-sec">
        <h4 className="pd-h">Tech stack</h4>
        <div className="pd-stack">
          {Object.entries(w.stack).map(([group, items]) => (
            <div key={group} className="pd-sg"><span>{group}</span><div className="m-stack">{items.map((s) => <span key={s}><Icon name={s} size={16} />{s}</span>)}</div></div>
          ))}
        </div>
      </section>

      <section data-sec="built" className="pd-sec">
        <h4 className="pd-h">What I built</h4>
        <ul className="m-list">{w.built.map((b) => <li key={b}>{b}</li>)}</ul>
      </section>

      {w.challenges && w.challenges.length > 0 && (
        <section data-sec="decisions" className="pd-sec">
          <h4 className="pd-h">Hard problems &amp; how I solved them</h4>
          <div className="pd-qa">
            {w.challenges.map((c) => <div key={c.q} className="pd-q"><b>❓ {c.q}</b><p>✅ {c.a}</p></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
