'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import React from 'react';
import './dashboard-theme.css';
import UnifiedSidebar from './components/UnifiedSidebar';
import TopBar from './components/TopBar';
import DisciplineTab from './components/DisciplineTab';
import InternshipsTab from './components/InternshipsTab';
import DashboardOverview from './components/DashboardOverview';
import FacultyTab from './components/FacultyTab';
import AdmissionsTab from './components/AdmissionsTab';
import StudentsTab from './components/StudentsTab';
import UniversityManagementTab from './components/UniversityManagementTab';
import StaffingTab from './components/StaffingTab';
import HostelTab from './components/HostelTab';
import LibraryTab from './components/LibraryTab';
import AlumniTab from './components/AlumniTab';
import TransportTab from './components/TransportTab';
import PlacementTab from './components/PlacementTab';
import AttendanceTab from './components/AttendanceTab';
import GradeEntryTab from './components/GradeEntryTab';
import LeavesTab from './components/LeavesTab';
import FeesTab from './components/FeesTab';
import TimetableTab from './components/TimetableTab';
import TransfersTab from './components/TransfersTab';
import RevaluationsTab from './components/RevaluationsTab';

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
        if (['FACULTY', 'HOD', 'INTERVIEWER'].includes(u.role) || u.all_roles?.includes('FACULTY')) {
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
  const isTrueAdmin = currentUser?.is_staff || allRoles.includes('ADMIN');
    const isDean = allRoles.includes('DEAN') || facultyProfile?.admin_role === 'Dean' || facultyProfile?.admin_role === 'Academics Dean';
    const isInterviewer = allRoles.includes('INTERVIEWER');
    const isAdmin = isTrueAdmin || isDean || isInterviewer;
  const isHOD = allRoles.includes('HOD') || facultyProfile?.admin_role === 'Head of Department';
  const isTransport = facultyProfile?.admin_role === 'Transport Incharge';
  const myDepartmentId = facultyProfile?.department;

  // Apply RBAC Filters
  const visibleDepartments = departments;
  const visiblePrograms = programs;
  const visibleCourses = courses; 
  const visibleApplications = isAdmin ? applications : []; // Admissions processed by admin
  const hasWriteAccess = isAdmin || isHOD;
  const visibleTimetable = timetable;
  const visibleLeaves = leaves;
  const visibleTransfers = transfers;
  const visibleRevaluations = revaluations;
  const visibleFees = fees;

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
    if (!form?.allocated_program) return alert('Please select a program.');
    if (!form?.start_year || !form?.end_year) return alert('Please select both a Start Year and an End Year.');
    
    const payload = {
      application: id,
      allocated_department: form.allocated_department,
      allocated_program: form.allocated_program,
      allocated_batch: `${form.start_year}-${form.end_year}`
    };

    try {
      await fetchAPI('/admission/allocations/', { method: 'POST', body: JSON.stringify(payload) });
      refreshData();
    } catch (error: any) { alert('Seat allocation failed: ' + (error.message || error)); }
  };

  const verifyFeePayment = async (appId: number) => {
    if (feeVerifications[appId]?.toLowerCase() !== 'yes') {
      return alert("Please type 'yes' to confirm fee payment.");
    }
    try {
      await fetchAPI(`/admission/applications/${appId}/pay_fees/`, { method: 'POST' });
      alert("Fee payment verified. Student enrolled!");
      refreshData();
    } catch (err: any) {
      alert("Failed to verify fee payment: " + (err.message || err));
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
    <div className="h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden theme-transition font-sans">
      <UnifiedSidebar
        activeSection={activeTab}
        setActiveSection={setActiveTab}
        user={currentUser}
        isAdmin={isAdmin}
        isHOD={isHOD}
        isTransport={isTransport}
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
            {activeTab === 'internships' && (
                <InternshipsTab />
              )}

              {activeTab === 'discipline' && (
                <DisciplineTab />
              )}

              {activeTab === 'overview' && (
              <DashboardOverview
                enrollments={enrollments}
                applications={visibleApplications}
                programs={visiblePrograms}
                departments={visibleDepartments}
                courses={visibleCourses}
                leaves={leaves}
                fees={fees}
                isAdmin={isAdmin}
                facultyProfile={facultyProfile}
              />
            )}

            {/* ─── UNIVERSITY MANAGEMENT TAB ─── */}
            {activeTab === 'university_mgmt' && (
              <UniversityManagementTab />
            )}

            {/* ─── FACULTY TAB ─── */}
            {activeTab === 'faculty' && (
              <FacultyTab isAdmin={isAdmin} departments={visibleDepartments} />
            )}

            {/* ─── ADMISSIONS TAB ─── */}
            {activeTab === 'admissions' && (
              <AdmissionsTab
                isAdmin={isAdmin}
                applications={visibleApplications}
                scheduleInterview={scheduleInterview}
                interviewDates={interviewDates}
                setInterviewDates={setInterviewDates}
                departments={visibleDepartments}
                programs={visiblePrograms}
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
              <AttendanceTab
                courses={visibleCourses}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                attendanceDate={attendanceDate}
                setAttendanceDate={setAttendanceDate}
                attendanceData={attendanceData}
                handleAttendanceChange={handleAttendanceChange}
                submitAttendance={submitAttendance}
                getStudentsForCourse={getStudentsForCourse}
              />
            )}

            {/* ─── GRADE ENTRY TAB ─── */}
            {activeTab === 'grade_entry' && (
              <GradeEntryTab
                courses={visibleCourses}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                gradeEntries={gradeEntries}
                handleGradeChange={handleGradeChange}
                submitGrades={submitGrades}
                getStudentsForCourse={getStudentsForCourse}
              />
            )}

            {/* ─── LEAVES TAB ─── */}
            {activeTab === 'leaves' && (
              <LeavesTab
                leaves={visibleLeaves}
                updateLeaveStatus={updateLeaveStatus}
                isAdmin={isAdmin}
                hasWriteAccess={hasWriteAccess}
              />
            )}

            {/* ─── STUDENTS TAB ─── */}
            {activeTab === 'students' && (
              <StudentsTab
                enrollments={enrollments}
                applications={applications}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
              />
            )}

            {/* ─── FEE MANAGEMENT ─── */}
            {activeTab === 'fees' && (
              <FeesTab
                fees={visibleFees}
                enrollments={enrollments}
                feeForm={feeForm}
                setFeeForm={setFeeForm}
                createFee={createFee}
                isAdmin={isAdmin}
                hasWriteAccess={hasWriteAccess}
              />
            )}

            {/* ─── TIMETABLE ─── */}
            {activeTab === 'timetable' && (
              <TimetableTab
                timetable={visibleTimetable}
                courses={visibleCourses}
                ttForm={ttForm}
                setTtForm={setTtForm}
                createTimetableSlot={createTimetableSlot}
                isAdmin={isAdmin}
                hasWriteAccess={hasWriteAccess}
              />
            )}

            {/* ─── TRANSFERS ─── */}
            {activeTab === 'transfers' && (
              <TransfersTab
                transfers={visibleTransfers}
                updateTransferStatus={updateTransferStatus}
                isAdmin={isAdmin}
                hasWriteAccess={hasWriteAccess}
              />
            )}

            {/* ─── REVALUATIONS ─── */}
            {activeTab === 'revaluations' && (
              <RevaluationsTab
                revaluations={visibleRevaluations}
                updateRevalStatus={updateRevalStatus}
                isAdmin={isAdmin}
                hasWriteAccess={hasWriteAccess}
              />
            )}

            {/* ─── STAFFING TAB ─── */}
            {activeTab === 'staffing' && (
              <StaffingTab />
            )}

            {/* ─── HOSTEL TAB ─── */}
            {activeTab === 'hostel' && (
              <HostelTab />
            )}

            {/* ─── LIBRARY TAB ─── */}
            {activeTab === 'library' && (
              <LibraryTab />
            )}

            {/* ─── TRANSPORT TAB ─── */}
            {activeTab === 'transport' && (
              <TransportTab />
            )}

            {/* ─── PLACEMENT TAB ─── */}
            {activeTab === 'placement' && (
              <PlacementTab />
            )}

            {/* ─── ALUMNI TAB ─── */}
            {activeTab === 'alumni' && (
              <AlumniTab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
