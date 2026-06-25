import React, { useEffect, useMemo, useState } from 'react';

import { apiGet } from '../lib/api';
import { RoomItem, ScheduleItem } from '../lib/types';

export default function Rooms() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [roomData, scheduleData] = await Promise.all([
          apiGet<RoomItem[]>('/api/rooms'),
          apiGet<ScheduleItem[]>('/api/schedules'),
        ]);

        if (!cancelled) {
          setRooms(roomData);
          setSchedules(scheduleData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load rooms');
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

  const usageByRoom = useMemo(() => {
    const counts = new Map<string, number>();
    schedules.forEach((schedule) => {
      counts.set(schedule.roomName, (counts.get(schedule.roomName) || 0) + 1);
    });
    return counts;
  }, [schedules]);

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">Loading rooms…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Room inventory</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Capacity and usage at a glance</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          This page helps explain where the recommendation engine is sending classes and which rooms are under the most pressure.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => {
          const usage = usageByRoom.get(room.name) || 0;
          const fill = Math.min(100, Math.round((usage / 4) * 100));

          return (
            <div key={room.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-glow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{room.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {room.building} · Floor {room.floor}
                  </p>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {room.capacity} seats
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Scheduled classes</span>
                  <span>{usage}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${fill}%` }} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Rooms in the same building are prioritized when capacity fits, which makes the recommendation story easy to explain.
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
