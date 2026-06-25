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

function MetricTile({
  label,
  value,
  note,
  tone = 'text-white',
}: {
  label: string;
  value: string | number;
  note: string;
  tone?: string;
}) {
  return (
    <div className="metric-card rounded-xl p-5">
      <div className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</div>
      <div className={`mt-3 text-4xl font-bold ${tone}`}>{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{note}</div>
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

  const utilization = summary.totalRooms
    ? Math.min(100, Math.round((summary.totalSchedules / summary.totalRooms) * 50))
    : 0;
  const utilizationTone = utilization >= 80 ? 'danger' : utilization >= 60 ? 'warning' : 'success';

  if (loading) {
    return <div className="panel rounded-xl p-6 text-slate-300">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="panel rounded-xl border-[color:var(--danger)] p-6 text-red-100">{error}</div>;
  }

  const topRecommendations = summary.topRecommendations.filter((item) => item.score > 0).slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="panel rounded-2xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-title text-amber-400">Command overview</p>
            <h1 className="mt-2 page-title">Operational load across campus scheduling</h1>
            <p className="mt-3 max-w-3xl page-subtitle">
              This control center keeps the story focused on one thing: what is broken, what is overloaded, and what
              the system recommends changing first.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="status-chip danger">Capacity Violations: {summary.capacityViolations}</span>
            <span className="status-chip warning">Schedule Conflicts: {summary.scheduleConflicts}</span>
            <span className={`status-chip ${utilizationTone}`}>Utilization: {utilization}%</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Total Rooms"
          value={summary.totalRooms}
          note="Seeded rooms available for re-assignment."
          tone="text-slate-100"
        />
        <MetricTile
          label="Total Courses"
          value={summary.totalCourses}
          note="Courses competing for room capacity."
          tone="text-slate-100"
        />
        <MetricTile
          label="Total Students"
          value={summary.totalStudents}
          note="Campus population behind the scheduling pressure."
          tone="text-slate-100"
        />
        <MetricTile
          label="Total Schedules"
          value={summary.totalSchedules}
          note="Schedule rows used to surface conflicts and recommendations."
          tone="text-slate-100"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-title text-slate-400">Alerts</p>
              <h2 className="mt-2 text-xl font-bold text-white">Operational issues that need attention</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="alert-bar danger rounded-xl p-4">
              <div className="text-sm font-semibold uppercase tracking-[0.08em] text-red-200">Capacity</div>
              <div className="mt-2 text-3xl font-bold text-white">{summary.capacityViolations}</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">
                Classes assigned to rooms that cannot hold the enrollment.
              </div>
            </div>

            <div className="alert-bar warning rounded-xl p-4">
              <div className="text-sm font-semibold uppercase tracking-[0.08em] text-amber-200">Conflicts</div>
              <div className="mt-2 text-3xl font-bold text-white">{summary.scheduleConflicts}</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">
                Same room, overlapping time, same day.
              </div>
            </div>

            <div className="alert-bar success rounded-xl p-4">
              <div className="text-sm font-semibold uppercase tracking-[0.08em] text-emerald-200">Utilization</div>
              <div className="mt-2 text-3xl font-bold text-white">{utilization}%</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">
                Simple usage indicator based on schedules per room.
              </div>
            </div>
          </div>
        </div>

        <div className="panel rounded-2xl p-6">
          <p className="section-title text-slate-400">Top recommendations</p>
          <h2 className="mt-2 text-xl font-bold text-white">Best fixes to show in the demo</h2>

          <div className="mt-5 space-y-3">
            {topRecommendations.length ? (
              topRecommendations.map((item) => {
                const spareSeats = (item.capacity ?? 0) - item.studentCount;
                return (
                  <div key={item.scheduleId} className="panel-soft rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">
                          {item.courseCode} - {item.courseName}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">{item.problem}</div>
                      </div>
                      <span className="status-chip success">Score {item.score}</span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <div className="text-slate-500">Current room</div>
                        <div className="mt-1 font-semibold text-slate-100">{item.currentRoom}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Recommended room</div>
                        <div className="mt-1 font-semibold text-emerald-200">{item.recommendedRoom}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-slate-500">Reason</div>
                        <div className="mt-1 leading-6 text-slate-300">{item.reason}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-slate-500">Impact</div>
                        <div className="mt-1 font-semibold text-white">
                          {spareSeats > 0 ? `${spareSeats} spare seats after the move` : 'Exact fit after reassignment'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-400">
                No actionable recommendations are currently available.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
