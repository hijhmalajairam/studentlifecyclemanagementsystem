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
import '../admin/dashboard-theme.css';
import TopBar from '../admin/components/TopBar';

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
        return (
          <div className="space-y-6 bg-[#f4f7fa] min-h-full">
            <div>
              <p className="text-[#a41034] text-xs font-bold uppercase tracking-wider mb-2">Faculty of Science and Technology</p>
              <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Good evening, {user?.first_name} {user?.last_name}</h1>
              <p className="text-sm text-slate-500 mt-1">Student · Academic Year 2025-26</p>
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4">My Academics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div onClick={() => setActiveSection('my_courses')} className="bg-white p-6 rounded-xl border-b-2 border-transparent hover:border-[#a41034] shadow-sm cursor-pointer hover:shadow-md transition group">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h4 className="font-bold text-slate-800">My Courses</h4>
                <p className="text-xs text-slate-500 mt-1">Enrolled courses with faculty, weights and materials</p>
              </div>

              <div onClick={() => setActiveSection('my_registration')} className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition group">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <h4 className="font-bold text-slate-800">My Registration</h4>
                <p className="text-xs text-slate-500 mt-1">Courses registered in each semester</p>
              </div>

              <div onClick={() => setActiveSection('attendance')} className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition group">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 className="font-bold text-slate-800">My Attendance</h4>
                <p className="text-xs text-slate-500 mt-1">Course-wise attendance and eligibility status</p>
              </div>

              <div onClick={() => setActiveSection('my_results')} className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition group">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                <h4 className="font-bold text-slate-800">My Results</h4>
                <p className="text-xs text-slate-500 mt-1">Course marks, SGPA and CGPA</p>
              </div>

              <div onClick={() => setActiveSection('my_dashboard')} className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition group">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h4 className="font-bold text-slate-800">My Dashboard</h4>
                <p className="text-xs text-slate-500 mt-1">Personalised academic overview & analytics</p>
              </div>
            </div>
            
            {/* Direct registration summary preview here */}
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Registration Preview</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" onClick={() => setActiveSection('my_registration')}>
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition">
                  <span className="font-bold text-slate-700">1st Semester (Current)</span>
                  <span className="text-blue-600 font-bold text-sm">View Full Details →</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timetable':
        return <TimetableView timetable={timetable} />;

      case 'my_dashboard':
        return <AcademicDashboard results={results} attendance={attendance} />;

      case 'my_registration':
        return <RegistrationView courses={courses} />;
        
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
          <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Hall Ticket Not Available</h2>
            <p className="text-slate-500 mb-6">Hall tickets are generated by the Controller of Examinations (CoE) typically 2 weeks before the End Term examination period begins. Please check back later.</p>
            <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition" onClick={() => setActiveSection('overview')}>Return to Dashboard</button>
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
          <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Notice Board</h2>
            <p className="text-slate-500">There are no active notices for your program at this time.</p>
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
