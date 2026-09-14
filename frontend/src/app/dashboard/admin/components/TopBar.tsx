'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

interface TopBarProps {
  user: any;
  isAdmin: boolean;
  facultyProfile?: any;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
}

export default function TopBar({ user, isAdmin, facultyProfile, darkMode, setDarkMode, activeRole, setActiveRole }: TopBarProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allRoles = (() => {
    const roles: string[] = [];
    if (isAdmin) roles.push('Administrator');
    if (user?.role === 'FACULTY' || user?.additional_roles?.includes('FACULTY')) roles.push('Faculty');
    // Map additional roles
    const roleMap: Record<string, string> = {
      'HOD': 'Head of Department',
      'DEAN': 'Dean',
      'WARDEN': 'Warden',
      'MESS_INCHARGE': 'Mess Incharge',
      'FINANCE': 'Finance Officer',
      'PLACEMENT_COORDINATOR': 'Placement Coordinator',
      'EXAM_CONTROLLER': 'Exam Controller',
      'LAB_INCHARGE': 'Lab In-charge',
      'SPORTS_COORDINATOR': 'Sports Coordinator',
      'CULTURAL_COORDINATOR': 'Cultural Coordinator',
      'LIBRARY_INCHARGE': 'Library Incharge',
      'HOSTEL_WARDEN': 'Hostel Warden',
      'TRANSPORT_INCHARGE': 'Transport Incharge',
      'INTERVIEWER': 'Interviewer',
    };
    for (const r of (user?.additional_roles || [])) {
      if (roleMap[r] && !roles.includes(roleMap[r])) roles.push(roleMap[r]);
    }
    if (facultyProfile?.admin_role && facultyProfile.admin_role !== 'None') {
      if (!roles.includes(facultyProfile.admin_role)) roles.push(facultyProfile.admin_role);
    }
    for (const r of (facultyProfile?.additional_roles || [])) {
      if (!roles.includes(r)) roles.push(r);
    }
    return roles.length > 0 ? roles : ['Faculty'];
  })();

  return (
    <header className="h-16 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--sidebar-border)] flex items-center justify-between px-8 shrink-0 z-20 sticky top-0 transition-colors duration-300">
      {/* Left: Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search students, courses, faculty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right: Role Switcher + Dark Mode + Notifications + Profile */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher */}
        {allRoles.length > 1 && (
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 hover:bg-blue-500/20 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span>{activeRole}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showRoleDropdown && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-[var(--card-bg)] border border-[var(--sidebar-border)] rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Switch Role</p>
                {allRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => { setActiveRole(role); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-all ${
                      activeRole === role
                        ? 'bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white shadow-md'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)] transition-all shadow-sm"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)] transition-all relative shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">3</span>
        </button>

        {/* Profile */}
        <div className="relative pl-2" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 rounded-xl transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-pink-500/30">
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-[var(--card-bg)] border border-[var(--sidebar-border)] rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-4 border-b border-[var(--sidebar-border)]">
                <p className="text-sm font-black text-[var(--text-primary)]">{user?.first_name} {user?.last_name}</p>
                <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">{user?.email}</p>
                {facultyProfile?.institutional_email && (
                  <p className="text-[10px] font-bold text-blue-500 mt-1 bg-blue-500/10 inline-block px-2 py-0.5 rounded-md">{facultyProfile.institutional_email}</p>
                )}
              </div>
              <a href="/dashboard/profile" className="flex items-center px-5 py-3 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)] transition-colors">
                <UserIcon className="w-4 h-4 mr-3" /> View Profile
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="w-full flex items-center px-5 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" /> Secure Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
