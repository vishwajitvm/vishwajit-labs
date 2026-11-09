'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { bus, log, request } from '@/lib/chaos';

type Shape = 'box' | 'cyl' | 'oct' | 'ico' | 'sphere' | 'torus' | 'dodeca';
interface NodeDef { id: string; label: string; tech: string; pos: [number, number, number]; color: string; shape: Shape; info: string }

const NODES: NodeDef[] = [
  { id: 'client', label: 'Client', tech: 'Browser · mobile', pos: [-9, 0.4, 0], color: '#94A3B8', shape: 'sphere', info: 'Where every request starts — maybe it is you, right now.' },
  { id: 'gateway', label: 'API Gateway', tech: 'Traefik · rate limiting', pos: [-5.6, 0, 0], color: '#22D3EE', shape: 'oct', info: 'Routes traffic, terminates TLS and rate-limits abusive clients (yes, including the monkey).' },
  { id: 'auth', label: 'Auth', tech: 'OIDC · Entra ID · JWT', pos: [-3, 2.9, -1.2], color: '#F472B6', shape: 'dodeca', info: 'Checks who you are and what you are allowed to do — RBAC with roles and permissions.' },
  { id: 'api', label: 'API Service', tech: 'FastAPI · NestJS', pos: [-1.1, 0, 0], color: '#818CF8', shape: 'box', info: 'The business logic. On FLO alone that is 244 REST operations across 34 modules.' },
  { id: 'cache', label: 'Cache', tech: 'Redis', pos: [2, 2.7, 0.6], color: '#F87171', shape: 'cyl', info: 'Hot data in microseconds, plus distributed locks and rate-limit counters.' },
  { id: 'db', label: 'Database', tech: 'PostgreSQL · RLS', pos: [2.7, 0.15, -0.6], color: '#60A5FA', shape: 'cyl', info: 'The source of truth. Row-level security keeps every tenant’s data apart.' },
  { id: 'queue', label: 'Queue', tech: 'Celery · Redis', pos: [1.4, -2.7, 0.4], color: '#FBBF24', shape: 'torus', info: 'Slow work goes async, so the API answers in milliseconds.' },
  { id: 'worker', label: 'AI Workers', tech: 'LangGraph · agents', pos: [5.4, -2.5, -0.2], color: '#A78BFA', shape: 'ico', info: 'Agents that review code, answer questions from documents and automate workflows.' },
  { id: 'vector', label: 'Vector DB', tech: 'Qdrant · pgvector', pos: [8.5, -0.5, -1], color: '#34D399', shape: 'dodeca', info: 'Semantic search, so AI answers come with real sources (RAG).' },
  { id: 'llm', label: 'LLM Router', tech: '90 models · fallbacks', pos: [8.7, -3.5, 0.8], color: '#E879F9', shape: 'oct', info: 'Picks the best available model and falls back automatically when one fails.' },
];
const EDGES: [string, string][] = [['client', 'gateway'], ['gateway', 'auth'], ['gateway', 'api'], ['api', 'cache'], ['api', 'db'], ['api', 'queue'],
  ['queue', 'worker'], ['worker', 'vector'], ['worker', 'llm'], ['worker', 'db']];
type Span = { from: string; to: string; label: string; ms: number; async?: boolean };
const TRACE: Span[] = [
  { from: 'client', to: 'gateway', label: 'HTTPS GET /projects', ms: 2 },
  { from: 'gateway', to: 'auth', label: 'verify JWT', ms: 4 },
  { from: 'auth', to: 'gateway', label: 'authorised ✓', ms: 1 },
  { from: 'gateway', to: 'api', label: 'route to API', ms: 1 },
  { from: 'api', to: 'cache', label: 'cache lookup', ms: 1 },
  { from: 'cache', to: 'api', label: 'miss', ms: 1 },
  { from: 'api', to: 'db', label: 'SELECT … (row-level security)', ms: 8 },
  { from: 'db', to: 'api', label: '12 rows', ms: 1 },
  { from: 'api', to: 'queue', label: 'enqueue AI summary', ms: 1 },
  { from: 'api', to: 'gateway', label: '200 OK', ms: 1 },
  { from: 'gateway', to: 'client', label: 'response sent', ms: 2 },
  { from: 'queue', to: 'worker', label: 'job picked up', ms: 3, async: true },
  { from: 'worker', to: 'vector', label: 'semantic search', ms: 18, async: true },
  { from: 'worker', to: 'llm', label: 'generate summary', ms: 96, async: true },
  { from: 'llm', to: 'worker', label: 'tokens streamed', ms: 12, async: true },
  { from: 'worker', to: 'db', label: 'save result', ms: 6, async: true },
];

function geometryFor(shape: Shape): THREE.BufferGeometry {
  switch (shape) {
    case 'box': return new THREE.BoxGeometry(1.15, 1.15, 1.15);
    case 'cyl': return new THREE.CylinderGeometry(0.6, 0.6, 1.1, 32);
    case 'oct': return new THREE.OctahedronGeometry(0.75);
    case 'ico': return new THREE.IcosahedronGeometry(0.75);
    case 'torus': return new THREE.TorusGeometry(0.55, 0.2, 16, 48);
    case 'dodeca': return new THREE.DodecahedronGeometry(0.7);
    default: return new THREE.SphereGeometry(0.62, 32, 32);
  }
}

interface Props { onTerminal: () => void }

export default function HeroSystem({ onTerminal }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{ fire: () => void; flood: () => void } | null>(null);
  const [selected, setSelected] = useState<NodeDef | null>(null);
  const [trace, setTrace] = useState<{ step: number; running: boolean } | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [rps, setRps] = useState(128);

  useEffect(() => {
    const id = setInterval(() => setRps(110 + Math.round(Math.random() * 60)), 1200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const host = mount.current!;
    let W = host.clientWidth, H = host.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor('#05060b');
    host.appendChild(renderer.domElement);
    const labels = new CSS2DRenderer();
    labels.setSize(W, H);
    Object.assign(labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
    host.appendChild(labels.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#05060b', 22, 46);
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
    const setCam = () => { const a = W / H; camera.position.set(0, 2.4, a < 1 ? 30 : a < 1.4 ? 24 : 19.5); };
    setCam();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.35;
    controls.minPolarAngle = Math.PI * 0.28; controls.maxPolarAngle = Math.PI * 0.62;

    scene.add(new THREE.AmbientLight('#8ea0ff', 0.55));
    const key = new THREE.PointLight('#ffffff', 60, 60); key.position.set(4, 8, 10); scene.add(key);
    const rim = new THREE.PointLight('#a78bfa', 40, 60); rim.position.set(-10, -4, -6); scene.add(rim);

    const system = new THREE.Group();
    scene.add(system);
    const placeSystem = () => { system.position.x = W > 1024 ? 2.6 : 0; system.position.y = W > 1024 ? 0 : -1.4; system.scale.setScalar(W < 640 ? 0.75 : 1); };
    placeSystem();

    // stars + floor grid
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(900 * 3);
    for (let i = 0; i < sp.length; i++) sp[i] = (Math.random() - 0.5) * 70;
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#64748b', size: 0.06 }));
    scene.add(stars);
    const grid = new THREE.GridHelper(60, 60, '#1e293b', '#0f172a');
    grid.position.y = -5.2; scene.add(grid);

    // nodes
    const meshes = new Map<string, { mesh: THREE.Mesh; halo: THREE.Mesh; def: NodeDef; pulse: number; label: HTMLDivElement }>();
    for (const n of NODES) {
      const geo = geometryFor(n.shape);
      const mat = new THREE.MeshStandardMaterial({ color: n.color, emissive: n.color, emissiveIntensity: 0.45, roughness: 0.25, metalness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...n.pos);
      mesh.userData.id = n.id;
      const halo = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: n.color, wireframe: true, transparent: true, opacity: 0.18 }));
      halo.scale.setScalar(1.45);
      mesh.add(halo);
      system.add(mesh);
      const div = document.createElement('div');
      div.className = 'sys-label';
      div.innerHTML = `<b>${n.label}</b><span>${n.tech}</span>`;
      const obj = new CSS2DObject(div);
      obj.position.set(0, -1.15, 0);
      mesh.add(obj);
      meshes.set(n.id, { mesh, halo, def: n, pulse: 0, label: div });
    }

    // edges
    const curves = new Map<string, THREE.Curve<THREE.Vector3>>();
    for (const [a, b] of EDGES) {
      const pa = new THREE.Vector3(...meshes.get(a)!.def.pos), pb = new THREE.Vector3(...meshes.get(b)!.def.pos);
      const mid = pa.clone().add(pb).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.7, 0.3));
      const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
      curves.set(`${a}>${b}`, curve);
      curves.set(`${b}>${a}`, new THREE.QuadraticBezierCurve3(pb, mid, pa));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.028, 8), new THREE.MeshBasicMaterial({ color: '#334155', transparent: true, opacity: 0.75 }));
      system.add(tube);
    }

    // packets
    type Packet = { mesh: THREE.Mesh; curve: THREE.Curve<THREE.Vector3>; t: number; speed: number; onDone?: () => void };
    const packets: Packet[] = [];
    const pGeo = new THREE.SphereGeometry(0.075, 12, 12);
    const spawn = (from: string, to: string, color: string, speed = 0.9, size = 1, onDone?: () => void) => {
      const curve = curves.get(`${from}>${to}`);
      if (!curve) { onDone?.(); return; }
      const mesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color }));
      mesh.scale.setScalar(size);
      system.add(mesh);
      packets.push({ mesh, curve, t: 0, speed, onDone });
    };
    let trafficT = 0;

    // request trace
    let tracing = false;
    const fire = () => {
      if (tracing) return;
      tracing = true;
      request('GET', '/projects');
      setTrace({ step: 0, running: true });
      let i = 0;
      const next = () => {
        if (i >= TRACE.length) { tracing = false; setTrace({ step: TRACE.length, running: false }); log('OK', 'trace 7f3a9c complete · 200 OK in 23ms · async job done in 158ms'); return; }
        const s = TRACE[i];
        const target = meshes.get(s.to);
        spawn(s.from, s.to, '#fef08a', Math.max(0.9, 2.2 - s.ms / 60), 2.4, () => {
          if (target) target.pulse = 1;
          i += 1; setTrace({ step: i, running: true }); next();
        });
      };
      next();
    };
    const flood = () => {
      const gw = meshes.get('gateway');
      for (let k = 0; k < 36; k++) setTimeout(() => spawn('client', 'gateway', '#ef4444', 2.6, 1.3, () => { if (gw) gw.pulse = 1; }), k * 45);
      if (gw) { gw.label.classList.add('limited'); setTimeout(() => gw.label.classList.remove('limited'), 3600); }
    };
    api.current = { fire, flood };
    const onFlood = () => flood();
    const onSend = () => fire();
    bus.addEventListener('flood', onFlood);
    bus.addEventListener('send-request', onSend);

    // picking
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let hovered: string | null = null;
    const pick = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects([...meshes.values()].map((m) => m.mesh), false)[0];
      return hit ? (hit.object.userData.id as string) : null;
    };
    const onMove = (e: PointerEvent) => {
      const id = pick(e);
      if (id !== hovered) {
        if (hovered) meshes.get(hovered)!.label.classList.remove('hot');
        hovered = id;
        if (id) meshes.get(id)!.label.classList.add('hot');
        renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
      }
    };
    let downAt = 0;
    const onDown = () => { downAt = performance.now(); };
    const onUp = (e: PointerEvent) => {
      if (performance.now() - downAt > 250) return;
      const id = pick(e);
      if (id) { const m = meshes.get(id)!; m.pulse = 1; setSelected(m.def); request('GET', `/system/${id}`); }
      else setSelected(null);
    };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.style.cursor = 'grab';

    // bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.85, 0.55, 0.12);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(host);

    const onResize = () => {
      W = host.clientWidth; H = host.clientHeight;
      renderer.setSize(W, H); labels.setSize(W, H); composer.setSize(W, H);
      camera.aspect = W / H; camera.updateProjectionMatrix(); setCam(); placeSystem();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      const t = clock.elapsedTime;
      controls.update();
      stars.rotation.y = t * 0.01;
      trafficT += dt;
      if (trafficT > 0.12) {
        trafficT = 0;
        const [a, b] = EDGES[Math.floor(Math.random() * EDGES.length)];
        const fwd = Math.random() < 0.7;
        spawn(fwd ? a : b, fwd ? b : a, meshes.get(fwd ? b : a)!.def.color, 0.5 + Math.random() * 0.6);
      }
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k];
        p.t += dt * p.speed;
        if (p.t >= 1) {
          system.remove(p.mesh); (p.mesh.material as THREE.Material).dispose();
          packets.splice(k, 1); p.onDone?.(); continue;
        }
        p.mesh.position.copy(p.curve.getPoint(p.t));
      }
      for (const m of meshes.values()) {
        m.mesh.rotation.y += dt * 0.4; m.halo.rotation.x += dt * 0.3;
        m.pulse = Math.max(0, m.pulse - dt * 2.2);
        const s = 1 + m.pulse * 0.45 + (m.def.id === hovered ? 0.15 : 0);
        m.mesh.scale.setScalar(s);
        (m.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.45 + m.pulse * 1.6;
      }
      composer.render();
      labels.render(scene, camera);
    };
    loop();
    log('INFO', 'system: 10 services up · traffic flowing');

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      bus.removeEventListener('flood', onFlood);
      bus.removeEventListener('send-request', onSend);
      controls.dispose(); composer.dispose(); renderer.dispose();
      host.innerHTML = '';
    };
  }, []);

  const downloadResume = async (type: 'ai' | 'fullstack') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
      await fetch(`${apiUrl}/api/analytics/log-download`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_type: `resume_${type}`, source: 'hero_button' }),
      });
    } catch { /* download anyway */ }
    request('GET', `/assets/resume-${type}.pdf`);
    window.open(`/assets/resume-${type}.pdf`, '_blank');
    setResumeOpen(false);
  };

  const syncMs = TRACE.filter((s) => !s.async).reduce((a, s) => a + s.ms, 0);
  let offset = 0;
  const rows = TRACE.map((s) => { const r = { ...s, start: s.async ? offset : offset }; offset += s.ms; return r; });
  const total = offset;

  return (
    <section className="hero-lab" id="top">
      <div ref={mount} className="hero-canvas" />
      <div className="hero-copy">
        <span className="status-pill" data-perch><i /> All systems operational · {rps} req/s · p99 42ms</span>
        <h1 className="hero-name" data-perch>
          {'Vishwajit VM'.split('').map((c, i) => <span key={i}>{c === ' ' ? ' ' : c}</span>)}
        </h1>
        <p className="hero-role">Backend &amp; AI Engineer</p>
        <p className="hero-lead">I build the systems behind the screen — APIs, databases, queues and AI agents — and I make sure they <b>stay up when things break</b>. Even when a monkey breaks them on purpose.</p>
        <div className="hero-cta">
          <button className="btn-primary jelly" data-flood onClick={() => api.current?.fire()}>▶ Send a request</button>
          <div className="resume">
            <button className="btn-ghost jelly" onClick={() => setResumeOpen(!resumeOpen)}>Résumé ▾</button>
            {resumeOpen && (
              <div className="resume-menu">
                <button onClick={() => downloadResume('ai')}>AI / Backend résumé</button>
                <button onClick={() => downloadResume('fullstack')}>Full-stack résumé</button>
              </div>
            )}
          </div>
          <button className="btn-ghost jelly" onClick={onTerminal}>&gt;_ Terminal</button>
        </div>
        <p className="hero-hint">🖱️ Drag the system to rotate it · click any service · press “Send a request” to trace it</p>
      </div>

      {selected && (
        <div className="node-card" style={{ ['--c' as string]: selected.color }}>
          <button className="x" onClick={() => setSelected(null)}>×</button>
          <small>{selected.tech}</small>
          <b>{selected.label}</b>
          <p>{selected.info}</p>
        </div>
      )}

      {trace && (
        <div className="trace">
          <div className="trace-head"><b>Trace 7f3a9c</b><span>{trace.running ? 'tracing…' : `200 OK · ${syncMs}ms · async ${total}ms`}</span><button onClick={() => setTrace(null)}>×</button></div>
          {rows.map((r, i) => (
            <div key={i} className={`span ${i < trace.step ? 'done' : ''} ${r.async ? 'async' : ''}`}>
              <span className="lbl">{r.label}</span>
              <span className="bar"><i style={{ left: `${(r.start / total) * 100}%`, width: `${Math.max(1.5, (r.ms / total) * 100)}%` }} /></span>
              <span className="ms">{r.ms}ms</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
