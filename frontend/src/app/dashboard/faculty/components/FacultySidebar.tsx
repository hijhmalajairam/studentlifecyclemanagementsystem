'use client';
import { useState } from 'react';
import { LayoutDashboard, Calendar, BookOpen, User, Users, FileText, Briefcase, UserCheck, Star, ClipboardList, Award } from 'lucide-react';

type SidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: any;
  isDean: boolean;
  isInterviewer: boolean;
};

export default function FacultySidebar({ activeSection, setActiveSection, user, isDean, isInterviewer }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItemClass = (section: string) => `
    flex items-center space-x-3 px-6 py-3.5 text-sm transition-all duration-200 cursor-pointer
    ${activeSection === section 
      ? 'bg-[#404376] border-l-4 border-[#e9ecef] font-medium text-white shadow-inner' 
      : 'text-slate-300 hover:bg-[#343663] hover:text-white border-l-4 border-transparent'}
  `;

  return (
    <div className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'} bg-[#2b2d5c] text-white flex flex-col shrink-0 z-30 shadow-xl`}>
      <div className="p-5 flex items-center justify-between bg-[#23254c] mb-2 shadow-sm">
        {!collapsed && (
          <div className="flex items-center space-x-3 text-white pl-2">
          <div className="bg-[#e41a4a] text-white p-2 rounded-lg shadow-sm border border-[#f52b5b]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight leading-tight">Veritas Grove</h2>
            <p className="text-[10px] text-indigo-200 tracking-wider font-semibold uppercase mt-0.5">Faculty Portal</p>
          </div>
        </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <div className={navItemClass('overview')} onClick={() => setActiveSection('overview')}>
          <LayoutDashboard size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>Dashboard</span>}
        </div>
        
        <div className={navItemClass('profile')} onClick={() => setActiveSection('profile')}>
          <User size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>My Profile</span>}
        </div>

        {!collapsed && <div className="px-6 py-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academics</div>}
        
        <div className={navItemClass('my_timetable')} onClick={() => setActiveSection('my_timetable')}>
          <Calendar size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>My Timetable</span>}
        </div>
        
        <div className={navItemClass('my_classes')} onClick={() => setActiveSection('my_classes')}>
          <BookOpen size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>My Classes</span>}
        </div>
        
        <div className={navItemClass('attendance')} onClick={() => setActiveSection('attendance')}>
          <UserCheck size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>Attendance</span>}
        </div>

        <div className={navItemClass('grading')} onClick={() => setActiveSection('grading')}>
          <ClipboardList size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>Grading</span>}
        </div>

        {!collapsed && <div className="px-6 py-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsibilities</div>}
        
        <div className={navItemClass('mentoring')} onClick={() => setActiveSection('mentoring')}>
          <Award size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>Mentoring</span>}
        </div>

        <div className={navItemClass('feedback')} onClick={() => setActiveSection('feedback')}>
          <Star size={18} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>Student Feedback</span>}
        </div>

        {(isDean || isInterviewer) && (
          <>
            {!collapsed && <div className="px-6 py-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administration</div>}
            
            <div className={navItemClass('admissions')} onClick={() => setActiveSection('admissions')}>
              <Users size={18} className={collapsed ? 'mx-auto' : ''} />
              {!collapsed && <span>Admissions & Interviews</span>}
            </div>
          </>
        )}
        
        {isInterviewer && (
          <>
            {!collapsed && <div className="px-6 py-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interviewer</div>}
            
            <div className={navItemClass('interviews')} onClick={() => setActiveSection('interviews')}>
              <Briefcase size={18} className={collapsed ? 'mx-auto' : ''} />
              {!collapsed && <span>Interview Pool</span>}
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-[#23254c] mt-auto flex flex-col border-t border-[#343663]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-[#2b2d5c] flex items-center justify-center font-bold text-xs shrink-0">
            {user?.first_name?.charAt(0) || 'F'}{user?.last_name?.charAt(0) || ''}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-white uppercase">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{isDean ? 'Academics Dean' : isInterviewer ? 'Interviewer' : 'Faculty'}</p>
            </div>
          )}
        </div>
        <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center px-4 py-2 rounded text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all duration-300"
          >
            Logout
        </button>
      </div>
    </div>
  );
}
