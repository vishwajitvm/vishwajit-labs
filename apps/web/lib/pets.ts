// Shared state between the two pets (Chaos Monkey 🐒 and Pink Snake 🐍): where each one is,
// whether the monkey is being hugged, the cartoon fight cloud, and the 3D "injury kit".
//
// Bus events (see lib/chaos.ts `bus`):
//   pet:flee   {x}          snake → monkey: run away from x
//   pet:hold                snake → monkey: you're wrapped, stay put while pets.monkey.held
//   pet:brawl  {x, y, ms}   either → both: fight inside the cloud at (x, y) for ms
//   pet:fight-now           panel → snake: go pick a fight with the monkey
import * as THREE from 'three';
import { log, send } from '@/lib/chaos';

export const pets = {
  monkey: { x: -999, y: -999, visible: true, mode: 'air', hurt: 0, held: false },
  snake: { x: -999, y: -999, visible: true, hurt: 0 },
};

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

let brawling = false;
export const isBrawling = () => brawling;

/** Cartoon fight cloud at (x, y). Both pets get 'pet:brawl' and play their side of it. */
export function startBrawl(x: number, y: number, ms = 2600) {
  if (brawling) return;
  brawling = true;
  const c = document.createElement('div');
  c.className = 'pet-brawl';
  c.style.left = `${x}px`; c.style.top = `${y}px`;
  const puffs: [number, number, number][] = [[-58, -6, 74], [-22, -38, 84], [28, -30, 78], [60, 4, 70], [16, 26, 84], [-34, 24, 74], [0, -4, 96]];
  const EMO = ['💥', '⭐', '💢', '💫', '✨', '🥊', '🐒', '🐍', '🍌', '🦴'];
  c.innerHTML =
    puffs.map(([px, py, s], i) => `<b style="left:${px - s / 2}px;top:${py - s / 2}px;width:${s}px;height:${s}px;animation-delay:${(-i * 0.11).toFixed(2)}s"></b>`).join('') +
    Array.from({ length: 12 }, (_, i) => `<i style="--dx:${Math.round(rand(-150, 150))}px;--dy:${Math.round(rand(-130, 90))}px;animation-delay:${(i * 0.09).toFixed(2)}s">${pick(EMO)}</i>`).join('');
  document.body.appendChild(c);
  log('ERROR', 'incident: chaos-monkey vs pink-snake — fight in progress 🥊');
  send('pet:brawl', { x, y, ms });
  setTimeout(() => {
    c.classList.add('poof');
    log('WARN', 'on-call: both pets injured — applying bandages 🩹');
    setTimeout(() => { c.remove(); brawling = false; }, 450);
  }, ms);
}

/** A crossed band-aid. `s` scales it to the pet's head. */
export function makeBandage(s = 1) {
  const g = new THREE.Group();
  const tape = new THREE.MeshStandardMaterial({ color: '#f3d3a6', roughness: 0.85 });
  const pad = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 });
  const a = new THREE.Mesh(new THREE.BoxGeometry(20 * s, 6.5 * s, 2 * s), tape); a.rotation.z = 0.7;
  const b = a.clone(); b.rotation.z = -0.7;
  const c = new THREE.Mesh(new THREE.BoxGeometry(6 * s, 6 * s, 2.8 * s), pad); c.rotation.z = Math.PI / 4;
  g.add(a, b, c);
  return g;
}

/** Dizzy stars that circle a head (spin the returned group around y). */
export function makeStars(n = 3, size = 5) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? size * 0.45 : size;
    if (i) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r); else shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: size * 0.4, bevelEnabled: false });
  const mat = new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffb800', emissiveIntensity: 0.35, roughness: 0.4 });
  const ring = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, mat);
    const a = (i / n) * Math.PI * 2;
    m.position.set(Math.cos(a) * size * 3.4, 0, Math.sin(a) * size * 3.4);
    ring.add(m);
  }
  const g = new THREE.Group(); g.rotation.x = 0.35; g.add(ring);
  g.userData.ring = ring;
  return g;
}
