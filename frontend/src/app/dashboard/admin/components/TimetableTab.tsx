import React from 'react';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface TimetableTabProps {
  timetable: any[];
  courses: any[];
  ttForm: { course: string; day: string; start_time: string; end_time: string; room: string };
  setTtForm: (form: any) => void;
  createTimetableSlot: (e: React.FormEvent) => void;
  isAdmin: boolean;
  hasWriteAccess: boolean;
}

export default function TimetableTab({
  timetable,
  courses,
  ttForm,
  setTtForm,
  createTimetableSlot,
  isAdmin,
  hasWriteAccess,
}: TimetableTabProps) {
  return (
    <div className="space-y-8">
      <form onSubmit={createTimetableSlot} className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Add Timetable Slot</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course</label>
            <select
              required
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              value={ttForm.course}
              onChange={(e) => setTtForm({ ...ttForm, course: e.target.value })}
            >
              <option value="">-- Select --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day</label>
            <select
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              value={ttForm.day}
              onChange={(e) => setTtForm({ ...ttForm, day: e.target.value })}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
            <input
              type="time"
              required
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              style={{ colorScheme: 'light' }}
              value={ttForm.start_time}
              onChange={(e) => setTtForm({ ...ttForm, start_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
            <input
              type="time"
              required
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              style={{ colorScheme: 'light' }}
              value={ttForm.end_time}
              onChange={(e) => setTtForm({ ...ttForm, end_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Room</label>
            <input
              type="text"
              placeholder="e.g. LH-301"
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none placeholder-slate-500"
              value={ttForm.room}
              onChange={(e) => setTtForm({ ...ttForm, room: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!hasWriteAccess}
          className={`bg-blue-600 text-slate-900 px-6 py-3 rounded font-bold transition ${
            !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
          }`}
        >
          Add Slot
        </button>
      </form>
      <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Day</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Time</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {timetable.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No timetable slots.
                </td>
              </tr>
            ) : (
              timetable.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-cyan-400">{t.course_code}</span>{' '}
                    <span className="text-slate-400">- {t.course_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{t.day}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-900">
                    {t.start_time?.slice(0, 5)} - {t.end_time?.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{t.room || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
