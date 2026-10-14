'use client';

import { useState } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { fetchAPI } from '@/lib/api';

export default function AttendanceTable({ attendanceRecords }: { attendanceRecords: any }) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ELIGIBLE' | 'SHORTAGE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily logs modal state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedCourseForLog, setSelectedCourseForLog] = useState<string | null>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const courseStats: Record<string, { code: string; name: string; present: number; total: number }> = {};
  const attendanceArray = Array.isArray(attendanceRecords) ? attendanceRecords : (attendanceRecords?.results || []);

  attendanceArray.forEach((record: any) => {
    const code = record.course?.code || record.course_code;
    const name = record.course?.name || record.course_name || code;
    if (!code) return;

    if (!courseStats[code]) {
      courseStats[code] = { code, name, present: 0, total: 0 };
    }

    if (record.total !== undefined && record.present !== undefined) {
      courseStats[code].total += Number(record.total);
      courseStats[code].present += Number(record.present);
    } else {
      courseStats[code].total += 1;
      if (record.status === 'PRESENT') {
        courseStats[code].present += 1;
      }
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
  const shortageCount = chartData.filter(c => c.percentage < 75).length;

  const filteredData = chartData.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ELIGIBLE') return c.percentage >= 75;
    if (statusFilter === 'SHORTAGE') return c.percentage < 75;
    return true;
  });

  const openDailyLogs = async (courseCode?: string) => {
    setSelectedCourseForLog(courseCode || null);
    setIsLogModalOpen(true);
    setLoadingLogs(true);
    try {
      const logs = await fetchAPI('/academics/attendance/my_daily_logs/');
      const filtered = Array.isArray(logs)
        ? (courseCode ? logs.filter((l: any) => l.course_code === courseCode) : logs)
        : [];
      setDailyLogs(filtered);
    } catch (err) {
      console.error('Failed to load daily logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Quick KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
          <p className={`text-2xl font-black mt-1 ${overallPercentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
            {overallPercentage}%
          </p>
          <span className="text-xs text-slate-500 font-medium">75% Mandatory Minimum</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Classes</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{overallTotal}</p>
          <span className="text-xs text-slate-500 font-medium">Conducted Sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classes Attended</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{overallPresent}</p>
          <span className="text-xs text-slate-500 font-medium">{overallTotal - overallPresent} Absent</span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${shortageCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shortage Alerts</span>
          <p className={`text-2xl font-black mt-1 ${shortageCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {shortageCount} {shortageCount === 1 ? 'Course' : 'Courses'}
          </p>
          <span className="text-xs text-slate-500 font-medium">
            {shortageCount > 0 ? 'Exam eligibility at risk' : 'All courses eligible 🎉'}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-800 text-lg">Course-wise Attendance & Eligibility</h2>
            <p className="text-xs text-slate-400">Current Semester Enrolled Subjects</p>
          </div>
          <button
            onClick={() => openDailyLogs()}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            <span>📅</span>
            <span>View Full Daily Log</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search course or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 w-48 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Filter:</span>
            <div className="bg-slate-200 p-0.5 rounded-lg flex text-xs font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md transition ${statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({chartData.length})
              </button>
              <button
                onClick={() => setStatusFilter('ELIGIBLE')}
                className={`px-3 py-1 rounded-md transition ${statusFilter === 'ELIGIBLE' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Eligible ({chartData.filter(c => c.percentage >= 75).length})
              </button>
              <button
                onClick={() => setStatusFilter('SHORTAGE')}
                className={`px-3 py-1 rounded-md transition ${statusFilter === 'SHORTAGE' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Shortage ({shortageCount})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-[10px] uppercase text-slate-400 font-black border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4 text-center">Section</th>
                <th className="px-6 py-4 text-center">Conducted</th>
                <th className="px-6 py-4 text-center">Attended</th>
                <th className="px-6 py-4 text-center">Percentage</th>
                <th className="px-6 py-4 text-center">Eligibility</th>
                <th className="px-6 py-4 text-right">Daily Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((stat, index) => (
                  <tr key={stat.name} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{stat.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">{stat.fullName}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">A</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">{stat.total}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{stat.present}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-sm" style={{ color: stat.color }}>{stat.percentage}%</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {stat.percentage >= 75 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg text-xs">
                          Eligible
                        </span>
                      ) : (
                        <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg text-xs inline-flex items-center">
                          <span className="mr-1">⚠️</span> Shortage
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDailyLogs(stat.name)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        History ↗
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No matching attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Bar Chart Breakdown */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Attendance Breakdown Chart</h3>
            <span className="text-xs text-slate-400 font-medium">Minimum threshold: 75%</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <ReferenceLine x={75} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '75% Min', fill: '#ef4444', fontSize: 12, fontWeight: 700 }} />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily Attendance History Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedCourseForLog ? `Daily Log: ${selectedCourseForLog}` : 'Full Attendance Log'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Session-by-session attendance audit</p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {loadingLogs ? (
                <p className="text-center text-xs text-slate-400 py-8">Loading attendance records...</p>
              ) : dailyLogs.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">No daily records found.</p>
              ) : (
                dailyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{log.course_code} - {log.course_name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{log.date}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        log.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
