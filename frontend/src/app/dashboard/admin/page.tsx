'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import React from 'react';
import './dashboard-theme.css';
import UnifiedSidebar from './components/UnifiedSidebar';
import TopBar from './components/TopBar';
import DashboardOverview from './components/DashboardOverview';
import FacultyTab from './components/FacultyTab';
import AdmissionsTab from './components/AdmissionsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [activeRole, setActiveRole] = useState('Administrator');
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [interviewDates, setInterviewDates] = useState<{ [key: number]: string }>({});
  const [allocationForms, setAllocationForms] = useState<{ [key: number]: { allocated_department: string; allocated_program: string; allocated_batch: string } }>({});
  const [feeVerifications, setFeeVerifications] = useState<{ [key: number]: string }>({});
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', previous_school_name: '', previous_marks_percentage: '' });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);

  // Academics state
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{ [key: number]: string }>({});

  // Leaves, Results, Enrollments
  const [leaves, setLeaves] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // New module states
  const [fees, setFees] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [revaluations, setRevaluations] = useState<any[]>([]);

  const [feeForm, setFeeForm] = useState({ enrollment: '', semester: '', amount: '', due_date: '' });
  const [ttForm, setTtForm] = useState({ course: '', day: 'MON', start_time: '09:00', end_time: '10:00', room: '' });
  const [gradeEntries, setGradeEntries] = useState<{ [key: number]: { marks: string, grade: string } }>({});

  const refreshData = () => {
    fetchAPI('/admission/applications/').then(data => setApplications(data)).catch(() => { });
    fetchAPI('/academics/departments/').then(data => setDepartments(data)).catch(() => { });
    fetchAPI('/academics/programs/').then(data => setPrograms(data)).catch(() => { });
    fetchAPI('/academics/courses/').then(data => setCourses(data)).catch(() => { });
    fetchAPI('/academics/registrations/').then(data => setRegistrations(data)).catch(() => { });
    fetchAPI('/academics/leaves/').then(data => setLeaves(data)).catch(() => { });
    fetchAPI('/academics/results/').then(data => setResults(data)).catch(() => { });
    fetchAPI('/academics/enrollment/').then(data => setEnrollments(data)).catch(() => { });
    fetchAPI('/academics/fees/').then(data => setFees(data)).catch(() => { });
    fetchAPI('/academics/timetable/').then(data => setTimetable(data)).catch(() => { });
    fetchAPI('/academics/transfers/').then(data => setTransfers(data)).catch(() => { });
    fetchAPI('/academics/revaluations/').then(data => setRevaluations(data)).catch(() => { });
  };

  useEffect(() => {
    refreshData();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        setDarkMode(u.dark_mode || false);
        const isAdminUser = u.is_staff || u.all_roles?.includes('ADMIN');
        setActiveRole(isAdminUser ? 'Administrator' : 'Faculty');

        // Fetch faculty profile for topbar details if faculty
        if (u.role === 'FACULTY' || u.all_roles?.includes('FACULTY')) {
          fetchAPI(`/academics/faculty-profiles/?user=${u.id}`).then(data => {
            if (data && data.length > 0) setFacultyProfile(data[0]);
          }).catch(() => { });
        }
      } catch { }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const allRoles = currentUser?.all_roles || [];
  const isAdmin = currentUser?.is_staff || allRoles.includes('ADMIN');

  const updateStatus = async (id: number, status: string) => {
    try {
      const application = await fetchAPI(`/admission/applications/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setApplications(apps => apps.map(app => app.id === id ? application : app));
    } catch { alert("Failed to update status"); }
  };

  const scheduleInterview = async (id: number) => {
    const interview_date = interviewDates[id];
    if (!interview_date) return alert('Choose an interview date and time first.');
    try {
      const application = await fetchAPI(`/admission/applications/${id}/`, { method: 'PATCH', body: JSON.stringify({ status: 'INTERVIEW_SCHEDULED', interview_date }) });
      setApplications(apps => apps.map(app => app.id === id ? application : app));
    } catch { alert('Failed to schedule interview'); }
  };

  const allocateSeat = async (id: number) => {
    const form = allocationForms[id];
    if (!form?.allocated_department || !form.allocated_program || !form.allocated_batch) return alert('Enter department, program, and batch.');
    try {
      await fetchAPI('/admission/allocations/', { method: 'POST', body: JSON.stringify({ application: id, ...form }) });
      refreshData();
    } catch { alert('Seat allocation failed. The application must first be selected.'); }
  };

  const verifyFeePayment = async (appId: number) => {
    if (feeVerifications[appId]?.toLowerCase() !== 'yes') {
      return alert("Please type 'yes' to confirm fee payment.");
    }
    try {
      await fetchAPI(`/admission/applications/${appId}/pay_fees/`, { method: 'POST' });
      alert("Fee payment verified. Student enrolled!");
      refreshData();
    } catch {
      alert("Failed to verify fee payment.");
    }
  };

  const createOfflineApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await fetchAPI('/admission/applications/create_offline/', {
        method: 'POST', body: JSON.stringify({
          user: { username: offlineForm.username, email: offlineForm.email, password: offlineForm.password, first_name: offlineForm.first_name, last_name: offlineForm.last_name, phone: offlineForm.phone },
          profile: { phone: offlineForm.phone },
          application: { previous_school_name: offlineForm.previous_school_name, previous_marks_percentage: offlineForm.previous_marks_percentage || null },
        }),
      });
      setOfflineForm({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', previous_school_name: '', previous_marks_percentage: '' });
      setShowOfflineForm(false); refreshData(); alert('Offline application created.');
    } catch { alert('Could not create the offline application. Check that username and email are unique.'); }
  };

  const verifyDocument = async (appId: number, docId: number, status: string) => {
    try {
      await fetchAPI(`/admission/documents/${docId}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setApplications(apps => apps.map(app => {
        if (app.id === appId) {
          return { ...app, documents: app.documents.map((d: any) => d.id === docId ? { ...d, status } : d) };
        }
        return app;
      }));
    } catch { alert("Failed to update doc"); }
  };

  const approveScholarship = async (appId: number, scholarshipId: number, concession: number) => {
    try {
      await fetchAPI(`/admission/scholarships/${scholarshipId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED', concession_percentage: concession })
      });
      setApplications(apps => apps.map(app => {
        if (app.id === appId) {
          return { ...app, scholarship: { ...app.scholarship, status: 'APPROVED', concession_percentage: concession } };
        }
        return app;
      }));
    } catch { alert("Failed to approve scholarship"); }
  };

  const getStudentsForCourse = (courseId: number) => {
    return registrations.filter(r => r.courses.includes(courseId)).map(r => r.enrollment);
  };

  const handleAttendanceChange = (enrollmentId: number, status: string) => {
    setAttendanceData(prev => ({ ...prev, [enrollmentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return;
    const studentsPayload = Object.keys(attendanceData).map(enrId => ({
      enrollment_id: parseInt(enrId),
      status: attendanceData[parseInt(enrId)]
    }));
    try {
      await fetchAPI('/academics/attendance/bulk_mark/', {
        method: 'POST',
        body: JSON.stringify({ course_id: selectedCourse.id, date: attendanceDate, students: studentsPayload })
      });
      alert('Attendance saved successfully!');
    } catch { alert('Failed to save attendance'); }
  };

  const handleGradeChange = (enrollmentId: number, field: string, value: string) => {
    setGradeEntries(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value }
    }));
  };

  const submitGrades = async () => {
    if (!selectedCourse) return;
    let count = 0;
    for (const [enrId, entry] of Object.entries(gradeEntries)) {
      if (!entry.marks || !entry.grade) continue;
      try {
        await fetchAPI('/academics/results/', {
          method: 'POST',
          body: JSON.stringify({
            enrollment: parseInt(enrId),
            course: selectedCourse.id,
            marks_obtained: parseFloat(entry.marks),
            grade: entry.grade,
            is_backlog: false,
            is_revaluation: false
          })
        });
        count++;
      } catch { /* skip duplicates */ }
    }
    alert(`Grades submitted for ${count} students!`);
    setGradeEntries({});
  };

  const updateLeaveStatus = async (leaveId: number, status: string) => {
    try {
      await fetchAPI(`/academics/leaves/${leaveId}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l));
    } catch { alert("Failed to update leave status"); }
  };

  const updateTransferStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(`/academics/transfers/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setTransfers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch { alert("Failed to update"); }
  };

  const updateRevalStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(`/academics/revaluations/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setRevaluations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { alert("Failed to update"); }
  };

  const createFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/academics/fees/', {
        method: 'POST',
        body: JSON.stringify({
          enrollment: parseInt(feeForm.enrollment),
          semester: parseInt(feeForm.semester),
          amount: parseFloat(feeForm.amount),
          due_date: feeForm.due_date
        })
      });
      alert('Fee created!');
      setFeeForm({ enrollment: '', semester: '', amount: '', due_date: '' });
      refreshData();
    } catch { alert('Failed to create fee'); }
  };

  const createTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/academics/timetable/', {
        method: 'POST',
        body: JSON.stringify({
          course: parseInt(ttForm.course),
          day: ttForm.day,
          start_time: ttForm.start_time,
          end_time: ttForm.end_time,
          room: ttForm.room
        })
      });
      alert('Timetable slot created!');
      setTtForm({ course: '', day: 'MON', start_time: '09:00', end_time: '10:00', room: '' });
      refreshData();
    } catch { alert('Failed to create slot'); }
  };


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden theme-transition font-sans">
      <UnifiedSidebar
        activeSection={activeTab}
        setActiveSection={setActiveTab}
        user={currentUser}
        isAdmin={isAdmin}
        facultyProfile={facultyProfile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={currentUser}
          isAdmin={isAdmin}
          facultyProfile={facultyProfile}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">

            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && (
              <DashboardOverview
                enrollments={enrollments}
                applications={applications}
                programs={programs}
                departments={departments}
                courses={courses}
                leaves={leaves}
                fees={fees}
                isAdmin={isAdmin}
                facultyProfile={facultyProfile}
              />
            )}

            {/* ─── FACULTY TAB ─── */}
            {activeTab === 'faculty' && (
              <FacultyTab isAdmin={isAdmin} departments={departments} />
            )}

            {/* ─── ADMISSIONS TAB ─── */}
            {activeTab === 'admissions' && (
              <AdmissionsTab
                isAdmin={isAdmin}
                applications={applications}
                departments={departments}
                programs={programs}
                offlineForm={offlineForm}
                setOfflineForm={setOfflineForm}
                createOfflineApplication={createOfflineApplication}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                updateStatus={updateStatus}
                allocationForms={allocationForms}
                setAllocationForms={setAllocationForms}
                allocateSeat={allocateSeat}
                feeVerifications={feeVerifications}
                setFeeVerifications={setFeeVerifications}
                verifyFeePayment={verifyFeePayment}
                showOfflineForm={showOfflineForm}
              />
            )}

            {/* ─── ATTENDANCE TAB ─── */}
            {activeTab === 'academics' && (
              <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course</label>
                    <select className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none focus:border-cyan-500"
                      onChange={e => { const cId = parseInt(e.target.value); setSelectedCourse(courses.find(c => c.id === cId)); }}>
                      <option value="">-- Choose --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                    <input type="date" className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none focus:border-cyan-500" style={{ colorScheme: 'light' }}
                      value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                  </div>
                </div>
                {selectedCourse ? (
                  <>
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase">Enrollment</th>
                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                            <tr><td colSpan={2} className="px-8 py-12 text-center text-slate-400">No students.</td></tr>
                          ) : getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                            <tr key={enrId} className="hover:bg-white/30 transition">
                              <td className="px-8 py-4 text-sm font-bold font-mono text-slate-700">ENR-{enrId}</td>
                              <td className="px-8 py-4 text-right">
                                <div className="inline-flex space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                  <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition ${attendanceData[enrId] === 'PRESENT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-400 border border-transparent'}`}>
                                    <input type="radio" className="hidden" name={`s-${enrId}`} checked={attendanceData[enrId] === 'PRESENT'} onChange={() => handleAttendanceChange(enrId, 'PRESENT')} /> Present
                                  </label>
                                  <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition ${attendanceData[enrId] === 'ABSENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 border border-transparent'}`}>
                                    <input type="radio" className="hidden" name={`s-${enrId}`} checked={attendanceData[enrId] === 'ABSENT'} onChange={() => handleAttendanceChange(enrId, 'ABSENT')} /> Absent
                                  </label>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button onClick={submitAttendance} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-900 px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">Save Attendance</button>
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">Select a course above</div>
                )}
              </div>
            )}

            {/* ─── GRADE ENTRY TAB ─── */}
            {activeTab === 'grade_entry' && (
              <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Course Grade Entry</h2>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Course</label>
                  <select className="w-full max-w-md bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none"
                    value={selectedCourse?.id || ''} onChange={e => setSelectedCourse(courses.find(c => c.id === parseInt(e.target.value)) || null)}>
                    <option value="">-- Select --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>

                {selectedCourse ? (
                  <>
                    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden">
                      <table className="min-w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                          <tr>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment ID</th>
                            <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Marks (out of 100)</th>
                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                            <tr><td colSpan={3} className="px-8 py-12 text-center text-slate-400">No students.</td></tr>
                          ) : getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                            <tr key={enrId} className="hover:bg-white/30 transition">
                              <td className="px-8 py-4 text-sm font-bold font-mono text-slate-700">ENR-{enrId}</td>
                              <td className="px-8 py-4 text-center">
                                <input type="number" min="0" max="100" placeholder="Marks"
                                  className="w-24 bg-white border border-slate-300 text-slate-900 p-2 rounded-lg text-center outline-none focus:border-purple-500"
                                  value={gradeEntries[enrId]?.marks || ''}
                                  onChange={e => handleGradeChange(enrId, 'marks', e.target.value)} />
                              </td>
                              <td className="px-8 py-4 text-right">
                                <select className="bg-white border border-slate-300 text-slate-900 p-2 rounded-lg outline-none focus:border-purple-500"
                                  value={gradeEntries[enrId]?.grade || ''}
                                  onChange={e => handleGradeChange(enrId, 'grade', e.target.value)}>
                                  <option value="">--</option>
                                  {['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button onClick={submitGrades} className="bg-gradient-to-r from-purple-600 to-pink-600 text-slate-900 px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">Submit Grades</button>
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">Select a course above</div>
                )}
              </div>
            )}

            {/* ─── LEAVES TAB ─── */}
            {activeTab === 'leaves' && (
              <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Pending Leave Requests</h2>
                  <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">{leaves.filter(l => l.status === 'PENDING').length} pending</span>
                </div>
                {leaves.length > 0 ? (
                  <div className="space-y-3">
                    {leaves.map((l: any) => (
                      <div key={l.id} className="bg-slate-50/50 p-5 border border-slate-200 rounded-2xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm font-bold text-slate-700">ENR-{l.enrollment}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${l.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                l.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>{l.status}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-1">📅 {l.start_date} → {l.end_date}</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-slate-300 mt-2">"{l.reason}"</p>
                          </div>
                          {l.status === 'PENDING' && (
                            <div className="flex space-x-2 ml-4">
                              <button onClick={() => updateLeaveStatus(l.id, 'APPROVED')} disabled={!isAdmin} className={`bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600/30'}`}>Approve</button>
                              <button onClick={() => updateLeaveStatus(l.id, 'REJECTED')} disabled={!isAdmin} className={`bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600/30'}`}>Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 italic text-center py-12">No leave requests found.</p>}
              </div>
            )}

            {/* ─── STUDENTS TAB ─── */}
            {activeTab === 'students' && (
              <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrollment #</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fee Paid</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Date</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No enrollments found.</td></tr>
                    ) : enrollments.map((e: any) => (
                      <React.Fragment key={e.id}>
                        <tr className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setExpandedRow(expandedRow === e.id ? null : e.id)}>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-cyan-500">{e.enrollment_number}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">UID-{e.user} <span className="text-xs text-slate-400 ml-2">(Click to view profile)</span></td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${e.fee_paid ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              {e.fee_paid ? 'PAID' : 'UNPAID'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(e.enrolled_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right text-xs text-slate-400">{expandedRow === e.id ? 'Close' : 'View'}</td>
                        </tr>
                        {expandedRow === e.id && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={5} className="px-8 py-6 border-b border-slate-200">
                              {(() => {
                                // Find corresponding application to show profile details
                                const studentApp = applications.find(a => a.enrollment_number === e.enrollment_number);
                                return studentApp ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                      <h4 className="font-bold text-slate-900 text-sm mb-4">Profile Details</h4>
                                      <div className="space-y-2">
                                        <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Username:</span> <span className="text-slate-800">{studentApp.profile_details?.username}</span></p>
                                        <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Email:</span> <span className="text-slate-800">{studentApp.profile_details?.email || 'N/A'}</span></p>
                                        <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Phone:</span> <span className="text-slate-800">{studentApp.profile_details?.phone || 'N/A'}</span></p>
                                        <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Entry Type:</span> <span className="text-slate-800">{studentApp.entry_type}</span></p>
                                      </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                      <h4 className="font-bold text-slate-900 text-sm mb-4">Academic & Seat Info</h4>
                                      <div className="space-y-2">
                                        {studentApp.seat_allocation ? (
                                          <>
                                            <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Department:</span> <span className="text-slate-800">{studentApp.seat_allocation.allocated_department}</span></p>
                                            <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Program:</span> <span className="text-slate-800">{studentApp.seat_allocation.allocated_program}</span></p>
                                            <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Batch:</span> <span className="text-slate-800">{studentApp.seat_allocation.allocated_batch}</span></p>
                                          </>
                                        ) : (
                                          <p className="text-sm text-slate-400 italic">No seat allocated yet.</p>
                                        )}
                                        <div className="border-t border-slate-100 my-2 pt-2"></div>
                                        <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">10th %:</span> <span className="text-slate-800">{studentApp.tenth_percentage || 'N/A'}%</span></p>
                                        <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">12th %:</span> <span className="text-slate-800">{studentApp.twelfth_percentage || 'N/A'}%</span></p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">No application details found for this enrollment.</p>
                                );
                              })()}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ─── FEE MANAGEMENT ─── */}
            {activeTab === 'fees' && (
              <div className="space-y-8">
                <form onSubmit={createFee} className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Create Fee Record</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enrollment ID</label>
                      <select className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none"
                        value={feeForm.enrollment} onChange={e => setFeeForm({ ...feeForm, enrollment: e.target.value })}>
                        <option value="">-- Select --</option>
                        {enrollments.map((e: any) => <option key={e.id} value={e.id}>{e.enrollment_number}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Semester</label>
                      <input type="number" min="1" max="8" required className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none"
                        value={feeForm.semester} onChange={e => setFeeForm({ ...feeForm, semester: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                      <input type="number" required className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none"
                        value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                      <input type="date" required className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none" style={{ colorScheme: 'light' }}
                        value={feeForm.due_date} onChange={e => setFeeForm({ ...feeForm, due_date: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" disabled={!isAdmin} className={`bg-gradient-to-r from-purple-600 to-pink-600 text-slate-900 px-6 py-3 rounded-xl font-bold transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>Create Fee</button>
                </form>
                <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Enrollment</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Semester</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Due Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fees.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No fee records.</td></tr>
                      ) : fees.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm font-mono text-cyan-400">ENR-{f.enrollment}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{f.semester}</td>
                          <td className="px-6 py-4 text-sm text-slate-900">₹{parseFloat(f.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{f.due_date}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${f.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              f.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>{f.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TIMETABLE ─── */}
            {activeTab === 'timetable' && (
              <div className="space-y-8">
                <form onSubmit={createTimetableSlot} className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Add Timetable Slot</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course</label>
                      <select required className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none"
                        value={ttForm.course} onChange={e => setTtForm({ ...ttForm, course: e.target.value })}>
                        <option value="">-- Select --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day</label>
                      <select className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none"
                        value={ttForm.day} onChange={e => setTtForm({ ...ttForm, day: e.target.value })}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                      <input type="time" required className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none" style={{ colorScheme: 'light' }}
                        value={ttForm.start_time} onChange={e => setTtForm({ ...ttForm, start_time: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                      <input type="time" required className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none" style={{ colorScheme: 'light' }}
                        value={ttForm.end_time} onChange={e => setTtForm({ ...ttForm, end_time: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Room</label>
                      <input type="text" placeholder="e.g. LH-301" className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none placeholder-slate-500"
                        value={ttForm.room} onChange={e => setTtForm({ ...ttForm, room: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" disabled={!isAdmin} className={`bg-gradient-to-r from-pink-600 to-purple-600 text-slate-900 px-6 py-3 rounded-xl font-bold transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>Add Slot</button>
                </form>
                <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Course</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Day</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Time</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timetable.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No timetable slots.</td></tr>
                      ) : timetable.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm"><span className="font-bold text-cyan-400">{t.course_code}</span> <span className="text-slate-400">- {t.course_name}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-700">{t.day}</td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-900">{t.start_time?.slice(0, 5)} - {t.end_time?.slice(0, 5)}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{t.room || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TRANSFERS ─── */}
            {activeTab === 'transfers' && (
              <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8">
                {transfers.length > 0 ? (
                  <div className="space-y-3">
                    {transfers.map((t: any) => (
                      <div key={t.id} className="bg-slate-50/50 p-5 border border-slate-200 rounded-2xl flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm font-bold text-slate-700">ENR-{t.enrollment}</span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs text-slate-400">{t.request_type.replace('_', ' ')}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              t.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>{t.status}</span>
                          </div>
                          <p className="text-sm text-slate-700">{t.reason}</p>
                        </div>
                        {t.status === 'PENDING' && (
                          <div className="flex space-x-2 ml-4">
                            <button onClick={() => updateTransferStatus(t.id, 'APPROVED')} disabled={!isAdmin} className={`bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600/30'}`}>Approve</button>
                            <button onClick={() => updateTransferStatus(t.id, 'REJECTED')} disabled={!isAdmin} className={`bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600/30'}`}>Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 italic text-center py-12">No transfer/exit requests.</p>}
              </div>
            )}

            {/* ─── REVALUATIONS ─── */}
            {activeTab === 'revaluations' && (
              <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8">
                {revaluations.length > 0 ? (
                  <div className="space-y-3">
                    {revaluations.map((r: any) => (
                      <div key={r.id} className="bg-slate-50/50 p-5 border border-slate-200 rounded-2xl flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-bold text-slate-900">{r.course_code}</span>
                            <span className="text-xs text-slate-400">Original: {r.original_grade} ({r.original_marks})</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              r.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>{r.status}</span>
                          </div>
                          <p className="text-sm text-slate-700">{r.reason}</p>
                        </div>
                        {r.status === 'PENDING' && (
                          <div className="flex space-x-2 ml-4">
                            <button onClick={() => updateRevalStatus(r.id, 'APPROVED')} disabled={!isAdmin} className={`bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600/30'}`}>Approve</button>
                            <button onClick={() => updateRevalStatus(r.id, 'REJECTED')} disabled={!isAdmin} className={`bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 transition ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600/30'}`}>Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 italic text-center py-12">No revaluation requests.</p>}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
