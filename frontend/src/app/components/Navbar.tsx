'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    if (!user) return;
    fetchAPI('/academics/notifications/unread_count/').then(data => {
      setUnreadCount(data.count || 0);
    }).catch(() => {});
  }, [user, pathname]);

  const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isLanding = pathname === '/';
  const isDashboard = pathname?.startsWith('/dashboard');
  if (isAuth || isLanding || isDashboard) return null;

  const handleLogout = async () => {
    try {
      await fetchAPI('/users/logout/', { method: 'POST' });
    } catch (e) {  }
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleNotifs = async () => {
    if (!showNotifs) {
      try {
        const data = await fetchAPI('/academics/notifications/');
        setNotifications(data.results || data || []);
      } catch { setNotifications([]); }
    }
    setShowNotifs(!showNotifs);
  };

  const markAllRead = async () => {
    try {
      await fetchAPI('/academics/notifications/mark_all_read/', { method: 'POST' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const primaryRole = user?.role || '';
  const allRoles: string[] = user?.all_roles || (primaryRole ? [primaryRole] : []);
  const isAdmin = user?.is_staff || allRoles.includes('ADMIN');
  const isHOD = allRoles.includes('HOD');
  const isInterviewer = allRoles.includes('INTERVIEWER');
  
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '';
  const initials = user
    ? `${(user.first_name || 'U')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : 'U';

  const roleColors: Record<string, string> = {
    ADMIN: 'from-red-500 to-orange-500',
    HOD: 'from-orange-500 to-amber-500',
    STUDENT: 'from-blue-500 to-cyan-500',
    PROSPECTIVE_STUDENT: 'from-blue-500 to-cyan-500',
    FACULTY: 'from-emerald-500 to-teal-500',
    PARENT: 'from-purple-500 to-pink-500',
  };

  const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/30',
    HOD: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    STUDENT: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    PROSPECTIVE_STUDENT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    FACULTY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    PARENT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const navLinks = [];
  
  // Faculty can always see the Admin Panel if they are HOD, INTERVIEWER, ADMIN or FACULTY. 
  // We can just add Admin Panel for any of these, but in the Admin Panel itself, we'll restrict access to specific tabs.
  const isFaculty = allRoles.includes('FACULTY');
  if (isAdmin || isHOD || isInterviewer || isFaculty) {
    navLinks.push({ href: '/dashboard/admin', label: 'Admin Panel', icon: '🛡️' });
  }
  if (allRoles.includes('STUDENT')) {
    navLinks.push({ href: '/dashboard/student', label: 'My Portal', icon: '🎓' });
  }
  if (allRoles.includes('PROSPECTIVE_STUDENT')) {
    navLinks.push({ href: '/dashboard/prospective', label: 'Dashboard', icon: '🏠' });
    navLinks.push({ href: '/dashboard/prospective/catalog', label: 'Program Catalog', icon: '📖' });
  }
  if (allRoles.includes('FACULTY') || primaryRole === 'FACULTY') {
    navLinks.push({ href: '/dashboard/faculty', label: 'Faculty Panel', icon: '📚' });
  }
  if (allRoles.includes('PARENT')) {
    navLinks.push({ href: '/dashboard/parent', label: 'Parent Portal', icon: '👨‍👩‍👧' });
  }
  navLinks.push({ href: '/dashboard/profile', label: 'Profile', icon: '👤' });

  const notifTypeIcons: Record<string, string> = {
    INFO: '💬', WARNING: '⚠️', ALERT: '🔴', SUCCESS: '✅',
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between z-50 shadow-sm sticky top-0">
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow-md">
            N
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tight hidden sm:inline">
            Veritas Grove University ERP
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-1 ml-4">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname?.startsWith(link.href) 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}>
              <span className="mr-1.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleBadgeColors[primaryRole] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
          {allRoles.length > 1 ? `${primaryRole?.replace('_', ' ')} +${allRoles.length - 1}` : primaryRole?.replace('_', ' ')}
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleNotifs}
            className="relative text-slate-500 hover:text-blue-600 transition p-2 rounded-lg hover:bg-slate-100"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase">
                    Mark All Read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-slate-500 text-sm">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 10).map((n: any) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-slate-50 ${!n.is_read ? 'bg-blue-50' : ''} hover:bg-slate-50 transition`}>
                      <div className="flex items-start space-x-2">
                        <span className="text-sm mt-0.5">{notifTypeIcons[n.notification_type] || '💬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col items-end mr-1">
          <span className="text-sm font-semibold text-slate-900 leading-tight">{displayName}</span>
          <span className="text-[10px] text-slate-400 capitalize">{primaryRole?.toLowerCase().replace('_', ' ')}</span>
        </div>

        {/* Avatar & Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center outline-none focus:ring-2 focus:ring-blue-500 rounded-full focus:ring-offset-2"
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${roleColors[primaryRole] || 'from-blue-500 to-purple-500'} flex items-center justify-center text-white text-sm font-bold shadow-sm hover:shadow-md transition-shadow border border-white`}>
              {initials}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-2 transform origin-top-right transition-all">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || user?.username}</p>
              </div>
              
              <div className="py-1">
                <Link href="/dashboard/profile" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer transition-colors">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span>My Profile</span>
                  </div>
                </Link>
                <Link href="/dashboard/settings" onClick={() => setShowProfileMenu(false)}>
                  <div className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center space-x-2 cursor-pointer transition-colors">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>Settings</span>
                  </div>
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
