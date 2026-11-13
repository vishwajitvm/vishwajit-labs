// Per-project share preview (og:image) for /projects/<slug> — used by LinkedIn, X, WhatsApp, Slack…
// Same visual language as the site-wide preview: cream dot-grid paper, ink outlines, clay blocks.
// Employer-internal metrics are intentionally left out: only name, tagline, status and stack.
import { ImageResponse } from 'next/og';
import { workById, flatStack, type Work } from '@/data/work';

export const alt = 'Project case study by Vishwajit VM';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const C = { cream: '#f4efe6', paper: '#fffdf8', ink: '#15130f', ink2: '#3b3832', muted: '#6f6a62', orange: '#ff5b1f' };
const CHIP_COLORS = ['#9fd0ff', '#b9a6ff', '#9fe8c8', '#ffe07a', '#ffb59a', '#ff8fb1'];
const URL_TEXT = 'vishwajit-labs-web.vercel.app';

const kindLabel = (w: Work) =>
  w.kind === 'product' ? 'My product' : w.kind === 'oss' ? 'Open source' : w.kind === 'freelance' ? 'Freelance project' : `Built at ${w.org}`;
const statusColor = (s: string) => {
  const t = s.toLowerCase();
  if (/live|on pypi/.test(t)) return '#16a34a';
  if (/complete|built/.test(t)) return '#7c3aed';
  if (/development|designed|phase/.test(t)) return '#d97706';
  if (/open source/.test(t)) return '#2563eb';
  return '#6b7280';
};

async function loadFont(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}&text=${encodeURIComponent(text)}`,
    ).then((r) => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null; // offline → default font instead of failing
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = workById(slug);
  const name = w?.name ?? 'Project';
  const tagline = w?.tagline ?? 'A project by Vishwajit VM';
  const color = w?.color ?? C.orange;
  const kind = (w ? kindLabel(w) : 'Project').toUpperCase();
  const status = w?.status ?? '';
  // Tech blocks: keep them on ONE row so they never run into the footer.
  const chips: string[] = [];
  let rowWidth = 0;
  for (const s of w ? flatStack(w) : []) {
    if (s.length > 18 || chips.length >= 5) continue;
    const width = s.length * 14.5 + 46 + 14; // text + padding/border + gap
    if (rowWidth + width > 720) break;
    chips.push(s);
    rowWidth += width;
  }
  const nameSize = name.length <= 12 ? 96 : name.length <= 20 ? 80 : 66;

  const glyphs = [name, tagline, kind, status, ...chips, URL_TEXT, 'VM', 'Case study · Vishwajit VM'].join('');
  const [extraBold, bold] = await Promise.all([loadFont(800, glyphs), loadFont(600, glyphs)]);
  const fonts = [
    ...(extraBold ? [{ name: 'Bricolage', data: extraBold, weight: 800 as const, style: 'normal' as const }] : []),
    ...(bold ? [{ name: 'Bricolage', data: bold, weight: 600 as const, style: 'normal' as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', position: 'relative',
          backgroundColor: C.cream,
          backgroundImage: 'radial-gradient(circle, rgba(21,19,15,0.10) 1.6px, transparent 1.6px)',
          backgroundSize: '26px 26px', fontFamily: 'Bricolage', color: C.ink,
        }}
      >
        {/* accent band */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 18, display: 'flex', backgroundColor: color, borderBottom: `3px solid ${C.ink}` }} />

        {/* left: copy */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '64px 0 0 72px', width: 790 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              display: 'flex', padding: '9px 20px', borderRadius: 999, backgroundColor: C.paper,
              border: `3px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`, fontSize: 22, fontWeight: 800, letterSpacing: 1.5,
            }}>{kind}</div>
            {status && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', borderRadius: 999, backgroundColor: C.paper,
                border: `3px solid ${C.ink}`, fontSize: 22, fontWeight: 600,
              }}>
                <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: statusColor(status) }} />
                {status}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', marginTop: 34, fontSize: nameSize, fontWeight: 800, lineHeight: 1.0, letterSpacing: -2.5 }}>{name}</div>
          <div style={{ display: 'flex', marginTop: 22, fontSize: 36, fontWeight: 600, lineHeight: 1.25, color: C.ink2 }}>{tagline}</div>

          <div style={{ display: 'flex', gap: 14, marginTop: 34 }}>
            {chips.map((c, i) => (
              <div key={c} style={{
                display: 'flex', padding: '10px 20px', borderRadius: 16, backgroundColor: CHIP_COLORS[i % CHIP_COLORS.length],
                border: `3px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`, fontSize: 24, fontWeight: 800,
              }}>{c}</div>
            ))}
          </div>
        </div>

        {/* right: big clay tile with the project emoji */}
        <div style={{
          position: 'absolute', right: 86, top: 120, width: 270, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 54, backgroundColor: color, border: `4px solid ${C.ink}`, boxShadow: `12px 12px 0 ${C.ink}`,
          transform: 'rotate(-6deg)', fontSize: 150,
        }}>{w?.emoji ?? '✨'}</div>

        {/* footer */}
        <div style={{ position: 'absolute', left: 72, bottom: 40, display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 600 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: C.orange, color: '#fff', border: `3px solid ${C.ink}`, fontSize: 20, fontWeight: 800,
          }}>VM</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontWeight: 800 }}>Case study · Vishwajit VM</div>
            <div style={{ display: 'flex', fontSize: 22, color: C.muted }}>{URL_TEXT}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts, emoji: 'twemoji' },
  );
}
