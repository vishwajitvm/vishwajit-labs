'use client';

/*
 * Hero: a pile of chunky clay "backend toys" (database, servers, gears, cloud, lock…) with real
 * physics. Your cursor shoves them, you can grab & throw them, click to make one jump,
 * and the Chaos Monkey can stomp into the pile.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { bus, log, request, send } from '@/lib/chaos';

type Kind = 'box' | 'db' | 'server' | 'gear' | 'cloud' | 'lock' | 'ball' | 'pill' | 'ring';
const TOYS: { kind: Kind; color: string; label: string; s: number }[] = [
  { kind: 'db', color: '#7FB8FF', label: 'PostgreSQL', s: 1.05 },
  { kind: 'server', color: '#B9A6FF', label: 'API server', s: 1 },
  { kind: 'box', color: '#FF5B1F', label: 'Redis', s: 0.95 },
  { kind: 'gear', color: '#FFD23F', label: 'Celery workers', s: 1 },
  { kind: 'cloud', color: '#FFFFFF', label: 'AWS · Azure', s: 1 },
  { kind: 'lock', color: '#FF8FB1', label: 'Auth · RBAC', s: 0.9 },
  { kind: 'ball', color: '#5FD6A4', label: 'Python', s: 0.85 },
  { kind: 'pill', color: '#7FB8FF', label: 'Docker', s: 0.95 },
  { kind: 'ring', color: '#B9A6FF', label: 'Message queue', s: 0.9 },
  { kind: 'db', color: '#5FD6A4', label: 'MongoDB', s: 0.85 },
  { kind: 'box', color: '#3DD6C8', label: 'FastAPI', s: 0.8 },
  { kind: 'ball', color: '#FFD23F', label: 'LLM', s: 0.75 },
  { kind: 'server', color: '#FFB59A', label: 'NestJS', s: 0.8 },
  { kind: 'box', color: '#FF8FB1', label: 'Qdrant', s: 0.7 },
  { kind: 'gear', color: '#7FB8FF', label: 'GitHub Actions', s: 0.75 },
  { kind: 'pill', color: '#FFD23F', label: 'Node.js', s: 0.8 },
  { kind: 'db', color: '#FFB59A', label: 'MySQL', s: 0.75 },
  { kind: 'ball', color: '#FF5B1F', label: 'Grafana', s: 0.65 },
];

const clayMat = (color: string) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: new THREE.Color('#ffffff') });
const darkMat = () => new THREE.MeshPhysicalMaterial({ color: '#15130f', roughness: 0.35, clearcoat: 0.6 });

function buildToy(kind: Kind, color: string, s: number) {
  const g = new THREE.Group();
  const body = new CANNON.Body({ mass: 1 * s, material: undefined, linearDamping: 0.05, angularDamping: 0.12 });
  const m = clayMat(color);
  const add = (mesh: THREE.Mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  switch (kind) {
    case 'box': {
      add(new THREE.Mesh(new RoundedBoxGeometry(1.1 * s, 1.1 * s, 1.1 * s, 5, 0.22 * s), m));
      body.addShape(new CANNON.Box(new CANNON.Vec3(0.55 * s, 0.55 * s, 0.55 * s)));
      break;
    }
    case 'server': {
      add(new THREE.Mesh(new RoundedBoxGeometry(1.5 * s, 1.0 * s, 1.0 * s, 5, 0.18 * s), m));
      for (let i = 0; i < 3; i++) {
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.07 * s, 12, 12), new THREE.MeshBasicMaterial({ color: i === 0 ? '#22c55e' : '#15130f' }));
        led.position.set((-0.45 + i * 0.22) * s, 0.15 * s, 0.51 * s); g.add(led);
        const slot = new THREE.Mesh(new RoundedBoxGeometry(0.9 * s, 0.08 * s, 0.04 * s, 2, 0.02), darkMat());
        slot.position.set(0.15 * s, (-0.12 - i * 0.0) * s - i * 0.12 * s, 0.5 * s); g.add(slot);
      }
      body.addShape(new CANNON.Box(new CANNON.Vec3(0.75 * s, 0.5 * s, 0.5 * s)));
      break;
    }
    case 'db': {
      for (let i = 0; i < 3; i++) {
        const c = add(new THREE.Mesh(new THREE.CylinderGeometry(0.6 * s, 0.6 * s, 0.36 * s, 36), m));
        c.position.y = (-0.4 + i * 0.4) * s;
      }
      body.addShape(new CANNON.Cylinder(0.6 * s, 0.6 * s, 1.16 * s, 12));
      break;
    }
    case 'gear': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.5 * s, 0.5 * s, 0.34 * s, 32), m));
      for (let i = 0; i < 8; i++) {
        const tooth = add(new THREE.Mesh(new RoundedBoxGeometry(0.24 * s, 0.34 * s, 0.24 * s, 2, 0.05 * s), m));
        const a = (i / 8) * Math.PI * 2; tooth.position.set(Math.cos(a) * 0.58 * s, 0, Math.sin(a) * 0.58 * s); tooth.rotation.y = -a;
      }
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.17 * s, 0.17 * s, 0.36 * s, 20), darkMat()); g.add(hole);
      body.addShape(new CANNON.Cylinder(0.68 * s, 0.68 * s, 0.34 * s, 12));
      break;
    }
    case 'cloud': {
      [[0, 0, 0, 0.5], [0.5, -0.08, 0, 0.38], [-0.5, -0.1, 0, 0.36], [0.2, 0.25, 0, 0.36]].forEach(([x, y, z, r]) => {
        const b = add(new THREE.Mesh(new THREE.SphereGeometry(r * s, 28, 20), m)); b.position.set(x * s, y * s, z * s);
        body.addShape(new CANNON.Sphere(r * s), new CANNON.Vec3(x * s, y * s, z * s));
      });
      break;
    }
    case 'lock': {
      add(new THREE.Mesh(new RoundedBoxGeometry(0.95 * s, 0.8 * s, 0.5 * s, 5, 0.15 * s), m)).position.y = -0.15 * s;
      const sh = add(new THREE.Mesh(new THREE.TorusGeometry(0.3 * s, 0.09 * s, 14, 28, Math.PI), clayMat('#d4d4d8'))); sh.position.y = 0.25 * s;
      const kh = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.08 * s, 0.1, 12), darkMat()); kh.rotation.x = Math.PI / 2; kh.position.set(0, -0.12 * s, 0.26 * s); g.add(kh);
      body.addShape(new CANNON.Box(new CANNON.Vec3(0.48 * s, 0.55 * s, 0.25 * s)), new CANNON.Vec3(0, 0, 0));
      break;
    }
    case 'ball': {
      add(new THREE.Mesh(new THREE.SphereGeometry(0.55 * s, 36, 24), m));
      body.addShape(new CANNON.Sphere(0.55 * s));
      break;
    }
    case 'pill': {
      add(new THREE.Mesh(new THREE.CapsuleGeometry(0.36 * s, 0.8 * s, 8, 20), m)).rotation.z = Math.PI / 2;
      body.addShape(new CANNON.Sphere(0.36 * s), new CANNON.Vec3(-0.4 * s, 0, 0));
      body.addShape(new CANNON.Sphere(0.36 * s), new CANNON.Vec3(0.4 * s, 0, 0));
      body.addShape(new CANNON.Box(new CANNON.Vec3(0.4 * s, 0.3 * s, 0.3 * s)));
      break;
    }
    case 'ring': {
      add(new THREE.Mesh(new THREE.TorusGeometry(0.5 * s, 0.2 * s, 18, 40), m)).rotation.x = Math.PI / 2;
      body.addShape(new CANNON.Cylinder(0.7 * s, 0.7 * s, 0.4 * s, 12));
      break;
    }
  }
  return { group: g, body, mat: m };
}

/** Résumés served from /public/assets/resume-<id>.pdf */
const RESUMES = [
  { id: 'backend', icon: '⚙️', label: 'Backend Developer' },
  { id: 'python', icon: '🐍', label: 'Python Developer' },
  { id: 'nodejs', icon: '🟢', label: 'Node.js Developer' },
  { id: 'fullstack', icon: '🧱', label: 'Full Stack Developer' },
  { id: 'ai', icon: '🤖', label: 'AI Engineer' },
];

export default function ClayHero() {
  const mount = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const tidyRef = useRef<() => void>(() => {});
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    const host = mount.current!;
    let W = host.clientWidth, H = host.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);
    const target = new THREE.Vector3(0, 1.8, 0);
    const placeCam = () => { const a = W / H; camera.position.set(0, 7.2, a < 0.9 ? 24 : 17); camera.lookAt(target); };
    placeCam();

    scene.add(new THREE.HemisphereLight('#fff6ea', '#d8cfc2', 1.6));
    const sun = new THREE.DirectionalLight('#ffffff', 2.4);
    sun.position.set(-5, 12, 8); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 12, bottom: -6, near: 1, far: 40 });
    sun.shadow.radius = 6;
    scene.add(sun);
    const fill = new THREE.DirectionalLight('#ffd9c2', 0.8); fill.position.set(8, 4, 6); scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    // physics
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -26, 0) });
    world.allowSleep = true;
    const mat = new CANNON.Material('clay');
    world.defaultContactMaterial = new CANNON.ContactMaterial(mat, mat, { friction: 0.35, restitution: 0.32 });
    const floor = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(floor);
    const walls: CANNON.Body[] = [];
    const halfW = () => { const d = camera.position.distanceTo(target); return Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d * camera.aspect - 0.9; };
    const mkWall = (nx: number, nz: number) => { const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() }); b.quaternion.setFromVectors(new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(nx, 0, nz)); world.addBody(b); walls.push(b); return b; };
    const wl = mkWall(1, 0), wr = mkWall(-1, 0), wb = mkWall(0, 1), wf = mkWall(0, -1);
    const leftEdge = () => -halfW();
    const placeWalls = () => { const h = halfW(); wl.position.set(leftEdge(), 0, 0); wr.position.set(h, 0, 0); wb.position.set(0, 0, -2.6); wf.position.set(0, 0, 3.2); };
    placeWalls();

    const toys = TOYS.map((t, i) => {
      const toy = buildToy(t.kind, t.color, t.s * (W < 700 ? 0.85 : 1));
      toy.group.userData.i = i;
      toy.group.traverse((o) => { o.userData.i = i; });
      scene.add(toy.group); world.addBody(toy.body);
      return { ...toy, label: t.label };
    });
    const drop = () => {
      const h = halfW();
      toys.forEach((t, i) => {
        t.body.position.set(THREE.MathUtils.randFloat(leftEdge() + 0.8, h * 0.9), 10 + i * 0.9, THREE.MathUtils.randFloat(-1.6, 1.8));
        t.body.velocity.set(0, 0, 0); t.body.angularVelocity.set(Math.random() * 4, Math.random() * 4, Math.random() * 4);
        t.body.quaternion.setFromEuler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        t.body.wakeUp();
      });
    };
    drop();
    tidyRef.current = () => { drop(); log('INFO', 'hero: re-provisioned 18 services 🧹'); };

    // cursor pusher (kinematic)
    const pusher = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, shape: new CANNON.Sphere(0.75) });
    pusher.position.set(0, -10, 0); world.addBody(pusher);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pushPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.75);
    const tmp = new THREE.Vector3();
    let pointerIn = false;
    let hovered = -1;
    const pickables = () => toys.map((t) => t.group);
    const setNdc = (e: PointerEvent) => { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };

    // grab & throw
    let drag: { c: CANNON.PointToPointConstraint; i: number; plane: THREE.Plane; moved: number } | null = null;
    const hand = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC });
    hand.collisionFilterGroup = 0; hand.collisionFilterMask = 0; world.addBody(hand);

    const onMove = (e: PointerEvent) => {
      setNdc(e); pointerIn = true;
      ray.setFromCamera(ndc, camera);
      if (drag) {
        if (ray.ray.intersectPlane(drag.plane, tmp)) { hand.position.set(tmp.x, Math.max(0.3, tmp.y), tmp.z); drag.moved += 1; }
        return;
      }
      if (ray.ray.intersectPlane(pushPlane, tmp)) {
        pusher.velocity.set((tmp.x - pusher.position.x) * 30, 0, (tmp.z - pusher.position.z) * 30);
        pusher.position.set(tmp.x, 0.75, tmp.z);
      }
      const hit = ray.intersectObjects(pickables(), true)[0];
      const i = hit ? (hit.object.userData.i as number) : -1;
      if (i !== hovered) {
        if (hovered >= 0) toys[hovered].mat.emissive.set('#000000');
        hovered = i;
        if (i >= 0) toys[i].mat.emissive.set('#3a2a1a');
        renderer.domElement.style.cursor = i >= 0 ? 'grab' : 'default';
      }
      if (tip.current) {
        tip.current.style.opacity = i >= 0 ? '1' : '0';
        if (i >= 0) { tip.current.textContent = toys[i].label; tip.current.style.transform = `translate(${e.clientX - host.getBoundingClientRect().left + 14}px, ${e.clientY - host.getBoundingClientRect().top - 30}px)`; }
      }
    };
    const onDown = (e: PointerEvent) => {
      setNdc(e); ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables(), true)[0];
      if (!hit) return;
      const i = hit.object.userData.i as number;
      const t = toys[i];
      const local = t.body.pointToLocalFrame(new CANNON.Vec3(hit.point.x, hit.point.y, hit.point.z));
      hand.position.set(hit.point.x, hit.point.y, hit.point.z);
      const c = new CANNON.PointToPointConstraint(t.body, local, hand, new CANNON.Vec3(0, 0, 0), 40);
      world.addConstraint(c);
      const n = new THREE.Vector3(); camera.getWorldDirection(n);
      drag = { c, i, plane: new THREE.Plane().setFromNormalAndCoplanarPoint(n.negate(), hit.point), moved: 0 };
      t.body.wakeUp();
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = 'grabbing';
      pusher.position.set(0, -10, 0);
    };
    const onUp = () => {
      if (!drag) return;
      const t = toys[drag.i];
      world.removeConstraint(drag.c);
      if (drag.moved < 3) { t.body.applyImpulse(new CANNON.Vec3((Math.random() - 0.5) * 3, 14 * t.body.mass, 0)); t.body.angularVelocity.set(0, 9, 4); request('POST', `/toys/${t.label.toLowerCase().replace(/\W+/g, '-')}/jump`); }
      else log('INFO', `${t.label}: thrown by a user — still serving traffic ✓`);
      drag = null; renderer.domElement.style.cursor = 'grab';
    };
    const onLeave = () => { pointerIn = false; pusher.position.set(0, -10, 0); if (tip.current) tip.current.style.opacity = '0'; };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    renderer.domElement.addEventListener('pointerleave', onLeave);

    // the monkey can stomp into the pile
    const onStomp = (ev: Event) => {
      const { x, y } = (ev as CustomEvent<{ x: number; y: number }>).detail;
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p)) return;
      toys.forEach((t) => {
        const d = Math.hypot(t.body.position.x - p.x, t.body.position.z - p.z);
        if (d < 4.5) {
          const k = (4.5 - d) / 4.5;
          t.body.wakeUp();
          t.body.applyImpulse(new CANNON.Vec3((t.body.position.x - p.x) * 2.2 * k * t.body.mass, 18 * k * t.body.mass, (Math.random() - 0.5) * 3));
          t.body.angularVelocity.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
        }
      });
    };
    bus.addEventListener('stomp', onStomp);

    // frosted glass with a clear "lens" that follows the cursor
    const section = host.parentElement as HTMLElement;
    const onLens = (e: PointerEvent) => {
      const g = glass.current, l = lens.current; if (!g || !l) return;
      const r = g.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const inside = x > 0 && y > 0 && x < r.width && y < r.height;
      g.style.setProperty('--mx', `${x}px`); g.style.setProperty('--my', `${y}px`);
      g.classList.toggle('lens', inside); l.classList.toggle('on', inside);
      l.style.transform = `translate(${e.clientX - section.getBoundingClientRect().left}px, ${e.clientY - section.getBoundingClientRect().top}px)`;
    };
    const offLens = () => { glass.current?.classList.remove('lens'); lens.current?.classList.remove('on'); };
    section.addEventListener('pointermove', onLens);
    section.addEventListener('pointerleave', offLens);

    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
    io.observe(host);
    const onResize = () => {
      W = host.clientWidth; H = host.clientHeight;
      renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); placeCam(); placeWalls();
    };
    window.addEventListener('resize', onResize);

    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (!visible) return;
      if (!pointerIn) pusher.velocity.set(0, 0, 0);
      world.step(1 / 60, dt, 3);
      toys.forEach((t) => {
        // keep runaway toys in the box
        if (t.body.position.y < -3 || Math.abs(t.body.position.x) > 40) { t.body.position.set(0, 9, 0); t.body.velocity.set(0, 0, 0); }
        t.group.position.copy(t.body.position as unknown as THREE.Vector3);
        t.group.quaternion.copy(t.body.quaternion as unknown as THREE.Quaternion);
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      bus.removeEventListener('stomp', onStomp);
      section.removeEventListener('pointermove', onLens);
      section.removeEventListener('pointerleave', offLens);
      renderer.dispose();
      host.innerHTML = '';
    };
  }, []);

  // The PDF opens straight from the link; analytics is fire-and-forget so a sleeping
  // backend (Render free tier takes ~50s to wake) never delays the résumé.
  const logResume = (type: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
    fetch(`${apiUrl}/api/analytics/log-download`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ file_type: `resume_${type}`, source: 'hero_button' }),
    }).catch(() => {});
    setResumeOpen(false);
  };

  return (
    <section className="hero" id="top" data-hero>
      <div ref={mount} className="hero-3d" />
      <div ref={glass} className="hero-glass" aria-hidden="true" />
      <div ref={lens} className="hero-lens" aria-hidden="true"><span>clear view</span></div>
      <div ref={tip} className="toy-tip" />
      <div className="hero-copy">
        <a href="#contact" className="avail jiggle"><i /> Available for freelance &amp; contract work</a>
        <h1 className="hero-h1" data-perch>
          <span className="line">I build backends</span>
          <span className="line">that <em>don’t break.</em></span>
        </h1>
        <p className="hero-sub">Hi, I’m <b>Vishwajit VM</b> — a backend &amp; AI engineer in New Delhi. 5+ years of APIs, databases, queues and AI agents that keep working when things go wrong.</p>
        <div className="hero-btns">
          <a className="btn btn-ink pop" href="#work">See my work ↓</a>
          <div className="dd">
            <button className="btn btn-paper pop" onClick={() => setResumeOpen(!resumeOpen)}>Résumé ▾</button>
            {resumeOpen && (
              <div className="dd-menu">
                <small>Pick the one that fits the role · PDF</small>
                {RESUMES.map((r) => (
                  <a key={r.id} href={`/assets/resume-${r.id}.pdf`} target="_blank" rel="noopener" onClick={() => logResume(r.id)}>
                    <span>{r.icon}</span>{r.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-orange pop" data-flood onClick={() => send('open-chat')}>✨ Ask my AI</button>
        </div>
      </div>
      <div className="hero-hint">
        <span>↙ Go on — push, grab &amp; throw the blocks</span>
        <button onClick={() => tidyRef.current()}>🧹 Tidy up</button>
      </div>
    </section>
  );
}
