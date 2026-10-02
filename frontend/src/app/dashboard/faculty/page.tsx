'use client';

import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import '../admin/dashboard-theme.css'; // Reuse theme
import MyTimetable from './components/MyTimetable';
import MyClasses from './components/MyClasses';
import InternshipManager from './components/InternshipManager';
import FacultyOpportunities from './components/FacultyOpportunities';

export default function FacultyDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('my_dashboard');
  const [loading, setLoading] = useState(true);

  const [internalAssessments, setInternalAssessments] = useState<any[]>([]);
  const [disciplinaryCases, setDisciplinaryCases] = useState<any[]>([]);
  const [courseGradingSchemes, setCourseGradingSchemes] = useState<any[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  
  // Grading Scheme State
  const [gradingSchemeForm, setGradingSchemeForm] = useState({ mean: '', stdDev: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        fetchAPI(`/academics/faculty-profiles/?user=${u.id}`)
          .then(data => {
            if (data && data.length > 0) {
              setFacultyProfile(data[0]);
            }
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-slate-400">Loading...</div>;
  }

  const additionalRoles = currentUser?.all_roles || [];
  const isHOD = additionalRoles.some((r: string) => r.startsWith('HOD_'));
  const isPlacement = additionalRoles.includes('PLACEMENT_DIRECTOR');
  const isWarden = additionalRoles.includes('CHIEF_WARDEN') || additionalRoles.includes('HOSTEL_WARDEN');
  const isCOE = additionalRoles.includes('CONTROLLER_OF_EXAMINATIONS');

  const sidebarSections = [
    {
      group: 'Base',
      items: [
        { id: 'my_dashboard', label: 'My Dashboard', icon: '⊞' },
        { id: 'my_timetable', label: 'My Timetable', icon: '📅' },
        { id: 'my_classes', label: 'My Classes', icon: '🧑‍🏫' },
      ]
    }
  ];

  
  sidebarSections.push({
    group: 'Internships',
    items: [
      { id: 'internship_manager', label: 'Internship Manager', icon: '🏢' },
      { id: 'faculty_opportunities', label: 'My Opportunities', icon: '🧑‍🏫' },
    ]
  });

  if (isHOD) {
    sidebarSections.push({
      group: 'Department',
      items: [
        { id: 'department_overview', label: 'Department Overview', icon: '🏢' },
      ]
    });
  }
  if (isPlacement) {
    sidebarSections.push({
      group: 'Placement',
      items: [
        { id: 'placement_cell', label: 'Placement Cell', icon: '💼' },
      ]
    });
  }
  if (isWarden) {
    sidebarSections.push({
      group: 'Hostel',
      items: [
        { id: 'hostel_management', label: 'Hostel Management', icon: '🏠' },
      ]
    });
  }
  if (isCOE) {
    sidebarSections.push({
      group: 'Exams',
      items: [
        { id: 'exam_cell', label: 'Exam Cell', icon: '📝' },
      ]
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden theme-transition font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col shrink-0 transition-all duration-300 border-r border-[var(--sidebar-border)] shadow-xl relative z-20">
        <div className="px-4 py-6 border-b border-[var(--sidebar-border)] flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black tracking-tight text-[var(--text-primary)]">Veritas Grove</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Faculty Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {sidebarSections.map(section => (
            <div key={section.group}>
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
                {section.group}
              </p>
              <div className="space-y-1">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-xs font-bold ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white shadow-lg shadow-blue-500/30 translate-x-1'
                        : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] hover:translate-x-1'
                    }`}
                  >
                    <span className={`text-base mr-3 ${activeSection === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-[var(--sidebar-border)] bg-[var(--bg-primary)]">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <span className="mr-2">🚪</span>
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar equivalent (simplified) */}
        <header className="bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Faculty Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{currentUser?.first_name} {currentUser?.last_name}</p>
              <p className="text-xs text-slate-500">{facultyProfile?.designation || 'Faculty Member'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              {currentUser?.first_name?.[0] || 'F'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Welcome Header */}
            <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-9xl">🎓</div>
              <div className="relative z-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  Welcome back, Prof. {currentUser?.last_name || currentUser?.first_name}!
                </h1>
                <p className="text-slate-500 font-medium mb-6">
                  {facultyProfile?.department_name || 'Department'} • {facultyProfile?.designation || 'Faculty'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold shadow-sm">
                    {currentUser?.role || 'FACULTY'}
                  </span>
                  {additionalRoles.map((role: string) => (
                    <span key={role} className="px-3 py-1.5 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg text-xs font-bold shadow-sm">
                      {role.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl min-h-[400px]">
              {activeSection === 'my_timetable' && <MyTimetable />}
              {activeSection === 'my_classes' && <MyClasses />}
              {activeSection === 'internship_manager' && <InternshipManager />}
              {activeSection === 'faculty_opportunities' && <FacultyOpportunities />}
              {activeSection === 'my_dashboard' && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4 opacity-50">⊞</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Dashboard Overview</h3>
                  <p className="text-slate-400">Select an item from the sidebar to view your teaching materials.</p>
                </div>
              )}
              {/* Fallback for HOD/Placement tabs for now */}
              {!['my_timetable', 'my_classes', 'my_dashboard', 'internship_manager', 'faculty_opportunities'].includes(activeSection) && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4 opacity-50">
                    {sidebarSections.flatMap(s => s.items).find(i => i.id === activeSection)?.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {sidebarSections.flatMap(s => s.items).find(i => i.id === activeSection)?.label}
                  </h3>
                  <p className="text-slate-400">
                    This advanced module is being built out now.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
      
      {/* Evidence Preview Modal */}
      {previewEvidence && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-sm font-bold text-slate-200">Evidence Document</h3>
              <button onClick={() => setPreviewEvidence(null)} className="text-slate-400 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 bg-slate-950/50 p-4">
              <iframe src={previewEvidence.startsWith('http') ? previewEvidence : `http://localhost:8000${previewEvidence}`} className="w-full h-full rounded-xl border border-slate-800 bg-white" title="Evidence Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
