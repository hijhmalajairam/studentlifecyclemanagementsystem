'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import StudentSidebar from './components/StudentSidebar';
import ContactDetails from './components/ContactDetails';
import PermanentAddress from './components/PermanentAddress';
import PresentAddress from './components/PresentAddress';
import MedicalRecord from './components/MedicalRecord';
import BankDetails from './components/BankDetails';
import ProfileSection from './components/ProfileSection';
import AttendanceTable from './components/AttendanceTable';
import GradeList from './components/GradeList';
import TimetableView from './components/TimetableView';
import AcademicDashboard from './components/AcademicDashboard';
import RegistrationView from './components/RegistrationView';
import StudentOverviewTab from './components/StudentOverviewTab';
import PlacementPrepTab from './components/PlacementPrepTab';
import FinancialAidTab from './components/FinancialAidTab';
import GrievanceTab from './components/GrievanceTab';
import '../admin/dashboard-theme.css';
import TopBar from '../admin/components/TopBar';

const noticeItems = [
  {
    id: 1,
    category: 'Academic',
    title: 'Mid-semester registration opens on Monday',
    description:
      'Students should complete course selection, verify credit limits, and confirm advisor approvals before the registration window closes.',
    meta: 'Today · 08:15 AM',
    audience: 'All students',
    priority: 'High',
  },
  {
    id: 2,
    category: 'Examination',
    title: 'Internal assessment schedule released',
    description:
      'The updated assessment calendar includes room assignments, invigilation notes, and submission deadlines for all ongoing modules.',
    meta: 'Yesterday · 06:40 PM',
    audience: 'Years 2-4',
    priority: 'Important',
  },
  {
    id: 3,
    category: 'Administrative',
    title: 'ID card revalidation and document check',
    description:
      'Students with pending document verification must visit the academic office with a recent photograph and university ID by Friday.',
    meta: '3 days ago',
    audience: 'Pending verification',
    priority: 'Reminder',
  },
];

const hallTicketDetails = [
  { label: 'Exam session', value: 'End Semester · November 2026' },
  { label: 'Programme', value: 'B.Sc. Computer Science' },
  { label: 'Hall ticket status', value: 'Not yet released' },
  { label: 'Expected release', value: '14 days before the first paper' },
];

const hallTicketChecklist = [
  'Verify your name, registration number, and course codes once the ticket is live.',
  'Carry a university ID card and a government photo ID to the exam centre.',
  'Reach the venue at least 30 minutes before reporting time.',
  'Keep a printed copy and a mobile backup of the hall ticket.',
];

export default function StudentDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  
  // States
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // Theming state
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  const { data: studentProfile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => fetchAPI('/academics/student-profiles/my_profile/')
  });

  const { data: enrollment, isLoading: loadingEnrollment } = useQuery({
    queryKey: ['enrollment'],
    queryFn: () => fetchAPI('/academics/enrollment/my_enrollment/')
  });

  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => fetchAPI('/academics/attendance/my_attendance/')
  });

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['results'],
    queryFn: () => fetchAPI('/academics/results/my_results/')
  });

  const { data: coursesResponse, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchAPI('/academics/courses/')
  });

  const { data: timetable = [], isLoading: loadingTimetable } = useQuery({
    queryKey: ['timetable'],
    queryFn: () => fetchAPI('/academics/timetable/my_timetable/')
  });
  
  const courses = coursesResponse?.results || coursesResponse || [];

  const loading = loadingProfile || loadingEnrollment || loadingAttendance || loadingResults || loadingCourses || loadingTimetable;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <StudentOverviewTab />;

      case 'timetable':
        return <TimetableView timetable={timetable} />;

      case 'my_dashboard':
        return <AcademicDashboard results={results} attendance={attendance} />;

      case 'my_registration':
        return <RegistrationView courses={courses} />;
        
      case 'financial_aid':
        return <FinancialAidTab />;
        
      case 'grievance':
        return <GrievanceTab />;
        
      case 'placement_prep':
        return <PlacementPrepTab />;
        
      case 'contact_details':
        return <ContactDetails profile={studentProfile} onUpdate={() => refetchProfile()} />;
        
      case 'permanent_address':
        return <PermanentAddress profile={studentProfile} onUpdate={() => refetchProfile()} />;
        
      case 'present_address':
        return <PresentAddress profile={studentProfile} onUpdate={() => refetchProfile()} />;
        
      case 'medical_record':
        return <MedicalRecord profile={studentProfile} onUpdate={() => refetchProfile()} />;
        
      case 'bank_details':
        return <BankDetails profile={studentProfile} onUpdate={() => refetchProfile()} />;
        
      case 'profile':
        return <ProfileSection profile={studentProfile} />;
        
      case 'attendance':
        return <AttendanceTable attendanceRecords={attendance} />;
        
      case 'my_results':
        return <GradeList results={results} />;
        
      case 'my_courses':
        return (
          <div className="space-y-6">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-xl shadow-sm">
              <h2 className="font-bold text-slate-800 text-lg">My Enrolled Courses</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-md">{courses.length} Courses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c: any, index: number) => (
                <div key={c.id || index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className={`h-2 ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-slate-400 text-sm">{c.code}</span>
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">Section A</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4">{c.name}</h3>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center text-sm text-slate-600">
                        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        Course Coordinator TBA
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        {c.credits} Credits
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 p-3 bg-slate-50 flex justify-end space-x-2">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">Syllabus</button>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">Materials</button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  No courses enrolled for the current semester.
                </div>
              )}
            </div>
          </div>
        );

      case 'my_hall_ticket':
        return (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400"></div>
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/60 blur-2xl"></div>
              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      Hall Ticket Center
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">End Semester Hall Ticket</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Your hall ticket area is ready for the release window. Once the Controller of Examinations publishes the document, this panel will surface the download, print, and verification actions.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Secure document workflow</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Mobile and print ready</span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Student portal preview</span>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:w-[24rem]">
                    {hallTicketDetails.map((item) => (
                      <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_25%,#ffffff_100%)] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200 pb-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-700">Exam admission preview</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Student identity and verification block</h3>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Pending release</span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Student</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
                        <p className="mt-1 text-sm text-slate-500">Registration number will appear here</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Exam hall ticket number</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">TBA</p>
                        <p className="mt-1 text-sm text-slate-500">Available after exam office publication</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Release progress</p>
                          <p className="mt-1 text-sm font-medium text-slate-700">Preparing for final verification and signature</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Expected</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">14 days before the first paper</p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400"></div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => window.print()} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
                        Download PDF
                      </button>
                      <button onClick={() => window.print()} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                        Print Preview
                      </button>
                      <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
                        Exam Schedule
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-700">Important instructions</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">Before you download or print</h3>
                    </div>

                    <div className="space-y-3">
                      {hallTicketChecklist.map((item, index) => (
                        <div key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">0{index + 1}</div>
                          <p className="text-sm leading-6 text-slate-600">{item}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-900">Need help after release?</p>
                      <p className="mt-1 text-sm leading-6 text-blue-800/90">
                        Contact the examination office if your name, programme, or photo is incorrect once the ticket becomes available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'mobile_portal':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mx-auto">
            <div className="bg-[#a41034] text-white px-6 py-4 flex items-center justify-center relative">
              <h2 className="font-bold text-lg text-center tracking-wide">University Mobile App Portal</h2>
            </div>
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-3xl mb-6 shadow-inner border border-slate-200">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Connect Your Mobile Device</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Download the official university application to access your hall tickets, receive instant notifications for marks, and track your attendance on the go.</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <button className="flex flex-col items-center justify-center bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition">
                  <span className="text-[10px] uppercase tracking-widest opacity-70">Download on the</span>
                  <span className="font-bold text-sm">App Store</span>
                </button>
                <button className="flex flex-col items-center justify-center bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition">
                  <span className="text-[10px] uppercase tracking-widest opacity-70">GET IT ON</span>
                  <span className="font-bold text-sm">Google Play</span>
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 border-t border-slate-200 p-4 grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-blue-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Hall Ticket</div></div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-emerald-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Marks</div></div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-amber-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Attendance</div></div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><div className="font-black text-purple-600 mb-1">✓</div><div className="text-xs font-bold text-slate-600">Settings</div></div>
            </div>
          </div>
        );

      case 'notice_board':
        return (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-700 via-blue-600 to-sky-500"></div>
              <div className="absolute -left-20 -top-12 h-40 w-40 rounded-full bg-blue-100/70 blur-2xl"></div>
              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-3 max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      Notice Board
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Latest updates for your academic timeline</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Notices are grouped by academic, examination, and administrative relevance so students can quickly scan what needs action today.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:min-w-[20rem]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-2xl font-semibold text-slate-900">{noticeItems.length}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Active notices</p>
                    </div>
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
                      <p className="text-2xl font-semibold text-blue-700">2</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700/80">High priority</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <p className="text-2xl font-semibold text-emerald-700">24h</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700/80">Average update window</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="space-y-4">
                    {noticeItems.map((notice) => (
                      <article key={notice.id} className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">{notice.category}</span>
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">{notice.audience}</span>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${notice.priority === 'High' ? 'bg-rose-50 text-rose-700' : notice.priority === 'Important' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                {notice.priority}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold tracking-tight text-slate-900">{notice.title}</h3>
                              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{notice.description}</p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path>
                              </svg>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Updated</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{notice.meta}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            Action required within the current academic window
                          </div>
                          <button className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100">
                            View details
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Quick glance</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">What needs attention</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Today</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">Registration and assessment updates</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">Review deadlines, confirm approvals, and check course submission windows before the day ends.</p>
                      </div>
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Exam notice</p>
                        <p className="mt-2 text-sm font-semibold text-blue-900">Hall ticket release is pending</p>
                        <p className="mt-1 text-sm leading-6 text-blue-800/90">Your hall ticket panel now shows the release timeline and a printable preview area.</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Support</p>
                        <p className="mt-2 text-sm font-semibold text-emerald-900">Academic office hours</p>
                        <p className="mt-1 text-sm leading-6 text-emerald-800/90">Visit the student helpdesk for verification, revalidation, and exam-related assistance.</p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-700 mb-2">Section Under Construction</h2>
            <p className="text-slate-500">This module is currently being updated to match the new university SIS standards.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-800 flex overflow-hidden theme-transition font-sans">
      <StudentSidebar activeSection={activeSection} setActiveSection={setActiveSection} user={user} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          user={user} 
          isAdmin={false} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          activeRole="Student"
          setActiveRole={() => {}}
        />

        {/* Dynamic Breadcrumbs */}
        <div className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center text-xs font-bold text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer transition" onClick={() => setActiveSection('overview')}>Home</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Academics</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-800 capitalize">{activeSection.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
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
