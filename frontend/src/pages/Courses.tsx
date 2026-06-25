import React, { useEffect, useState } from 'react';

import { apiGet } from '../lib/api';
import { CourseItem } from '../lib/types';

function demandClass(count: number) {
  if (count >= 60) return 'status-chip danger';
  if (count >= 35) return 'status-chip warning';
  return 'status-chip success';
}

function demandText(count: number) {
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
    return <div className="panel rounded-xl p-6 text-slate-300">Loading courses...</div>;
  }

  if (error) {
    return <div className="panel rounded-xl border-[color:var(--danger)] p-6 text-red-100">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-2xl p-6">
        <p className="section-title text-amber-400">Course demand</p>
        <h1 className="mt-2 page-title">Enrollment pressure by class</h1>
        <p className="mt-3 max-w-3xl page-subtitle">
          The course table explains why room size matters and gives the recommendation engine its operating context.
        </p>
      </section>

      <section className="panel rounded-2xl p-4">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Code</th>
                <th className="text-left">Course</th>
                <th className="text-left">Enrollment</th>
                <th className="text-left">Demand</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="bg-[#111827]">
                  <td>
                    <div className="font-semibold text-white">{course.code}</div>
                    <div className="mt-1 text-sm text-slate-400">Course ID {course.id}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-100">{course.name}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-white">{course.studentCount}</div>
                    <div className="mt-1 text-sm text-slate-400">students enrolled</div>
                  </td>
                  <td>
                    <div className={demandClass(course.studentCount)}>{demandText(course.studentCount)}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-500">
                      {course.studentCount >= 60
                        ? 'Requires a large room or split section.'
                        : course.studentCount >= 35
                          ? 'Needs a mid-size classroom.'
                          : 'Fits in a smaller room.'}
                    </div>
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
