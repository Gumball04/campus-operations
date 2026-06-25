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
    return <div className="panel rounded-xl p-6 text-slate-300">Loading rooms...</div>;
  }

  if (error) {
    return <div className="panel rounded-xl border-[color:var(--danger)] p-6 text-red-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-2xl p-6">
        <p className="section-title text-amber-400">Room inventory</p>
        <h1 className="mt-2 page-title">Rooms and capacity pressure</h1>
        <p className="mt-3 max-w-3xl page-subtitle">
          A dense administrative view of room size, utilization, and how often the scheduling engine is using each
          room.
        </p>
      </section>

      <section className="panel rounded-2xl p-4">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Room</th>
                <th className="text-left">Location</th>
                <th className="text-left">Capacity</th>
                <th className="text-left">Scheduled classes</th>
                <th className="text-left">Usage tag</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const usage = usageByRoom.get(room.name) || 0;
                const pressure = room.capacity ? Math.min(100, Math.round((usage / 4) * 100)) : 0;
                const tagClass =
                  pressure >= 75
                    ? 'status-chip danger'
                    : pressure >= 50
                      ? 'status-chip warning'
                      : 'status-chip success';
                const tagText = pressure >= 75 ? 'Heavy use' : pressure >= 50 ? 'Active' : 'Available';

                return (
                  <tr key={room.id} className="bg-[#111827]">
                    <td>
                      <div className="font-semibold text-white">{room.name}</div>
                      <div className="mt-1 text-sm text-slate-400">Room ID {room.id}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-100">{room.building}</div>
                      <div className="mt-1 text-sm text-slate-400">Floor {room.floor}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-white">{room.capacity}</div>
                      <div className="mt-1 text-sm text-slate-400">seats available</div>
                    </td>
                    <td>
                      <div className="font-semibold text-white">{usage}</div>
                      <div className="mt-1 text-sm text-slate-400">scheduled classes</div>
                    </td>
                    <td>
                      <div className={tagClass}>{tagText}</div>
                      <div className="mt-2 text-xs leading-5 text-slate-500">{pressure}% relative pressure</div>
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
