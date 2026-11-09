// Shatter & self-heal effect for page elements, shared by the Chaos Monkey and the Pink Snake.
// The element hides (.crashed), 3D shards fly out in the pet's scene, then fly home and it reappears.
import * as THREE from 'three';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Shard = { mesh: THREE.Mesh; v: THREE.Vector3; w: THREE.Vector3; home: THREE.Vector3; homeQ: THREE.Quaternion; from?: THREE.Vector3; fromQ?: THREE.Quaternion };
export type ShardGroup = { list: Shard[]; el: HTMLElement; mode: 'fly' | 'heal'; t: number };

export function createShards(scene: THREE.Scene, viewportH: () => number) {
  const groups: ShardGroup[] = [];

  /** Break `el` into shards flying away from (sx, sy). */
  const shatter = (el: HTMLElement, sx: number, sy: number): ShardGroup => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const base = new THREE.Color(cs.backgroundColor && !cs.backgroundColor.includes('0, 0, 0, 0') ? cs.backgroundColor.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, 'rgb($1,$2,$3)') : '#FFFDF8');
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
      const tint = base.clone().lerp(new THREE.Color(pick(['#FF5B1F', '#B9A6FF', '#9FE8C8', '#FFE07A', '#9FD0FF', '#FF8FB1'])), 0.35);
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
    const group: ShardGroup = { list, el, mode: 'fly', t: 0 };
    groups.push(group);
    return group;
  };

  /** Fly the shards home; the element reappears when they land. */
  const heal = (g: ShardGroup) => {
    g.mode = 'heal'; g.t = 0;
    g.list.forEach((s) => { s.from = s.mesh.position.clone(); s.fromQ = s.mesh.quaternion.clone(); });
  };

  const update = (dt: number) => {
    const H = viewportH();
    for (let gi = groups.length - 1; gi >= 0; gi--) {
      const g = groups[gi]; g.t += dt;
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
          groups.splice(gi, 1);
        }
      }
    }
  };

  return { shatter, heal, update };
}
