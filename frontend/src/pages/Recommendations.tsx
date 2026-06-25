import React, { useEffect, useState } from 'react';

import { apiGet } from '../lib/api';
import { DashboardRecommendation } from '../lib/types';

function impactLabel(item: DashboardRecommendation) {
  const spareSeats = (item.capacity ?? 0) - item.studentCount;
  if (spareSeats >= 20) return `High impact, ${spareSeats} spare seats`;
  if (spareSeats >= 10) return `Moderate impact, ${spareSeats} spare seats`;
  return `Targeted fix, ${Math.max(spareSeats, 0)} spare seats`;
}

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

  const actionable = items.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);

  if (loading) {
    return <div className="panel rounded-xl p-6 text-slate-300">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="panel rounded-xl border-[color:var(--danger)] p-6 text-red-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-2xl p-6">
        <p className="section-title text-amber-400">Decision support</p>
        <h1 className="mt-2 page-title">Problem to action recommendations</h1>
        <p className="mt-3 max-w-3xl page-subtitle">
          Each recommendation is structured for an operational audience: the problem, the action to take, why that
          action is correct, and the impact it will have on the schedule.
        </p>
      </section>

      <section className="space-y-4">
        {actionable.map((item) => {
          const spareSeats = (item.capacity ?? 0) - item.studentCount;
          return (
            <article key={item.scheduleId} className="panel rounded-2xl p-5">
              <div className="flex flex-col gap-3 border-b border-slate-700 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="section-title text-slate-400">Problem</div>
                  <div className="mt-2 text-lg font-bold text-white">{item.problem}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {item.courseCode} · {item.courseName} · {item.currentRoom}
                  </div>
                </div>
                <span className="status-chip success">Score {item.score}</span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="panel-soft rounded-xl p-4">
                  <div className="section-title text-slate-400">Recommended Action</div>
                  <div className="mt-2 text-base font-semibold text-emerald-200">{item.recommendedRoom}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Move the class to a room with {item.capacity} seats.
                  </div>
                </div>

                <div className="panel-soft rounded-xl p-4">
                  <div className="section-title text-slate-400">Reason</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{item.reason}</div>
                </div>

                <div className="panel-soft rounded-xl p-4">
                  <div className="section-title text-slate-400">Impact</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{impactLabel(item)}</div>
                </div>

                <div className="panel-soft rounded-xl p-4">
                  <div className="section-title text-slate-400">Capacity delta</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {spareSeats > 0
                      ? `${spareSeats} open seats after reassignment`
                      : 'Exact fit after reassignment'}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
