'use client';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: any;
  isAdmin: boolean;
  facultyProfile?: any;
}

const sidebarSections = [
  {
    group: 'Main',
    items: [
      { id: 'overview', label: 'Dashboard', icon: '⊞' },
      { id: 'admissions', label: 'Admissions', icon: '📋', adminOnly: false },
    ]
  },
  {
    group: 'Academics',
    items: [
      { id: 'academics', label: 'Attendance', icon: '📊' },
      { id: 'timetable', label: 'Timetable', icon: '📅' },
      { id: 'students', label: 'Students', icon: '🎓' },
      { id: 'grade_entry', label: 'Grade Entry', icon: '✏️' },
    ]
  },
  {
    group: 'Management',
    items: [
      { id: 'leaves', label: 'Leave Requests', icon: '🗓' },
      { id: 'fees', label: 'Fee Management', icon: '💳' },
      { id: 'transfers', label: 'Transfers / Exit', icon: '🚪' },
      { id: 'revaluations', label: 'Revaluations', icon: '📝' },
    ]
  },
  {
    group: 'Faculty',
    items: [
      { id: 'faculty', label: 'Faculty Directory', icon: '🧑‍🏫' },
    ]
  },
];

export default function UnifiedSidebar({ activeSection, setActiveSection, user, isAdmin, facultyProfile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col shrink-0 transition-all duration-300 border-r border-[var(--sidebar-border)] shadow-xl relative z-20`}>
      {/* Logo / Brand */}
      <div className={`px-4 py-6 border-b border-[var(--sidebar-border)] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-black tracking-tight text-[var(--text-primary)]">Veritas Grove</h1>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg shadow-blue-500/20">
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
        {sidebarSections.map(section => (
          <div key={section.group}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
                {section.group}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all duration-200 text-xs font-bold ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white shadow-lg shadow-blue-500/30 translate-x-1'
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
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <span className="mr-2">🚪</span>
            Secure Logout
          </button>
        </div>
      )}
    </aside>
  );
}
