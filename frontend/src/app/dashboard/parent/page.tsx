'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function ParentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [childData, setChildData] = useState<any>(null);
  const [childAttendance, setChildAttendance] = useState<any[]>([]);
  const [childResults, setChildResults] = useState<any[]>([]);
  const [childLeaves, setChildLeaves] = useState<any[]>([]);
  const [childFees, setChildFees] = useState<any[]>([]);
  const [childTimetable, setChildTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const fetchParentData = async () => {
      try {
        // Parent views their linked child's data
        const [enrollment, attendance, results, leaves, fees, timetable] = await Promise.all([
          fetchAPI('/academics/enrollment/my_enrollment/').catch(() => null),
          fetchAPI('/academics/attendance/my_attendance/').catch(() => []),
          fetchAPI('/academics/results/my_results/').catch(() => []),
          fetchAPI('/academics/leaves/my_leaves/').catch(() => []),
          fetchAPI('/academics/fees/my_fees/').catch(() => []),
          fetchAPI('/academics/timetable/my_timetable/').catch(() => []),
        ]);
        setChildData(enrollment);
        setChildAttendance(attendance || []);
        setChildResults(results?.results || []);
        setChildLeaves(leaves || []);
        setChildFees(fees || []);
        setChildTimetable(timetable || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetchParentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading parent portal…</p>
        </div>
      </div>
    );
  }

  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayNames: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              👨‍👩‍👧 Parent Portal
            </h1>
            <p className="text-slate-400 mt-1">
              Monitor your child's academic progress, attendance, and fee dues.
            </p>
          </div>

          {!childData ? (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No Child Enrollment Found</h3>
              <p className="text-slate-500">Your child's data will appear here once they are enrolled in the university.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Fee Dues */}
              {childFees.length > 0 && (
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="mr-3 text-2xl">💳</span>
                    Fee Dues
                  </h2>
                  <div className="space-y-3">
                    {childFees.map((fee: any) => (
                      <div key={fee.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-lg">Semester {fee.semester}</p>
                            <p className="text-sm text-slate-400">
                              ₹{parseFloat(fee.net_amount).toLocaleString()} 
                              {parseFloat(fee.scholarship_discount) > 0 && (
                                <span className="text-green-400 ml-2">({fee.scholarship_discount}% discount)</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Due: {fee.due_date}</p>
                          </div>
                          <div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              fee.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              fee.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>{fee.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance Overview */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Attendance Overview
                </h2>
                {childAttendance.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childAttendance.map((att: any, idx: number) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <p className="font-bold text-white">{att.course_code}</p>
                            <p className="text-xs text-slate-500">{att.course_name}</p>
                          </div>
                          <div className={`text-3xl font-black ${att.percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                            {att.percentage.toFixed(0)}%
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${att.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(att.percentage, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-slate-500">{att.present} / {att.total} classes</p>
                          {att.warning && <span className="text-[10px] font-bold text-red-400 uppercase">⚠ Low Attendance</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-500 italic">No attendance data yet.</p>}
              </div>

              {/* Timetable */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3 text-2xl">📅</span>
                  Weekly Timetable
                </h2>
                {childTimetable.length > 0 ? (
                  <div className="space-y-4">
                    {dayOrder.filter(d => childTimetable.some(t => t.day === d)).map(day => (
                      <div key={day}>
                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">{dayNames[day]}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {childTimetable.filter(t => t.day === day).map((slot: any) => (
                            <div key={slot.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                              <p className="font-bold text-white">{slot.course_code}</p>
                              <p className="text-xs text-slate-400">{slot.course_name}</p>
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                                <span className="text-sm text-cyan-400 font-mono">{slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}</span>
                                {slot.room && <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">🏛 {slot.room}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-500 italic">No timetable scheduled.</p>}
              </div>

              {/* Exam Results */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Examination Results
                </h2>
                {childResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childResults.map((r: any) => (
                      <div key={r.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-white">{r.course_code}</p>
                            <p className="text-sm text-slate-400">{r.course_name}</p>
                          </div>
                          <span className={`text-2xl font-black ${
                            ['O', 'A+', 'A'].includes(r.grade) ? 'text-green-400' :
                            r.grade === 'F' ? 'text-red-400' : 'text-blue-400'
                          }`}>{r.grade}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                          <span className="text-lg font-bold text-white">{r.marks_obtained}<span className="text-sm text-slate-500"> / {r.max_marks}</span></span>
                          {r.is_backlog && <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-bold">BACKLOG</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-500 italic">No results published yet.</p>}
              </div>

              {/* Leave Requests */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Leave Requests
                </h2>
                {childLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {childLeaves.map((l: any) => (
                      <div key={l.id} className="bg-slate-900/50 p-4 border border-slate-700/50 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-200">{l.start_date} to {l.end_date}</span>
                          <p className="text-xs text-slate-500 mt-1">{l.reason}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          l.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          l.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-500 italic">No leave requests.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
