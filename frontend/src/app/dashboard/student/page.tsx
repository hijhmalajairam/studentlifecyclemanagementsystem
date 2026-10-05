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
import StudentInternshipPortal from './components/StudentInternshipPortal';
import AcademicDashboard from './components/AcademicDashboard';
import RegistrationView from './components/RegistrationView';
import StudentOverviewTab from './components/StudentOverviewTab';
import PlacementPrepTab from './components/PlacementPrepTab';
import FinancialAidTab from './components/FinancialAidTab';
import GrievanceTab from './components/GrievanceTab';
import '../admin/dashboard-theme.css';
import TopBar from '../admin/components/TopBar';
import MyCoursesView from './components/MyCoursesView';
import HallTicketView from './components/HallTicketView';
import MobilePortalView from './components/MobilePortalView';
import NoticeBoardView from './components/NoticeBoardView';

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
        
      case 'internships':
        return <StudentInternshipPortal enrollment={studentProfile?.enrollments?.[0]} />;
        
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
        return <MyCoursesView courses={courses} />;

      case 'my_hall_ticket':
        return <HallTicketView user={user} />;
        
      case 'mobile_portal':
        return <MobilePortalView />;

      case 'notice_board':
        return <NoticeBoardView />;

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
    <div className="h-screen bg-[#f4f7fa] text-slate-800 flex overflow-hidden theme-transition font-sans">
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
