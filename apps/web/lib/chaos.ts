// Shared "production" state for the portfolio: live logs, metrics, service health
// and a small command bus used by the Chaos Monkey, the 3D system hero and the log panel.

export type Level = 'INFO' | 'WARN' | 'ERROR' | 'OK' | 'CHAOS';
export interface LogLine { id: number; t: string; level: Level; msg: string }

type Listener = () => void;
const listeners = new Set<Listener>();
let lines: LogLine[] = [];
let seq = 0;

export const metrics = {
  started: Date.now(),
  requests: 0,
  errors: 0,
  recoveries: 0,
  chaos: true,
  monkeyVisible: true,
};

function emit() { listeners.forEach((l) => l()); }

export function log(level: Level, msg: string) {
  const d = new Date();
  lines = [...lines.slice(-60), { id: ++seq, t: d.toTimeString().slice(0, 8), level, msg }];
  if (level === 'ERROR') metrics.errors += 1;
  if (level === 'OK') metrics.recoveries += 1;
  emit();
}

export function request(method: string, path: string, status = 200) {
  metrics.requests += 1;
  const ms = status >= 400 ? 1 + Math.round(Math.random() * 3) : 3 + Math.round(Math.random() * 28);
  log(status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO', `${method} ${path} ${status} ${ms}ms`);
}

export const getLines = () => lines;
export function subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; }

export function setChaos(on: boolean) {
  metrics.chaos = on;
  log(on ? 'CHAOS' : 'OK', on ? 'chaos-monkey: experiments ENABLED' : 'chaos-monkey: experiments paused — monkey is chilling');
}

export function setMonkeyVisible(on: boolean) { metrics.monkeyVisible = on; emit(); }

/** Health badge inside a [data-svc] element. */
export type Health = 'ok' | 'down' | 'slow' | 'restarting';
const HEALTH_TEXT: Record<Health, string> = { ok: 'healthy', down: 'crashed', slow: 'degraded', restarting: 'restarting…' };
export function setHealth(svc: Element | null, h: Health) {
  if (!svc) return;
  svc.setAttribute('data-health-state', h);
  const badge = svc.querySelector('[data-health]');
  if (badge) badge.textContent = HEALTH_TEXT[h];
}

/** Command bus: 'feed', 'chaos-now', 'send-request', 'flood' */
export const bus: EventTarget = typeof window !== 'undefined' ? new EventTarget() : ({} as EventTarget);
export function send(type: string, detail?: unknown) {
  if (typeof window === 'undefined') return;
  bus.dispatchEvent(new CustomEvent(type, { detail }));
}
