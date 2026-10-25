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

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  const getSlotData = (day: string, hourNum: number) => {
    return timetable.find((t: any) => {
      if (t.day !== day) return false;
      const startHour = parseInt(t.start_time?.split(':')[0] || '0');
      const endHour = parseInt(t.end_time?.split(':')[0] || '0');
      return hourNum >= startHour && hourNum < endHour;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Faculty Weekly Teaching Schedule • Fall 2026
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Lectures & Lab Sessions</h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing all scheduled periods across academic programs and sections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl">
              {timetable.length} Weekly Sessions
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold">Loading Timetable...</div>
        ) : timetable.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold">No classes scheduled for you this term.</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Time</th>
                  {days.map(day => (
                    <th key={day} className="px-6 py-4 bg-slate-50 border-b border-l border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[9, 10, 11, 12, 14, 15].map(hour => {
                  const timeStr = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
                  return (
                    <tr key={hour} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 border-r border-slate-100 bg-slate-50/50">
                        <span className="bg-white text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs border border-slate-200 block text-center font-mono">
                          {timeStr}
                        </span>
                      </td>
                      {days.map(day => {
                        const slot = getSlotData(day, hour);
                        return (
                          <td key={`${day}-${hour}`} className="px-3 py-3 border-r border-slate-100 relative h-32 w-44 align-top">
                            {slot ? (
                              <div className="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 border border-indigo-200/80 p-3 rounded-xl shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-indigo-800">{slot.course_code}</span>
                                    <span className="bg-white text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[9px] border border-indigo-100 shadow-2xs">
                                      {slot.academic_year || '1st Year'}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{slot.course_name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    Sem {slot.semester || 1} • {slot.section || 'Sec A'}
                                  </p>
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-indigo-100/80 flex items-center justify-between text-[10px]">
                                  <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                    📍 {slot.room || 'Room TBA'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full min-h-[70px] rounded-xl border border-dashed border-slate-100 bg-slate-50/30 flex items-center justify-center">
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
