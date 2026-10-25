'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  LogOut, 
  User as UserIcon,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Click outside to dismiss dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch unread count and notifications
  const loadNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetchAPI('/academics/notifications/unread_count/'),
        fetchAPI('/academics/notifications/')
      ]);
      setUnreadCount(countRes?.count ?? 0);
      setNotifications(Array.isArray(listRes) ? listRes : (listRes?.results || []));
    } catch (err) {
      // Graceful silence if unauthenticated or offline
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 45 seconds for new alerts
    const interval = setInterval(loadNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetchAPI('/academics/notifications/mark_all_read/', { method: 'POST' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      await fetchAPI(`/academics/notifications/${id}/mark_read/`, { method: 'POST' });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

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

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <header className="h-16 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--sidebar-border)] flex items-center justify-between px-8 shrink-0 z-20 sticky top-0 transition-colors duration-300">
      {/* Left: Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search students, courses, faculty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
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
              className="flex items-center space-x-2 px-4 py-2 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 hover:bg-blue-500/20 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span>{activeRole}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showRoleDropdown && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-[var(--card-bg)] border border-[var(--sidebar-border)] rounded-md shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">Switch Role</p>
                {allRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => { setActiveRole(role); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-all ${
                      activeRole === role
                        ? 'bg-blue-600 text-white shadow-md'
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
          className="w-10 h-10 rounded flex items-center justify-center bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)] transition-all shadow-sm"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) loadNotifications();
            }}
            className="w-10 h-10 rounded flex items-center justify-center bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)] transition-all relative shadow-sm"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-[var(--card-bg)] border border-[var(--sidebar-border)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* Header */}
              <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-extrabold text-[var(--text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--sidebar-border)]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No notifications right now.</p>
                    <p className="mt-0.5">You're completely up to date!</p>
                  </div>
                ) : (
                  notifications.slice(0, 15).map(n => {
                    const isWarning = n.notification_type === 'WARNING';
                    const isSuccess = n.notification_type === 'SUCCESS';

                    return (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkSingleRead(n.id)}
                        className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                          !n.is_read 
                            ? 'bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/15' 
                            : 'hover:bg-[var(--card-hover)] opacity-75'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                          isWarning 
                            ? 'bg-amber-500/10 text-amber-600' 
                            : isSuccess 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {isWarning ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-bold truncate ${!n.is_read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <div className="flex items-center space-x-1 text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(n.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-[var(--sidebar-border)] bg-slate-50/50 dark:bg-slate-800/30 text-center">
                <a
                  href="/dashboard/student"
                  className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block"
                >
                  View Veritas Grove Notification Center
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative pl-2" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 rounded transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-pink-500/30">
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-[var(--card-bg)] border border-[var(--sidebar-border)] rounded-md shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-4 border-b border-[var(--sidebar-border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.first_name} {user?.last_name}</p>
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