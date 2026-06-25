import React, { useEffect, useMemo, useState } from 'react';

import { apiGet } from '../lib/api';
import { CapacityViolation, ScheduleConflict, ScheduleItem } from '../lib/types';

type SchedulesPayload = {
  schedules: ScheduleItem[];
  capacityViolations: CapacityViolation[];
  conflicts: ScheduleConflict[];
};

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function Schedules() {
  const [data, setData] = useState<SchedulesPayload>({
    schedules: [],
    capacityViolations: [],
    conflicts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [schedules, capacityViolations, conflicts] = await Promise.all([
          apiGet<ScheduleItem[]>('/api/schedules'),
          apiGet<CapacityViolation[]>('/api/analytics/capacity'),
          apiGet<ScheduleConflict[]>('/api/analytics/conflicts'),
        ]);

        if (!cancelled) {
          setData({ schedules, capacityViolations, conflicts });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load schedules');
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

  const issueMap = useMemo(() => {
    const capacityIds = new Set(data.capacityViolations.map((item) => item.scheduleId));
    const conflictIds = new Set<number>();
    data.conflicts.forEach((item) => {
      conflictIds.add(item.firstScheduleId);
      conflictIds.add(item.secondScheduleId);
    });

    return { capacityIds, conflictIds };
  }, [data.capacityViolations, data.conflicts]);

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">Loading schedules…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Scheduling view</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Conflict detection in one table</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Rows are highlighted when the same room is double-booked or when a class exceeds the room capacity.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-amber-100">
            {data.capacityViolations.length} capacity violations
          </div>
          <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-rose-100">
            {data.conflicts.length} schedule conflicts
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-100">
            {data.schedules.filter((item) => !issueMap.capacityIds.has(item.id) && !issueMap.conflictIds.has(item.id)).length} clear schedules
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-glow">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">All schedules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Room</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Enrollment</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.schedules.map((item) => {
                const hasCapacity = issueMap.capacityIds.has(item.id);
                const hasConflict = issueMap.conflictIds.has(item.id);
                const statusClass = hasConflict
                  ? 'border-rose-400/20 bg-rose-400/10 text-rose-100'
                  : hasCapacity
                    ? 'border-amber-400/20 bg-amber-400/10 text-amber-100'
                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
                const statusText = hasConflict && hasCapacity
                  ? 'Conflict + capacity'
                  : hasConflict
                    ? 'Conflict'
                    : hasCapacity
                      ? 'Capacity violation'
                      : 'Clear';

                return (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{item.courseCode}</div>
                      <div className="text-slate-400">{item.courseName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.roomName}</div>
                      <div className="text-slate-400">
                        {item.building} · Floor {item.floor} · {item.capacity} seats
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      <div>{titleCase(item.day)}</div>
                      <div className="text-slate-400">
                        {item.startTime} - {item.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{item.studentCount}</div>
                      <div className="text-slate-400">students</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
