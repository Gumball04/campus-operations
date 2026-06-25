import React, { useEffect, useState } from 'react';

import { apiGet } from '../lib/api';
import { CourseItem } from '../lib/types';

function demandTone(count: number) {
  if (count >= 60) return 'text-rose-200 border-rose-400/20 bg-rose-400/10';
  if (count >= 35) return 'text-amber-200 border-amber-400/20 bg-amber-400/10';
  return 'text-emerald-200 border-emerald-400/20 bg-emerald-400/10';
}

function demandLabel(count: number) {
  if (count >= 60) return 'High demand';
  if (count >= 35) return 'Medium demand';
  return 'Low demand';
}

export default function Courses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiGet<CourseItem[]>('/api/courses');
        if (!cancelled) {
          setCourses(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load courses');
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
    return <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">Loading courses…</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Course demand</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Enrollment pressure by class</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          The course list helps explain why some rooms are the wrong size, which is the simplest way to show the recommendation engine working.
        </p>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-glow">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">All courses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Enrollment</th>
                <th className="px-6 py-4 font-medium">Demand</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t border-white/5">
                  <td className="px-6 py-4 font-semibold text-white">{course.code}</td>
                  <td className="px-6 py-4 text-slate-300">{course.name}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{course.studentCount}</div>
                    <div className="text-slate-400">students</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${demandTone(course.studentCount)}`}>
                      {demandLabel(course.studentCount)}
                    </span>
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
