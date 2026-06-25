import React, { useEffect, useMemo, useState } from 'react';

import { apiGet } from '../lib/api';
import { CapacityViolation, ScheduleConflict, ScheduleItem } from '../lib/types';

type SchedulesPayload = {
  schedules: ScheduleItem[];
  capacityViolations: CapacityViolation[];
  conflicts: ScheduleConflict[];
};

function formatDay(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
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
    return <div className="panel rounded-xl p-6 text-slate-300">Loading schedules...</div>;
  }

  if (error) {
    return <div className="panel rounded-xl border-[color:var(--danger)] p-6 text-red-100">{error}</div>;
  }

  const clearSchedules = data.schedules.filter(
    (item) => !issueMap.capacityIds.has(item.id) && !issueMap.conflictIds.has(item.id),
  ).length;

  return (
    <div className="space-y-6">
      <section className="panel rounded-2xl p-6">
        <p className="section-title text-amber-400">Schedule operations</p>
        <h1 className="mt-2 page-title">Table-first conflict view</h1>
        <p className="mt-3 max-w-3xl page-subtitle">
          Conflict rows are marked in red, capacity pressure is flagged in amber, and every row includes the room and
          enrollment context needed for a quick operational decision.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="status-chip danger">{data.conflicts.length} conflicts</span>
          <span className="status-chip warning">{data.capacityViolations.length} capacity alerts</span>
          <span className="status-chip success">{clearSchedules} clear schedules</span>
        </div>
      </section>

      <section className="panel rounded-2xl p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="status-chip danger">Red left border = room conflict</span>
          <span className="status-chip warning">Amber badge = capacity pressure</span>
          <span className="status-chip success">Green badge = clear schedule</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Course</th>
                <th className="text-left">Room</th>
                <th className="text-left">Time</th>
                <th className="text-left">Enrollment</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.schedules.map((item) => {
                const hasCapacity = issueMap.capacityIds.has(item.id);
                const hasConflict = issueMap.conflictIds.has(item.id);
                const statusText = hasConflict && hasCapacity
                  ? 'Conflict + capacity'
                  : hasConflict
                    ? 'Conflict'
                    : hasCapacity
                      ? 'Capacity pressure'
                      : 'Clear';
                const statusClass = hasConflict
                  ? 'status-chip danger'
                  : hasCapacity
                    ? 'status-chip warning'
                    : 'status-chip success';

                return (
                  <tr key={item.id} className="bg-[#111827]">
                    <td className={`border-l-4 ${hasConflict ? 'border-l-[color:var(--danger)]' : 'border-l-transparent'}`}>
                      <div className="font-semibold text-white">{item.courseCode}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.courseName}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-white">{item.roomName}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {item.building} · Floor {item.floor} · {item.capacity} seats
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-white">{formatDay(item.day)}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {item.startTime} - {item.endTime}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-white">{item.studentCount}</div>
                      <div className="mt-1 text-sm text-slate-400">students enrolled</div>
                    </td>
                    <td>
                      <div className={statusClass}>{statusText}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-500">
                        {hasConflict
                          ? 'Two classes overlap in the same room.'
                          : hasCapacity
                            ? 'Enrollment exceeds the assigned room capacity.'
                            : 'No current scheduling issue detected.'}
                      </div>
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
