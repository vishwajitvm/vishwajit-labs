// Renders a custom 1200x627 PNG per project into public/project-thumbs/<slug>.png
// (used as LinkedIn project media). Each image shows the project's own architecture.
// Usage: node scripts/render-thumbs.mjs [slug ...]   (no args = every project)
import { writeFile, mkdir } from 'node:fs/promises';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import { WORK } from '../data/work.ts';

const W = 1200, H = 627;
const C = { cream: '#f4efe6', paper: '#fffdf8', ink: '#15130f', ink2: '#3b3832', muted: '#6f6a62', orange: '#ff5b1f' };
const OUT = new URL('../public/project-thumbs/', import.meta.url);

const kindLabel = (w) =>
  w.kind === 'product' ? 'My product' : w.kind === 'oss' ? 'Open source' : w.kind === 'freelance' ? 'Freelance project' : `Built at ${w.org}`;
const statusColor = (s) => {
  const t = s.toLowerCase();
  if (/live|on pypi/.test(t)) return '#16a34a';
  if (/complete|built/.test(t)) return '#7c3aed';
  if (/development|designed|phase/.test(t)) return '#d97706';
  if (/open source/.test(t)) return '#2563eb';
  return '#6b7280';
};
// Lighter tints of the project colour for the tier cards.
const tint = (hex, a) => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const mix = (c) => Math.round(c * a + 255 * (1 - a));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

async function loadFont(weight, text) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}&text=${encodeURIComponent(text)}`,
  ).then((r) => r.text());
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`font ${weight} not found`);
  return fetch(src).then((r) => r.arrayBuffer());
}

const box = (style, ...children) => h('div', { style: { display: 'flex', ...style } }, ...children);

async function render(w) {
  const kind = kindLabel(w).toUpperCase();
  // Architecture: at most 5 tiers × 3 nodes, labels only (no internal numbers).
  const tiers = w.arch.tiers.slice(0, 5).map((t) => ({
    name: clip(t.name, 16).toUpperCase(),
    nodes: t.nodes.slice(0, 3).map((n) => clip(n.label, 34)),
  }));
  const n = tiers.length;
  const arrowW = 34;
  const colW = Math.floor((W - 128 - arrowW * (n - 1)) / n);
  const nodeSize = colW < 190 ? 17 : 19;
  const nameSize = w.name.length <= 14 ? 66 : w.name.length <= 22 ? 56 : 46;
  const tagline = clip(w.tagline, 64);

  const glyphs = [w.name, tagline, kind, w.status, ...tiers.flatMap((t) => [t.name, ...t.nodes]),
    'HOW IT WORKS', 'Case study · Vishwajit VM', 'vishwajit-labs-web.vercel.app', 'VM→…'].join('');
  const [xb, sb] = await Promise.all([loadFont(800, glyphs), loadFont(600, glyphs)]);

  const pill = (text, extra = {}) => box({
    alignItems: 'center', gap: 9, padding: '7px 16px', borderRadius: 999, backgroundColor: C.paper,
    border: `3px solid ${C.ink}`, fontSize: 18, fontWeight: 800, letterSpacing: 1, ...extra,
  }, text);

  const tree = box(
    {
      width: '100%', height: '100%', position: 'relative', flexDirection: 'column', fontFamily: 'Bricolage', color: C.ink,
      backgroundColor: C.cream,
      backgroundImage: 'radial-gradient(circle, rgba(21,19,15,0.10) 1.6px, transparent 1.6px)', backgroundSize: '26px 26px',
    },
    // accent band
    box({ position: 'absolute', left: 0, top: 0, width: '100%', height: 16, backgroundColor: w.color, borderBottom: `3px solid ${C.ink}` }),

    // header: emoji tile + title block
    box({ padding: '50px 64px 0 64px', alignItems: 'center', gap: 40 },
      box({
        width: 170, height: 170, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 40,
        backgroundColor: w.color, border: `4px solid ${C.ink}`, boxShadow: `9px 9px 0 ${C.ink}`, transform: 'rotate(-6deg)', fontSize: 96,
      }, w.emoji),
      box({ flexDirection: 'column', flexGrow: 1 },
        box({ gap: 12 },
          pill(kind, { boxShadow: `3px 3px 0 ${C.ink}` }),
          pill(box({ alignItems: 'center', gap: 9, fontWeight: 600, letterSpacing: 0 },
            box({ width: 12, height: 12, borderRadius: 999, backgroundColor: statusColor(w.status) }), w.status)),
        ),
        box({ marginTop: 16, fontSize: nameSize, fontWeight: 800, lineHeight: 1.0, letterSpacing: -2 }, w.name),
        box({ marginTop: 10, fontSize: 28, fontWeight: 600, lineHeight: 1.2, color: C.ink2 }, tagline),
      ),
    ),

    // architecture
    box({ padding: '30px 64px 0 64px', alignItems: 'center', gap: 12 },
      box({ fontSize: 16, fontWeight: 800, letterSpacing: 2, color: C.muted }, 'HOW IT WORKS'),
      box({ flexGrow: 1, height: 3, backgroundColor: C.ink, opacity: 0.15, borderRadius: 2 }),
    ),
    box({ padding: '14px 64px 0 64px', alignItems: 'flex-start' },
      ...tiers.flatMap((t, i) => {
        const col = box({
          width: colW, flexDirection: 'column', borderRadius: 18, border: `3px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`,
          backgroundColor: tint(w.color, i % 2 ? 0.28 : 0.5), overflow: 'hidden',
        },
          box({ padding: '8px 12px', backgroundColor: C.ink, color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }, t.name),
          box({ flexDirection: 'column', gap: 8, padding: 10 },
            ...t.nodes.map((label) => box({
              padding: '8px 11px', borderRadius: 11, backgroundColor: C.paper, border: `2px solid ${C.ink}`,
              fontSize: nodeSize, fontWeight: 600, lineHeight: 1.15,
            }, label)),
          ),
        );
        return i < n - 1
          ? [col, box({ width: arrowW, height: 60, alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800 }, '→')]
          : [col];
      }),
    ),

    // footer
    box({ position: 'absolute', left: 64, right: 64, bottom: 26, alignItems: 'center', justifyContent: 'space-between' },
      box({ alignItems: 'center', gap: 12 },
        box({
          width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: C.orange,
          color: '#fff', border: `3px solid ${C.ink}`, fontSize: 15, fontWeight: 800,
        }, 'VM'),
        box({ fontSize: 20, fontWeight: 800 }, 'Case study · Vishwajit VM'),
      ),
      box({ fontSize: 18, fontWeight: 600, color: C.muted }, 'vishwajit-labs-web.vercel.app'),
    ),
  );

  const res = new ImageResponse(tree, {
    width: W, height: H, emoji: 'twemoji',
    fonts: [
      { name: 'Bricolage', data: xb, weight: 800, style: 'normal' },
      { name: 'Bricolage', data: sb, weight: 600, style: 'normal' },
    ],
  });
  return Buffer.from(await res.arrayBuffer());
}

const only = process.argv.slice(2);
await mkdir(OUT, { recursive: true });
for (const w of WORK.filter((x) => !only.length || only.includes(x.id))) {
  const png = await render(w);
  await writeFile(new URL(`${w.id}.png`, OUT), png);
  console.log(`${w.id}.png  ${(png.length / 1024).toFixed(0)} KB`);
}
