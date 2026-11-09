'use client';

import { STACK_ICONS } from '@/data/stackIcons';

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const ic = STACK_ICONS[name] || STACK_ICONS[name.replace(/\.js$/, '')];
  if (!ic) return null;
  if (ic.svg) return <svg viewBox={ic.vb} width={size} height={size} className="ico" dangerouslySetInnerHTML={{ __html: ic.svg }} />;
  return <span className="ico emoji" style={{ fontSize: size - 2 }}>{ic.emoji}</span>;
}
