'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function StudentDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ entry_type: 'REGULAR', previous_school_name: '' });
  const [activeTab, setActiveTab] = useState('status');

  // Document & Scholarship state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [scholarshipReason, setScholarshipReason] = useState('');

  // Academics state
  const [enrollment, setEnrollment] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  
  // Lifecycle state
  const [leaves, setLeaves] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [sgpa, setSgpa] = useState<Record<number, number>>({});
  const [cgpa, setCgpa] = useState(0);
  const [leaveData, setLeaveData] = useState({ start_date: '', end_date: '', reason: '' });

  // Fees state
  const [fees, setFees] = useState<any[]>([]);

  // Timetable state
  const [timetable, setTimetable] = useState<any[]>([]);

  // Revaluation state
  const [revaluations, setRevaluations] = useState<any[]>([]);
  const [revalForm, setRevalForm] = useState({ result: '', reason: '' });

  // Transfer state
  const [transferRequests, setTransferRequests] = useState<any[]>([]);
  const [transferForm, setTransferForm] = useState({ request_type: 'TRANSFER_OUT', reason: '' });

  // No-Dues state
  const [noDues, setNoDues] = useState<any>(null);

  // Disciplinary Case state
  const [disciplinaryCases, setDisciplinaryCases] = useState<any[]>([]);

  // Internship state
  const [internships, setInternships] = useState<any[]>([]);
  const [internshipForm, setInternshipForm] = useState({ company_name: '', role: '', start_date: '', end_date: '', stipend: 0 });


  const fetchDashboardData = async () => {
    try {
      const appData = await fetchAPI('/admission/applications/my_application/');
      setApplication(appData);
      try {
        const enrData = await fetchAPI('/academics/enrollment/my_enrollment/');
        setEnrollment(enrData);
        const [courseList, regList, attList, leaveList, resultData, feeList, ttList, revalList, trList, ndData, dcList, intList] = await Promise.all([
          fetchAPI('/academics/courses/'),
          fetchAPI('/academics/registrations/my_registrations/'),
          fetchAPI('/academics/attendance/my_attendance/'),
          fetchAPI('/academics/leaves/my_leaves/'),
          fetchAPI('/academics/results/my_results/'),
          fetchAPI('/academics/fees/my_fees/').catch(() => []),
          fetchAPI('/academics/timetable/my_timetable/').catch(() => []),
          fetchAPI('/academics/revaluations/my_revaluations/').catch(() => []),
          fetchAPI('/academics/transfers/my_requests/').catch(() => []),
          fetchAPI('/academics/no-dues/my_status/').catch(() => null),
          fetchAPI('/academics/disciplinary-cases/my_cases/').catch(() => []),
          fetchAPI('/academics/internships/my_internships/').catch(() => []),
        ]);
        setCourses(courseList);
        setMyRegistrations(regList);
        setAttendance(attList);
        setLeaves(leaveList);
        setResults(resultData.results || []);
        setSgpa(resultData.sgpa || {});
        setCgpa(resultData.cgpa || 0);
        setFees(feeList);
        setTimetable(ttList);
        setRevaluations(revalList);
        setTransferRequests(trList);
        setNoDues(ndData);
        setDisciplinaryCases(dcList);
        setInternships(intList);
      } catch { /* not enrolled */ }
    } catch { setApplication(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchAPI('/admission/applications/', { method: 'POST', body: JSON.stringify(formData) });
      setApplication(data);
    } catch { alert("Failed to submit application"); }
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    const fd = new FormData();
    fd.append('document_name', docName);
    fd.append('file', docFile);
    try {
      await fetchAPI('/admission/documents/', { method: 'POST', body: fd });
      alert("Document uploaded!");
      setDocFile(null); setDocName('');
      fetchDashboardData();
    } catch { alert("Failed to upload document"); }
  };

  const handleScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/admission/scholarships/', { method: 'POST', body: JSON.stringify({ reason: scholarshipReason }) });
      alert("Scholarship applied!");
      fetchDashboardData();
    } catch (err: any) {
      let msg = 'Failed to apply';
      try { const p = JSON.parse(err.message); msg = p.detail || msg; } catch {}
      alert(msg);
    }
  };

  const payFee = async () => {
    try {
      const data = await fetchAPI('/academics/enrollment/pay_fee/', { method: 'POST' });
      setEnrollment(data);
      alert("Fee paid! You are now officially enrolled.");
      fetchDashboardData();
    } catch (err: any) {
      let msg = 'Failed to pay fee';
      try { const p = JSON.parse(err.message); msg = p.detail || msg; } catch {}
      alert(msg);
    }
  };

  const toggleCourse = (id: number) => {
    setSelectedCourseIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const registerForSemester = async () => {
    if (selectedCourseIds.length === 0) return alert("Select at least one course.");
    try {
      await fetchAPI('/academics/registrations/', {
        method: 'POST',
        body: JSON.stringify({ semester: 1, courses: selectedCourseIds })
      });
      alert("Registered!");
      fetchDashboardData();
    } catch { alert("Registration failed"); }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/academics/leaves/', { method: 'POST', body: JSON.stringify(leaveData) });
      alert("Leave request submitted successfully!");
      setLeaveData({ start_date: '', end_date: '', reason: '' });
      fetchDashboardData();
    } catch (err: any) {
      let msg = 'Failed to submit leave';
      try { const p = JSON.parse(err.message); msg = p.detail || msg; } catch {}
      alert(msg);
    }
  };

  const paySemesterFee = async (feeId: number) => {
    try {
      await fetchAPI(`/academics/fees/${feeId}/pay_semester_fee/`, { method: 'POST' });
      alert('Fee paid successfully!');
      fetchDashboardData();
    } catch { alert('Failed to pay fee'); }
  };

  const submitRevaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revalForm.result || !revalForm.reason) return alert('Please fill all fields');
    try {
      await fetchAPI('/academics/revaluations/', {
        method: 'POST',
        body: JSON.stringify({ result: parseInt(revalForm.result), reason: revalForm.reason })
      });
      alert('Revaluation request submitted!');
      setRevalForm({ result: '', reason: '' });
      fetchDashboardData();
    } catch { alert('Failed to submit revaluation'); }
  };

  const submitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.reason) return alert('Please provide a reason');
    try {
      await fetchAPI('/academics/transfers/', {
        method: 'POST',
        body: JSON.stringify(transferForm)
      });
      alert('Request submitted!');
      setTransferForm({ request_type: 'TRANSFER_OUT', reason: '' });
      fetchDashboardData();
    } catch { alert('Failed to submit request'); }
  };

  const submitInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/academics/internships/', {
        method: 'POST',
        body: JSON.stringify(internshipForm)
      });
      alert('Internship request submitted for approval!');
      setInternshipForm({ company_name: '', role: '', start_date: '', end_date: '', stipend: 0 });
      fetchDashboardData();
    } catch { alert('Failed to submit internship'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading your portal…</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'status', label: '📊 Overview', always: true },
    { id: 'docs', label: '📄 Documents', showWhen: application?.status === 'SELECTED' },
    { id: 'scholarship', label: '💰 Scholarship', showWhen: application?.status === 'SELECTED' },
    { id: 'enrollment', label: '🎫 Enrollment', showWhen: application?.status === 'SELECTED' },
    { id: 'academics', label: '📚 Academics', showWhen: !!enrollment },
    { id: 'timetable', label: '📅 Timetable', showWhen: !!enrollment },
    { id: 'fees', label: '💳 Fees', showWhen: !!enrollment },
    { id: 'lifecycle', label: '🗓 Leaves', showWhen: !!enrollment },
    { id: 'results', label: '📝 Results', showWhen: !!enrollment },
    { id: 'internship', label: '💼 Internships', showWhen: !!enrollment },
    { id: 'discipline', label: '⚖️ Discipline', showWhen: !!enrollment },
    { id: 'transfer', label: '🚪 Transfer / Exit', showWhen: !!enrollment },
  ];

  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayNames: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
          
          {!application ? (
            /* ─── No Application Yet ─── */
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-white mb-2">Start Your Application</h2>
              <p className="text-slate-400 text-sm mb-8">Fill in the details below to apply for admission.</p>
              <form onSubmit={handleAppSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Entry Type</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData.entry_type} onChange={e => setFormData({ ...formData, entry_type: e.target.value })}
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="LATERAL">Lateral Entry (Year 2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previous School</label>
                  <input type="text" required placeholder="e.g. Delhi Public School"
                    className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-slate-500"
                    value={formData.previous_school_name} onChange={e => setFormData({ ...formData, previous_school_name: e.target.value })}
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
                  Submit Application
                </button>
              </form>
            </div>
          ) : (
            /* ─── Application Exists ─── */
            <>
              {/* Tab Bar */}
              <div className="flex space-x-1 bg-slate-800/40 backdrop-blur p-1.5 rounded-2xl mb-8 border border-slate-700/30 overflow-x-auto">
                {tabs.filter(t => t.always || t.showWhen).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                
                {/* ─── STATUS ─── */}
                {activeTab === 'status' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Application Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          application.status === 'SELECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          application.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            application.status === 'SELECTED' ? 'bg-green-400' :
                            application.status === 'REJECTED' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                          {application.status}
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Entry Type</p>
                        <p className="text-lg font-bold text-white">{application.entry_type}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Enrollment</p>
                        <p className="text-lg font-bold text-cyan-400">{enrollment ? enrollment.enrollment_number : 'Not Yet'}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">CGPA</p>
                        <p className="text-lg font-bold text-emerald-400">{cgpa > 0 ? cgpa.toFixed(2) : '—'}</p>
                      </div>
                    </div>
                    {application.status === 'SELECTED' && !enrollment && (
                      <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-5 rounded-2xl text-sm leading-relaxed">
                        🎉 <strong>Congratulations!</strong> You have been selected. Please upload your documents, get them verified, and pay the enrollment fee to complete your admission.
                      </div>
                    )}
                    {application.status === 'PENDING' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 p-5 rounded-2xl text-sm">
                        ⏳ Your application is under review. You will be notified once a decision is made.
                      </div>
                    )}
                    {application.status === 'REJECTED' && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-5 rounded-2xl text-sm">
                        ❌ Your application was rejected. Please contact the admissions office for more information.
                      </div>
                    )}
                  </div>
                )}

                {/* ─── DOCUMENTS ─── */}
                {activeTab === 'docs' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Document Verification</h2>
                    <form onSubmit={handleDocUpload} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-8 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Document Name</label>
                        <input type="text" placeholder="e.g. Aadhaar Card, 10th Marksheet" required
                          className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                          value={docName} onChange={e => setDocName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">File</label>
                        <input type="file" required
                          className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:text-blue-400 file:font-semibold hover:file:bg-blue-600/30 file:cursor-pointer file:transition"
                          onChange={e => setDocFile(e.target.files ? e.target.files[0] : null)} />
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition">Upload Document</button>
                    </form>
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">Submitted Documents</h3>
                    {application.documents?.length > 0 ? (
                      <div className="space-y-3">
                        {application.documents.map((d: any) => (
                          <div key={d.id} className="bg-slate-900/50 p-4 border border-slate-700/50 rounded-xl flex items-center justify-between">
                            <span className="font-medium text-slate-200">{d.document_name}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              d.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              d.status === 'FORGED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>{d.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-slate-500 italic">No documents uploaded yet.</p>}
                  </div>
                )}

                {/* ─── SCHOLARSHIP ─── */}
                {activeTab === 'scholarship' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Merit Scholarship</h2>
                    {application.scholarship ? (
                      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Status</span>
                          <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                            application.scholarship.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            application.scholarship.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>{application.scholarship.status}</span>
                        </div>
                        {application.scholarship.concession_percentage > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Fee Concession</span>
                            <span className="text-2xl font-black text-cyan-400">{application.scholarship.concession_percentage}%</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleScholarship} className="space-y-4">
                        <p className="text-sm text-slate-400 mb-4">All your documents must be verified before you can apply for a scholarship.</p>
                        <textarea required placeholder="Describe why you deserve this scholarship…"
                          className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-4 rounded-xl h-32 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 resize-none"
                          value={scholarshipReason} onChange={e => setScholarshipReason(e.target.value)} />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition">Apply for Scholarship</button>
                      </form>
                    )}
                  </div>
                )}

                {/* ─── ENROLLMENT ─── */}
                {activeTab === 'enrollment' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Enrollment & Fee Payment</h2>
                    {enrollment ? (
                      <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-green-400 mb-2">Welcome to the University!</h3>
                        <p className="text-slate-400 mb-4">Your official enrollment number:</p>
                        <p className="text-4xl font-mono font-black text-white tracking-widest bg-slate-900/50 inline-block px-8 py-4 rounded-2xl border border-slate-700">{enrollment.enrollment_number}</p>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-slate-400 mb-2">All documents must be verified before you can pay.</p>
                        <p className="text-slate-500 text-sm mb-8">Pay the seat fee to confirm your admission and get your enrollment number.</p>
                        <button onClick={payFee} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Pay Fee & Confirm Enrollment
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── ACADEMICS ─── */}
                {activeTab === 'academics' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Academics & Attendance</h2>
                    {myRegistrations.length > 0 ? (
                      <div className="space-y-8">
                        {/* Live Attendance */}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-3 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Live Attendance
                          </h3>
                          {attendance.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {attendance.map((att: any, idx: number) => (
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
                          ) : <p className="text-slate-500 italic">No attendance recorded yet.</p>}
                        </div>
                        {/* Registered Courses */}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-3 mb-4">
                            My Courses — Semester {myRegistrations[0]?.semester}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {myRegistrations[0]?.courses_details?.map((c: any) => (
                              <div key={c.id} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <span className="font-bold text-blue-300 block">{c.code}</span>
                                <span className="text-sm text-blue-200/70">{c.name}</span>
                                <span className="text-xs text-slate-500 block mt-1">{c.credits} Credits</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">Register for Courses</h3>
                        <p className="text-sm text-slate-500 mb-6">Select the courses you want to take this semester.</p>
                        <div className="space-y-3 mb-6">
                          {courses.map(course => (
                            <label key={course.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                              selectedCourseIds.includes(course.id)
                                ? 'bg-blue-600/10 border-blue-500/30 shadow-inner'
                                : 'border-slate-700/50 hover:bg-slate-800/50'
                            }`}>
                              <input type="checkbox" className="w-5 h-5 rounded accent-blue-500"
                                checked={selectedCourseIds.includes(course.id)}
                                onChange={() => toggleCourse(course.id)} />
                              <div className="ml-4">
                                <p className="font-bold text-white">{course.code}</p>
                                <p className="text-sm text-slate-400">{course.name} · {course.credits} Credits · Sem {course.semester}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <button onClick={registerForSemester} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-all">
                          Confirm Registration
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TIMETABLE ─── */}
                {activeTab === 'timetable' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Weekly Timetable</h2>
                    {timetable.length > 0 ? (
                      <div className="space-y-4">
                        {dayOrder.filter(d => timetable.some(t => t.day === d)).map(day => (
                          <div key={day}>
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">{dayNames[day]}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {timetable.filter(t => t.day === day).map((slot: any) => (
                                <div key={slot.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                  <p className="font-bold text-white">{slot.course_code}</p>
                                  <p className="text-xs text-slate-400">{slot.course_name}</p>
                                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                                    <span className="text-sm text-cyan-400 font-mono">{slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}</span>
                                    {slot.room && <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">🏛 {slot.room}</span>}
                                  </div>
                                  {slot.faculty_name && <p className="text-xs text-slate-500 mt-1">👤 {slot.faculty_name}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                        <p className="text-slate-400">No timetable scheduled yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── FEES ─── */}
                {activeTab === 'fees' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Fee Management</h2>
                    {fees.length > 0 ? (
                      <div className="space-y-3">
                        {fees.map((fee: any) => (
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
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                  fee.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  fee.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>{fee.status}</span>
                                {fee.status !== 'PAID' && (
                                  <button onClick={() => paySemesterFee(fee.id)}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition hover:scale-[1.02]">
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                        <p className="text-slate-400">No fees have been generated for your semesters yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── LIFECYCLE (LEAVES) ─── */}
                {activeTab === 'lifecycle' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Leave of Absence (LOA)</h2>
                    <form onSubmit={handleLeaveSubmit} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-8 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                          <input type="date" required style={{ colorScheme: 'dark' }}
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={leaveData.start_date} onChange={e => setLeaveData({ ...leaveData, start_date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                          <input type="date" required style={{ colorScheme: 'dark' }}
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={leaveData.end_date} onChange={e => setLeaveData({ ...leaveData, end_date: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason</label>
                        <textarea required placeholder="Explain why you need a leave of absence..."
                          className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                          value={leaveData.reason} onChange={e => setLeaveData({ ...leaveData, reason: e.target.value })} />
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition">Request Leave</button>
                    </form>
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">Past Requests</h3>
                    {leaves.length > 0 ? (
                      <div className="space-y-3">
                        {leaves.map((l: any) => (
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
                    ) : <p className="text-slate-500 italic">No leave requests found.</p>}
                  </div>
                )}

                {/* ─── RESULTS ─── */}
                {activeTab === 'results' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Examination Results</h2>
                      {cgpa > 0 && (
                        <div className="flex items-center space-x-4">
                          {Object.entries(sgpa).map(([sem, gpa]) => (
                            <div key={sem} className="bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 text-center">
                              <p className="text-[10px] text-slate-500 uppercase">Sem {sem}</p>
                              <p className="text-lg font-bold text-blue-400">{(gpa as number).toFixed(2)}</p>
                            </div>
                          ))}
                          <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-center">
                            <p className="text-[10px] text-emerald-400 uppercase font-bold">CGPA</p>
                            <p className="text-lg font-bold text-emerald-400">{cgpa.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {results.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          {results.map((r: any) => (
                            <div key={r.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
                              <div className="absolute right-[-10%] bottom-[-20%] text-9xl font-black opacity-5 text-white pointer-events-none">{r.grade}</div>
                              <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                  <p className="font-bold text-white text-lg">{r.course_code}</p>
                                  <p className="text-sm text-slate-400">{r.course_name}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className={`text-3xl font-black ${
                                    ['O', 'A+', 'A'].includes(r.grade) ? 'text-green-400' :
                                    r.grade === 'F' ? 'text-red-400' : 'text-blue-400'
                                  }`}>{r.grade}</span>
                                  <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">Grade</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 relative z-10">
                                <div>
                                  <span className="text-2xl font-bold text-white">{r.marks_obtained}</span>
                                  <span className="text-sm text-slate-500"> / {r.max_marks}</span>
                                </div>
                                <div className="flex gap-2">
                                  {r.is_backlog && <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-bold uppercase">Backlog</span>}
                                  {r.is_revaluation && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase">Reval</span>}
                                  {!r.is_backlog && !r.is_revaluation && <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-[10px] font-bold uppercase">Regular</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Revaluation Request Form */}
                        <div className="border-t border-slate-700 pt-6">
                          <h3 className="text-lg font-semibold text-slate-300 mb-4">Request Revaluation</h3>
                          <form onSubmit={submitRevaluation} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Result</label>
                              <select className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={revalForm.result} onChange={e => setRevalForm({ ...revalForm, result: e.target.value })}>
                                <option value="">-- Choose a course result --</option>
                                {results.map((r: any) => (
                                  <option key={r.id} value={r.id}>{r.course_code} — Grade: {r.grade}, Marks: {r.marks_obtained}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason</label>
                              <textarea placeholder="Explain why you want revaluation..." required
                                className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                value={revalForm.reason} onChange={e => setRevalForm({ ...revalForm, reason: e.target.value })} />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition">Submit Revaluation</button>
                          </form>
                          {revaluations.length > 0 && (
                            <div className="mt-6 space-y-3">
                              <h4 className="text-sm font-bold text-slate-400 uppercase">Your Revaluation Requests</h4>
                              {revaluations.map((rv: any) => (
                                <div key={rv.id} className="bg-slate-900/50 p-4 border border-slate-700/50 rounded-xl flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-slate-200">{rv.course_code} — Original: {rv.original_grade} ({rv.original_marks})</p>
                                    <p className="text-xs text-slate-500">{rv.reason}</p>
                                  </div>
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                    rv.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    rv.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                  }`}>{rv.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                        <p className="text-slate-400">No examination results published yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── INTERNSHIPS ─── */}
                {activeTab === 'internship' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Internship Requests</h2>
                    <form onSubmit={submitInternship} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-8 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                          <input type="text" required placeholder="e.g. Google"
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={internshipForm.company_name} onChange={e => setInternshipForm({ ...internshipForm, company_name: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role / Position</label>
                          <input type="text" required placeholder="e.g. Software Engineer Intern"
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={internshipForm.role} onChange={e => setInternshipForm({ ...internshipForm, role: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                          <input type="date" required style={{ colorScheme: 'dark' }}
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={internshipForm.start_date} onChange={e => setInternshipForm({ ...internshipForm, start_date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                          <input type="date" required style={{ colorScheme: 'dark' }}
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={internshipForm.end_date} onChange={e => setInternshipForm({ ...internshipForm, end_date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stipend (Monthly ₹)</label>
                          <input type="number" required placeholder="0"
                            className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={internshipForm.stipend} onChange={e => setInternshipForm({ ...internshipForm, stipend: parseFloat(e.target.value) })} />
                        </div>
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition mt-4">Submit Internship details</button>
                    </form>
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">My Internships</h3>
                    {internships.length > 0 ? (
                      <div className="space-y-3">
                        {internships.map((int: any) => (
                          <div key={int.id} className="bg-slate-900/50 p-4 border border-slate-700/50 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white">{int.role} at {int.company_name}</p>
                              <p className="text-xs text-slate-400">{int.start_date} to {int.end_date} · ₹{int.stipend}/mo</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              int.status === 'APPROVED' || int.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              int.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>{int.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-slate-500 italic">No internships registered.</p>}
                  </div>
                )}

                {/* ─── DISCIPLINARY CASES ─── */}
                {activeTab === 'discipline' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Disciplinary Record</h2>
                    {disciplinaryCases.length > 0 ? (
                      <div className="space-y-4">
                        {disciplinaryCases.map((dc: any) => (
                          <div key={dc.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-white">{dc.title}</h3>
                                <p className="text-xs text-slate-500">Incident Date: {dc.date_of_incident} · Reported By: {dc.reported_by_name || 'System'}</p>
                              </div>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                dc.status === 'RESOLVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>{dc.status}</span>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300 border border-slate-700/30">
                              <p className="mb-2"><strong>Description:</strong> {dc.description}</p>
                              {dc.action_taken && <p className="text-red-400"><strong>Action Taken:</strong> {dc.action_taken}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-green-500/20">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                          <span className="text-3xl">🌟</span>
                        </div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">Clean Record</h3>
                        <p className="text-slate-400">You have no disciplinary cases against you.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TRANSFER / EXIT ─── */}
                {activeTab === 'transfer' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Transfer / Exit Documentation</h2>

                    {/* No-Dues Status */}
                    {noDues && (
                      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-8">
                        <h3 className="text-lg font-semibold text-slate-300 mb-4">No-Dues Clearance Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Library', cleared: noDues.library_cleared },
                            { label: 'Hostel', cleared: noDues.hostel_cleared },
                            { label: 'Fees', cleared: noDues.fees_cleared },
                            { label: 'Department', cleared: noDues.department_cleared },
                          ].map(item => (
                            <div key={item.label} className={`p-4 rounded-xl border text-center ${
                              item.cleared ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                            }`}>
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                              <p className={`text-lg font-bold ${item.cleared ? 'text-green-400' : 'text-red-400'}`}>
                                {item.cleared ? '✅ Cleared' : '❌ Pending'}
                              </p>
                            </div>
                          ))}
                        </div>
                        {noDues.certificate_issued && (
                          <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                            <p className="text-green-400 font-bold">📜 Transfer Certificate / No-Dues Certificate has been issued.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transfer Request Form */}
                    <form onSubmit={submitTransfer} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-8 space-y-4">
                      <h3 className="text-lg font-semibold text-slate-300">Submit a Request</h3>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Request Type</label>
                        <select className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                          value={transferForm.request_type} onChange={e => setTransferForm({ ...transferForm, request_type: e.target.value })}>
                          <option value="TRANSFER_OUT">Transfer Out</option>
                          <option value="DROPOUT">Dropout</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason</label>
                        <textarea required placeholder="Provide your reason..."
                          className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                          value={transferForm.reason} onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })} />
                      </div>
                      <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-semibold transition">Submit Request</button>
                    </form>

                    {/* Past Transfer Requests */}
                    {transferRequests.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Your Requests</h3>
                        {transferRequests.map((tr: any) => (
                          <div key={tr.id} className="bg-slate-900/50 p-4 border border-slate-700/50 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="font-medium text-slate-200">{tr.request_type.replace('_', ' ')}</span>
                              <p className="text-xs text-slate-500 mt-1">{tr.reason}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              tr.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              tr.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>{tr.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
