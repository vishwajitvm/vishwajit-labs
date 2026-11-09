'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { About, ContactBlock, Footer, GitHubLive, Journey, Marquee, Nav, Toolbox, WorkGrid } from '@/components/v3/Sections';
import { AskAI, MonkeyPanel } from '@/components/v3/Widgets';

// WebGL layers are client-only.
const ClayHero = dynamic(() => import('@/components/v3/ClayHero'), { ssr: false, loading: () => <section className="hero" id="top" /> });
const ChaosMonkey = dynamic(() => import('@/components/v3/ChaosMonkey'), { ssr: false });

export default function Home() {
  useEffect(() => {
    // Visit analytics → existing backend (unchanged behaviour).
    const api = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
    fetch(`${api}/api/analytics/log-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: window.location.pathname,
        referrer: document.referrer || 'direct',
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      }),
    }).catch(() => {});

    // Reveal-on-scroll for anything marked [data-reveal]-able.
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.12 });
    document.querySelectorAll('.sec').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="site">
      <Nav />
      <ClayHero />
      <Marquee />
      <About />
      <WorkGrid />
      <Journey />
      <Toolbox />
      <GitHubLive />
      <ContactBlock />
      <Footer />
      <AskAI />
      <MonkeyPanel />
      <ChaosMonkey />
    </main>
  );
}
