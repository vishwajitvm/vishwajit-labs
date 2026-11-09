'use client';

import { use } from 'react';
import Link from 'next/link';
import { WORK, workById } from '@/data/work';
import ProjectDetail from '@/components/v3/ProjectDetail';

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const w = workById(slug);

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
      <article className="pj-card pj-detail" style={{ ['--c' as string]: w.color }}>
        <ProjectDetail w={w} />
        <nav className="pj-nav">
          <Link href={`/projects/${prev.id}`}>← {prev.emoji} {prev.name}</Link>
          <Link href={`/projects/${next.id}`}>{next.name} {next.emoji} →</Link>
        </nav>
      </article>
    </main>
  );
}
