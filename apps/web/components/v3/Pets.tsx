'use client';

// The pets (Chaos Monkey + Pink Snake) are off by default. Their code and WebGL canvases load only
// once a visitor lets them out from the panel, and unload again when they're hidden.
import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import { metrics, subscribe } from '@/lib/chaos';

const ChaosMonkey = dynamic(() => import('@/components/v3/ChaosMonkey'), { ssr: false });
const PinkSnake = dynamic(() => import('@/components/v3/PinkSnake'), { ssr: false });

export default function Pets() {
  const on = useSyncExternalStore(subscribe, () => metrics.monkeyVisible, () => false);
  if (!on) return null;
  return (
    <>
      <ChaosMonkey />
      <PinkSnake />
    </>
  );
}
