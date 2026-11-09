'use client';

/*
 * Chaos Monkey — a 3D monkey that roams the page and runs "chaos experiments" on it:
 * crashes cards (they shatter and self-heal), injects latency, steals skills (restored
 * from backup), floods the gateway (rate limited), pushes things, hides, naps.
 * You can grab it, throw it, poke it and feed it bananas.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { bus, log, metrics, request, setHealth, subscribe } from '@/lib/chaos';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function ChaosMonkey() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current!;
    let W = window.innerWidth, H = window.innerHeight;
    const SC = W < 640 ? 0.72 : 1;

    // ------------------------------------------------------------ renderer / overlay
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    const cv = renderer.domElement;
    Object.assign(cv.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '60' });
    root.appendChild(cv);
    const bubble = document.createElement('div'); bubble.className = 'monkey-bubble'; root.appendChild(bubble);
    const hit = document.createElement('div'); hit.className = 'monkey-hit'; root.appendChild(hit);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, W, 0, -H, -3000, 3000);
    scene.add(new THREE.AmbientLight('#ffffff', 1.0));
    const sun = new THREE.DirectionalLight('#ffffff', 2.2); sun.position.set(300, 400, 900); scene.add(sun);
    const rimL = new THREE.DirectionalLight('#a78bfa', 1.2); rimL.position.set(-600, 200, 300); scene.add(rimL);

    // ------------------------------------------------------------ the monkey (built from primitives)
    const M = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.05 });
    const fur = M('#8b5a2b'), furDark = M('#6b4220'), skin = M('#f2cfa0'), white = M('#ffffff'), black = M('#141414'), band = M('#ef4444');
    const sphere = (r: number, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
      const o = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o;
    };
    const monkey = new THREE.Group();          // positioned at the feet
    const body = new THREE.Group(); monkey.add(body);   // squash & stretch
    scene.add(monkey);
    const legGeo = new THREE.CapsuleGeometry(6.5, 12, 4, 10);
    const legL = new THREE.Mesh(legGeo, furDark); legL.position.set(-11, 12, 0);
    const legR = new THREE.Mesh(legGeo, furDark); legR.position.set(11, 12, 0);
    body.add(legL, legR, sphere(7, skin, -12, 3, 6, 1, 0.6, 1.3), sphere(7, skin, 12, 3, 6, 1, 0.6, 1.3));
    body.add(sphere(24, fur, 0, 38, 0, 1, 1.1, 0.9), sphere(16, skin, 0, 36, 14, 1, 1.15, 0.55));
    const arm = (side: number) => {
      const pivot = new THREE.Group(); pivot.position.set(side * 22, 52, 0);
      const a = new THREE.Mesh(new THREE.CapsuleGeometry(5.5, 20, 4, 10), fur); a.position.set(0, -14, 0);
      pivot.add(a, sphere(6.5, skin, 0, -28, 0));
      body.add(pivot); return pivot;
    };
    const armL = arm(-1), armR = arm(1);
    const head = new THREE.Group(); head.position.set(0, 80, 0); body.add(head);
    head.add(sphere(27, fur));
    head.add(sphere(10, fur, -29, 2, -2), sphere(10, fur, 29, 2, -2), sphere(6, skin, -30, 2, 5, 1, 1, 0.5), sphere(6, skin, 30, 2, 5, 1, 1, 0.5));
    head.add(sphere(12, skin, -8.5, 3, 18), sphere(12, skin, 8.5, 3, 18), sphere(14, skin, 0, -8, 19, 1.35, 0.85, 0.75));
    const headband = new THREE.Mesh(new THREE.TorusGeometry(26.6, 2.6, 10, 48), band); headband.rotation.x = Math.PI / 2; headband.position.y = 11; head.add(headband);
    const knot = sphere(4, band, -22, 13, -14); head.add(knot);
    const eyes = new THREE.Group(); head.add(eyes);
    const eyeL = sphere(7, white, -8.5, 4, 26), eyeR = sphere(7, white, 8.5, 4, 26);
    const pupils = new THREE.Group();
    const pupL = sphere(3.4, black, -8.5, 4, 32.4), pupR = sphere(3.4, black, 8.5, 4, 32.4);
    pupils.add(pupL, pupR, sphere(1.1, white, -7.4, 5.6, 35.5), sphere(1.1, white, 9.6, 5.6, 35.5));
    eyes.add(eyeL, eyeR, pupils);
    const browGeo = new THREE.BoxGeometry(10, 2.2, 2);
    const browL = new THREE.Mesh(browGeo, furDark); browL.position.set(-8.5, 13.5, 30);
    const browR = new THREE.Mesh(browGeo, furDark); browR.position.set(8.5, 13.5, 30);
    head.add(browL, browR);
    head.add(sphere(1.8, black, -2.6, -4, 33.5), sphere(1.8, black, 2.6, -4, 33.5));
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(6, 1.4, 8, 24, Math.PI), black);
    mouth.position.set(0, -10, 31.5); mouth.rotation.z = Math.PI; head.add(mouth);
    const tailCurve = new THREE.CatmullRomCurve3([[0, 0, 0], [-14, -4, -4], [-26, 6, -8], [-28, 22, -8], [-20, 31, -6], [-13, 25, -4]].map((p) => new THREE.Vector3(...(p as [number, number, number]))));
    const tail = new THREE.Group(); tail.position.set(-14, 26, -12);
    tail.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 40, 3.2, 8), furDark)); body.add(tail);
    monkey.scale.setScalar(SC);

    // ------------------------------------------------------------ shards (for crashed cards)
    type Shard = { mesh: THREE.Mesh; v: THREE.Vector3; w: THREE.Vector3; home: THREE.Vector3; homeQ: THREE.Quaternion; from?: THREE.Vector3; fromQ?: THREE.Quaternion };
    const shards: { list: Shard[]; el: HTMLElement; mode: 'fly' | 'heal'; t: number }[] = [];
    const shatter = (el: HTMLElement, sx: number, sy: number) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const base = new THREE.Color(cs.backgroundColor && !cs.backgroundColor.includes('0, 0, 0, 0') ? cs.backgroundColor : '#111827');
      const cols = clamp(Math.round(r.width / 70), 3, 9), rows = clamp(Math.round(r.height / 70), 2, 7);
      const pts: THREE.Vector2[][] = [];
      for (let i = 0; i <= cols; i++) {
        pts[i] = [];
        for (let j = 0; j <= rows; j++) {
          const edge = i === 0 || j === 0 || i === cols || j === rows;
          pts[i][j] = new THREE.Vector2(r.left + (i / cols) * r.width + (edge ? 0 : rand(-14, 14)), r.top + (j / rows) * r.height + (edge ? 0 : rand(-14, 14)));
        }
      }
      const list: Shard[] = [];
      const tri = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) => {
        const cx = (a.x + b.x + c.x) / 3, cy = (a.y + b.y + c.y) / 3;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute([a.x - cx, -(a.y - cy), 0, b.x - cx, -(b.y - cy), 0, c.x - cx, -(c.y - cy), 0], 3));
        g.computeVertexNormals();
        const tint = base.clone().lerp(new THREE.Color(pick(['#6366f1', '#22d3ee', '#a78bfa', '#334155'])), 0.35);
        const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: tint, side: THREE.DoubleSide, roughness: 0.2, metalness: 0.6, emissive: tint, emissiveIntensity: 0.25, transparent: true, opacity: 0.95 }));
        mesh.position.set(cx, -cy, 50);
        scene.add(mesh);
        const away = new THREE.Vector3(cx - sx, -(cy - sy), 0).normalize();
        list.push({ mesh, v: new THREE.Vector3(away.x * rand(150, 520), away.y * rand(150, 420) + rand(250, 620), rand(-200, 200)),
          w: new THREE.Vector3(rand(-6, 6), rand(-6, 6), rand(-6, 6)), home: mesh.position.clone(), homeQ: mesh.quaternion.clone() });
      };
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        if (Math.random() < 0.5) { tri(pts[i][j], pts[i + 1][j], pts[i + 1][j + 1]); tri(pts[i][j], pts[i + 1][j + 1], pts[i][j + 1]); }
        else { tri(pts[i][j], pts[i + 1][j], pts[i][j + 1]); tri(pts[i + 1][j], pts[i + 1][j + 1], pts[i][j + 1]); }
      }
      el.classList.add('crashed');
      const group = { list, el, mode: 'fly' as const, t: 0 };
      shards.push(group);
      return group;
    };
    const heal = (g: (typeof shards)[number]) => {
      (g as { mode: string }).mode = 'heal'; g.t = 0;
      g.list.forEach((s) => { s.from = s.mesh.position.clone(); s.fromQ = s.mesh.quaternion.clone(); });
    };

    // ------------------------------------------------------------ state
    type Anchor = { el: Element; dx: number; offY: number } | null;
    const S = {
      x: W * 0.7, y: -160, vx: 0, vy: 0, mode: 'air' as 'air' | 'anchored' | 'jump' | 'drag' | 'floor',
      anchor: null as Anchor, face: 1, sq: 0, sqv: 0, behind: false, flip: 0,
      pose: 'idle' as 'idle' | 'walk' | 'push' | 'charge' | 'carry' | 'tap' | 'sleep' | 'flail' | 'happy',
      jump: null as null | { fx: number; fy: number; tx: () => [number, number]; h: number; T: number; t: number; land: Anchor },
    };
    let carried: HTMLElement | null = null;
    let mouseX = W / 2, mouseY = H / 2, mouseSpeed = 0, lastMX = 0, lastMY = 0;
    const floorY = () => H - 6;
    const setBehind = (b: boolean) => { S.behind = b; cv.style.zIndex = b ? '5' : '60'; };
    let bubbleT: ReturnType<typeof setTimeout> | undefined;
    const say = (t: string, ms = 1800) => { bubble.textContent = t; bubble.classList.add('show'); clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove('show'), ms); };

    const visible = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 20 && r.bottom > 90 && r.top < H - 60 && r.right > 30 && r.left < W - 30; };
    const choose = (sel: string) => { const els = [...document.querySelectorAll(sel)].filter((e) => visible(e) && !e.classList.contains('crashed')); return els.length ? pick(els) : null; };
    const anchorPos = (a: NonNullable<Anchor>): [number, number] => { const r = a.el.getBoundingClientRect(); return [r.left + a.dx, r.top + a.offY]; };

    // ------------------------------------------------------------ movement primitives (generators)
    type Gen = Generator<void, void, number>;
    function* wait(ms: number): Gen { let t = 0; while (t < ms) t += yield; }
    function* jumpTo(target: () => [number, number], land: Anchor, h = 140): Gen {
      const [tx, ty] = target();
      const d = Math.hypot(tx - S.x, ty - S.y);
      S.jump = { fx: S.x, fy: S.y, tx: target, h: Math.max(h, (S.y - ty) + 70), T: clamp(d / 900, 0.42, 0.95), t: 0, land };
      S.mode = 'jump'; S.anchor = null; S.sqv += 5;
      if (Math.abs(tx - S.x) > 4) S.face = tx > S.x ? 1 : -1;
      while (S.jump) yield;
    }
    const onEl = (el: Element, dx?: number, offY = 0) => {
      const r = el.getBoundingClientRect();
      const ddx = dx ?? clamp(rand(30, r.width - 30), 20, Math.max(21, r.width - 20));
      const a = { el, dx: ddx, offY };
      return { target: () => anchorPos(a), anchor: a };
    };
    function* hopOn(el: Element, dx?: number, offY = 0, h = 140): Gen { const o = onEl(el, dx, offY); yield* jumpTo(o.target, o.anchor, h); }
    function* toFloor(x: number): Gen { yield* jumpTo(() => [clamp(x, 40, W - 40), floorY()], null, 120); }
    function* walkOn(toDx: number): Gen {
      if (!S.anchor) return;
      S.pose = 'walk';
      while (S.anchor && Math.abs(S.anchor.dx - toDx) > 3) {
        const dt = yield;
        const dir = Math.sign(toDx - S.anchor.dx); S.face = dir;
        S.anchor.dx += dir * Math.min(Math.abs(toDx - S.anchor.dx), 150 * dt / 1000);
      }
      S.pose = 'idle';
    }

    // ------------------------------------------------------------ chaos experiments
    const svcOf = (el: Element) => el.closest('[data-svc]');
    const svcName = (el: Element) => svcOf(el)?.getAttribute('data-svc') || 'portfolio-svc';

    function* expKill(): Gen {
      const el = choose('[data-break]') as HTMLElement | null; if (!el) return;
      yield* hopOn(el, el.getBoundingClientRect().width / 2);
      S.pose = 'charge'; say(pick(['kill -9 💥', 'Testing resilience…', 'Let’s see if this survives', 'sudo break prod']), 1600);
      log('CHAOS', `chaos-monkey: terminating ${svcName(el)}/pod-${Math.ceil(Math.random() * 3)}`);
      yield* wait(1300);
      S.pose = 'idle';
      const o = onEl(el, el.getBoundingClientRect().width / 2);
      S.jump = { fx: S.x, fy: S.y, tx: o.target, h: 90, T: 0.5, t: 0, land: null }; S.mode = 'jump';
      while (S.jump) yield;
      const started = performance.now();
      const g = shatter(el, S.x, S.y);
      setHealth(svcOf(el), 'down');
      log('ERROR', `${svcName(el)}: pod crashed — readiness probe failing`);
      say(pick(['Oops. 🙈', 'Production go brrr', 'It was like that when I got here']), 1600);
      S.vy = -620; S.vx = rand(-260, 260); S.mode = 'air'; S.anchor = null;
      yield* wait(1300);
      setHealth(svcOf(el), 'restarting');
      log('WARN', `${svcName(el)}: restarting pod (attempt 1/3, backoff 200ms)`);
      yield* wait(900);
      heal(g);
      yield* wait(800);
      setHealth(svcOf(el), 'ok');
      log('OK', `${svcName(el)}: recovered in ${((performance.now() - started) / 1000).toFixed(1)}s — zero data lost`);
    }

    function* expLatency(): Gen {
      const el = choose('[data-svc] [data-break], [data-svc][data-break]') as HTMLElement | null; if (!el) return;
      yield* hopOn(el);
      S.pose = 'sleep'; say('Injecting 2s latency ⏳', 1800);
      el.classList.add('svc-slow'); setHealth(svcOf(el), 'slow');
      log('CHAOS', `chaos-monkey: injecting 2000ms latency into ${svcName(el)}`);
      log('WARN', `${svcName(el)}: p99 latency 2412ms (SLO 300ms)`);
      yield* wait(2200);
      log('INFO', `${svcName(el)}: circuit breaker OPEN → serving cached response`);
      yield* wait(1800);
      el.classList.remove('svc-slow'); setHealth(svcOf(el), 'ok'); S.pose = 'idle';
      log('OK', `${svcName(el)}: circuit breaker CLOSED · p99 38ms`);
    }

    function* expSteal(): Gen {
      const chip = choose('[data-chip]') as HTMLElement | null; if (!chip) return;
      yield* hopOn(chip, chip.getBoundingClientRect().width / 2);
      const r = chip.getBoundingClientRect();
      const clone = chip.cloneNode(true) as HTMLElement;
      clone.classList.add('chip-carried');
      Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px` });
      document.body.appendChild(clone);
      chip.style.visibility = 'hidden'; carried = clone; S.pose = 'carry';
      const name = chip.getAttribute('data-chip') || 'skill';
      log('ERROR', `skills-db: DELETE FROM skills WHERE name='${name}' 💀 (by chaos-monkey)`);
      say(pick([`Mine now: ${name} 😈`, 'Yoink!', 'Free skill!']), 1600);
      for (let k = 0; k < 2; k++) { const p = choose('[data-perch]'); if (p) yield* hopOn(p); else yield* toFloor(rand(80, W - 80)); yield* wait(350); }
      log('WARN', 'skills-db: integrity check failed — restoring from backup…');
      yield* wait(600);
      carried = null; S.pose = 'idle';
      const back = chip.getBoundingClientRect();
      clone.style.transition = 'left .7s cubic-bezier(.3,1.4,.5,1), top .7s cubic-bezier(.3,1.4,.5,1), transform .7s';
      clone.style.left = `${back.left}px`; clone.style.top = `${back.top}px`; clone.style.transform = 'rotate(0deg)';
      yield* wait(720);
      clone.remove(); chip.style.visibility = '';
      log('OK', `skills-db: '${name}' restored from backup (point-in-time recovery, RPO 0s)`);
      say('Fine. Take it back.', 1400);
    }

    function* expFlood(): Gen {
      const btn = choose('[data-flood]'); if (!btn) return;
      yield* hopOn(btn, btn.getBoundingClientRect().width / 2);
      S.pose = 'tap'; say('click click click click', 1600);
      log('CHAOS', 'chaos-monkey: flooding the API gateway (60 req/s)');
      bus.dispatchEvent(new CustomEvent('flood'));
      for (let k = 0; k < 6; k++) { request('GET', '/projects', k < 3 ? 200 : 429); yield* wait(170); }
      log('WARN', 'gateway: rate limiter tripped — 429 Too Many Requests for chaos-monkey 🙈');
      S.pose = 'idle'; say('429?! Rude.', 1500);
      yield* wait(900);
    }

    function* doPush(): Gen {
      const el = choose('[data-push]') as HTMLElement | null; if (!el) return;
      const r = el.getBoundingClientRect();
      const side = Math.random() < 0.5 ? -1 : 1;
      yield* hopOn(el, side < 0 ? -34 : r.width + 34, r.height);
      S.face = -side; S.pose = 'push'; say(pick(['Hnnngh!', 'Scaling horizontally…', 'Move!', 'Load balancing 💪']), 1500);
      yield* wait(500);
      const px = -side * rand(18, 34);
      el.style.transition = 'translate .5s cubic-bezier(.3,1.6,.5,1)'; el.style.translate = `${px}px 0`; el.classList.add('pushed');
      if (S.anchor) S.anchor.dx += -side * 10;
      log('WARN', `${svcName(el)}: load spike — shoved ${Math.abs(Math.round(px))}px · autoscaler +1 replica`);
      yield* wait(900); S.pose = 'idle';
      setTimeout(() => { el.style.translate = ''; el.classList.remove('pushed'); }, rand(4500, 8000));
    }

    function* doHide(): Gen {
      const el = choose('[data-hide]'); if (!el) return;
      setBehind(true);
      yield* hopOn(el, undefined, 74 * SC, 160);
      say(pick(['Can’t reproduce the bug 🙈', 'Works on my machine', 'You can’t see me', 'Shh, I’m a hidden dependency']), 2200);
      yield* wait(rand(2400, 4200));
      const o = onEl(el, S.anchor?.dx);
      setBehind(true);
      S.jump = { fx: S.x, fy: S.y, tx: o.target, h: 120, T: 0.55, t: 0, land: o.anchor }; S.mode = 'jump'; S.sqv += 5;
      let switched = false;
      while (S.jump) { yield; if (!switched && S.jump && S.jump.t / S.jump.T > 0.45) { setBehind(false); switched = true; } }
      setBehind(false);
      say('Boo! 👻', 1100);
      yield* wait(700);
    }

    function* doPerch(): Gen {
      const el = choose('[data-perch], [data-break]'); if (!el) { yield* toFloor(rand(80, W - 80)); return; }
      yield* hopOn(el);
      if (Math.random() < 0.5 && S.anchor) { const r = (S.anchor.el as Element).getBoundingClientRect(); yield* walkOn(clamp(rand(20, r.width - 20), 10, r.width)); }
      if (Math.random() < 0.4) say(pick(['Is this production? 👀', 'Nice uptime you’ve got there…', 'I refactored your CSS', 'brb, reading the logs', '404: boredom not found', 'All your base are belong to me']), 1900);
      yield* wait(rand(1200, 2600));
    }

    function* doSleep(): Gen {
      const el = choose('[data-perch]'); if (el) yield* hopOn(el);
      S.pose = 'sleep'; log('INFO', 'chaos-monkey: idle connection… 💤');
      for (let k = 0; k < 4; k++) { say(['z', 'zZ', 'zZz', 'zZzZ 💤'][k], 900); yield* wait(900); }
      S.pose = 'idle'; say('*yawn*', 900);
    }

    function* doBanana(b: HTMLElement): Gen {
      say('🍌!!!', 1000);
      while (b.isConnected && b.dataset.landed !== '1') yield;
      if (!b.isConnected) return;
      const r = b.getBoundingClientRect();
      yield* jumpTo(() => [r.left + r.width / 2, r.bottom], null, 160);
      b.remove(); S.pose = 'happy'; say('nom nom 🍌', 1400);
      log('INFO', 'garbage collector: freed 1 banana (120 kcal reclaimed)');
      yield* wait(1200); S.pose = 'idle';
    }

    function* flip(): Gen { S.flip = 0.0001; S.vy = -720; S.mode = 'air'; S.anchor = null; S.sqv += 4; yield* wait(400); }

    let gen: Gen | null = null;
    let queued: Gen | null = null;
    const nextTask = (): Gen => {
      const r = Math.random();
      if (metrics.chaos) {
        if (r < 0.18) return expKill();
        if (r < 0.31) return expLatency();
        if (r < 0.44) return expSteal();
        if (r < 0.51) return expFlood();
        if (r < 0.64) return doPush();
        if (r < 0.77) return doHide();
        if (r < 0.95) return doPerch();
        return doSleep();
      }
      if (r < 0.4) return doPerch();
      if (r < 0.7) return doHide();
      if (r < 0.85) return doSleep();
      return doPush();
    };
    const interrupt = (g: Gen) => { queued = g; };

    // ------------------------------------------------------------ input
    let dragging = false, grabDX = 0, grabDY = 0, moved = 0, lastClick = 0;
    const samples: { x: number; y: number; t: number }[] = [];
    hit.addEventListener('pointerenter', () => { if (!dragging) say(pick(['👀 what?', 'Don’t touch prod!', 'I’m testing resilience', 'Grab me if you can', 'Psst… try throwing me']), 1300); });
    hit.addEventListener('pointerdown', (e) => {
      e.preventDefault(); hit.setPointerCapture(e.pointerId);
      dragging = true; moved = 0; samples.length = 0;
      grabDX = e.clientX - S.x; grabDY = e.clientY - S.y;
      if (carried) { carried.remove(); carried = null; document.querySelectorAll<HTMLElement>('[data-chip]').forEach((c) => { c.style.visibility = ''; }); }
      gen = null; S.jump = null; S.anchor = null; S.mode = 'drag'; S.pose = 'flail'; setBehind(false);
      hit.classList.add('grabbing');
    });
    hit.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      moved += Math.abs(e.movementX) + Math.abs(e.movementY);
      S.x = e.clientX - grabDX; S.y = e.clientY - grabDY;
      samples.push({ x: S.x, y: S.y, t: performance.now() }); if (samples.length > 6) samples.shift();
      if (moved > 40 && moved < 60) { say(pick(['Wheee! 🎢', 'Put me down!', 'Unhandled exception!!']), 1200); log('INFO', 'chaos-monkey: caught by a user — exception handled ✓'); }
    });
    const release = () => {
      if (!dragging) return;
      dragging = false; hit.classList.remove('grabbing');
      const now = performance.now();
      if (moved < 6) {
        if (now - lastClick < 320) { interrupt(flip()); say('Backflip! 🤸', 1200); }
        else { S.pose = 'happy'; say(pick(['Hehe 🙈', 'Ow!', 'POST /monkey/poke 200', 'Tickles!']), 1100); request('POST', '/monkey/poke'); S.sqv += 6; }
        lastClick = now; S.mode = 'air'; S.vx = 0; S.vy = -260;
        return;
      }
      const a = samples[0], b = samples[samples.length - 1];
      const dt = Math.max(16, b.t - a.t) / 1000;
      S.vx = clamp((b.x - a.x) / dt, -2600, 2600); S.vy = clamp((b.y - a.y) / dt, -2600, 2600);
      S.mode = 'air'; S.pose = 'flail';
    };
    hit.addEventListener('pointerup', release); hit.addEventListener('pointercancel', release);
    const onMouse = (e: PointerEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('pointermove', onMouse);

    // bus commands
    const onFeed = () => {
      const b = document.createElement('div'); b.className = 'banana'; b.textContent = '🍌';
      const x = rand(120, W - 160); let y = -40, vy = 0;
      b.style.left = `${x}px`; b.style.top = `${y}px`; document.body.appendChild(b);
      const fall = () => { vy += 0.9; y = Math.min(floorY() - 34, y + vy); b.style.top = `${y}px`; if (y < floorY() - 34) requestAnimationFrame(fall); else b.dataset.landed = '1'; };
      requestAnimationFrame(fall);
      interrupt(doBanana(b));
      log('INFO', 'POST /monkey/feed 201 — banana dispatched 🍌');
    };
    const onChaosNow = () => interrupt(pick([expKill, expLatency, expSteal, expFlood])());
    bus.addEventListener('feed', onFeed);
    bus.addEventListener('chaos-now', onChaosNow);
    const unsub = subscribe(() => {
      const show = metrics.monkeyVisible;
      cv.style.display = show ? '' : 'none'; hit.style.display = show ? '' : 'none';
      if (!show) bubble.classList.remove('show');
    });

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H);
      camera.right = W; camera.bottom = -H; camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ------------------------------------------------------------ main loop
    let last = performance.now(), raf = 0, idleT = 1200, blinkT = 2500, t = 0;
    log('CHAOS', 'chaos-monkey deployed to production 🐒 (grab it, throw it, or feed it from the panel)');
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dtMs = Math.min(50, now - last); last = now;
      const dt = dtMs / 1000; t += dt;
      const ms = Math.hypot(mouseX - lastMX, mouseY - lastMY) / Math.max(dt, 0.001); lastMX = mouseX; lastMY = mouseY;
      mouseSpeed = mouseSpeed * 0.8 + ms * 0.2;

      // tasks
      if (!dragging && metrics.monkeyVisible) {
        if (queued) { gen = queued; queued = null; S.pose = 'idle'; gen.next(0); }
        if (!gen && (S.mode === 'anchored' || S.mode === 'floor')) {
          idleT -= dtMs;
          if (idleT <= 0) { gen = nextTask(); gen.next(0); idleT = rand(700, 2200); }
        }
        if (gen) { const res = gen.next(dtMs); if (res.done) { gen = null; S.pose = S.pose === 'carry' ? 'idle' : S.pose; } }
      }

      // scared of fast cursors
      const hx = S.x, hy = S.y - 80 * SC;
      if (!dragging && mouseSpeed > 2600 && Math.hypot(mouseX - hx, mouseY - hy) < 130 && S.mode !== 'jump' && S.mode !== 'air') {
        gen = null; S.vx = (hx > mouseX ? 1 : -1) * 520; S.vy = -760; S.mode = 'air'; S.anchor = null; say('AAAH! 😱', 900);
      }

      // physics
      if (S.mode === 'jump' && S.jump) {
        const j = S.jump; j.t += dt;
        const k = Math.min(1, j.t / j.T);
        const [tx, ty] = j.tx();
        S.x = j.fx + (tx - j.fx) * k;
        S.y = j.fy + (ty - j.fy) * k - 4 * j.h * k * (1 - k);
        if (k >= 1) {
          S.jump = null; S.sqv -= 7;
          if (j.land) { S.anchor = j.land; S.mode = 'anchored'; } else { S.mode = 'floor'; S.y = Math.min(S.y, floorY()); }
        }
      } else if (S.mode === 'air') {
        S.vy += 2300 * dt; S.vx *= 0.995;
        const prevY = S.y;
        S.x += S.vx * dt; S.y += S.vy * dt;
        if (S.x < 30) { S.x = 30; S.vx = Math.abs(S.vx) * 0.6; S.sqv -= 3; }
        if (S.x > W - 30) { S.x = W - 30; S.vx = -Math.abs(S.vx) * 0.6; S.sqv -= 3; }
        if (S.y < 100 * SC && S.vy < 0) { S.y = 100 * SC; S.vy = Math.abs(S.vy) * 0.4; }
        if (S.vy > 0) {
          for (const el of document.querySelectorAll('[data-perch], [data-break], [data-hide]')) {
            if (el.classList.contains('crashed')) continue;
            const r = el.getBoundingClientRect();
            if (S.x > r.left + 8 && S.x < r.right - 8 && prevY <= r.top && S.y >= r.top && r.top > 60 && r.top < H) {
              S.y = r.top; S.mode = 'anchored'; S.anchor = { el, dx: S.x - r.left, offY: 0 }; S.sqv -= Math.min(10, S.vy / 180);
              if (S.pose === 'flail') S.pose = 'idle'; break;
            }
          }
        }
        if (S.mode === 'air' && S.y >= floorY()) {
          if (S.vy > 900) { S.y = floorY(); S.vy = -S.vy * 0.35; S.vx *= 0.7; S.sqv -= 8; }
          else { S.y = floorY(); S.mode = 'floor'; S.sqv -= 5; if (S.pose === 'flail') S.pose = 'idle'; }
        }
      } else if (S.mode === 'anchored' && S.anchor) {
        const r = (S.anchor.el as Element).getBoundingClientRect();
        S.x = r.left + S.anchor.dx; S.y = r.top + S.anchor.offY;
        if (r.bottom < -40 || r.top > H + 40 || !S.anchor.el.isConnected) {
          // our perch scrolled away — drop in from the sky
          gen = null; S.anchor = null; S.mode = 'air'; setBehind(false);
          S.x = rand(80, W - 80); S.y = -140; S.vx = 0; S.vy = 200;
        }
      } else if (S.mode === 'floor') {
        S.y = floorY();
      }

      // squash & stretch spring
      const acc = -340 * S.sq - 15 * S.sqv;
      S.sqv += acc * dt; S.sq += S.sqv * dt;
      S.sq = clamp(S.sq, -0.38, 0.38);
      let stretch = 0;
      if (S.mode === 'drag' && samples.length > 1) {
        const a = samples[0], b = samples[samples.length - 1];
        stretch = clamp(Math.hypot(b.x - a.x, b.y - a.y) / 260, 0, 0.35);
      }
      if (S.mode === 'air') stretch = clamp(Math.abs(S.vy) / 4000, 0, 0.22);
      const sy = 1 + S.sq + stretch, sx = 1 - (S.sq + stretch) * 0.55;
      body.scale.set(sx, sy, sx);

      // pose animation
      const swing = Math.sin(t * 12);
      let aL = 0.25, aR = -0.25;
      if (S.pose === 'walk' || S.mode === 'jump') { aL = 0.4 + swing * 0.6; aR = -0.4 + swing * 0.6; legL.rotation.x = swing * 0.5; legR.rotation.x = -swing * 0.5; }
      else { legL.rotation.x = legR.rotation.x = 0; }
      if (S.pose === 'push') { aL = aR = -S.face * 1.5; }
      if (S.pose === 'charge') { aL = 2.6 + Math.sin(t * 40) * 0.2; aR = -2.6 - Math.sin(t * 40) * 0.2; }
      if (S.pose === 'carry' || S.pose === 'happy') { aL = 2.7 + swing * 0.15; aR = -2.7 - swing * 0.15; }
      if (S.pose === 'tap') { aL = -S.face * (1.2 + Math.abs(Math.sin(t * 28)) * 0.8); aR = aL; }
      if (S.pose === 'flail') { aL = 2 + Math.sin(t * 25) * 0.9; aR = -2 + Math.cos(t * 25) * 0.9; }
      armL.rotation.z += (aL - armL.rotation.z) * 0.3; armR.rotation.z += (aR - armR.rotation.z) * 0.3;
      tail.rotation.z = Math.sin(t * 3.2) * 0.35;

      // facing, flip, charge shake, behind tint
      monkey.rotation.y += ((S.face * 0.5) - monkey.rotation.y) * 0.15;
      if (S.flip) { S.flip += dt * 11; monkey.rotation.z = -S.face * S.flip; if (S.flip >= Math.PI * 2) { S.flip = 0; monkey.rotation.z = 0; } }
      else monkey.rotation.z = S.mode === 'drag' ? clamp((samples.length > 1 ? samples[samples.length - 1].x - samples[0].x : 0) * -0.004, -0.6, 0.6) : 0;
      const shake = S.pose === 'charge' ? rand(-3, 3) : 0;
      fur.emissive.set(S.pose === 'charge' ? '#ff2020' : '#000000'); fur.emissiveIntensity = S.pose === 'charge' ? 0.35 + Math.sin(t * 30) * 0.2 : 0;
      browL.rotation.z = S.pose === 'charge' ? -0.5 : 0.08; browR.rotation.z = S.pose === 'charge' ? 0.5 : -0.08;
      browL.position.y = browR.position.y = S.pose === 'charge' ? 11 : 13.5;
      mouth.rotation.z = S.pose === 'charge' ? 0 : Math.PI;
      mouth.position.y = S.pose === 'charge' ? -14 : -10;
      const surprised = S.pose === 'flail';
      mouth.scale.set(surprised ? 0.6 : 1, surprised ? 1.6 : 1, 1);

      // eyes: blink, sleep, follow cursor
      blinkT -= dtMs;
      const sleeping = S.pose === 'sleep';
      const blink = blinkT < 0 && blinkT > -130;
      if (blinkT < -130) blinkT = rand(2200, 5200);
      eyes.scale.y = sleeping || blink ? 0.12 : 1;
      const ex = mouseX - hx, ey = mouseY - hy, el = Math.max(1, Math.hypot(ex, ey));
      pupils.position.x = (ex / el) * 3.2 - monkey.rotation.y * 3; pupils.position.y = -(ey / el) * 3;
      head.rotation.z = clamp(-ex / 2400, -0.18, 0.18);

      monkey.position.set(S.x + shake, -S.y, 0);
      // carried chip follows the hands
      if (carried) { carried.style.left = `${S.x - carried.offsetWidth / 2}px`; carried.style.top = `${S.y - 150 * SC}px`; carried.style.transform = `rotate(${Math.sin(t * 6) * 8}deg)`; }

      // shards
      for (let gi = shards.length - 1; gi >= 0; gi--) {
        const g = shards[gi]; g.t += dt;
        if (g.mode === 'fly') {
          g.list.forEach((s) => {
            s.v.y -= 1400 * dt; s.mesh.position.addScaledVector(s.v, dt);
            if (s.mesh.position.y < -H + 8) { s.mesh.position.y = -H + 8; s.v.y = Math.abs(s.v.y) * 0.3; s.v.x *= 0.6; }
            s.mesh.rotation.x += s.w.x * dt; s.mesh.rotation.y += s.w.y * dt; s.mesh.rotation.z += s.w.z * dt;
          });
        } else {
          const k = Math.min(1, g.t / 0.75);
          const e = 1 - Math.pow(1 - k, 3);
          g.list.forEach((s) => { s.mesh.position.lerpVectors(s.from!, s.home, e); s.mesh.quaternion.slerpQuaternions(s.fromQ!, s.homeQ, e); });
          if (k >= 1) {
            g.list.forEach((s) => { scene.remove(s.mesh); s.mesh.geometry.dispose(); (s.mesh.material as THREE.Material).dispose(); });
            g.el.classList.remove('crashed'); g.el.classList.add('healed'); setTimeout(() => g.el.classList.remove('healed'), 900);
            shards.splice(gi, 1);
          }
        }
      }

      // overlay DOM: hit box + speech bubble
      Object.assign(hit.style, { left: `${S.x - 44 * SC}px`, top: `${S.y - 112 * SC}px`, width: `${88 * SC}px`, height: `${112 * SC}px` });
      bubble.style.left = `${S.x}px`; bubble.style.top = `${S.y - 128 * SC}px`;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMouse);
      window.removeEventListener('resize', onResize);
      bus.removeEventListener('feed', onFeed);
      bus.removeEventListener('chaos-now', onChaosNow);
      unsub();
      renderer.dispose();
      root.innerHTML = '';
    };
  }, []);

  return <div ref={host} aria-hidden="true" />;
}
