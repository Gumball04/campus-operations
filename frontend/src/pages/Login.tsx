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
    <div className="app-shell flex min-h-screen items-center px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden panel lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border-b border-slate-700 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <p className="section-title text-amber-400">University Operations Portal</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white">
            Campus Operations Intelligence Platform
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Internal planning teams use this command center to detect room conflicts, expose capacity pressure, and
            identify the best room move before the schedule causes a disruption.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['10', 'Rooms'],
              ['8', 'Courses'],
              ['20', 'Schedules'],
            ].map(([value, label]) => (
              <div key={label} className="panel-soft rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 panel-soft rounded-xl p-5">
            <p className="text-sm font-semibold text-white">What this demo proves</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
              <li>• A room can be over capacity.</li>
              <li>• Two classes can collide in the same room.</li>
              <li>• The system recommends a better room immediately.</li>
            </ul>
          </div>
        </section>

        <section className="bg-slate-950 p-8 lg:p-10">
          <div className="panel rounded-2xl p-6">
            <p className="section-title text-slate-400">Sign in</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Access the operations dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Use the seeded admin account to load the demo dataset and view operational alerts.
            </p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input-field"
                  placeholder="admin@campus.ai"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-field"
                  placeholder="Admin123!"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-[color:var(--danger)] bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <button type="submit" disabled={loading} className="button-primary w-full disabled:opacity-70">
                {loading ? 'Signing in...' : 'Enter command center'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-700 pt-4 text-sm text-slate-400">
              Seeded credentials: <span className="font-semibold text-slate-200">admin@campus.ai / Admin123!</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
