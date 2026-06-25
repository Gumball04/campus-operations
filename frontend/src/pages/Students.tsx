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
    return <div className="panel rounded-xl p-6 text-slate-300">Loading students...</div>;
  }

  if (error) {
    return <div className="panel rounded-xl border-[color:var(--danger)] p-6 text-red-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-2xl p-6">
        <p className="section-title text-amber-400">Student roster</p>
        <h1 className="mt-2 page-title">Campus population snapshot</h1>
        <p className="mt-3 max-w-3xl page-subtitle">
          A dense roster view keeps the demo grounded in a real campus population rather than an abstract data set.
        </p>
        <div className="mt-5 status-chip success">{total} total students</div>
      </section>

      <section className="panel rounded-2xl p-4">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Student #</th>
                <th className="text-left">Name</th>
                <th className="text-left">Department</th>
                <th className="text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="bg-[#111827]">
                  <td>
                    <div className="font-semibold text-white">{student.studentNumber}</div>
                    <div className="mt-1 text-sm text-slate-400">Student ID {student.id}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-100">{student.fullName}</div>
                  </td>
                  <td>
                    <span className="status-chip warning">{student.department}</span>
                  </td>
                  <td>
                    <div className="text-slate-300">{student.email}</div>
                    <div className="mt-1 text-xs text-slate-500">{student.createdAt}</div>
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
