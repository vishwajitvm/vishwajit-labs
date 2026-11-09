// Share preview (og:image) for LinkedIn, X, WhatsApp, Slack… Generated once at build time.
// Same look as the hero: cream dot-grid paper, ink outlines, chunky clay blocks.
import { ImageResponse } from 'next/og';

export const alt = 'Vishwajit VM — Backend & AI Engineer. I build backends that don’t break.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const C = {
  cream: '#f4efe6', paper: '#fffdf8', ink: '#15130f', ink2: '#3b3832', muted: '#6f6a62',
  orange: '#ff5b1f', lilac: '#b9a6ff', mint: '#9fe8c8', butter: '#ffe07a', sky: '#9fd0ff', peach: '#ffb59a', teal: '#3dd6c8',
};

const HEAD = ['I build backends', 'that', 'don’t break.'];
const PILL = 'Available for freelance & contract work';
const NAME = 'Vishwajit VM';
const ROLE = 'Backend & AI Engineer · New Delhi';
const STACK = 'Python · FastAPI · Node.js · NestJS · LLM & RAG';
const URL_TEXT = 'vishwajit-labs-web.vercel.app';

// [label, background, text colour, left, top, rotate°]
const BLOCKS: [string, string, string, number, number, number][] = [
  ['PostgreSQL', C.sky, C.ink, 838, 70, -6],
  ['FastAPI', C.teal, C.ink, 990, 168, 5],
  ['Redis', C.orange, '#fff', 846, 210, 4],
  ['LLM · RAG', C.butter, C.ink, 930, 306, -4],
  ['NestJS', C.peach, C.ink, 830, 368, -3],
  ['Docker', C.lilac, C.ink, 1010, 418, 6],
];

/** Bricolage Grotesque (the site's display font) as TTF, subset to the glyphs we draw. */
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
    return null; // offline build → falls back to the default font instead of failing
  }
}

export default async function Image() {
  const glyphs = [...HEAD, PILL, NAME, ROLE, STACK, URL_TEXT, 'VM', ...BLOCKS.map((b) => b[0])].join('');
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
          backgroundSize: '26px 26px',
          fontFamily: 'Bricolage', color: C.ink,
        }}
      >
        {/* left: copy */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '62px 0 0 72px', width: 780 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', alignSelf: 'flex-start', gap: 12,
              padding: '10px 22px', borderRadius: 999, backgroundColor: C.mint,
              border: `3px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`,
              fontSize: 24, fontWeight: 600,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: '#16a34a' }} />
            {PILL}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30, fontSize: 86, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3 }}>
            <div style={{ display: 'flex' }}>{HEAD[0]}</div>
            <div style={{ display: 'flex' }}>
              <div style={{ display: 'flex', marginRight: 22 }}>{HEAD[1]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', color: C.orange }}>
                {HEAD[2]}
                <svg width="430" height="18" viewBox="0 0 430 18" style={{ marginTop: 2 }}>
                  <path
                    d="M2 11 Q 15 1 28 9 T 54 9 T 80 9 T 106 9 T 132 9 T 158 9 T 184 9 T 210 9 T 236 9 T 262 9 T 288 9 T 314 9 T 340 9 T 366 9 T 392 9 T 418 9"
                    fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', marginTop: 30, fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>{NAME}</div>
          <div style={{ display: 'flex', marginTop: 6, fontSize: 28, fontWeight: 600, color: C.ink2 }}>{ROLE}</div>
          <div style={{ display: 'flex', marginTop: 10, fontSize: 24, fontWeight: 600, color: C.muted }}>{STACK}</div>
        </div>

        {/* right: the clay block pile */}
        {BLOCKS.map(([label, bg, fg, left, top, rot]) => (
          <div
            key={label}
            style={{
              position: 'absolute', left, top, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px 26px', borderRadius: 26, backgroundColor: bg, color: fg,
              border: `3px solid ${C.ink}`, boxShadow: `7px 7px 0 ${C.ink}`,
              fontSize: 30, fontWeight: 800, letterSpacing: -0.5, transform: `rotate(${rot}deg)`,
            }}
          >
            {label}
          </div>
        ))}

        {/* footer */}
        <div
          style={{
            position: 'absolute', left: 72, bottom: 40, display: 'flex', alignItems: 'center', gap: 14,
            fontSize: 26, fontWeight: 600, color: C.ink,
          }}
        >
          <div
            style={{
              width: 52, height: 52, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: C.orange, color: '#fff', border: `3px solid ${C.ink}`, fontSize: 20, fontWeight: 800,
            }}
          >
            VM
          </div>
          {URL_TEXT}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
