'use client';

import { use } from 'react';
import Link from 'next/link';
import { WORK, workById } from '@/data/work';
import { projectsData } from '@/data/projectsData';
import { Icon } from '@/components/v3/Sections';

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const w = workById(slug);
  const deep = projectsData[slug];

  if (!w) {
    return (
      <main className="site pj-wrap">
        <div className="pj-card pj-404">
          <span className="big">🙈</span>
          <h1 className="h2">This project went missing.</h1>
          <p className="lede">The Chaos Monkey probably hid it. Head back and pick another one.</p>
          <Link className="btn btn-orange pop" href="/#work">← All projects</Link>
        </div>
      </main>
    );
  }

  const i = WORK.findIndex((x) => x.id === w.id);
  const prev = WORK[(i - 1 + WORK.length) % WORK.length], next = WORK[(i + 1) % WORK.length];

  return (
    <main className="site pj-wrap">
      <Link href="/#work" className="pj-back">← Back to all projects</Link>
      <article className="pj-card" style={{ ['--c' as string]: w.color }}>
        <header className="pj-head">
          <span className="m-emoji">{w.emoji}</span>
          <div>
            <p className="m-kind">{w.kind === 'product' ? 'My product' : `Built at ${w.org}`}{w.when ? ` · ${w.when}` : ''}</p>
            <h1>{w.name}</h1>
            <p className="m-tag">{w.tagline}</p>
          </div>
        </header>
        <div className="pj-body">
          {w.stats && <div className="m-stats">{w.stats.map((s) => <span key={s}>{s}</span>)}</div>}
          <p className="m-sum">{w.summary}</p>
          <div className="m-links">
            {w.links.live && <a className="btn btn-orange pop" href={w.links.live} target="_blank" rel="noopener">Visit live site ↗</a>}
            {w.links.code && <a className="btn btn-ink pop" href={w.links.code} target="_blank" rel="noopener">View code ↗</a>}
            {w.links.pypi && <a className="btn btn-paper pop" href={w.links.pypi} target="_blank" rel="noopener">On PyPI ↗</a>}
          </div>

          <h2>What I built</h2>
          <ul className="m-list">{w.bullets.map((b) => <li key={b}>{b}</li>)}</ul>

          <h2>Built with</h2>
          <div className="m-stack">{w.stack.map((s) => <span key={s}><Icon name={s} size={16} />{s}</span>)}</div>

          {deep && (
            <>
              <h2>How it works</h2>
              <p className="pj-text">{deep.architecture || deep.overview}</p>
              {deep.features?.length > 0 && (
                <>
                  <h2>Key features</h2>
                  <div className="pj-grid">
                    {deep.features.map((f) => (
                      <div key={f.title} className="tile pj-feat"><b>{f.title}</b><span>{f.description}</span><small>{f.detail}</small></div>
                    ))}
                  </div>
                </>
              )}
              {deep.techChoices?.length > 0 && (
                <>
                  <h2>Why these tools</h2>
                  <div className="pj-grid">
                    {deep.techChoices.map((t) => (
                      <div key={t.name} className="tile pj-feat"><b>{t.name}</b><span>{t.whyChosen}</span></div>
                    ))}
                  </div>
                </>
              )}
              {deep.apis?.length > 0 && (
                <>
                  <h2>A few of the APIs</h2>
                  <div className="pj-apis">
                    {deep.apis.map((a) => (
                      <div key={a.method + a.path} className="pj-api"><code className={`verb ${a.method}`}>{a.method}</code><code>{a.path}</code><span>{a.desc}</span></div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <nav className="pj-nav">
          <Link href={`/projects/${prev.id}`}>← {prev.emoji} {prev.name}</Link>
          <Link href={`/projects/${next.id}`}>{next.name} {next.emoji} →</Link>
        </nav>
      </article>
    </main>
  );
}
