import React, { useEffect, useState } from 'react';

import { apiGet } from '../lib/api';
import { DashboardSummary } from '../lib/types';

const emptySummary: DashboardSummary = {
  totalStudents: 0,
  totalRooms: 0,
  totalCourses: 0,
  totalSchedules: 0,
  capacityViolations: 0,
  scheduleConflicts: 0,
  topRecommendations: [],
};

function MetricCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow">
      <p className="text-sm text-slate-400">{label}</p>
      <div className={`mt-3 text-4xl font-bold ${tone}`}>{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{hint}</p>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Overview</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiGet<DashboardSummary>('/api/dashboard/summary');
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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

  const healthScore = Math.max(0, 100 - summary.capacityViolations * 18 - summary.scheduleConflicts * 22);
  const actionableRecommendations = summary.topRecommendations.filter((item) => item.score > 0);

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 p-6 shadow-glow sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Operational pulse</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white">
              See where the campus schedule is under pressure and which room to move it to.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This dashboard surfaces the real bottlenecks: overbooked rooms, overlapping schedules, and the best
              fixes ranked by fit, capacity, and building preference.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                ['Conflicts', summary.scheduleConflicts],
                ['Capacity violations', summary.capacityViolations],
                ['Top recommendations', actionableRecommendations.length],
              ].map(([label, count]) => (
                <div key={label as string} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  <span className="font-semibold text-white">{count}</span> {label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Operational health</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-5xl font-bold text-white">{healthScore}</div>
                <div className="mt-1 text-sm text-slate-300">out of 100</div>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                Demo-ready
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Capacity pressure</span>
                  <span>{summary.capacityViolations}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(100, summary.capacityViolations * 28)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Schedule overlap</span>
                  <span>{summary.scheduleConflicts}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-rose-400" style={{ width: `${Math.min(100, summary.scheduleConflicts * 40)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total rooms" value={summary.totalRooms} tone="text-emerald-300" hint="Available spaces in the seed dataset." />
        <MetricCard label="Total courses" value={summary.totalCourses} tone="text-amber-300" hint="Courses competing for room capacity." />
        <MetricCard label="Total students" value={summary.totalStudents} tone="text-cyan-300" hint="The campus population shown in the demo." />
        <MetricCard label="Total schedules" value={summary.totalSchedules} tone="text-rose-300" hint="Schedule rows driving the operational story." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
          <SectionHeader
            title="Issues that matter"
            description="The seeded dataset deliberately contains problems so the video has something concrete to show."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
              <p className="text-sm text-amber-100">Capacity violations</p>
              <div className="mt-3 text-4xl font-bold text-amber-100">{summary.capacityViolations}</div>
              <p className="mt-2 text-sm leading-6 text-amber-50/80">
                Courses assigned to rooms that are too small.
              </p>
            </div>
            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5">
              <p className="text-sm text-rose-100">Schedule conflicts</p>
              <div className="mt-3 text-4xl font-bold text-rose-100">{summary.scheduleConflicts}</div>
              <p className="mt-2 text-sm leading-6 text-rose-50/80">
                Same room, same day, overlapping time window.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
          <SectionHeader
            title="Top recommendations"
            description="These are the best fixes to highlight in the demo."
          />

          <div className="mt-6 space-y-3">
            {actionableRecommendations.length ? (
              actionableRecommendations.map((item) => (
                <div key={item.scheduleId} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.courseCode} - {item.courseName}</p>
                      <p className="mt-1 text-sm text-slate-300">{item.problem}</p>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Score {item.score}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Current</span>
                      <span className="text-slate-100">{item.currentRoom}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Move to</span>
                      <span className="text-emerald-200">{item.recommendedRoom}</span>
                    </div>
                    <div className="text-slate-400">{item.reason}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No actionable recommendations were found.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
