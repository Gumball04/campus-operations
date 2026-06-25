import React, { useEffect, useMemo, useState } from 'react';

import { apiGet } from '../lib/api';
import { DashboardRecommendation } from '../lib/types';

export default function Recommendations() {
  const [items, setItems] = useState<DashboardRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await apiGet<DashboardRecommendation[]>('/api/recommendations');
        if (!cancelled) {
          setItems(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load recommendations');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const actionable = useMemo(
    () => items.filter((item) => item.score > 0).sort((a, b) => b.score - a.score),
    [items],
  );

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">Loading recommendations…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Recommendation engine</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Problem → fix → reason</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          These are the actionable moves the platform suggests after weighing capacity, availability, and building preference.
        </p>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-glow">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Actionable recommendations</h3>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
            {actionable.length} items
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium">Problem</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Current room</th>
                <th className="px-6 py-4 font-medium">Fix</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {actionable.map((item) => (
                <tr key={item.scheduleId} className="border-t border-white/5">
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100">
                      {item.problem}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{item.courseCode}</div>
                    <div className="text-slate-400">{item.courseName}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.studentCount} students</div>
                  </td>
                  <td className="px-6 py-4 text-slate-200">{item.currentRoom}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-emerald-200">{item.recommendedRoom}</div>
                    <div className="text-slate-400">{item.capacity} seats</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.reason}</td>
                  <td className="px-6 py-4">
                    <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {item.score}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
