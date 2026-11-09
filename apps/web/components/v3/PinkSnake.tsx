'use client';

/*
 * Pink Snake: a cute, stretchy 3D snake that lives on the page next to the Chaos Monkey.
 * It slithers, sidewinds, inch-crawls and belly-slides; wraps words, cards and whole sections
 * (sometimes squeezing so hard they shatter and self-heal); swallows skill chips; sheds its skin;
 * rears up and hisses; chases its tail; and picks fights with the monkey.
 *
 * Two transparent canvases share one scene: one sits BEHIND the page's cards and renders only
 * z < 0, the other sits IN FRONT and renders only z > 0. A coil that goes round a card therefore
 * really passes behind it and comes back round the front.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { bus, log, metrics, send, setHealth, subscribe } from '@/lib/chaos';
import { isBrawling, makeBandage, makeStars, pets, startBrawl } from '@/lib/pets';
import { createShards } from '@/lib/shatter';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const V3 = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);
const cr = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
const cumLen = (pts: THREE.Vector3[]) => {
  const c = new Array<number>(pts.length); c[0] = 0;
  for (let i = 1; i < pts.length; i++) c[i] = c[i - 1] + pts[i].distanceTo(pts[i - 1]);
  return c;
};
const sampleInto = (pts: THREE.Vector3[], cum: number[], s: number, out: THREE.Vector3) => {
  const last = cum.length - 1;
  if (s <= 0) { out.copy(pts[0]); return; }
  if (s >= cum[last]) { out.copy(pts[last]); return; }
  let lo = 0, hi = last;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
  const seg = cum[hi] - cum[lo] || 1;
  out.lerpVectors(pts[lo], pts[hi], (s - cum[lo]) / seg);
};

const N = 44;        // spine points (physics)
const RINGS = 150;   // rings drawn along the body
const RAD = 14;      // vertices per ring
type Gen = Generator<void, void, number>;
type Gait = 'slither' | 'sidewind' | 'crawl' | 'slide';
const WORDS = '.scribble, .hero-h1 em, [data-chip], .btn, .h2, .socials a';

export default function PinkSnake() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current!;
    let W = window.innerWidth, H = window.innerHeight;
    const SC = W < 640 ? 0.62 : 0.85;      // snake scale
    const MSC = W < 640 ? 0.6 : 0.82;      // the monkey's scale (to wrap it)
    const SEG = 7.4 * SC, R0 = 12 * SC;

    // ---------------------------------------------------------------- scene + two renderers
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, W, 0, -H, -3000, 3000);
    scene.add(new THREE.AmbientLight('#ffffff', 1.05));
    const sun = new THREE.DirectionalLight('#ffffff', 2.1); sun.position.set(300, 400, 900); scene.add(sun);
    const rim = new THREE.DirectionalLight('#ffd1e6', 1.1); rim.position.set(-600, 200, 300); scene.add(rim);
    const makeRenderer = (z: number, keepFront: boolean) => {
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); r.setSize(W, H);
      r.clippingPlanes = [new THREE.Plane(V3(0, 0, keepFront ? 1 : -1), 0)];
      Object.assign(r.domElement.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: String(z) });
      root.appendChild(r.domElement);
      return r;
    };
    const back = makeRenderer(4, false), front = makeRenderer(61, true);
    const bubble = document.createElement('div'); bubble.className = 'monkey-bubble snake-bubble'; root.appendChild(bubble);
    const hit = document.createElement('div'); hit.className = 'snake-hit'; root.appendChild(hit);
    const fx = createShards(scene, () => H);

    // ---------------------------------------------------------------- body (tube rebuilt every frame)
    const PINK = new THREE.Color('#ff86bd'), LIGHT = new THREE.Color('#ffc8e0');
    const skin = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.02 });
    const posA = new THREE.BufferAttribute(new Float32Array(RINGS * RAD * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const norA = new THREE.BufferAttribute(new Float32Array(RINGS * RAD * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const colA = new THREE.BufferAttribute(new Float32Array(RINGS * RAD * 3), 3);
    const idx: number[] = [];
    for (let k = 0; k < RINGS - 1; k++) for (let j = 0; j < RAD; j++) {
      const a = k * RAD + j, b = k * RAD + ((j + 1) % RAD), c = (k + 1) * RAD + j, d = (k + 1) * RAD + ((j + 1) % RAD);
      idx.push(a, b, c, b, d, c);
    }
    const tmpC = new THREE.Color();
    for (let k = 0; k < RINGS; k++) {
      const u = k / (RINGS - 1);
      const s = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 7);
      tmpC.copy(PINK).lerp(LIGHT, s * s * (3 - 2 * s) * 0.85);
      for (let j = 0; j < RAD; j++) colA.setXYZ(k * RAD + j, tmpC.r, tmpC.g, tmpC.b);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', posA); geo.setAttribute('normal', norA); geo.setAttribute('color', colA); geo.setIndex(idx);
    const body = new THREE.Mesh(geo, skin); body.frustumCulled = false; scene.add(body);
    const prof = (u: number) => (u < 0.07 ? 0.78 + (u / 0.07) * 0.22 : u < 0.55 ? 1 : Math.max(0.1, 1 - Math.pow((u - 0.55) / 0.45, 1.5) * 0.9));

    // ---------------------------------------------------------------- head (faces the viewer, like the monkey)
    const M = (c: string, rough = 0.45) => new THREE.MeshStandardMaterial({ color: c, roughness: rough });
    const pinkM = M('#ff86bd', 0.42), lightM = M('#ffd3e6', 0.5), white = M('#ffffff', 0.3), black = M('#161216', 0.3), blushM = M('#ff5d93', 0.6), bowM = M('#b9a6ff', 0.4), tongueM = M('#ff2d55', 0.5);
    const ball = (r: number, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
      const o = new THREE.Mesh(new THREE.SphereGeometry(r * SC, 28, 20), m); o.position.set(x * SC, y * SC, z * SC); o.scale.set(sx, sy, sz); return o;
    };
    const head = new THREE.Group(); scene.add(head);
    head.add(ball(16, pinkM, 0, 0, 0, 1.14, 1, 0.92));
    head.add(ball(10.5, lightM, 0, -5, 8, 1.2, 0.78, 0.7));                     // muzzle
    const eyes = new THREE.Group(); head.add(eyes);
    eyes.add(ball(6.3, white, -7.4, 3.5, 11.2), ball(6.3, white, 7.4, 3.5, 11.2));
    const pupils = new THREE.Group(); eyes.add(pupils);
    pupils.add(ball(4.1, black, -7.4, 3.5, 15.4), ball(4.1, black, 7.4, 3.5, 15.4), ball(1.4, white, -6, 5.2, 19.2), ball(1.4, white, 8.8, 5.2, 19.2));
    const blushL = ball(3.6, blushM, -12, -3.5, 9.8, 1.25, 0.7, 0.45), blushR = ball(3.6, blushM, 12, -3.5, 9.8, 1.25, 0.7, 0.45); head.add(blushL, blushR);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(3.2 * SC, 0.85 * SC, 8, 20, Math.PI), black);
    smile.position.set(0, -5.6 * SC, 15.6 * SC); smile.rotation.z = Math.PI; head.add(smile);
    const bow = new THREE.Group(); bow.position.set(0, 15.5 * SC, 2 * SC); bow.rotation.z = 0.18; head.add(bow);
    bow.add(ball(5.4, bowM, -6, 0, 0, 1.25, 0.85, 0.6), ball(5.4, bowM, 6, 0, 0, 1.25, 0.85, 0.6), ball(2.8, bowM, 0, 0, 2));
    const tongue = new THREE.Group(); tongue.position.set(0, -9 * SC, 13.5 * SC); head.add(tongue);
    const tg = new THREE.Mesh(new THREE.BoxGeometry(1.8 * SC, 11 * SC, 1.2 * SC), tongueM); tg.position.y = -5.5 * SC; tongue.add(tg);
    const fork = (s: number) => { const f = new THREE.Mesh(new THREE.BoxGeometry(1.4 * SC, 4.6 * SC, 1.2 * SC), tongueM); f.position.set(s * 1.4 * SC, -12.2 * SC, 0); f.rotation.z = s * 0.45; return f; };
    tongue.add(fork(-1), fork(1)); tongue.scale.y = 0.001;
    // tail tip: a little heart
    const hs = new THREE.Shape(); const hk = 0.42 * SC;
    for (let i = 0; i <= 40; i++) { const tt = (i / 40) * Math.PI * 2; const x = 16 * Math.pow(Math.sin(tt), 3) * hk, y = (13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt)) * hk; if (i) hs.lineTo(x, y); else hs.moveTo(x, y); }
    const heartTip = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 3 * SC, bevelEnabled: true, bevelSize: 1 * SC, bevelThickness: 1 * SC, bevelSegments: 2 }), M('#ff4f8b', 0.35));
    scene.add(heartTip);
    // injuries
    const bandage = makeBandage(0.75 * SC); bandage.position.set(9 * SC, 10 * SC, 12 * SC); bandage.rotation.z = 0.4; bandage.visible = false; head.add(bandage);
    const stars = makeStars(3, 4.5 * SC); stars.position.set(0, 26 * SC, 0); stars.visible = false; head.add(stars);
    const bodyBand = new THREE.Mesh(new THREE.TorusGeometry(R0 * 1.02, 2.4 * SC, 8, 22), M('#fffaf0', 0.8)); bodyBand.visible = false; scene.add(bodyBand);

    // ---------------------------------------------------------------- state
    const P: THREE.Vector3[] = Array.from({ length: N }, (_, i) => V3(-30 - i * SEG, H - 50 * SC, 0));
    const S = {
      heading: 0, wig: 0, gait: 'slither' as Gait,
      spacing: SEG, spacingT: SEG, spacingV: 0, stiff: 1, zT: 0,
      path: null as null | (() => THREE.Vector3[]), sHead: 0,
      sq: 0, sqv: 0, hurt: 0, dizzy: 0, sleeping: false, happy: 0,
      bulge: -1, rattle: 0, tongueT: 1500, flick: 0, fastTongue: 0,
      cleanup: null as null | (() => void),
    };
    let mouseX = W / 2, mouseY = H / 2;
    let bubbleT: ReturnType<typeof setTimeout> | undefined;
    const say = (t: string, ms = 1800) => { bubble.textContent = t; bubble.classList.add('show'); clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove('show'), ms); };
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    const pop = (x: number, y: number, ch = '💗') => {
      const s = document.createElement('span'); s.className = 'snake-pop'; s.textContent = ch;
      s.style.left = `${x}px`; s.style.top = `${y}px`; s.style.setProperty('--dx', `${Math.round(rand(-40, 40))}px`);
      document.body.appendChild(s); later(() => s.remove(), 1250);
    };
    const visible = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 16 && r.top > 90 && r.bottom < H - 40 && r.left > 20 && r.right < W - 20; };
    const choose = (sel: string) => { const els = [...document.querySelectorAll(sel)].filter((e) => visible(e) && !e.classList.contains('crashed') && !e.closest('.mk, .nav, .modal-bg')); return els.length ? (pick(els) as HTMLElement) : null; };
    const label = (el: Element) => el.getAttribute('data-chip') || el.getAttribute('data-svc') || (el.textContent || 'thing').trim().replace(/\s+/g, ' ').slice(0, 26);
    const monkeyHere = (ignoreHurt = false) => pets.monkey.visible && metrics.monkeyVisible && !isBrawling() && (ignoreHurt || pets.monkey.hurt <= 0)
      && pets.monkey.x > 30 && pets.monkey.x < W - 30 && pets.monkey.y > 90 && pets.monkey.y < H + 10;

    // ---------------------------------------------------------------- movement primitives
    function* wait(ms: number): Gen { let t = 0; while (t < ms) t += yield; }
    function* tween(get: () => number, set: (v: number) => void, to: number, ms: number): Gen {
      const from = get(); let t = 0;
      while (t < ms) { t += yield; const k = Math.min(1, t / ms); set(from + (to - from) * (1 - Math.pow(1 - k, 3))); }
    }
    const GAIT: Record<Gait, { amp: number; freq: number; speed: number }> = {
      slither: { amp: 0.55, freq: 7, speed: 190 }, sidewind: { amp: 1.15, freq: 3.6, speed: 150 },
      crawl: { amp: 0.04, freq: 2, speed: 62 }, slide: { amp: 0.1, freq: 9, speed: 540 },
    };
    /** Move the head toward a (possibly moving) target; the body follows like a rope. */
    function* slitherTo(target: () => [number, number], gait: Gait = 'slither', timeout = 9000, near = 14, speedMul = 1): Gen {
      S.gait = gait; const g = GAIT[gait]; let t = 0;
      while (t < timeout) {
        const dt = yield; t += dt;
        const [tx, ty] = target();
        const h = P[0], dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy);
        if (d < near) break;
        const want = Math.atan2(dy, dx);
        let da = want - S.heading; da = Math.atan2(Math.sin(da), Math.cos(da));
        S.heading += da * Math.min(1, (dt / 1000) * 5);
        S.wig += (dt / 1000) * g.freq;
        const ang = d < 40 ? want : S.heading + Math.sin(S.wig) * g.amp;
        const step = Math.min(d, (g.speed * SC * speedMul * dt) / 1000);
        h.x += Math.cos(ang) * step; h.y += Math.sin(ang) * step;
      }
      S.gait = 'slither';
    }
    /** Slide the head along a path (the body follows the same path behind it). */
    function* ride(build: () => THREE.Vector3[], to: number, speed: number): Gen {
      S.path = build;
      while (S.sHead < to) { const dt = yield; S.sHead = Math.min(to, S.sHead + (speed * dt) / 1000); }
    }
    const endOf = (build: () => THREE.Vector3[]) => { const c = cumLen(build()); return c[c.length - 1]; };
    const line = (pts: THREE.Vector3[], a: THREE.Vector3, b: THREE.Vector3, n: number, from = 1) => { for (let k = from; k <= n; k++) pts.push(a.clone().lerp(b, k / n)); };
    /** Fit the whole body onto a stretch of path `len` long. */
    const fit = (len: number, min = SEG, max = SEG * 6) => { S.spacingT = clamp(len / (N - 1), min, max); };

    // ---------------------------------------------------------------- crush (shatter + self-heal, like the monkey's kill)
    const crush = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const g = fx.shatter(el, r.left + r.width / 2, r.top + r.height / 2);
      const svc = el.closest('[data-svc]'), name = svc?.getAttribute('data-svc') || `“${label(el)}”`;
      setHealth(svc, 'down');
      log('ERROR', `${name}: crushed by a pink mutex 🐍 — deadlock, pod OOMKilled`);
      later(() => { setHealth(svc, 'restarting'); log('WARN', `${name}: lock released, restarting…`); }, 1400);
      later(() => fx.heal(g), 2300);
      later(() => { setHealth(svc, 'ok'); log('OK', `${name}: recovered — the snake says sorry 💗`); }, 3200);
    };

    // ================================================================ behaviours
    function* roam(): Gen {
      const g: Gait = pick(['slither', 'slither', 'sidewind', 'crawl', 'slide']);
      const floor = g === 'slide' || Math.random() < 0.4;
      const tx = rand(60, W - 60), ty = floor ? H - 34 * SC : rand(130, H - 110);
      if (g === 'slide') say(pick(['Wheee! 🛝', 'Belly slide!', 'Zoom zoom 🐍💨']), 1300);
      if (g === 'sidewind' && Math.random() < 0.5) say('Sidewinding 😎', 1300);
      if (g === 'crawl' && Math.random() < 0.5) say('inch… by… inch 🐛', 1500);
      yield* slitherTo(() => [tx, ty], g, g === 'crawl' ? 4500 : 9000);
      if (Math.random() < 0.3) say(pick(['hsss~ 💕', 'Is this production? 👀', 'I lint with my tongue 👅', 'Pink is a deployment colour', 'Any bugs to hug?']), 1700);
      yield* wait(rand(400, 1400));
    }

    function* wrapEl(el: HTMLElement, strong: boolean): Gen {
      yield* slitherTo(() => { const r = el.getBoundingClientRect(); return [r.left - 20 * SC, r.top - 4]; }, 'slither', 8000, 18, 1.25);
      if (!visible(el) || el.classList.contains('crashed')) return;
      const r0 = el.getBoundingClientRect();
      const sq = { v: 1 }, start = P[0].clone(), pad = 7 * SC;
      const ry0 = r0.height / 2 + pad, rz0 = clamp(r0.height * 0.45, 16 * SC, 56 * SC);
      const circ = 2 * Math.PI * Math.sqrt((ry0 * ry0 + rz0 * rz0) / 2);
      const turns = clamp(Math.min(Math.round(r0.width / (48 * SC)), Math.floor(((N - 1) * SEG * 6) / circ)), 1, 8);
      const dir = r0.right + 330 * SC < W ? 1 : -1;
      const EN = 12, K = turns * 40, EX = 30;
      const build = () => {
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2, ry = (r.height / 2 + pad) * sq.v, rz = rz0 * (0.35 + 0.65 * sq.v);
        const x0 = r.left - 3, x1 = r.right + 3;
        const pts = [start.clone()];
        line(pts, start, V3(x0, cy - ry), EN);
        for (let k = 1; k <= K; k++) { const u = k / K, f = u * turns * Math.PI * 2; pts.push(V3(x0 + (x1 - x0) * u, cy - ry * Math.cos(f), rz * Math.sin(f))); }
        for (let k = 1; k <= EX; k++) { const t = k / EX; pts.push(V3(x1 + dir * t * 340 * SC, cy - ry - Math.sin(t * Math.PI) * 46 * SC, 0)); }
        return pts;
      };
      const c0 = cumLen(build()), coilEnd = c0[EN + K];
      fit(coilEnd - c0[EN]); S.sHead = 0;
      S.cleanup = () => { el.style.scale = ''; el.classList.remove('snake-squeeze', 'snake-crush'); };
      yield* ride(build, coilEnd, Math.max(320 * SC, coilEnd / 2.2));
      log('CHAOS', `pink-snake: acquired an exclusive lock on “${label(el)}” 🔒`);
      say(pick(['Hug! 🤗', 'Mine now 💗', 'Locked 🔒', 'Snug as a bug', 'Wrapped with love 🎀']), 1400);
      el.classList.add('snake-squeeze');
      for (let k = 0; k < 2; k++) {
        el.style.scale = '1.03 0.9'; yield* tween(() => sq.v, (v) => { sq.v = v; }, 0.82, 220);
        el.style.scale = ''; yield* tween(() => sq.v, (v) => { sq.v = v; }, 1, 300);
      }
      if (strong) {
        say(pick(['SUPER SQUEEZE 💪🐍', 'Tighter… TIGHTER…', 'Compressing… gzip -9']), 1500);
        el.classList.add('snake-crush'); el.style.scale = '0.97 0.8';
        yield* tween(() => sq.v, (v) => { sq.v = v; }, 0.6, 1200);
        el.classList.remove('snake-crush', 'snake-squeeze'); el.style.scale = '';
        crush(el);
        say(pick(['Oops… too tight 😳', 'I just wanted a hug 🥺', 'hug.exe crashed']), 1700);
        yield* tween(() => sq.v, (v) => { sq.v = v; }, 0.08, 220);
      } else {
        yield* wait(rand(500, 1100));
        el.classList.remove('snake-squeeze');
      }
      S.cleanup = null; S.spacingT = SEG;
      yield* ride(build, endOf(build), 360 * SC);
      S.path = null;
    }

    function* wrapArea(): Gen {
      type Box = { l: number; t: number; r: number; b: number; el: HTMLElement | null; name: string };
      const AREAS = ['#about .bento', '#work .grid', '#timeline .jobs', '#skills .toolbox', '#github', '#contact .contact'];
      const boxes: Box[] = AREAS.map((q) => document.querySelector<HTMLElement>(q)).filter((e): e is HTMLElement => !!e).map((el) => {
        const r = el.getBoundingClientRect();
        return { l: Math.max(r.left, 14), t: Math.max(r.top, 84), r: Math.min(r.right, W - 14), b: Math.min(r.bottom, H - 14), el, name: el.closest('section')?.id || 'cluster' };
      }).filter((b) => b.r - b.l > 240 && b.b - b.t > 170);
      const whole = Math.random() < 0.35 || !boxes.length;
      const box: Box = whole ? { l: 14, t: 84, r: W - 14, b: H - 14, el: null, name: 'the whole page' }
        : boxes.sort((a, b) => (b.r - b.l) * (b.b - b.t) - (a.r - a.l) * (a.b - a.t))[0];
      const ins = { v: 0 };
      const loop = (i: number) => {
        const l = box.l + i, t = box.t + i, r = box.r - i, b = box.b - i, c = 34 * SC, z = 6;
        const pts: THREE.Vector3[] = [];
        const seg = (x0: number, y0: number, x1: number, y1: number) => { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 16)); for (let k = 0; k < n; k++) pts.push(V3(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, z)); };
        const arc = (cx: number, cy: number, a0: number) => { for (let k = 0; k < 8; k++) { const a = a0 + (k / 8) * (Math.PI / 2); pts.push(V3(cx + Math.cos(a) * c, cy + Math.sin(a) * c, z)); } };
        seg(l + c, t, r - c, t); arc(r - c, t + c, -Math.PI / 2);
        seg(r, t + c, r, b - c); arc(r - c, b - c, 0);
        seg(r - c, b, l + c, b); arc(l + c, b - c, Math.PI / 2);
        seg(l, b - c, l, t + c); arc(l + c, t + c, Math.PI);
        pts.push(pts[0].clone());
        return pts;
      };
      yield* slitherTo(() => [box.l + 40, box.t + 10], 'slide', 5000, 24);
      const start = P[0].clone(), EN = 14;
      const build = () => {
        const lp = loop(ins.v);
        const pts = [start.clone()];
        line(pts, start, lp[0], EN);
        pts.push(...lp.slice(1), ...lp.slice(1, Math.min(lp.length, 1 + Math.ceil(520 / 16))));
        return pts;
      };
      const perim = (() => { const c = cumLen(loop(0)); return c[c.length - 1]; })();
      const entry = cumLen(build())[EN];
      S.spacingT = perim / (N - 1); S.sHead = 0;
      if (box.el) { box.el.classList.add('snake-hug'); S.cleanup = () => { box.el!.style.scale = ''; box.el!.classList.remove('snake-hug'); }; }
      say(whole ? 'I’m gonna hug EVERYTHING 🤗' : 'Group hug! 🤗', 1700);
      yield* ride(build, entry + perim, Math.max(560 * SC, (entry + perim) / 3));
      log('CHAOS', `pink-snake: wrapped ${whole ? 'the whole page' : `#${box.name}`} — global lock acquired 🔒`);
      for (let k = 0; k < 2; k++) {
        if (box.el) box.el.style.scale = '0.985';
        yield* tween(() => ins.v, (v) => { ins.v = v; }, 12 * SC, 260);
        for (let h = 0; h < 3; h++) { const p = P[Math.floor(rand(0, N))]; pop(p.x, p.y); }
        if (box.el) box.el.style.scale = '';
        yield* tween(() => ins.v, (v) => { ins.v = v; }, 0, 340);
      }
      yield* wait(600);
      S.cleanup?.(); S.cleanup = null;
      log('OK', 'pink-snake: lock released — throughput restored 💗');
      S.spacingT = SEG;
      yield* ride(build, endOf(build), 900 * SC);
      S.path = null;
    }

    function* hideBehind(): Gen {
      const el = choose('[data-hide], [data-break]'); if (!el) return;
      S.zT = -80 * SC;
      yield* slitherTo(() => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, 'slither', 7000);
      say(pick(['Can’t see me 🙈', 'I’m in the backend now', 'Under the hood 🔧', 'Shh… hidden dependency']), 1700);
      yield* wait(rand(1300, 2400));
      yield* slitherTo(() => { const r = el.getBoundingClientRect(); return [r.left + r.width * 0.7, r.top - 16 * SC]; }, 'crawl', 3500, 14, 2.4);
      S.zT = 0; say('Peekaboo! 🐍', 1200);
      yield* wait(900);
    }

    function* coilSleep(): Gen {
      const Ro = 44 * SC, Ri = 9 * SC, turns = 2.6, K = 110, EN = 10, EX = 30;
      const cx = rand(Ro + 30, W - Ro - 30), cy = H - 26 * SC;
      yield* slitherTo(() => [cx + Ro + 30 * SC, cy - 4], 'slither', 8000);
      const start = P[0].clone(), side = cx < W / 2 ? 1 : -1;
      const build = () => {
        const pts = [start.clone()];
        line(pts, start, V3(cx + Ro, cy), EN);
        for (let k = 1; k <= K; k++) { const u = k / K, a = u * turns * Math.PI * 2, rr = Ro - (Ro - Ri) * u; pts.push(V3(cx + rr * Math.cos(a), cy - u * 22 * SC + rr * Math.sin(a) * 0.3, rr * Math.sin(a) + u * 14 * SC)); }
        const e = pts[pts.length - 1].clone();
        for (let k = 1; k <= EX; k++) { const t = k / EX; pts.push(V3(e.x + side * t * 270 * SC, e.y - Math.sin(t * Math.PI) * 70 * SC + t * 12 * SC, 30 * SC * (1 - t))); }
        return pts;
      };
      const c0 = cumLen(build()); fit(c0[EN + K] - c0[EN], SEG * 0.7, SEG * 2.2); S.sHead = 0;
      yield* ride(build, c0[EN + K], 220 * SC);
      S.sleeping = true; log('INFO', 'pink-snake: coiled up — idle connection 💤');
      for (let k = 0; k < 5; k++) { say(['z', 'zZ', 'zZz', 'zZzZ 💤', 'zZzZz 💤'][k], 950); yield* wait(950); }
      S.sleeping = false; say('*yawn* 🥱', 900); yield* wait(600);
      S.spacingT = SEG;
      yield* ride(build, endOf(build), 260 * SC);
      S.path = null;
    }

    function* stretchYawn(): Gen {
      say(pick(['streeeeetch 🧘', 'Big stretch!', 'Horizontal scaling 📏', 'Look how long I am!']), 1800);
      S.spacingT = SEG * 3.4;
      const dir = P[0].x < W / 2 ? 1 : -1;
      yield* slitherTo(() => [clamp(P[0].x + dir * 80, 30, W - 30), P[0].y], 'crawl', 1700, 2);
      yield* wait(900);
      S.spacingT = SEG; say('boing!', 900);
      yield* wait(900);
    }

    function* heartShape(): Gen {
      const cx = clamp(P[0].x, 130 * SC + 30, W - 130 * SC - 30), cy = clamp(P[0].y, 200, H - 150);
      const k = 6 * SC, EN = 10, K = 140;
      const hp = (t: number) => V3(cx + k * 16 * Math.pow(Math.sin(t), 3), cy - k * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)), 4);
      const start = P[0].clone();
      const build = () => { const pts = [start.clone()]; line(pts, start, hp(0), EN); for (let i = 1; i <= K * 1.4; i++) pts.push(hp((i / K) * Math.PI * 2)); return pts; };
      const c0 = cumLen(build()); fit(c0[EN + K] - c0[EN], SEG, SEG * 4); S.sHead = 0;
      yield* ride(build, c0[EN + K], 420 * SC);
      S.happy = 1800; say(pick(['love you 💗', 'This portfolio has my heart 💗', '<3']), 1700);
      for (let i = 0; i < 5; i++) { pop(cx + rand(-60, 60) * SC, cy + rand(-40, 40) * SC); yield* wait(160); }
      yield* wait(1100);
      S.spacingT = SEG;
      yield* ride(build, endOf(build), 420 * SC);
      S.path = null;
    }

    function* rearUp(): Gen {
      const x0 = clamp(P[0].x, 80, W - 160), y0 = clamp(P[0].y, 220, H - 30);
      const start = P[0].clone(), EN = 12, K = 40, dir = x0 < W / 2 ? 1 : -1;
      const build = () => {
        const pts = [start.clone()];
        const base = V3(x0 + dir * 90 * SC, y0);
        line(pts, start, base, EN);
        for (let k = 1; k <= K; k++) { const u = k / K; pts.push(V3(base.x + dir * Math.sin(u * Math.PI * 1.4) * 22 * SC, y0 - u * 120 * SC, 10 * u)); }
        return pts;
      };
      yield* ride(build, endOf(build), 300 * SC);
      say(pick(['HSSSSS 😾', 'Who goes there?!', 'I am the danger 🐍', 'Cobra mode: ON']), 1600);
      S.fastTongue = 1400; log('INFO', 'pink-snake: threat level raised to HSSS');
      yield* wait(1500);
      S.path = null;
      yield* slitherTo(() => [x0 + dir * 180 * SC, y0], 'slither', 1500);
    }

    function* chaseTail(): Gen {
      const R = ((N - 1) * SEG) / (Math.PI * 2) * 1.08;
      const cx = clamp(P[0].x, R + 30, W - R - 30), cy = clamp(P[0].y, R + 110, H - R - 20);
      const start = P[0].clone(), EN = 10, K = 60, laps = 2.4;
      const build = () => {
        const pts = [start.clone()];
        line(pts, start, V3(cx + R, cy), EN);
        for (let k = 1; k <= K * laps; k++) { const a = (k / K) * Math.PI * 2; pts.push(V3(cx + R * Math.cos(a), cy + R * Math.sin(a) * 0.92, 2)); }
        return pts;
      };
      S.sHead = 0; S.spacingT = SEG;
      say(pick(['My tail?! 🌀', 'Wait, who’s that behind me?', 'Infinite loop detected 🔁']), 1700);
      yield* ride(build, endOf(build), 520 * SC);
      S.path = null; say('Dizzy… 😵‍💫', 1200); S.dizzy = 1600;
      yield* wait(900);
    }

    function* eatChip(): Gen {
      const chip = choose('[data-chip]'); if (!chip) return;
      yield* slitherTo(() => { const r = chip.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, 'slither', 8000, 12, 1.2);
      if (!visible(chip)) return;
      const name = label(chip);
      chip.style.visibility = 'hidden';
      S.cleanup = () => { chip.style.visibility = ''; };
      S.sq = 0; S.sqv += 10; say(pick([`nom! ${name} 😋`, 'Gulp!', 'Tastes like JavaScript 👅']), 1400);
      log('ERROR', `skills-db: pink-snake swallowed '${name}' whole 😋`);
      S.bulge = 0;
      for (let t = 0; t < 2600;) { const dt = yield; t += dt; S.bulge = t / 2600; }
      S.bulge = -1;
      chip.style.visibility = ''; chip.classList.add('healed'); later(() => chip.classList.remove('healed'), 900);
      S.cleanup = null;
      log('OK', `skills-db: '${name}' restored from backup — snakes can’t digest TypeScript`);
      say(pick(['Blegh 🤢', 'Too many types 🤢', 'Here, take it back']), 1300);
      yield* wait(500);
    }

    function* shedSkin(): Gen {
      say(pick(['✨ shedding… v2.0 incoming', 'New skin, who dis? ✨', 'Hot-swapping my skin 🔄']), 1800);
      yield* wait(600);
      const ghost = new THREE.Mesh(geo.clone(), new THREE.MeshStandardMaterial({ color: '#ffe3ef', transparent: true, opacity: 0.55, roughness: 0.9, depthWrite: false }));
      ghost.frustumCulled = false; scene.add(ghost);
      const away = P[0].x < W / 2 ? 1 : -1;
      yield* slitherTo(() => [clamp(P[0].x + away * 140, 30, W - 30), P[0].y + rand(-30, 30)], 'slide', 1400, 6);
      log('INFO', 'pink-snake: rolled out v2.0 — old skin garbage-collected ✨');
      for (let t = 0; t < 3000;) { const dt = yield; t += dt; (ghost.material as THREE.MeshStandardMaterial).opacity = 0.55 * (1 - t / 3000); }
      scene.remove(ghost); ghost.geometry.dispose(); (ghost.material as THREE.Material).dispose();
      say('Fresh! 💅', 1100);
    }

    function* rattle(): Gen {
      S.rattle = 1800; say(pick(['tsss tsss 🎵', '*rattle rattle*', 'Shake it off 🎶']), 1700);
      yield* wait(1900);
    }

    function* sunbathe(): Gen {
      const el = choose('[data-perch], [data-break]'); if (!el) return;
      yield* slitherTo(() => { const r = el.getBoundingClientRect(); return [r.left + 16, r.top - R0 * 0.9]; }, 'slither', 7000);
      const start = P[0].clone(), EN = 6;
      const build = () => { const r = el.getBoundingClientRect(); const pts = [start.clone()]; line(pts, start, V3(r.left + 16, r.top - R0 * 0.9), EN); line(pts, V3(r.left + 16, r.top - R0 * 0.9), V3(r.right - 16, r.top - R0 * 0.9), 30); return pts; };
      const c0 = cumLen(build()); fit(Math.min(c0[c0.length - 1] - c0[EN], (N - 1) * SEG * 1.4), SEG, SEG * 1.4); S.sHead = 0;
      yield* ride(build, c0[c0.length - 1], 130 * SC);
      S.path = null; S.sleeping = true;
      say(pick(['Sunbathing ☀️😎', 'Warming up my CPU ☀️', 'Do not disturb 😎']), 2000);
      yield* wait(rand(2200, 3400));
      S.sleeping = false; S.spacingT = SEG;
    }

    function* climb(): Gen {
      const el = choose('[data-break]'); if (!el) return;
      const r0 = el.getBoundingClientRect(); const left = r0.left > W - r0.right;
      const sx = () => { const r = el.getBoundingClientRect(); return left ? r.left - R0 : r.right + R0; };
      yield* slitherTo(() => { const r = el.getBoundingClientRect(); return [sx(), Math.min(H - 30, r.bottom)]; }, 'slither', 8000);
      const start = P[0].clone(), EN = 6;
      const build = () => {
        const r = el.getBoundingClientRect(); const x = sx(), pts = [start.clone()];
        line(pts, start, V3(x, r.bottom), EN);
        line(pts, V3(x, r.bottom), V3(x, r.top - R0 * 0.8), 40);
        line(pts, V3(x, r.top - R0 * 0.8), V3(left ? r.left + r.width * 0.6 : r.right - r.width * 0.6, r.top - R0 * 0.8), 30);
        return pts;
      };
      S.sHead = 0; S.spacingT = SEG;
      say(pick(['Parkour! 🧗', 'Scaling vertically 📈', 'Climbing the stack']), 1500);
      yield* ride(build, endOf(build), 170 * SC);
      S.path = null;
      say(pick(['Top of the stack! 🏔️', 'Made it 💪']), 1300);
      yield* wait(900);
    }

    function* tasteCursor(): Gen {
      if (mouseY < 90 || mouseY > H - 30) return;
      yield* slitherTo(() => [clamp(mouseX - 46 * SC, 20, W - 20), clamp(mouseY + 20 * SC, 100, H - 20)], 'slither', 5000, 18);
      S.fastTongue = 1600;
      say(pick(['*blep* 👅', 'You taste like JavaScript 👅', 'Mmm, cursor', 'Is that a recruiter I smell? 👀']), 1600);
      yield* wait(1700);
    }

    // ---------------------------------------------------------------- the monkey: chase, hug, fight
    function* wrapMonkey(fight: boolean): Gen {
      let w = 0;
      while (!['anchored', 'floor', 'hold'].includes(pets.monkey.mode) && w < 1800) w += yield;
      if (!monkeyHere(true)) return;
      pets.monkey.held = true; send('pet:hold');
      S.cleanup = () => { pets.monkey.held = false; };
      const sq = { v: 1 }, start = P[0].clone(), turns = 3, K = turns * 40, EN = 10, EX = 30;
      const dir = pets.monkey.x < W / 2 ? 1 : -1;
      const anchor = { live: true, x: 0, y: 0 };
      const build = () => {
        if (anchor.live) { anchor.x = pets.monkey.x; anchor.y = pets.monkey.y; }
        const mx = anchor.x, my = anchor.y, rr = (26 * MSC + R0) * sq.v, y0 = my - 8 * MSC;
        const pts = [start.clone()];
        line(pts, start, V3(mx + rr, y0), EN);
        for (let k = 1; k <= K; k++) { const u = k / K, f = u * turns * Math.PI * 2; pts.push(V3(mx + rr * Math.cos(f), y0 - u * 88 * MSC, rr * Math.sin(f))); }
        const ex = mx + rr, ey = y0 - 88 * MSC;
        for (let k = 1; k <= EX; k++) { const t = k / EX; pts.push(V3(ex + dir * t * 330 * SC, ey - Math.sin(t * Math.PI) * 40 * SC + t * 70 * SC, 0)); }
        return pts;
      };
      const c0 = cumLen(build()), coilEnd = c0[EN + K];
      fit(coilEnd - c0[EN]); S.sHead = 0;
      yield* ride(build, coilEnd, Math.max(340 * SC, coilEnd / 1.8));
      log('CHAOS', 'pink-snake: acquired a lock on chaos-monkey 🐒🔒');
      say(pick(['Gotcha! 🐍💗', 'Hug time!!', 'You’re not going anywhere 😈', 'Caught you, banana thief!']), 1500);
      for (let k = 0; k < 3; k++) { yield* tween(() => sq.v, (v) => { sq.v = v; }, 0.78, 200); yield* tween(() => sq.v, (v) => { sq.v = v; }, 1, 260); }
      if (fight && !isBrawling()) {
        S.cleanup = null; pets.monkey.held = false; S.path = null;
        startBrawl(anchor.x, anchor.y - 48 * MSC);
        yield* wait(60);
        return;
      }
      yield* wait(400);
      anchor.live = false; pets.monkey.held = false; S.cleanup = null;
      say(pick(['Okay, you can go 💗', 'Hug complete ✓', 'Friends? 🥺']), 1400);
      S.spacingT = SEG;
      yield* ride(build, endOf(build), 380 * SC);
      S.path = null;
    }

    function* chaseMonkey(fightChance = 0.7, ignoreHurt = false): Gen {
      if (!monkeyHere(ignoreHurt)) { say('Where’s that monkey? 🐒', 1400); return; }
      say(pick(['🐒 SNACK!', 'Come here, banana thief 🐍', 'Tag, you’re it!', 'You broke prod, monkey!']), 1500);
      log('CHAOS', 'pink-snake: chasing chaos-monkey — predator/prey load test 🐍🐒');
      send('pet:flee', { x: P[0].x });
      yield* slitherTo(() => [pets.monkey.x, pets.monkey.y - 30 * MSC], 'slither', 7000, 42 * SC, 1.75);
      if (!monkeyHere(true) || Math.hypot(P[0].x - pets.monkey.x, P[0].y - (pets.monkey.y - 30 * MSC)) > 64 * SC) {
        say(pick(['Next time… 😤', 'He’s too fast 😮‍💨', 'I’ll get you, monkey!']), 1500); return;
      }
      yield* wrapMonkey(Math.random() < fightChance);
    }

    function* brawl(cx: number, cy: number, ms: number): Gen {
      S.path = null; S.zT = 0; S.spacingT = SEG * 0.8;
      let t = 0, jt = 0, tx = cx, ty = cy;
      while (t < ms) {
        const dt = yield; t += dt; jt -= dt;
        if (jt <= 0) { tx = cx + rand(-60, 60); ty = cy + rand(-50, 50); jt = 110; }
        P[0].x += (tx - P[0].x) * 0.35; P[0].y += (ty - P[0].y) * 0.35;
      }
      S.hurt = 25000; S.dizzy = 4500; S.spacingT = SEG;
      say(pick(['ow ow ow 🤕', 'hisss… 🩹', 'He bit my tail!! 😭', 'I want a lawyer 🐍⚖️']), 1900);
      const dir = Math.random() < 0.5 ? -1 : 1;
      yield* slitherTo(() => [clamp(cx + dir * 260 * SC, 40, W - 40), clamp(cy + 60, 120, H - 40)], 'slide', 1300);
    }

    // ---------------------------------------------------------------- scheduler
    const nextTask = (): Gen => {
      if (S.hurt > 0 && Math.random() < 0.5) return pick([coilSleep, roam, roam])();
      if (monkeyHere() && S.hurt <= 0 && Math.random() < 0.09) return chaseMonkey();
      const r = Math.random();
      if (r < 0.17) { const el = choose(WORDS); if (el) return wrapEl(el, metrics.chaos && Math.random() < 0.3); }
      if (r < 0.25) { const el = choose('[data-break]'); if (el) return wrapEl(el, metrics.chaos && Math.random() < 0.4); }
      if (r < 0.32) return wrapArea();
      if (r < 0.37 && metrics.chaos) return eatChip();
      if (r < 0.42) return hideBehind();
      if (r < 0.47) return coilSleep();
      if (r < 0.51) return stretchYawn();
      if (r < 0.54) return heartShape();
      if (r < 0.58) return rearUp();
      if (r < 0.61) return chaseTail();
      if (r < 0.64) return shedSkin();
      if (r < 0.67) return rattle();
      if (r < 0.71) return sunbathe();
      if (r < 0.75) return climb();
      if (r < 0.78) return tasteCursor();
      return roam();
    };
    let gen: Gen | null = null, queued: Gen | null = null;
    const abort = () => { S.cleanup?.(); S.cleanup = null; S.path = null; S.zT = 0; S.spacingT = SEG; S.sleeping = false; S.bulge = -1; };
    const interrupt = (g: Gen) => { queued = g; };

    // ---------------------------------------------------------------- input
    let dragging = false, gx = 0, gy = 0, moved = 0, lastClick = 0;
    hit.addEventListener('pointerenter', () => { if (!dragging) say(pick(['hsss~ 💕', 'Boop me?', 'I’m a pink mutex 🔒', 'Wanna hug? 🤗', 'Grab me and stretch me!']), 1300); });
    hit.addEventListener('pointerdown', (e) => {
      e.preventDefault(); hit.setPointerCapture(e.pointerId);
      dragging = true; moved = 0; gx = e.clientX - P[0].x; gy = e.clientY - P[0].y;
      abort(); gen = null; queued = null; hit.classList.add('grabbing');
    });
    hit.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      moved += Math.abs(e.movementX) + Math.abs(e.movementY);
      P[0].x = e.clientX - gx; P[0].y = e.clientY - gy;
      if (moved > 70 && moved < 100) say(pick(['Wheee! 🎢', 'I’m stretchy!!', 'Don’t tie me in a knot!', 'Elastic scaling 📏']), 1100);
    });
    const release = () => {
      if (!dragging) return;
      dragging = false; hit.classList.remove('grabbing');
      const now = performance.now();
      if (moved < 6) {
        if (now - lastClick < 320) interrupt(heartShape());
        else { S.sqv += 9; S.happy = 900; pop(P[0].x, P[0].y - 30 * SC); say(pick(['boop! 💗', 'hehe 🙈', 'POST /snake/boop 200', 'again!']), 1000); }
        lastClick = now;
      } else say(pick(['boing!', 'Snap back! 🪀', 'That tickled']), 900);
    };
    hit.addEventListener('pointerup', release); hit.addEventListener('pointercancel', release);
    const onMouse = (e: PointerEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('pointermove', onMouse);

    const onBrawl = (e: Event) => { const d = (e as CustomEvent).detail as { x: number; y: number; ms: number }; interrupt(brawl(d.x, d.y, d.ms)); };
    const onFightNow = () => interrupt(chaseMonkey(1, true));
    bus.addEventListener('pet:brawl', onBrawl);
    bus.addEventListener('pet:fight-now', onFightNow);
    const showAll = () => { const s = metrics.monkeyVisible; [back.domElement, front.domElement, hit].forEach((n) => { n.style.display = s ? '' : 'none'; }); if (!s) bubble.classList.remove('show'); pets.snake.visible = s; };
    const unsub = subscribe(showAll);
    showAll();
    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      back.setSize(W, H); front.setSize(W, H);
      camera.right = W; camera.bottom = -H; camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ---------------------------------------------------------------- per-frame helpers
    const C = Array.from({ length: RINGS }, () => V3(0, 0)), T = Array.from({ length: RINGS }, () => V3(1, 0));
    const n = V3(0, 0, 1), b = V3(0, 0), dirV = V3(0, 0);
    const constrain = (i: number, t: number) => {
      const a = P[i - 1], q = P[i];
      const dx = q.x - a.x, dy = q.y - a.y, dz = q.z - a.z, L = Math.hypot(dx, dy, dz) || 1e-4;
      const want = S.gait === 'crawl' ? S.spacing * (1 + 0.28 * Math.sin(t * 7 - i * 0.55)) : S.spacing;
      const k = ((L - want) / L) * S.stiff;
      q.x -= dx * k; q.y -= dy * k; q.z -= dz * k;
      q.z += (S.zT - q.z) * 0.08;
    };
    const updateTube = (t: number) => {
      for (let k = 0; k < RINGS; k++) {
        const u = (k / (RINGS - 1)) * (N - 1), i = Math.min(N - 2, Math.floor(u)), f = u - i;
        const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(N - 1, i + 2)];
        C[k].set(cr(p0.x, p1.x, p2.x, p3.x, f), -cr(p0.y, p1.y, p2.y, p3.y, f), cr(p0.z, p1.z, p2.z, p3.z, f));
      }
      if (S.rattle > 0) for (let k = Math.floor(RINGS * 0.86); k < RINGS; k++) { const w = (k / RINGS - 0.86) / 0.14; C[k].x += Math.sin(t * 90) * 4 * SC * w; C[k].y += Math.cos(t * 77) * 3 * SC * w; }
      for (let k = 0; k < RINGS; k++) {
        T[k].subVectors(C[Math.min(RINGS - 1, k + 1)], C[Math.max(0, k - 1)]);
        if (T[k].lengthSq() < 1e-8) T[k].copy(k ? T[k - 1] : V3(1, 0)); else T[k].normalize();
      }
      n.set(0, 0, 1).addScaledVector(T[0], -T[0].z);
      if (n.lengthSq() < 1e-4) n.set(0, 1, 0).addScaledVector(T[0], -T[0].y);
      n.normalize();
      const rScale = clamp(Math.sqrt(SEG / S.spacing), 0.5, 1.1) * (1 + Math.sin(t * 2.2) * 0.02);
      for (let k = 0; k < RINGS; k++) {
        if (k) { n.addScaledVector(T[k], -n.dot(T[k])); if (n.lengthSq() < 1e-6) n.set(0, 0, 1).addScaledVector(T[k], -T[k].z); n.normalize(); }
        b.crossVectors(T[k], n);
        const u = k / (RINGS - 1);
        let r = R0 * prof(u) * rScale;
        if (S.bulge >= 0) r *= 1 + 0.75 * Math.exp(-((u - S.bulge * 0.9 - 0.05) ** 2) / 0.0025);
        if (S.gait === 'crawl') r *= 1 - 0.07 * Math.sin(t * 7 - u * (N - 1) * 0.55);
        for (let j = 0; j < RAD; j++) {
          const th = (j / RAD) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
          dirV.set(n.x * c + b.x * s, n.y * c + b.y * s, n.z * c + b.z * s);
          const o = k * RAD + j;
          posA.setXYZ(o, C[k].x + dirV.x * r, C[k].y + dirV.y * r, C[k].z + dirV.z * r);
          norA.setXYZ(o, dirV.x, dirV.y, dirV.z);
        }
      }
      posA.needsUpdate = true; norA.needsUpdate = true;
    };
    const qTmp = new THREE.Quaternion(), zAxis = V3(0, 0, 1);

    // ---------------------------------------------------------------- main loop
    let last = performance.now(), raf = 0, idleT = 2600, blinkT = 2000, t = 0, backDirty = false;
    log('INFO', 'pink-snake deployed 🐍💗 — it hugs things. Sometimes too hard.');
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dtMs = Math.min(50, now - last); last = now;
      const dt = dtMs / 1000; t += dt;
      if (!metrics.monkeyVisible) return;

      // tasks
      if (!dragging) {
        if (queued) { abort(); gen = queued; queued = null; gen.next(0); }
        if (!gen) { idleT -= dtMs; if (idleT <= 0) { gen = nextTask(); gen.next(0); idleT = rand(300, 1400); } }
        if (gen) { const res = gen.next(dtMs); if (res.done) gen = null; }
      }

      // springs: body length, elasticity, head squash
      S.spacingV += ((S.spacingT - S.spacing) * 55 - S.spacingV * 9) * dt;
      S.spacing = Math.max(SEG * 0.6, S.spacing + S.spacingV * dt);
      S.stiff += ((dragging ? 0.16 : 1) - S.stiff) * Math.min(1, dt * 2.2);
      S.sqv += (-300 * S.sq - 14 * S.sqv) * dt; S.sq = clamp(S.sq + S.sqv * dt, -0.35, 0.35);

      // spine
      if (!S.path && !dragging) { P[0].x = clamp(P[0].x, 16, W - 16); P[0].y = clamp(P[0].y, 70, H - 14); }
      if (!S.path) P[0].z += (S.zT - P[0].z) * 0.08;
      if (S.path) {
        const pts = S.path(), cum = cumLen(pts);
        for (let i = 0; i < N; i++) { const s = S.sHead - i * S.spacing; if (s >= 0) sampleInto(pts, cum, s, P[i]); else if (i) constrain(i, t); }
      } else for (let i = 1; i < N; i++) constrain(i, t);
      pets.snake.x = P[0].x; pets.snake.y = P[0].y; pets.snake.hurt = S.hurt;

      // timers
      if (S.hurt > 0) { S.hurt -= dtMs; if (S.hurt <= 0) { log('OK', 'pink-snake: patched up 🩹 → healthy again'); say('All better 💗', 1200); } }
      if (S.dizzy > 0) S.dizzy -= dtMs;
      if (S.happy > 0) S.happy -= dtMs;
      if (S.rattle > 0) S.rattle -= dtMs;
      if (S.fastTongue > 0) S.fastTongue -= dtMs;

      updateTube(t);

      // head
      const hx = P[0].x, hy = P[0].y;
      head.position.set(hx, -hy, P[0].z + 8 * SC);
      const ddx = P[0].x - P[3].x, ddy = P[0].y - P[3].y, dl = Math.hypot(ddx, ddy) || 1;
      head.rotation.y += (clamp(ddx / dl, -1, 1) * 0.42 - head.rotation.y) * 0.12;
      head.rotation.x += (clamp(ddy / dl, -1, 1) * 0.32 - head.rotation.x) * 0.12;
      head.rotation.z = Math.sin(t * 1.7) * 0.06 + (S.dizzy > 0 ? Math.sin(t * 9) * 0.22 : 0);
      head.scale.set(1 + S.sq * 0.5, 1 - S.sq, 1 + S.sq * 0.3);
      blinkT -= dtMs; const blink = blinkT < 0 && blinkT > -130; if (blinkT < -130) blinkT = rand(2000, 5000);
      eyes.scale.y += ((S.sleeping || blink ? 0.1 : S.happy > 0 ? 0.45 : 1) - eyes.scale.y) * 0.35;
      if (S.dizzy > 0) pupils.position.set(Math.cos(t * 12) * 1.7 * SC, Math.sin(t * 12) * 1.7 * SC, 0);
      else { const ex = mouseX - hx, ey = mouseY - hy, ed = Math.max(1, Math.hypot(ex, ey)); pupils.position.set((ex / ed) * 1.8 * SC, -(ey / ed) * 1.6 * SC, 0); }
      smile.scale.set(S.happy > 0 ? 1.4 : 1, S.happy > 0 ? 1.4 : 1, 1);
      blushL.scale.x = blushR.scale.x = S.happy > 0 ? 1.6 : 1.25;
      bow.rotation.z = 0.18 + Math.sin(t * 3) * 0.05;
      // tongue
      S.tongueT -= dtMs;
      if (S.flick > 0) { S.flick -= dtMs; tongue.scale.y = Math.max(0.001, Math.sin((1 - S.flick / 280) * Math.PI)); if (S.flick <= 0) tongue.scale.y = 0.001; }
      else if (!S.sleeping && (S.tongueT <= 0 || S.fastTongue > 0)) { S.flick = 280; S.tongueT = rand(1800, 4500); }
      // tail heart, injuries
      const tip = C[RINGS - 1];
      heartTip.position.set(tip.x, tip.y - 5 * SC, tip.z + 2);
      heartTip.rotation.z = Math.sin(t * 2.5) * 0.25;
      bandage.visible = bodyBand.visible = S.hurt > 0;
      if (bodyBand.visible) { const kb = Math.floor(RINGS * 0.42); bodyBand.position.copy(C[kb]); bodyBand.quaternion.copy(qTmp.setFromUnitVectors(zAxis, T[kb])); }
      stars.visible = S.dizzy > 0; (stars.userData.ring as THREE.Group).rotation.y += dt * 5;

      fx.update(dt);

      // DOM overlay
      const hs = Math.max(40, 46 * SC);
      Object.assign(hit.style, { left: `${hx - hs / 2}px`, top: `${hy - hs / 2}px`, width: `${hs}px`, height: `${hs}px` });
      bubble.style.left = `${hx}px`; bubble.style.top = `${hy - 26 * SC}px`;

      // render: the back canvas only matters while part of the body is behind the page
      let behind = false;
      for (let i = 0; i < N; i++) if (P[i].z < -R0 * 0.4) { behind = true; break; }
      front.render(scene, camera);
      if (behind) { back.render(scene, camera); backDirty = true; } else if (backDirty) { back.clear(); backDirty = false; }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      abort();
      window.removeEventListener('pointermove', onMouse);
      window.removeEventListener('resize', onResize);
      bus.removeEventListener('pet:brawl', onBrawl);
      bus.removeEventListener('pet:fight-now', onFightNow);
      unsub();
      back.dispose(); front.dispose();
      root.innerHTML = '';
    };
  }, []);

  return <div ref={host} aria-hidden="true" />;
}
