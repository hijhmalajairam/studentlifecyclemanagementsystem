'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function MyClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/academics/course-sections/my_classes/')
      .then(data => setClasses(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🧑‍🏫</span> My Active Classes
        </h2>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl shadow-sm">Loading Classes...</div>
      ) : classes.length === 0 ? (
        <div className="py-20 text-center text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl shadow-sm">You are not assigned to any active classes this term.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {cls.course_code}
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black shadow-sm border border-emerald-100">{cls.term_name}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                {cls.course_name || 'Course Name Unknown'}
              </h3>
              <p className="text-xs font-bold text-slate-400 mb-6">Section {cls.id} • Capacity: {cls.capacity}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-100 hover:border-transparent py-2.5 rounded-xl text-xs font-black transition-all text-center">
                  Mark Attendance
                </button>
                <button className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 hover:border-transparent py-2.5 rounded-xl text-xs font-black transition-all text-center">
                  Grade Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
