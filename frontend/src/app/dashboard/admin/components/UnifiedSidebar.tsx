'use client';
import { useState } from 'react';
import { LayoutDashboard, Users, Settings, FileText, Calendar, Edit3, Briefcase, GraduationCap, Building, Search, Home, Library, Bus, LogOut, CheckSquare } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: any;
  isAdmin: boolean;
  isHOD?: boolean;
  isTransport?: boolean;
  facultyProfile?: any;
}

const sidebarSections = [
  {
    group: 'Main',
    items: [
      { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'admissions', label: 'Admissions', icon: <FileText size={18} />, adminOnly: false },
    ]
  },
  {
    group: 'Academics',
    items: [
      { id: 'university_mgmt', label: 'University Setup', icon: <Building size={18} /> },
      { id: 'academics', label: 'Attendance', icon: <FileText size={18} /> },
      { id: 'timetable', label: 'Timetable', icon: <Calendar size={18} /> },
      { id: 'students', label: 'Students', icon: <FileText size={18} /> },
      { id: 'grade_entry', label: 'Grade Entry', icon: <Edit3 size={18} /> },
        { id: 'internships', label: 'Internships', icon: <Briefcase size={18} /> },
    ]
  },
  {
    group: 'Management',
    items: [
      { id: 'staffing', label: 'Staffing & Roles', icon: <Users size={18} /> },
      { id: 'leaves', label: 'Leave Requests', icon: <FileText size={18} /> },
      { id: 'fees', label: 'Fee Management', icon: <FileText size={18} /> },
        { id: 'discipline', label: 'Discipline Cases', icon: <CheckSquare size={18} /> },
      { id: 'transfers', label: 'Transfers / Exit', icon: <LogOut size={18} /> },
      { id: 'revaluations', label: 'Revaluations', icon: <FileText size={18} /> },
    ]
  },
  {
    group: 'Campus Life',
    items: [
      { id: 'hostel', label: 'Hostel Management', icon: <Home size={18} /> },
      { id: 'library', label: 'Library System', icon: <Library size={18} /> },
      { id: 'transport', label: 'Transport', icon: <Bus size={18} /> },
      { id: 'alumni', label: 'Alumni Network', icon: <FileText size={18} /> },
    ]
  },
  {
    group: 'Career',
    items: [
      { id: 'placement', label: 'Placement Cell', icon: <Briefcase size={18} /> },
    ]
  },
  {
    group: 'Faculty',
    items: [
      { id: 'faculty', label: 'Faculty Directory', icon: <GraduationCap size={18} /> },
    ]
  },
];

export default function UnifiedSidebar({ activeSection, setActiveSection, user, isAdmin, isHOD, isTransport, facultyProfile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filteredSections = sidebarSections.map(section => {
    return {
      ...section,
      items: section.items.filter(item => {
        if (isAdmin) return true;
        if (isHOD) {
          return ['overview', 'academics', 'timetable', 'students', 'grade_entry', 'leaves', 'transfers', 'revaluations', 'faculty', 'discipline', 'internships'].includes(item.id);
        }
        if (isTransport) {
          return ['overview', 'transport', 'students'].includes(item.id);
        }
        // Normal faculty
        return ['overview', 'academics', 'timetable', 'students', 'grade_entry'].includes(item.id);
      })
    };
  }).filter(section => section.items.length > 0);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col shrink-0 transition-all duration-300 border-r border-[var(--sidebar-border)] shadow-xl relative z-20`}>
      {/* Logo / Brand */}
      <div className={`px-4 py-6 border-b border-[var(--sidebar-border)] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">Veritas Grove</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">University ERP</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] transition text-[var(--sidebar-text)]">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Mini Card */}
      {!collapsed && (
        <div className="px-5 py-5 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-lg shadow-blue-500/20">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-[11px] font-semibold text-[var(--text-secondary)] truncate">
                {isAdmin ? 'System Administrator' : facultyProfile?.designation || 'Faculty Member'}
              </p>
            </div>
          </div>
          {facultyProfile?.faculty_enrollment_number && (
            <div className="mt-3 px-3 py-1.5 bg-blue-500/10 rounded-lg text-[11px] font-mono font-bold text-blue-500 text-center border border-blue-500/20">
              {facultyProfile.faculty_enrollment_number}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {filteredSections.map(section => (
          <div key={section.group}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                {section.group}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded transition-all duration-200 text-xs font-bold ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                      : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] hover:translate-x-1'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`text-base ${collapsed ? '' : 'mr-3'} ${activeSection === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
                  {!collapsed && item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      {!collapsed && (
        <div className="px-5 py-4 border-t border-[var(--sidebar-border)] bg-[var(--bg-primary)]">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center px-4 py-3 rounded text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <LogOut size={16} className="mr-2" />
            Secure Logout
          </button>
        </div>
      )}
    </aside>
  );
}
