'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, MessageSquare, Download, Users, Bot, Key, LogOut } from 'lucide-react';

interface StatsResponse {
  database?: boolean;
  visitors_count: number;
  downloads_count: number;
  messages_count: number;
  chat_logs_count: number;
  recent_messages: Array<{
    name: string;
    email: string;
    message: string;
    created_at: string;
  }>;
  recent_visits: Array<{
    url: string;
    visited_at: string;
    ip_address: string;
  }>;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vishwajit-labs-backend.onrender.com';
const TOKEN_KEY = 'admin-token';
// The token lives only in this tab (sessionStorage) and is checked by the backend on every request.
const readToken = () => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
const writeToken = (t: string) => { try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } };

class AuthError extends Error {}

async function verify(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/auth/verify`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return res.ok;
  } catch { return false; }
}

/** Email + password → a session token (12 hours), or an error message to show. */
async function signIn(email: string, password: string): Promise<{ token?: string; error?: string }> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  } catch {
    return { error: 'Can’t reach the backend. It may be waking up (free hosting), so try again in a minute.' };
  }
  if (res.ok) return { token: (await res.json()).token };
  if (res.status === 401) return { error: 'Wrong email or password.' };
  if (res.status === 429) return { error: 'Too many attempts. Wait 15 minutes and try again.' };
  if (res.status === 503) {
    const detail = await res.json().then((j) => j.detail as string).catch(() => '');
    return { error: detail.includes('ADMIN_PASSWORD') ? 'No admin account yet: add ADMIN_PASSWORD on Render (Environment), wait for the redeploy, then sign in.' : 'The database isn’t connected right now.' };
  }
  return { error: `Sign-in failed (HTTP ${res.status}). Try again in a minute.` };
}

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [loginError, setLoginError] = useState('');
  const isLoggedIn = !!token;

  // Restore a token from this tab's session, if it's still valid.
  useEffect(() => {
    const saved = readToken();
    if (!saved) return;
    verify(saved).then((ok) => { if (ok) setToken(saved); else writeToken(''); });
  }, []);

  const logout = () => {
    const t = readToken();
    if (t) fetch(`${API}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    writeToken(''); setToken(''); setPassword('');
  };

  const { data, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ['adminStats', token],
    queryFn: async () => {
      const res = await fetch(`${API}/api/analytics/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 503) throw new AuthError('signed out');
      if (!res.ok) throw new Error('API offline');
      return res.json();
    },
    enabled: isLoggedIn,
    retry: (n, e) => !(e instanceof AuthError) && n < 2,
  });
  useEffect(() => { if (error instanceof AuthError) logout(); }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true); setLoginError('');
    const r = await signIn(email.trim(), password);
    setChecking(false);
    if (r.token) { writeToken(r.token); setToken(r.token); setPassword(''); }
    else setLoginError(r.error || 'Sign-in failed.');
  };

  // 1. Render Login Screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-mono p-6">
        <form 
          onSubmit={handleLogin}
          className="w-full max-w-sm border border-white/5 bg-white/2 p-8 rounded-2xl flex flex-col gap-5"
        >
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400">
              <Key className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-white text-sm font-bold uppercase tracking-wider">Kernel Authentication</h1>
            <span className="text-[9px] text-zinc-500">ADMINISTRATIVE ACCESS ONLY</span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-email-input" className="text-[9px] text-zinc-400 uppercase">Email</label>
            <input
              id="admin-email-input"
              type="email"
              required
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password-input" className="text-[9px] text-zinc-400 uppercase">Password</label>
            <input
              id="admin-password-input"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-950 border border-white/10 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500/30 font-mono"
            />
          </div>

          {loginError && (
            <span className="text-red-500 text-[9px] block text-center font-bold">{loginError}</span>
          )}

          <button
            type="submit"
            disabled={checking}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-[#030303] text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{checking ? 'CHECKING…' : 'SIGN_IN'}</span>
          </button>
        </form>
      </div>
    );
  }

  // 2. Render Main Admin Dashboard
  return (
    <div className="min-h-screen bg-[#030303] py-20 px-6 sm:px-12 font-mono">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-2xl font-sans font-bold text-white tracking-tight">System Admin Console</h1>
            <span className="text-[9px] text-blue-400 tracking-wider">
              {isLoading ? 'loading…' : error ? 'backend unreachable, retrying…' : data?.database === false ? 'database not connected' : 'telemetry database is live'}
            </span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 border border-white/5 bg-white/2 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Visitors</span>
              <h3 className="text-white text-lg font-bold mt-1">{data?.visitors_count}</h3>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/2 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-purple-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Resumes</span>
              <h3 className="text-white text-lg font-bold mt-1">{data?.downloads_count}</h3>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/2 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Contacts</span>
              <h3 className="text-white text-lg font-bold mt-1">{data?.messages_count}</h3>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/2 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">AI Chats</span>
              <h3 className="text-white text-lg font-bold mt-1">{data?.chat_logs_count}</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Messages */}
          <div className="p-8 border border-white/5 bg-white/2 rounded-2xl">
            <h2 className="text-white text-xs font-bold uppercase tracking-wider mb-6 border-b border-white/5 pb-3">Contact Messages</h2>
            <div className="flex flex-col gap-4">
              {data?.recent_messages.map((msg, idx) => (
                <div key={idx} className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-[10px] leading-relaxed">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">{msg.name} ({msg.email})</span>
                    <span className="text-zinc-500 text-[8px]">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-400 font-mono mt-2">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visitor History */}
          <div className="p-8 border border-white/5 bg-white/2 rounded-2xl">
            <h2 className="text-white text-xs font-bold uppercase tracking-wider mb-6 border-b border-white/5 pb-3">Visitor Logs</h2>
            <div className="flex flex-col gap-3 font-mono text-[9px] text-zinc-400">
              {data?.recent_visits.map((visit, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded border border-white/5 bg-zinc-950/40">
                  <span>{visit.url}</span>
                  <span className="text-zinc-600">IP: {visit.ip_address} | {new Date(visit.visited_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
