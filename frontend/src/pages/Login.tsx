import React, { useState } from 'react';

import { login, saveToken } from '../lib/api';

type LoginProps = {
  onSuccess: () => void;
};

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('admin@campus.ai');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      saveToken(response.accessToken);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/75 shadow-glow backdrop-blur lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400/20 via-slate-900 to-amber-400/10 p-8 sm:p-10">
          <div className="absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-30" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Campus Operations Intelligence</p>
            <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              One screen for rooms, schedules, and the decisions that need fixing.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200/90">
              This demo surfaces capacity violations, schedule conflicts, and room recommendations in a way that feels
              like an operations control room instead of a spreadsheet.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['10', 'Rooms'],
                ['8', 'Courses'],
                ['20', 'Schedules'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 p-8 sm:p-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Demo login</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Sign in to the dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use the seeded admin account to unlock the operational view.
            </p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/60"
                  placeholder="admin@campus.ai"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/60"
                  placeholder="Admin123!"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Enter dashboard'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <p className="font-semibold text-amber-50">Seeded credentials</p>
              <p className="mt-1">admin@campus.ai / Admin123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
