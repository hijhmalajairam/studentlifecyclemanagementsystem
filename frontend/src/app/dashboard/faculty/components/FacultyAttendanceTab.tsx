'use client';

const dummyAttendanceData = [
  { course: 'MATH101 - Calculus I', section: 'A', date: '2026-09-30', totalStudents: 58, present: 52, absent: 6, percentage: '89.7%' },
  { course: 'MATH101 - Calculus I', section: 'A', date: '2026-09-28', totalStudents: 58, present: 55, absent: 3, percentage: '94.8%' },
  { course: 'MATH101 - Calculus I', section: 'A', date: '2026-09-26', totalStudents: 58, present: 50, absent: 8, percentage: '86.2%' },
  { course: 'MATH201 - Linear Algebra', section: 'B', date: '2026-09-30', totalStudents: 38, present: 35, absent: 3, percentage: '92.1%' },
  { course: 'MATH201 - Linear Algebra', section: 'B', date: '2026-09-28', totalStudents: 38, present: 37, absent: 1, percentage: '97.4%' },
  { course: 'MATH201 - Linear Algebra', section: 'B', date: '2026-09-25', totalStudents: 38, present: 33, absent: 5, percentage: '86.8%' },
];

const lowAttendanceStudents = [
  { name: 'Rahul Mehra', enrollment: 'ENR-2026-0041', course: 'MATH101', totalClasses: 24, attended: 15, percentage: '62.5%' },
  { name: 'Priya Sharma', enrollment: 'ENR-2026-0058', course: 'MATH201', totalClasses: 20, attended: 13, percentage: '65.0%' },
  { name: 'Arjun Nair', enrollment: 'ENR-2026-0073', course: 'MATH101', totalClasses: 24, attended: 17, percentage: '70.8%' },
];

export default function FacultyAttendanceTab() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Attendance Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Track and review attendance across your courses</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-blue-500 uppercase">Avg. Attendance</p>
            <p className="text-xl font-black text-blue-700">91.2%</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-emerald-500 uppercase">Classes Taken</p>
            <p className="text-xl font-black text-emerald-700">48</p>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Sessions</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</th>
              <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {dummyAttendanceData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-slate-800">{row.course}</p>
                  <p className="text-xs text-slate-400">Section {row.section}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{row.date}</td>
                <td className="px-5 py-4 text-center">
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">{row.present}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">{row.absent}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-sm font-black ${parseFloat(row.percentage) >= 90 ? 'text-emerald-600' : parseFloat(row.percentage) >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                    {row.percentage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low Attendance Alert */}
      <div className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-red-50 border-b border-red-200 flex items-center space-x-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">Low Attendance Alerts (&lt;75%)</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-red-50/30">
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Student</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Course</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase">Attended</th>
              <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {lowAttendanceStudents.map((s, i) => (
              <tr key={i} className="hover:bg-red-50/30 transition">
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{s.enrollment}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{s.course}</td>
                <td className="px-5 py-4 text-center text-sm text-slate-600">{s.attended}/{s.totalClasses}</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-sm font-black text-red-600">{s.percentage}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
