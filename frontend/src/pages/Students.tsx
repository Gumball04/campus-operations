import React, { useEffect, useState } from 'react';

import { apiGet } from '../lib/api';
import { StudentItem } from '../lib/types';

type StudentPage = {
  content: StudentItem[];
  totalElements: number;
};

export default function Students() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiGet<StudentPage>('/api/students?size=10');
        if (!cancelled) {
          setStudents(data.content || []);
          setTotal(data.totalElements || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load students');
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

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">Loading students…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Student snapshot</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Campus population</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          A quick look at the seeded student roster that drives the dashboard totals.
        </p>
        <div className="mt-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          {total} total students
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-glow">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Latest students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium">Student #</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-white/5">
                  <td className="px-6 py-4 font-semibold text-white">{student.studentNumber}</td>
                  <td className="px-6 py-4 text-slate-300">{student.fullName}</td>
                  <td className="px-6 py-4 text-slate-400">{student.department}</td>
                  <td className="px-6 py-4 text-slate-400">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
