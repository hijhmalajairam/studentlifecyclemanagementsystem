'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { 
  Users, 
  CreditCard, 
  Calendar, 
  GraduationCap, 
  Award, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

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
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Parent Portal…</p>
        </div>
      </div>
    );
  }

  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayNames: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday' };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Guardian Academic Portal</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Parent & Guardian Portal
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                Monitor your child's statutory 75% attendance compliance, bursar fee payments, and weekly academic schedule.
              </p>
            </div>

            {childData && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center space-x-4 shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-600/20">
                  {childData.student_name ? childData.student_name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{childData.student_name || 'Enrolled Student'}</div>
                  <div className="font-mono text-xs text-blue-600 font-bold">{childData.enrollment_number}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{childData.program_name || 'B.Tech CSE'} • Year {childData.current_year} (Sem {childData.current_semester})</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!childData ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Linked Student Enrollment Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your guardian account will automatically show academic records once the student admission verification and seat allocation are completed.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Fee Dues */}
            {childFees.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Tuition & Term Fee Status</h2>
                      <p className="text-xs text-slate-400">Bursar invoices, scholarship discounts, and payment receipts</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {childFees.map((fee: any) => (
                    <div key={fee.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-extrabold text-slate-900 text-base">Semester {fee.semester} Fee</span>
                          <p className="text-xs text-slate-400">Due: {fee.due_date}</p>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                          fee.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          fee.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {fee.status}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 font-medium">Net Amount Due</span>
                        <div className="text-right">
                          <span className="text-xl font-black text-slate-900">₹{parseFloat(fee.net_amount).toLocaleString()}</span>
                          {parseFloat(fee.scholarship_discount) > 0 && (
                            <span className="block text-[11px] text-emerald-600 font-bold">({fee.scholarship_discount}% Scholarship Applied)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Overview */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Attendance Compliance Register</h2>
                    <p className="text-xs text-slate-400">Mandatory 75% Statutory Minimum enforcement per course</p>
                  </div>
                </div>
              </div>

              {childAttendance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {childAttendance.map((att: any, idx: number) => {
                    const isShortage = att.percentage < 75;
                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                              {att.course_code}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{att.course_name}</h4>
                          </div>
                          <div className={`text-2xl font-black ${!isShortage ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {att.percentage.toFixed(0)}%
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${!isShortage ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(att.percentage, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2 text-xs">
                          <span className="text-slate-500 font-medium">{att.present} of {att.total} classes attended</span>
                          {isShortage ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Shortage Warning
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Good Standing
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No attendance records published yet.</p>
              )}
            </div>

            {/* Weekly Timetable */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Weekly Lecture Timetable</h2>
                    <p className="text-xs text-slate-400">Class timings, laboratory slots, and lecture venues</p>
                  </div>
                </div>
              </div>

              {childTimetable.length > 0 ? (
                <div className="space-y-4">
                  {dayOrder.filter(d => childTimetable.some(t => t.day === d)).map(day => (
                    <div key={day} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                      <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-3">{dayNames[day]}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {childTimetable.filter(t => t.day === day).map((slot: any) => (
                          <div key={slot.id} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                            <span className="font-mono text-xs font-black text-slate-900">{slot.course_code}</span>
                            <p className="text-xs text-slate-600 font-medium truncate">{slot.course_name}</p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[11px]">
                              <span className="text-blue-600 font-bold font-mono">{slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}</span>
                              {slot.room && <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">Room {slot.room}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No timetable scheduled.</p>
              )}
            </div>

            {/* Leave Requests */}
            {childLeaves.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Excused Leave & Absence History</h2>
                      <p className="text-xs text-slate-400">Approved leaves that protect statutory attendance eligibility</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {childLeaves.map((l: any) => (
                    <div key={l.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{l.start_date} to {l.end_date}</div>
                        <p className="text-xs text-slate-500 mt-0.5">{l.reason}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        l.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}