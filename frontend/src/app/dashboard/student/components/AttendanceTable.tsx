'use client';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export default function AttendanceTable({ attendanceRecords }: { attendanceRecords: any }) {
  // We need to aggregate the raw attendance records by course to get percentages
  // Since attendanceRecords here might just be raw entries (date + status), let's group them
  
  const courseStats: Record<string, { code: string, name: string, present: number, total: number }> = {};
  const attendanceArray = Array.isArray(attendanceRecords) ? attendanceRecords : (attendanceRecords?.results || []);
  
  attendanceArray.forEach((record: any) => {
    const code = record.course?.code || record.course_code;
    const name = record.course?.name || record.course_name;
    if (!code) return;

    if (!courseStats[code]) {
      courseStats[code] = { code, name, present: 0, total: 0 };
    }
    
    courseStats[code].total += 1;
    if (record.status === 'PRESENT') {
      courseStats[code].present += 1;
    }
  });

  const chartData = Object.values(courseStats).map(stat => {
    const percentage = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
    let color = '#10b981'; // emerald
    if (percentage < 75 && percentage >= 65) color = '#f59e0b'; // amber
    if (percentage < 65) color = '#ef4444'; // red

    return {
      name: stat.code,
      fullName: stat.name,
      percentage: percentage,
      color: color,
      present: stat.present,
      total: stat.total
    };
  });

  const overallTotal = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const overallPresent = chartData.reduce((acc, curr) => acc + curr.present, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-lg">My Attendance</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-slate-500">Overall:</span>
            <span className={`text-sm font-black px-2 py-1 rounded ${overallPercentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {overallPercentage}%
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 flex space-x-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-slate-600">Year</label>
            <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white min-w-[120px] outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>2025-26</option>
              <option>2024-25</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-slate-600">Semester</label>
            <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white min-w-[120px] outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>1st Semester</option>
              <option>2nd Semester</option>
            </select>
          </div>
          <button className="bg-blue-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition-colors">
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider text-center w-12">#</th>
                <th className="px-6 py-4 font-bold tracking-wider">Course</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Section</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Classes Taken</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Attended</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Percentage</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.length > 0 ? (
                chartData.map((stat, index) => (
                  <tr key={stat.name} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{stat.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">{stat.fullName}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">A</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">{stat.total}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{stat.present}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black" style={{ color: stat.color }}>{stat.percentage}%</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {stat.percentage >= 75 ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md text-xs">Eligible</span>
                      ) : (
                        <span className="text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md text-xs flex items-center justify-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Shortage
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No attendance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-6 uppercase tracking-wider">Course-wise Attendance Breakdown</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill: '#475569', fontWeight: 600, fontSize: 12}} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <ReferenceLine x={75} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '75% Min', fill: '#ef4444', fontSize: 12, fontWeight: 600 }} />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
