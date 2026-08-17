'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import React from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [interviewDates, setInterviewDates] = useState<{[key: number]: string}>({});
  const [allocationForms, setAllocationForms] = useState<{[key: number]: { allocated_department: string; allocated_program: string; allocated_batch: string }}>({});
  const [feeVerifications, setFeeVerifications] = useState<{[key: number]: string}>({});
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', previous_school_name: '', previous_marks_percentage: '' });

  // Academics state
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{[key: number]: string}>({});

  // Leaves, Results, Enrollments
  const [leaves, setLeaves] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // New module states
  const [fees, setFees] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [revaluations, setRevaluations] = useState<any[]>([]);

  // Forms
  const [feeForm, setFeeForm] = useState({ enrollment: '', semester: '', amount: '', due_date: '' });
  const [ttForm, setTtForm] = useState({ course: '', day: 'MON', start_time: '09:00', end_time: '10:00', room: '' });

  const refreshData = () => {
    fetchAPI('/admission/applications/').then(data => setApplications(data)).catch(() => {});
    fetchAPI('/academics/departments/').then(data => setDepartments(data)).catch(() => {});
    fetchAPI('/academics/programs/').then(data => setPrograms(data)).catch(() => {});
    fetchAPI('/academics/courses/').then(data => setCourses(data)).catch(() => {});
    fetchAPI('/academics/registrations/').then(data => setRegistrations(data)).catch(() => {});
    fetchAPI('/academics/leaves/').then(data => setLeaves(data)).catch(() => {});
    fetchAPI('/academics/results/').then(data => setResults(data)).catch(() => {});
    fetchAPI('/academics/enrollment/').then(data => setEnrollments(data)).catch(() => {});
    fetchAPI('/academics/fees/').then(data => setFees(data)).catch(() => {});
    fetchAPI('/academics/timetable/').then(data => setTimetable(data)).catch(() => {});
    fetchAPI('/academics/transfers/').then(data => setTransfers(data)).catch(() => {});
    fetchAPI('/academics/revaluations/').then(data => setRevaluations(data)).catch(() => {});
  };

  useEffect(() => { refreshData(); }, []);

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
          return { ...app, documents: app.documents.map((d:any) => d.id === docId ? { ...d, status } : d) };
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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '🌍', color: 'blue' },
    { id: 'admissions', label: 'Admissions', icon: '📋', color: 'cyan' },
    { id: 'academics', label: 'Attendance', icon: '📊', color: 'yellow' },
    { id: 'leaves', label: 'Leave Requests', icon: '🗓', color: 'orange' },
    { id: 'students', label: 'Students Directory', icon: '🎓', color: 'emerald' },
    { id: 'fees', label: 'Fee Management', icon: '💳', color: 'purple' },
    { id: 'timetable', label: 'Timetable', icon: '📅', color: 'pink' },
    { id: 'transfers', label: 'Transfer / Exit', icon: '🚪', color: 'red' },
    { id: 'revaluations', label: 'Revaluations', icon: '📝', color: 'blue' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
    yellow: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-600/20 text-pink-400 border-pink-500/30',
    red: 'bg-red-600/20 text-red-400 border-red-500/30',
    orange: 'bg-orange-600/20 text-orange-400 border-orange-500/30',
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Command Center</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === item.id ? `${colorMap[item.color]} border` : 'hover:bg-slate-50 text-slate-400 hover:text-slate-900 border border-transparent'
              }`}>
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h1>
              <p className="text-slate-500 font-medium mt-1">Manage university operations, applications, and student lifecycles.</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all">Generate Report</button>
            </div>
          </div>
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-bold">🎓</div>
                    <span className="text-sm font-bold text-slate-400">Total</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Enrolled Students</h3>
                  <p className="text-3xl font-black text-slate-900">{enrollments.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold">📋</div>
                    <span className="text-sm font-bold text-slate-400">Pending</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Applications</h3>
                  <p className="text-3xl font-black text-slate-900">{applications.filter(a => a.status === 'SUBMITTED' || a.status === 'INTERVIEW_PASSED').length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 text-xl font-bold">💳</div>
                    <span className="text-sm font-bold text-slate-400">Action Req</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Pending Fees</h3>
                  <p className="text-3xl font-black text-slate-900">{applications.filter(a => a.status === 'FEE_PENDING').length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-xl font-bold">🏢</div>
                    <span className="text-sm font-bold text-slate-400">Active</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Programs</h3>
                  <p className="text-3xl font-black text-slate-900">{programs.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts & Deadlines */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 text-sm">🔔</span>
                    Alerts & Action Items
                  </h3>
                  <div className="space-y-4">
                    {leaves.filter(l => l.status === 'PENDING').length > 0 && (
                      <div className="flex items-start bg-orange-50 p-4 rounded-2xl border border-orange-100">
                        <div className="text-orange-500 mr-3 text-xl">🗓</div>
                        <div>
                          <p className="text-sm font-bold text-orange-900">Pending Leave Requests</p>
                          <p className="text-xs text-orange-700 mt-1">There are {leaves.filter(l => l.status === 'PENDING').length} unapproved student leave requests waiting for your review.</p>
                        </div>
                      </div>
                    )}
                    {applications.filter(a => a.status === 'FEE_PENDING').length > 0 && (
                      <div className="flex items-start bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="text-blue-500 mr-3 text-xl">💳</div>
                        <div>
                          <p className="text-sm font-bold text-blue-900">Fee Verifications Needed</p>
                          <p className="text-xs text-blue-700 mt-1">There are {applications.filter(a => a.status === 'FEE_PENDING').length} applicants waiting for fee payment verification before enrollment.</p>
                        </div>
                      </div>
                    )}
                    {applications.filter(a => a.status === 'SUBMITTED').length > 0 && (
                      <div className="flex items-start bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                        <div className="text-cyan-500 mr-3 text-xl">📋</div>
                        <div>
                          <p className="text-sm font-bold text-cyan-900">New Applications</p>
                          <p className="text-xs text-cyan-700 mt-1">{applications.filter(a => a.status === 'SUBMITTED').length} new applications need to be reviewed and scheduled for interviews.</p>
                        </div>
                      </div>
                    )}
                    
                    {leaves.filter(l => l.status === 'PENDING').length === 0 && applications.filter(a => a.status === 'FEE_PENDING' || a.status === 'SUBMITTED').length === 0 && (
                      <p className="text-slate-500 text-sm italic text-center py-6">You're all caught up! No pending action items.</p>
                    )}
                  </div>
                </div>

                {/* University Data Snapshot */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">📊</span>
                    University Snapshot
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-bold text-slate-700">Admissions Conversion Rate</p>
                        <p className="text-xs font-bold text-indigo-600">{applications.length > 0 ? Math.round((enrollments.length / applications.length) * 100) : 0}%</p>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${applications.length > 0 ? (enrollments.length / applications.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3">Active Departments</p>
                      <div className="flex flex-wrap gap-2">
                        {departments.map(d => (
                          <span key={d.id} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">{d.name}</span>
                        ))}
                        {departments.length === 0 && <span className="text-xs text-slate-400 italic">No departments loaded</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ADMISSIONS TAB ─── */}
          {activeTab === 'admissions' && (
            <>
            {showOfflineForm && <form onSubmit={createOfflineApplication} className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-6 grid md:grid-cols-3 gap-4">
              <h2 className="md:col-span-3 font-bold text-lg">Create offline application</h2>
              {[['first_name', 'First name'], ['last_name', 'Last name'], ['username', 'Username'], ['email', 'Email'], ['phone', 'Phone'], ['previous_school_name', 'Previous school / college'], ['previous_marks_percentage', 'Previous marks %']].map(([name, label]) => <label key={name} className="text-xs font-bold text-slate-400 uppercase">{label}<input required={name !== 'phone' && name !== 'previous_marks_percentage'} type={name === 'email' ? 'email' : name === 'previous_marks_percentage' ? 'number' : 'text'} min={name === 'previous_marks_percentage' ? 0 : undefined} max={name === 'previous_marks_percentage' ? 100 : undefined} value={offlineForm[name as keyof typeof offlineForm]} onChange={e => setOfflineForm(prev => ({ ...prev, [name]: e.target.value }))} className="mt-1.5 block w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-100" /></label>)}
              <label className="text-xs font-bold text-slate-400 uppercase">Temporary password<input required type="password" value={offlineForm.password} onChange={e => setOfflineForm(prev => ({ ...prev, password: e.target.value }))} className="mt-1.5 block w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-100" /></label>
              <div className="md:col-span-3"><button className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-bold">Create applicant and application</button></div>
            </form>}
            <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Entry</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.filter(a => !['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No applications ready for allocation.</td></tr>
                  ) : applications.filter(a => !['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).map(app => (
                    <React.Fragment key={app.id}>
                      <tr className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4">
                          <button onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)} className="flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition">
                            <svg className={`w-4 h-4 mr-2 transition-transform ${expandedRow === app.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            {expandedRow === app.id ? 'Close' : 'Expand'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900"><div>{app.profile_details?.username || `Applicant #${app.id}`}</div><div className="text-xs text-slate-400">{app.application_number || 'Not submitted'}</div></td>
                        <td className="px-6 py-4 text-sm"><span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 text-xs">{app.entry_type}</span></td>
                        <td className="px-6 py-4 text-sm">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                            app.status === 'SELECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${app.status === 'SELECTED' ? 'bg-green-400' : app.status === 'REJECTED' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                            {app.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => updateStatus(app.id, 'SELECTED')} className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30">Approve</button>
                          <button onClick={() => updateStatus(app.id, 'REJECTED')} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30">Reject</button>
                        </td>
                      </tr>
                      {expandedRow === app.id && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={5} className="px-8 py-6 border-b border-slate-200">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                              {/* Academic Profile & Interview Notes */}
                              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-slate-900 text-sm">🎓 Applicant Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">10th Grade</p>
                                    <p className="text-sm font-medium text-slate-700">{app.tenth_board} ({app.tenth_passing_year})</p>
                                    <p className="text-lg font-black text-slate-900 mt-1">{app.tenth_percentage}%</p>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">12th Grade</p>
                                    <p className="text-sm font-medium text-slate-700">{app.twelfth_board} ({app.twelfth_passing_year})</p>
                                    <p className="text-lg font-black text-slate-900 mt-1">{app.twelfth_percentage}%</p>
                                  </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Interview Notes</p>
                                  <p className="text-sm text-slate-700">{app.interviewer_notes || 'No notes provided by interviewer.'}</p>
                                </div>
                              </div>

                              {/* Documents */}
                              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-4 text-sm">📄 Documents Verification</h4>
                                {app.documents?.length > 0 ? (
                                  <div className="space-y-3">
                                    {app.documents.map((doc: any) => (
                                      <div key={doc.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                          <span className="block font-bold text-sm text-slate-800 mb-1">{doc.document_name}</span>
                                          <div className="flex items-center space-x-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : doc.status === 'FORGED' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>{doc.status}</span>
                                            <a href={`http://localhost:8000${doc.file}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">View File ↗</a>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-sm text-slate-500 italic">No documents uploaded.</p>}
                              </div>

                              {/* Seat Allocation */}
                              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-slate-900 text-sm">🏛 Seat Allocation</h4>
                                <p className="text-xs text-slate-500">{app.profile_details?.email} · {app.profile_details?.phone || 'No phone supplied'}</p>
                                <div className="grid grid-cols-3 gap-2">
                                  <select value={allocationForms[app.id]?.allocated_department || ''} onChange={e => setAllocationForms(prev => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_department: e.target.value } }))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500">
                                    <option value="">-- Select Department --</option>
                                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                  </select>
                                  <select value={allocationForms[app.id]?.allocated_program || ''} onChange={e => setAllocationForms(prev => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_program: e.target.value } }))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500">
                                    <option value="">-- Select Program --</option>
                                    {programs.filter(p => !allocationForms[app.id]?.allocated_department || p.department_name === allocationForms[app.id].allocated_department || departments.find(d => d.name === allocationForms[app.id].allocated_department)?.id === p.department).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                  </select>
                                  <input placeholder="Batch (e.g. 2024-2028)" value={allocationForms[app.id]?.allocated_batch || ''} onChange={e => setAllocationForms(prev => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_batch: e.target.value } }))} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500" />
                                </div>
                                <button onClick={() => allocateSeat(app.id)} disabled={app.status !== 'SELECTED'} className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-xs font-bold border border-purple-200 transition disabled:opacity-40">Allocate seat (selected applications only)</button>
                                {app.seat_allocation && <p className="text-xs text-emerald-600 font-bold">Allocated: {app.seat_allocation.allocated_program}, {app.seat_allocation.allocated_department} — {app.seat_allocation.allocated_batch}</p>}
                              </div>

                              {/* Fee Payment Verification */}
                              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-slate-900 text-sm">💳 Fee Payment & Enrollment</h4>
                                {app.status === 'FEE_PENDING' || app.status === 'ENROLLED' ? (
                                  <>
                                    <p className="text-xs text-slate-500">Verify documents and manually approve fee payment to generate an enrollment number.</p>
                                    <div className="flex gap-2">
                                      <input 
                                        placeholder="Type 'yes' to verify" 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={feeVerifications[app.id] || ''}
                                        onChange={e => setFeeVerifications(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        disabled={app.status === 'ENROLLED'}
                                      />
                                      <button 
                                        onClick={() => verifyFeePayment(app.id)} 
                                        className="bg-green-100 hover:bg-green-200 text-green-700 px-4 rounded-lg text-sm font-bold border border-green-200 transition disabled:opacity-40"
                                        disabled={app.status === 'ENROLLED' || feeVerifications[app.id]?.toLowerCase() !== 'yes'}
                                      >
                                        {app.status === 'ENROLLED' ? 'Enrolled' : 'Verify & Enroll'}
                                      </button>
                                    </div>
                                    {app.enrollment_number && (
                                      <div className="mt-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                                        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Enrollment No.</span>
                                        <span className="text-lg font-black text-emerald-700">{app.enrollment_number}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-xs text-slate-400 font-medium">Application must be in FEE_PENDING status to collect fees.</p>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            </>
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
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              l.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              l.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>{l.status}</span>
                          </div>
                          <p className="text-sm text-slate-400 mb-1">📅 {l.start_date} → {l.end_date}</p>
                          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-slate-300 mt-2">"{l.reason}"</p>
                        </div>
                        {l.status === 'PENDING' && (
                          <div className="flex space-x-2 ml-4">
                            <button onClick={() => updateLeaveStatus(l.id, 'APPROVED')} className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition">Approve</button>
                            <button onClick={() => updateLeaveStatus(l.id, 'REJECTED')} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 transition">Reject</button>
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
                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-slate-900 px-6 py-3 rounded-xl font-bold transition hover:scale-[1.02]">Create Fee</button>
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            f.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
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
                      {['MON','TUE','WED','THU','FRI','SAT'].map(d => <option key={d} value={d}>{d}</option>)}
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
                <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 text-slate-900 px-6 py-3 rounded-xl font-bold transition hover:scale-[1.02]">Add Slot</button>
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
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">{t.start_time?.slice(0,5)} - {t.end_time?.slice(0,5)}</td>
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            t.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            t.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>{t.status}</span>
                        </div>
                        <p className="text-sm text-slate-700">{t.reason}</p>
                      </div>
                      {t.status === 'PENDING' && (
                        <div className="flex space-x-2 ml-4">
                          <button onClick={() => updateTransferStatus(t.id, 'APPROVED')} className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30">Approve</button>
                          <button onClick={() => updateTransferStatus(t.id, 'REJECTED')} className="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30">Reject</button>
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            r.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            r.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>{r.status}</span>
                        </div>
                        <p className="text-sm text-slate-700">{r.reason}</p>
                      </div>
                      {r.status === 'PENDING' && (
                        <div className="flex space-x-2 ml-4">
                          <button onClick={() => updateRevalStatus(r.id, 'APPROVED')} className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30">Approve</button>
                          <button onClick={() => updateRevalStatus(r.id, 'REJECTED')} className="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30">Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 italic text-center py-12">No revaluation requests.</p>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
