'use client';

export default function TimetableView({ timetable }: { timetable: any[] }) {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // A mapping of slots. This assumes typical 1-hour slots from 9 AM to 4 PM.
  // We can derive columns dynamically or use a fixed grid.
  const slots = [
    { label: 'Slot 1', time: '09:00 - 10:00' },
    { label: 'Slot 2', time: '10:00 - 11:00' },
    { label: 'Slot 3', time: '11:00 - 12:00' },
    { label: 'Slot 4', time: '12:00 - 13:00' },
    { label: 'Slot 5', time: '14:00 - 15:00' },
    { label: 'Slot 6', time: '15:00 - 16:00' },
  ];

  // Helper to color-code cards based on course code
  const getCardColor = (courseCode: string) => {
    if (!courseCode) return 'bg-slate-50 border-slate-200';
    
    // Hash the course code to consistently pick a color
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
      hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-900',
      'bg-green-50 border-green-200 text-green-900',
      'bg-yellow-50 border-yellow-200 text-yellow-900',
      'bg-pink-50 border-pink-200 text-pink-900',
      'bg-indigo-50 border-indigo-200 text-indigo-900',
      'bg-purple-50 border-purple-200 text-purple-900',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Organize data by day and time
  const getSlotData = (day: string, timePrefix: string) => {
    if (!timetable || timetable.length === 0) return null;
    return timetable.find(t => t.day === day && t.start_time.startsWith(timePrefix));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-lg">My Timetable</h2>
        <div className="flex space-x-3">
          <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>All sessions</option>
            <option>Regular classes</option>
          </select>
          <button className="border border-slate-300 rounded-lg px-4 py-1.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="bg-slate-50 border-b border-slate-200 p-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs w-24">Day</th>
              {slots.map((slot, i) => (
                <th key={i} className="bg-slate-50 border-b border-l border-slate-200 p-4 text-center">
                  <div className="font-bold text-slate-700">{slot.label}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">{slot.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day} className="border-b border-slate-200 last:border-0">
                <td className="p-4 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                  {day}
                </td>
                
                {/* Fixed time prefixes for slots */}
                {[ '09', '10', '11', '12', '14', '15' ].map((prefix, idx) => {
                  const entry = getSlotData(day, prefix);
                  return (
                    <td key={idx} className="p-2 border-r border-slate-200 last:border-0 align-top h-32 w-48 bg-white">
                      {entry ? (
                        <div className={`p-3 rounded-xl border ${getCardColor(entry.course_code)} h-full flex flex-col transition hover:shadow-md cursor-default`}>
                          <div className="font-black text-xs mb-1 tracking-wide uppercase">{entry.course_code} - A</div>
                          <div className="font-medium text-sm leading-tight flex-1 opacity-90">{entry.course_name}</div>
                          <div className="mt-3 text-xs opacity-75 font-semibold flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            {entry.faculty_name || 'TBA'}
                          </div>
                          <div className="text-xs opacity-75 font-medium mt-0.5 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            {entry.room || 'TBA'}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium text-xs">
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
  );
}
