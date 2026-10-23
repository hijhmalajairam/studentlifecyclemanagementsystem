'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

interface FacultyKPIs {
  overall_avg_percentage: number;
  total_sessions_conducted: number;
  total_students_enrolled: number;
  total_at_risk_students: number;
}

interface FacultyCourse {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  semester: number;
  department_code?: string;
  department_name?: string;
  instructors?: string[];
  enrolled_students: number;
  total_sessions: number;
  avg_percentage: number;
  at_risk_count: number;
}

interface RecentSession {
  course_id: number;
  course_code: string;
  course_name: string;
  date: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

interface AtRiskStudent {
  enrollment_id: number;
  enrollment_number: string;
  student_name: string;
  course_code: string;
  course_name: string;
  total: number;
  present: number;
  percentage: number;
  status: 'CRITICAL' | 'WARNING';
}

interface DepartmentFaculty {
  faculty_id: number;
  faculty_name: string;
  username: string;
  designation: string;
  admin_role: string;
  courses_taught: string[];
  sessions_conducted: number;
  avg_attendance: number;
}

export default function FacultyAttendanceTab() {
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'personal' | 'department' | 'university'>('personal');
  const [kpis, setKpis] = useState<FacultyKPIs | null>(null);
  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [deptFaculty, setDeptFaculty] = useState<DepartmentFaculty[]>([]);
  const [departments, setDepartments] = useState<{id: number; code: string; name: string}[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');

  // Attendance marking modal state
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<FacultyCourse | null>(null);
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, 'PRESENT' | 'ABSENT'>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [sendingWarning, setSendingWarning] = useState<number | null>(null);

  const loadFacultyStats = async (deptFilter?: string) => {
    try {
      setLoading(true);
      const url = deptFilter
        ? `/academics/attendance/faculty_stats/?department=${deptFilter}`
        : '/academics/attendance/faculty_stats/';
      const data = await fetchAPI(url);
      setScope(data.scope || 'personal');
      setKpis(data.kpis);
      setCourses(data.courses || []);
      setRecentSessions(data.recent_sessions || []);
      setAtRiskStudents(data.at_risk_students || []);
      setDeptFaculty(data.department_faculty || []);
      if (data.departments) setDepartments(data.departments);
    } catch (err) {
      console.error('Failed to load faculty attendance stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyStats();
  }, []);

  const handleDeptFilter = (deptCode: string) => {
    setSelectedDept(deptCode);
    loadFacultyStats(deptCode || undefined);
  };

  const openMarkingModal = async (course: FacultyCourse) => {
    setSelectedCourse(course);
    setIsMarkingOpen(true);
    setLoadingStudents(true);
    try {
      // Find course-section students or fetch registrations
      const classRes = await fetchAPI('/academics/course-sections/my_classes/');
      const classes = Array.isArray(classRes) ? classRes : (classRes.results || []);
      const matchedClass = classes.find((c: any) => c.course === course.course_id || c.course_code === course.course_code);

      let studs: any[] = [];
      if (matchedClass) {
        studs = await fetchAPI(`/academics/course-sections/${matchedClass.id}/students/`);
      } else {
        // Fallback to enrollment query
        const allEnr = await fetchAPI('/academics/enrollment/');
        studs = (Array.isArray(allEnr) ? allEnr : (allEnr.results || [])).map((e: any) => ({
          enrollment_id: e.id,
          student_name: e.user ? `${e.user.first_name || ''} ${e.user.last_name || ''}`.trim() || e.user.username : 'Student'
        }));
      }

      setCourseStudents(studs);
      const initial: Record<number, 'PRESENT' | 'ABSENT'> = {};
      studs.forEach((s: any) => {
        initial[s.enrollment_id] = 'PRESENT';
      });
      setAttendanceData(initial);
    } catch (err) {
      console.error('Failed to load students for course', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSetAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<number, 'PRESENT' | 'ABSENT'> = {};
    courseStudents.forEach((s: any) => {
      updated[s.enrollment_id] = status;
    });
    setAttendanceData(updated);
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return;
    setSavingAttendance(true);
    try {
      const payload = Object.keys(attendanceData).map(enrId => ({
        enrollment_id: parseInt(enrId),
        status: attendanceData[parseInt(enrId)]
      }));

      await fetchAPI('/academics/attendance/bulk_mark/', {
        method: 'POST',
        body: JSON.stringify({
          course_id: selectedCourse.course_id,
          date: markingDate,
          students: payload
        })
      });

      alert(`Attendance saved for ${payload.length} students on ${markingDate}!`);
      setIsMarkingOpen(false);
      loadFacultyStats(selectedDept || undefined);
    } catch (err) {
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleNotifyStudent = async (student: AtRiskStudent) => {
    setSendingWarning(student.enrollment_id);
    try {
      await fetchAPI('/academics/attendance/send_warning/', {
        method: 'POST',
        body: JSON.stringify({
          enrollment_id: student.enrollment_id,
          course_code: student.course_code,
          course_name: student.course_name,
          percentage: student.percentage
        })
      });
      setContactSuccess(`Official attendance warning sent to ${student.student_name} (${student.percentage}% in ${student.course_code}).`);
      setTimeout(() => setContactSuccess(null), 5000);
    } catch {
      alert('Failed to send warning notification.');
    } finally {
      setSendingWarning(null);
    }
  };

  const scopeLabel = scope === 'university' ? 'University-Wide' : scope === 'department' ? 'Department Overview' : 'My Classes';
  const scopeIcon = scope === 'university' ? '🏛️' : scope === 'department' ? '🏢' : '📚';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {scopeIcon} {scope === 'department' ? 'Department Attendance Hub' : scope === 'university' ? 'University Attendance Dashboard' : 'Faculty Attendance Hub'}
            </h2>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              scope === 'university' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              scope === 'department' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {scopeLabel}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {scope === 'department'
              ? 'All courses & faculty in your department — lecture conduction audit & at-risk monitoring'
              : scope === 'university'
              ? 'University-wide attendance compliance across all departments'
              : 'Live monitoring, class session logs, and automated eligibility warnings'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Department Filter (Admin only) */}
          {scope === 'university' && departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={e => handleDeptFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          )}
          {courses.length > 0 && scope !== 'university' && (
            <button
              onClick={() => openMarkingModal(courses[0])}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition"
            >
              <span>📝</span>
              <span>Take Attendance</span>
            </button>
          )}
        </div>
      </div>

      {contactSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{contactSuccess}</span>
          </div>
          <button onClick={() => setContactSuccess(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Avg. Rate</span>
            <span className="text-xl">📊</span>
          </div>
          <p className={`text-2xl font-black mt-2 ${(kpis?.overall_avg_percentage || 0) >= 80 ? 'text-emerald-600' : (kpis?.overall_avg_percentage || 0) >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
            {kpis?.overall_avg_percentage ?? 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {scope === 'department' ? 'Across department courses' : scope === 'university' ? 'University-wide average' : 'Across all your classes'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sessions Conducted</span>
            <span className="text-xl">📖</span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">
            {kpis?.total_sessions_conducted ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Lectures marked this semester</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
            <span className="text-xl">👥</span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">
            {kpis?.total_students_enrolled ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {scope === 'department' ? 'In department programs' : scope === 'university' ? 'Total university enrollment' : 'Under your direct instruction'}
          </p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${(kpis?.total_at_risk_students || 0) > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">At-Risk (&lt;75%)</span>
            <span className="text-xl">⚠️</span>
          </div>
          <p className={`text-2xl font-black mt-2 ${(kpis?.total_at_risk_students || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {kpis?.total_at_risk_students ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Need immediate intervention</p>
        </div>
      </div>

      {/* HOD Department Faculty Conduction Table */}
      {scope === 'department' && deptFaculty.length > 0 && (
        <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 bg-indigo-50/70 border-b border-indigo-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-indigo-500 text-lg">👨‍🏫</span>
              <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">
                Department Faculty — Lecture Conduction Audit
              </h3>
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {deptFaculty.length} Faculty Members
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-indigo-50/20 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Faculty Member</th>
                  <th className="px-5 py-3 text-left">Designation</th>
                  <th className="px-5 py-3 text-left">Courses Assigned</th>
                  <th className="px-5 py-3 text-center">Sessions Conducted</th>
                  <th className="px-5 py-3 text-right">Avg. Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {deptFaculty.map((f) => (
                  <tr key={f.faculty_id} className="hover:bg-indigo-50/20 transition">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800">{f.faculty_name}</p>
                      <p className="text-xs text-slate-400">{f.username}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-600">{f.designation}</span>
                      {f.admin_role !== 'None' && (
                        <span className="ml-2 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                          {f.admin_role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {f.courses_taught.length > 0 ? f.courses_taught.map(c => (
                          <span key={c} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            {c}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-400 italic">No courses assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-black ${f.sessions_conducted > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                        {f.sessions_conducted}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-sm font-black ${
                        f.avg_attendance >= 80 ? 'text-emerald-600' :
                        f.avg_attendance >= 75 ? 'text-amber-600' :
                        f.avg_attendance > 0 ? 'text-red-600' : 'text-slate-300'
                      }`}>
                        {f.avg_attendance > 0 ? `${f.avg_attendance}%` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Overview Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {scope === 'department' ? 'Department Courses' : scope === 'university' ? 'All Courses' : 'Your Assigned Courses'}
        </h3>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <div key={course.course_id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-1 rounded-lg">
                    {course.course_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Sem {course.semester} • {course.credits} Credits
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-800 mt-2">{course.course_name}</h4>
                
                {/* Show instructor names for HOD/Admin scope */}
                {(scope === 'department' || scope === 'university') && course.instructors && course.instructors.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">Instructor: {course.instructors.join(', ')}</p>
                )}
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Attendance Average</span>
                    <span className={`font-black ${course.avg_percentage >= 80 ? 'text-emerald-600' : course.avg_percentage >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {course.avg_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${course.avg_percentage >= 80 ? 'bg-emerald-500' : course.avg_percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(course.avg_percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>👥 {course.enrolled_students} Students</span>
                  <span>📅 {course.total_sessions} Sessions</span>
                  {course.at_risk_count > 0 && (
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                      ⚠️ {course.at_risk_count} low
                    </span>
                  )}
                </div>
              </div>

              {scope === 'personal' && (
                <button
                  onClick={() => openMarkingModal(course)}
                  className="mt-5 w-full bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 border border-slate-200 hover:border-blue-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                >
                  <span>📝 Mark Attendance</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Low Attendance At-Risk Alerts Table */}
      <div className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-red-50/70 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">
              {scope === 'department' ? 'Department Attendance Alerts' : scope === 'university' ? 'University Debar Watchlist' : 'Low Attendance Alerts'} (&lt;75% Mandatory Threshold)
            </h3>
          </div>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {atRiskStudents.length} Students At Risk
          </span>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-bold text-slate-700">Excellent Standing!</p>
            <p className="text-xs text-slate-400 mt-1">All enrolled students currently meet or exceed the 75% attendance threshold.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-red-50/20 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Course</th>
                  <th className="px-5 py-3 text-center">Attended / Total</th>
                  <th className="px-5 py-3 text-center">Percentage</th>
                  <th className="px-5 py-3 text-center">Severity</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {atRiskStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20 transition">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800">{s.student_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.enrollment_number}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-sm text-slate-700">{s.course_code}</span>
                      <p className="text-xs text-slate-400">{s.course_name}</p>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                      {s.present} / {s.total}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-black text-red-600">{s.percentage}%</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${s.status === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleNotifyStudent(s)}
                        disabled={sendingWarning === s.enrollment_id}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
                      >
                        {sendingWarning === s.enrollment_id ? 'Sending...' : 'Send Notice'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Sessions History</h3>
          <span className="text-xs text-slate-400 font-medium">Last 10 Conducted Lectures</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-5 py-3 text-left">Course</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-center">Present</th>
                <th className="px-5 py-3 text-center">Absent</th>
                <th className="px-5 py-3 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSessions.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">{row.course_code} - {row.course_name}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{row.date}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                      {row.present}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">
                      {row.absent}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-sm font-black ${row.percentage >= 85 ? 'text-emerald-600' : row.percentage >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {row.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Attendance Marking Modal */}
      {isMarkingOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Mark Attendance: {selectedCourse.course_code}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCourse.course_name}</p>
              </div>
              <button
                onClick={() => setIsMarkingOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-600">Lecture Date:</label>
                <input
                  type="date"
                  value={markingDate}
                  onChange={e => setMarkingDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSetAll('PRESENT')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAll('ABSENT')}
                  className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  All Absent
                </button>
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {loadingStudents ? (
                <p className="text-center text-xs text-slate-400 py-8">Loading class roll...</p>
              ) : courseStudents.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">No registered students found for this course.</p>
              ) : (
                courseStudents.map((stud) => {
                  const status = attendanceData[stud.enrollment_id] || 'PRESENT';
                  return (
                    <div
                      key={stud.enrollment_id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/60 transition"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">{stud.student_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">ID #{stud.enrollment_id}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setAttendanceData(prev => ({ ...prev, [stud.enrollment_id]: 'PRESENT' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceData(prev => ({ ...prev, [stud.enrollment_id]: 'ABSENT' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${status === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsMarkingOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingAttendance || courseStudents.length === 0}
                onClick={submitAttendance}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
              >
                <span>{savingAttendance ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
