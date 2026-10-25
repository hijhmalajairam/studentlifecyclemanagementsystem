'use client';

export default function TimetableView({ timetable }: { timetable: any[] }) {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  
  const periods = [
    { label: 'Period 1', time: '09:00 - 10:00', prefix: '09' },
    { label: 'Period 2', time: '10:00 - 11:00', prefix: '10' },
    { label: 'Period 3', time: '11:00 - 12:00', prefix: '11' },
    { label: 'Period 4', time: '12:00 - 13:00', prefix: '12' },
    { label: 'Period 5', time: '14:00 - 15:00', prefix: '14' },
    { label: 'Period 6', time: '15:00 - 16:00', prefix: '15' },
  ];

  const getCardColor = (courseCode: string) => {
    if (!courseCode) return 'bg-slate-50 border-slate-200 text-slate-800';
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
      hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-50/80 border-blue-200 text-blue-900',
      'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      'bg-amber-50/80 border-amber-200 text-amber-900',
      'bg-purple-50/80 border-purple-200 text-purple-900',
      'bg-indigo-50/80 border-indigo-200 text-indigo-900',
      'bg-cyan-50/80 border-cyan-200 text-cyan-900',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getSlotData = (day: string, timePrefix: string) => {
    if (!timetable || timetable.length === 0) return null;
    const hour = parseInt(timePrefix);
    return timetable.find((t: any) => {
      if (t.day !== day) return false;
      const startHour = parseInt(t.start_time?.split(':')[0] || '0');
      const endHour = parseInt(t.end_time?.split(':')[0] || '0');
      return hour >= startHour && hour < endHour;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Academic Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Academic Year 2026-27 • Autumn Term
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Class Timetable & Lecture Schedule</h2>
            <p className="text-xs text-slate-500 mt-1">
              B.Tech Computer Science & Engineering • 1st Year (Semester 1) • Section A
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl">
              5 Courses Enrolled
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl">
              Mon – Fri
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm border-collapse min-w-[950px]">
            <thead>
              <tr>
                <th className="bg-slate-50 border-b border-slate-200 p-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs w-28">
                  Day
                </th>
                {periods.map((slot, i) => (
                  <th key={i} className="bg-slate-50 border-b border-l border-slate-200 p-4 text-center">
                    <div className="font-bold text-slate-800">{slot.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{slot.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="border-b border-slate-100 last:border-0">
                  <td className="p-4 text-center font-black text-slate-800 bg-slate-50/70 border-r border-slate-200">
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-bold">
                      {day}
                    </span>
                  </td>
                  
                  {periods.map((period, idx) => {
                    const entry = getSlotData(day, period.prefix);
                    return (
                      <td key={idx} className="p-2 border-r border-slate-100 last:border-0 align-top h-36 w-44 bg-white">
                        {entry ? (
                          <div className={`p-3 rounded-xl border ${getCardColor(entry.course_code)} h-full flex flex-col justify-between transition hover:shadow-md cursor-default`}>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-black text-xs tracking-wider uppercase">{entry.course_code}</span>
                                <span className="text-[9px] font-bold bg-white/70 px-1.5 py-0.5 rounded shadow-2xs">
                                  {entry.section || 'Sec A'}
                                </span>
                              </div>
                              <p className="font-bold text-xs leading-tight line-clamp-2">{entry.course_name}</p>
                              <p className="text-[10px] font-medium opacity-70 mt-0.5">
                                {entry.academic_year || '1st Year'} • Sem {entry.semester || 1}
                              </p>
                            </div>

                            <div className="space-y-1 mt-2 pt-2 border-t border-black/5 text-[11px] font-medium opacity-90">
                              <div className="flex items-center text-[10px] font-semibold truncate">
                                <span className="mr-1">👨‍🏫</span>
                                <span className="truncate">{entry.faculty_name || 'Prof. Faculty'}</span>
                              </div>
                              <div className="flex items-center text-[10px] font-semibold">
                                <span className="mr-1">📍</span>
                                <span>{entry.room || 'Room TBA'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium text-xs bg-slate-50/40 rounded-xl border border-dashed border-slate-100">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
