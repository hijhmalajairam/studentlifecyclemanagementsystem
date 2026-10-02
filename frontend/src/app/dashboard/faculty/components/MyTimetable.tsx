'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function MyTimetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/academics/timetable/my_timetable/')
      .then(data => setTimetable(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📅</span> My Weekly Schedule
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold">Loading Timetable...</div>
        ) : timetable.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold">No classes scheduled for you this term.</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">Time</th>
                  {days.map(day => (
                    <th key={day} className="px-6 py-4 bg-slate-50 border-b border-l border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[160px] text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Generate time slots from 09:00 to 17:00 */}
                {[9, 10, 11, 12, 13, 14, 15, 16].map(hour => {
                  const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                  return (
                    <tr key={hour} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 border-r border-slate-100">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black shadow-sm border border-blue-100">{timeStr}</span>
                      </td>
                      {days.map(day => {
                        // Find if there's a class for this day and time
                        const slot = timetable.find(t => t.day === day && t.start_time.startsWith(timeStr));
                        return (
                          <td key={`${day}-${hour}`} className="px-4 py-3 border-r border-slate-100 relative">
                            {slot ? (
                              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                                <p className="text-xs font-black text-indigo-700">{slot.course_code}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-2">{slot.course_name}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="bg-white px-2 py-0.5 rounded text-[9px] font-bold text-slate-400 border border-slate-100">Sec: {slot.section_id || 'A'}</span>
                                  <span className="bg-emerald-50 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-600 border border-emerald-100">{slot.room || 'TBD'}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full min-h-[80px] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[10px] font-bold text-slate-300">Free</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
