'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import React from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('admissions');
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [interviewDates, setInterviewDates] = useState<{[key: number]: string}>({});
  const [allocationForms, setAllocationForms] = useState<{[key: number]: { allocated_department: string; allocated_program: string; allocated_batch: string }}>({});
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', previous_school_name: '', previous_marks_percentage: '' });

  // Academics state
  const [courses, setCourses] = useState<any[]>([]);
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
    { id: 'admissions', label: 'Admissions', icon: '📋', color: 'blue' },
    { id: 'academics', label: 'Attendance', icon: '📊', color: 'cyan' },
    { id: 'leaves', label: 'Leave Requests', icon: '🗓', color: 'yellow' },
    { id: 'students', label: 'Students', icon: '🎓', color: 'emerald' },
    { id: 'fees', label: 'Fee Management', icon: '💳', color: 'purple' },
    { id: 'timetable', label: 'Timetable', icon: '📅', color: 'pink' },
    { id: 'transfers', label: 'Transfer / Exit', icon: '🚪', color: 'red' },
    { id: 'revaluations', label: 'Revaluations', icon: '📝', color: 'orange' },
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
    <div className="min-h-[calc(100vh-56px)] bg-slate-900 text-slate-200 flex">
      {/* Sidebar */}
      <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Command Center</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === item.id ? `${colorMap[item.color]} border` : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}>
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {sidebarItems.find(s => s.id === activeTab)?.label || 'Dashboard'}
            </h1>
            {activeTab === 'admissions' && (
              <div className="flex space-x-3 items-center">
                <button onClick={() => setShowOfflineForm(value => !value)} className="bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl text-sm font-bold">{showOfflineForm ? 'Close form' : '+ Offline application'}</button>
                <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                  <span className="text-xl font-bold text-white">{applications.length}</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pending</span>
                  <span className="text-xl font-bold text-yellow-400">{applications.filter(a => ['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length}</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Selected</span>
                  <span className="text-xl font-bold text-green-400">{applications.filter(a => a.status === 'SELECTED').length}</span>
                </div>
              </div>
            )}
          </header>

          {/* ─── ADMISSIONS TAB ─── */}
          {activeTab === 'admissions' && (
            <>
            {showOfflineForm && <form onSubmit={createOfflineApplication} className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 grid md:grid-cols-3 gap-4">
              <h2 className="md:col-span-3 font-bold text-lg">Create offline application</h2>
              {[['first_name', 'First name'], ['last_name', 'Last name'], ['username', 'Username'], ['email', 'Email'], ['phone', 'Phone'], ['previous_school_name', 'Previous school / college'], ['previous_marks_percentage', 'Previous marks %']].map(([name, label]) => <label key={name} className="text-xs font-bold text-slate-400 uppercase">{label}<input required={name !== 'phone' && name !== 'previous_marks_percentage'} type={name === 'email' ? 'email' : name === 'previous_marks_percentage' ? 'number' : 'text'} min={name === 'previous_marks_percentage' ? 0 : undefined} max={name === 'previous_marks_percentage' ? 100 : undefined} value={offlineForm[name as keyof typeof offlineForm]} onChange={e => setOfflineForm(prev => ({ ...prev, [name]: e.target.value }))} className="mt-1.5 block w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-slate-100" /></label>)}
              <label className="text-xs font-bold text-slate-400 uppercase">Temporary password<input required type="password" value={offlineForm.password} onChange={e => setOfflineForm(prev => ({ ...prev, password: e.target.value }))} className="mt-1.5 block w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-slate-100" /></label>
              <div className="md:col-span-3"><button className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-bold">Create applicant and application</button></div>
            </form>}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
              <table className="min-w-full text-left">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Entry</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {applications.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No applications found.</td></tr>
                  ) : applications.map(app => (
                    <React.Fragment key={app.id}>
                      <tr className="hover:bg-slate-700/30 transition group">
                        <td className="px-6 py-4">
                          <button onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)} className="flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition">
                            <svg className={`w-4 h-4 mr-2 transition-transform ${expandedRow === app.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            {expandedRow === app.id ? 'Close' : 'Expand'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-200"><div>{app.profile_details?.username || `Applicant #${app.id}`}</div><div className="text-xs text-slate-500">{app.application_number || 'Not submitted'}</div></td>
                        <td className="px-6 py-4 text-sm"><span className="bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50 text-xs">{app.entry_type}</span></td>
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
                        <tr className="bg-slate-900/80">
                          <td colSpan={5} className="px-8 py-6 border-b border-slate-700">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                                <h4 className="font-bold text-slate-200 mb-4 text-sm">📄 Documents</h4>
                                {app.documents?.length > 0 ? (
                                  <div className="space-y-3">
                                    {app.documents.map((doc: any) => (
                                      <div key={doc.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
                                        <div>
                                          <span className="block font-medium text-sm text-slate-300">{doc.document_name}</span>
                                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${doc.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' : doc.status === 'FORGED' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>{doc.status}</span>
                                        </div>
                                        <div className="space-x-1 flex">
                                          <button onClick={() => verifyDocument(app.id, doc.id, 'VERIFIED')} className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 border border-green-500/20 transition" title="Verify">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                          </button>
                                          <button onClick={() => verifyDocument(app.id, doc.id, 'FORGED')} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/20 transition" title="Flag Forged">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-sm text-slate-500 italic">No documents.</p>}
                              </div>
                              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                                <h4 className="font-bold text-slate-200 mb-4 text-sm">💰 Scholarship</h4>
                                {app.scholarship ? (
                                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="text-sm text-slate-300 italic mb-4 bg-slate-800/50 p-3 rounded-lg border-l-4 border-blue-500">"{app.scholarship.reason}"</p>
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm text-slate-400">Status:</span>
                                      <span className="text-sm font-bold text-yellow-400">{app.scholarship.status} {app.scholarship.concession_percentage > 0 && `(${app.scholarship.concession_percentage}% off)`}</span>
                                    </div>
                                    {app.scholarship.status === 'APPLIED' && (
                                      <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                                        <button onClick={() => approveScholarship(app.id, app.scholarship.id, 50)} className="flex-1 bg-cyan-600/20 text-cyan-400 py-2 rounded-lg text-xs font-bold border border-cyan-500/30">50%</button>
                                        <button onClick={() => approveScholarship(app.id, app.scholarship.id, 100)} className="flex-1 bg-blue-600/20 text-blue-400 py-2 rounded-lg text-xs font-bold border border-blue-500/30">100%</button>
                                      </div>
                                    )}
                                  </div>
                                ) : <p className="text-sm text-slate-500 italic">No scholarship request.</p>}
                              </div>
                              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 space-y-4">
                                <h4 className="font-bold text-slate-200 text-sm">🗓 Interview and allocation</h4>
                                <p className="text-xs text-slate-400">{app.profile_details?.email} · {app.profile_details?.phone || 'No phone supplied'}</p>
                                <div className="flex gap-2"><input type="datetime-local" value={interviewDates[app.id] || ''} onChange={e => setInterviewDates(prev => ({ ...prev, [app.id]: e.target.value }))} className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm" /><button onClick={() => scheduleInterview(app.id)} className="bg-amber-500/15 text-amber-300 px-3 rounded-lg text-xs font-bold border border-amber-500/30">Schedule</button></div>
                                {app.interview_date && <p className="text-xs text-amber-200">Scheduled: {new Date(app.interview_date).toLocaleString()}</p>}
                                <div className="grid grid-cols-3 gap-2"><input placeholder="Department" value={allocationForms[app.id]?.allocated_department || ''} onChange={e => setAllocationForms(prev => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_department: e.target.value } }))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-xs" /><input placeholder="Program" value={allocationForms[app.id]?.allocated_program || ''} onChange={e => setAllocationForms(prev => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_program: e.target.value } }))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-xs" /><input placeholder="Batch" value={allocationForms[app.id]?.allocated_batch || ''} onChange={e => setAllocationForms(prev => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_batch: e.target.value } }))} className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-xs" /></div>
                                <button onClick={() => allocateSeat(app.id)} disabled={app.status !== 'SELECTED'} className="w-full bg-purple-600/20 text-purple-300 py-2 rounded-lg text-xs font-bold border border-purple-500/30 disabled:opacity-40">Allocate seat (selected applications only)</button>
                                {app.seat_allocation && <p className="text-xs text-emerald-300">Allocated: {app.seat_allocation.allocated_program}, {app.seat_allocation.allocated_department} — {app.seat_allocation.allocated_batch}</p>}
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
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8">
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course</label>
                  <select className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-cyan-500"
                    onChange={e => { const cId = parseInt(e.target.value); setSelectedCourse(courses.find(c => c.id === cId)); }}>
                    <option value="">-- Choose --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                  <input type="date" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-cyan-500" style={{ colorScheme: 'dark' }}
                    value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                </div>
              </div>
              {selectedCourse ? (
                <>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-700/50">
                      <thead className="bg-slate-800/80">
                        <tr>
                          <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase">Enrollment</th>
                          <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                          <tr><td colSpan={2} className="px-8 py-12 text-center text-slate-500">No students.</td></tr>
                        ) : getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                          <tr key={enrId} className="hover:bg-slate-800/30 transition">
                            <td className="px-8 py-4 text-sm font-bold font-mono text-slate-300">ENR-{enrId}</td>
                            <td className="px-8 py-4 text-right">
                              <div className="inline-flex space-x-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                                <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition ${attendanceData[enrId] === 'PRESENT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-500 border border-transparent'}`}>
                                  <input type="radio" className="hidden" name={`s-${enrId}`} checked={attendanceData[enrId] === 'PRESENT'} onChange={() => handleAttendanceChange(enrId, 'PRESENT')} /> Present
                                </label>
                                <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition ${attendanceData[enrId] === 'ABSENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-500 border border-transparent'}`}>
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
                    <button onClick={submitAttendance} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">Save Attendance</button>
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">Select a course above</div>
              )}
            </div>
          )}

          {/* ─── LEAVES TAB ─── */}
          {activeTab === 'leaves' && (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Pending Leave Requests</h2>
                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">{leaves.filter(l => l.status === 'PENDING').length} pending</span>
              </div>
              {leaves.length > 0 ? (
                <div className="space-y-3">
                  {leaves.map((l: any) => (
                    <div key={l.id} className="bg-slate-900/50 p-5 border border-slate-700/50 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm font-bold text-slate-300">ENR-{l.enrollment}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              l.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              l.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>{l.status}</span>
                          </div>
                          <p className="text-sm text-slate-400 mb-1">📅 {l.start_date} → {l.end_date}</p>
                          <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border-l-4 border-slate-600 mt-2">"{l.reason}"</p>
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
              ) : <p className="text-slate-500 italic text-center py-12">No leave requests found.</p>}
            </div>
          )}

          {/* ─── STUDENTS TAB ─── */}
          {activeTab === 'students' && (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
              <table className="min-w-full text-left">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrollment #</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fee Paid</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {enrollments.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-500">No enrollments found.</td></tr>
                  ) : enrollments.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 text-sm font-mono font-bold text-cyan-400">{e.enrollment_number}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">UID-{e.user}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${e.fee_paid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {e.fee_paid ? 'PAID' : 'UNPAID'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(e.enrolled_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── FEE MANAGEMENT ─── */}
          {activeTab === 'fees' && (
            <div className="space-y-8">
              <form onSubmit={createFee} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Create Fee Record</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enrollment ID</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none"
                      value={feeForm.enrollment} onChange={e => setFeeForm({ ...feeForm, enrollment: e.target.value })}>
                      <option value="">-- Select --</option>
                      {enrollments.map((e: any) => <option key={e.id} value={e.id}>{e.enrollment_number}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Semester</label>
                    <input type="number" min="1" max="8" required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none"
                      value={feeForm.semester} onChange={e => setFeeForm({ ...feeForm, semester: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                    <input type="number" required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none"
                      value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                    <input type="date" required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none" style={{ colorScheme: 'dark' }}
                      value={feeForm.due_date} onChange={e => setFeeForm({ ...feeForm, due_date: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition hover:scale-[1.02]">Create Fee</button>
              </form>
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Enrollment</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Semester</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Due Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {fees.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No fee records.</td></tr>
                    ) : fees.map((f: any) => (
                      <tr key={f.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4 text-sm font-mono text-cyan-400">ENR-{f.enrollment}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{f.semester}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">₹{parseFloat(f.amount).toLocaleString()}</td>
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
              <form onSubmit={createTimetableSlot} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Add Timetable Slot</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course</label>
                    <select required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none"
                      value={ttForm.course} onChange={e => setTtForm({ ...ttForm, course: e.target.value })}>
                      <option value="">-- Select --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none"
                      value={ttForm.day} onChange={e => setTtForm({ ...ttForm, day: e.target.value })}>
                      {['MON','TUE','WED','THU','FRI','SAT'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                    <input type="time" required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none" style={{ colorScheme: 'dark' }}
                      value={ttForm.start_time} onChange={e => setTtForm({ ...ttForm, start_time: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                    <input type="time" required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none" style={{ colorScheme: 'dark' }}
                      value={ttForm.end_time} onChange={e => setTtForm({ ...ttForm, end_time: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Room</label>
                    <input type="text" placeholder="e.g. LH-301" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none placeholder-slate-500"
                      value={ttForm.room} onChange={e => setTtForm({ ...ttForm, room: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold transition hover:scale-[1.02]">Add Slot</button>
              </form>
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Course</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Day</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {timetable.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No timetable slots.</td></tr>
                    ) : timetable.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4 text-sm"><span className="font-bold text-cyan-400">{t.course_code}</span> <span className="text-slate-400">- {t.course_name}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-300">{t.day}</td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-200">{t.start_time?.slice(0,5)} - {t.end_time?.slice(0,5)}</td>
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
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              {transfers.length > 0 ? (
                <div className="space-y-3">
                  {transfers.map((t: any) => (
                    <div key={t.id} className="bg-slate-900/50 p-5 border border-slate-700/50 rounded-2xl flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-sm font-bold text-slate-300">ENR-{t.enrollment}</span>
                          <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs text-slate-400">{t.request_type.replace('_', ' ')}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            t.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            t.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>{t.status}</span>
                        </div>
                        <p className="text-sm text-slate-300">{t.reason}</p>
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
              ) : <p className="text-slate-500 italic text-center py-12">No transfer/exit requests.</p>}
            </div>
          )}

          {/* ─── REVALUATIONS ─── */}
          {activeTab === 'revaluations' && (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              {revaluations.length > 0 ? (
                <div className="space-y-3">
                  {revaluations.map((r: any) => (
                    <div key={r.id} className="bg-slate-900/50 p-5 border border-slate-700/50 rounded-2xl flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-bold text-slate-200">{r.course_code}</span>
                          <span className="text-xs text-slate-400">Original: {r.original_grade} ({r.original_marks})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            r.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            r.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>{r.status}</span>
                        </div>
                        <p className="text-sm text-slate-300">{r.reason}</p>
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
              ) : <p className="text-slate-500 italic text-center py-12">No revaluation requests.</p>}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
