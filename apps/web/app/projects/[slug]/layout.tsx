// Server-side metadata for /projects/<slug>. page.tsx is a client component, so it can't export metadata itself.
// Without this, every project page inherited the site-wide og:url (the homepage), and LinkedIn followed it,
// showing the homepage card instead of the project's own preview image.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { workById } from '@/data/work';

const SITE = 'https://vishwajit-labs-web.vercel.app';

// LinkedIn wants 100+ characters; keep it under ~200 so previews don't cut mid-word.
function describe(text: string) {
  if (text.length <= 200) return text;
  const cut = text.slice(0, 200);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = workById(slug);
  if (!w) return { title: 'Project not found — Vishwajit VM' };

  const title = `${w.name} — ${w.tagline}`;
  const description = describe(w.overview);
  const url = `${SITE}/projects/${w.id}`;
  return {
    title: `${w.name} · Case study — Vishwajit VM`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Vishwajit Labs', locale: 'en_US', type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return children;
}
