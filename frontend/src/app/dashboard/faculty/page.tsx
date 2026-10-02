'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import FacultySidebar from './components/FacultySidebar';
import TopBar from '../admin/components/TopBar';
import MyTimetable from './components/MyTimetable';
import MyClasses from './components/MyClasses';
import AdmissionsTab from '../admin/components/AdmissionsTab';
import FacultyProfileSection from './components/FacultyProfileSection';
import InterviewPool from './components/InterviewPool';
import FacultyAttendanceTab from './components/FacultyAttendanceTab';
import FacultyGradingTab from './components/FacultyGradingTab';
import FacultyMentoringTab from './components/FacultyMentoringTab';
import FacultyFeedbackTab from './components/FacultyFeedbackTab';

export default function FacultyDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeRole, setActiveRole] = useState('Faculty');

  // Admissions State
  const [applications, setApplications] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', previous_school_name: '', previous_marks_percentage: '' });
  const [interviewDates, setInterviewDates] = useState<Record<number, string>>({});
  const [allocationForms, setAllocationForms] = useState<Record<number, any>>({});
  const [feeVerifications, setFeeVerifications] = useState<Record<number, string>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    setCurrentUser(user);

    // Set initial active role
    const roles = user.additional_roles || [];
    if (roles.includes('DEAN')) setActiveRole('Dean');
    else if (roles.includes('INTERVIEWER')) setActiveRole('Interviewer');
    else setActiveRole('Faculty');

    fetchAPI('/academics/faculty/my_profile/')
      .then(data => setFacultyProfile(data))
      .catch(err => console.error(err));

    fetchAdmissionsData();
  }, []);

  const fetchAdmissionsData = async () => {
    try {
      const [apps, depts, progs] = await Promise.all([
        fetchAPI('/admission/applications/'),
        fetchAPI('/academics/departments/'),
        fetchAPI('/academics/programs/')
      ]);
      setApplications(apps || []);
      setDepartments(depts || []);
      setPrograms(progs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const application = await fetchAPI(`/admission/applications/${id}/`, { 
        method: 'PATCH', 
        body: JSON.stringify({ status }) 
      });
      setApplications(apps => apps.map(app => app.id === id ? application : app));
    } catch (err) {
      alert("Failed to update status");
    }
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
    if (!form?.allocated_program) return alert('Please select a program.');
    try {
      await fetchAPI('/admission/allocations/', { method: 'POST', body: JSON.stringify({ application: id, ...form }) });
      fetchAdmissionsData();
    } catch (error: any) { alert('Seat allocation failed: ' + (error.message || error)); }
  };

  const verifyFeePayment = async (appId: number) => {
    if (feeVerifications[appId]?.toLowerCase() !== 'yes') {
      return alert("Please type 'yes' to confirm fee payment.");
    }
    try {
      await fetchAPI(`/admission/applications/${appId}/pay_fees/`, { method: 'POST' });
      alert("Fee payment verified. Student enrolled!");
      fetchAdmissionsData();
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
      setShowOfflineForm(false); fetchAdmissionsData(); alert('Offline application created.');
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

  if (!isMounted || !currentUser) return null;

  const additionalRoles = currentUser.additional_roles || [];
  const isDean = additionalRoles.includes('DEAN');
  const isInterviewer = additionalRoles.includes('INTERVIEWER');

  // Handle role switch => navigate to the right default tab
  const handleRoleSwitch = (role: string) => {
    setActiveRole(role);
    if (role === 'Dean') {
      setActiveSection('admissions');
    } else if (role === 'Interviewer') {
      setActiveSection('interviews');
    } else {
      setActiveSection('overview');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-8xl">🎓</div>
              <div className="relative z-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  Welcome back, {facultyProfile?.designation || 'Prof.'} {currentUser.last_name || currentUser.first_name}!
                </h1>
                <p className="text-slate-500 font-medium mb-6">
                  {facultyProfile?.department_name || 'Department'} • {facultyProfile?.designation || 'Faculty'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold shadow-sm">
                    {currentUser.role || 'FACULTY'}
                  </span>
                  {additionalRoles.map((role: string) => (
                    <span key={role} className="px-3 py-1.5 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg text-xs font-bold shadow-sm">
                      {role.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">📚</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">My Classes</p>
                    <p className="text-xl font-black text-slate-800">2 Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">👥</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mentees</p>
                    <p className="text-xl font-black text-slate-800">5 Students</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg">⭐</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                    <p className="text-xl font-black text-slate-800">4.45/5.0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg">✅</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance Avg.</p>
                    <p className="text-xl font-black text-slate-800">91.2%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="grid gap-3 md:grid-cols-4">
                <button onClick={() => setActiveSection('my_classes')} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                  <p className="text-sm font-bold text-slate-800">📖 Mark Attendance</p>
                  <p className="text-xs text-slate-400 mt-1">Open class list</p>
                </button>
                <button onClick={() => setActiveSection('grading')} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-left">
                  <p className="text-sm font-bold text-slate-800">📝 Grade Entry</p>
                  <p className="text-xs text-slate-400 mt-1">Submit student grades</p>
                </button>
                <button onClick={() => setActiveSection('mentoring')} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition text-left">
                  <p className="text-sm font-bold text-slate-800">🎯 Mentoring</p>
                  <p className="text-xs text-slate-400 mt-1">Check mentee progress</p>
                </button>
                <button onClick={() => setActiveSection('feedback')} className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition text-left">
                  <p className="text-sm font-bold text-slate-800">⭐ Feedback</p>
                  <p className="text-xs text-slate-400 mt-1">View student feedback</p>
                </button>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Today&apos;s Schedule</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { time: '09:00 - 10:00', course: 'MATH101 - Calculus I', room: 'Room 301, Block A', type: 'Lecture' },
                  { time: '11:00 - 12:00', course: 'MATH201 - Linear Algebra', room: 'Room 204, Block B', type: 'Lecture' },
                  { time: '14:00 - 15:00', course: 'MATH101 - Calculus I', room: 'Lab 102, Block C', type: 'Tutorial' },
                  { time: '15:30 - 16:30', course: 'Office Hours', room: 'Faculty Office, Rm 412', type: 'Office Hours' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center px-5 py-4 hover:bg-slate-50/50 transition">
                    <div className="w-28 shrink-0">
                      <p className="text-sm font-bold text-blue-600">{s.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{s.course}</p>
                      <p className="text-xs text-slate-400">{s.room}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      s.type === 'Lecture' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      s.type === 'Tutorial' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>{s.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'my_timetable':
        return <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200"><MyTimetable /></div>;
      case 'my_classes':
        return <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200"><MyClasses /></div>;
      case 'attendance':
        return <FacultyAttendanceTab />;
      case 'grading':
        return <FacultyGradingTab />;
      case 'mentoring':
        return <FacultyMentoringTab />;
      case 'feedback':
        return <FacultyFeedbackTab />;
      case 'profile':
        return <FacultyProfileSection profile={facultyProfile} user={currentUser} />;
      case 'admissions':
        if (isDean || isInterviewer) {
          return (
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
              <AdmissionsTab
                isAdmin={true}
                applications={applications}
                departments={departments}
                programs={programs}
                offlineForm={offlineForm}
                setOfflineForm={setOfflineForm}
                showOfflineForm={showOfflineForm}
                setShowOfflineForm={setShowOfflineForm}
                interviewDates={interviewDates}
                setInterviewDates={setInterviewDates}
                allocationForms={allocationForms}
                setAllocationForms={setAllocationForms}
                feeVerifications={feeVerifications}
                setFeeVerifications={setFeeVerifications}
                updateStatus={updateStatus}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                scheduleInterview={scheduleInterview}
                allocateSeat={allocateSeat}
                verifyFeePayment={verifyFeePayment}
                createOfflineApplication={createOfflineApplication}
                verifyDocument={verifyDocument}
                approveScholarship={approveScholarship}
              />
            </div>
          );
        }
        return <div>Access Denied</div>;
      case 'interviews':
        if (isInterviewer) {
          return <InterviewPool />;
        }
        return <div>Access Denied</div>;
      default:
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-700 mb-2">Section Under Construction</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-800 flex overflow-hidden theme-transition font-sans">
      <FacultySidebar activeSection={activeSection} setActiveSection={setActiveSection} user={currentUser} isDean={isDean} isInterviewer={isInterviewer} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          user={currentUser} 
          isAdmin={false}
          facultyProfile={facultyProfile} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          activeRole={activeRole}
          setActiveRole={handleRoleSwitch}
        />

        {/* Dynamic Breadcrumbs */}
        <div className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center text-xs font-bold text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer transition" onClick={() => setActiveSection('overview')}>Home</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Faculty</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-800 capitalize">{activeSection.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
              AY 2025-26
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
