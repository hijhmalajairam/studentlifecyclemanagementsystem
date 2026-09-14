'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OverviewProps {
  enrollments: any[];
  applications: any[];
  programs: any[];
  departments: any[];
  courses: any[];
  leaves: any[];
  fees: any[];
  isAdmin: boolean;
  facultyProfile?: any;
}

export default function DashboardOverview({ enrollments, applications, programs, departments, courses, leaves, fees, isAdmin, facultyProfile }: OverviewProps) {
  const pendingApps = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'INTERVIEW_PASSED').length;
  const pendingFees = applications.filter(a => a.status === 'FEE_PENDING').length;
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;
  const conversionRate = applications.length > 0 ? Math.round((enrollments.length / applications.length) * 100) : 0;

  // Recharts data for existing charts
  const monthlyData = [
    { name: 'Jan', val: 35 }, { name: 'Feb', val: 52 }, { name: 'Mar', val: 43 },
    { name: 'Apr', val: 67 }, { name: 'May', val: 58 }, { name: 'Jun', val: 72 },
    { name: 'Jul', val: 45 }, { name: 'Aug', val: 80 }, { name: 'Sep', val: 63 },
    { name: 'Oct', val: 55 }, { name: 'Nov', val: 48 }, { name: 'Dec', val: 70 },
  ];

  // Recharts Data Processing

  // 1. Fee Revenue over time (mocked for past 6 months if not enough data)
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const feeRevenueData = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map(month => {
    // In a real scenario, this would aggregate `fees` by paid_date
    return { name: month, revenue: Math.floor(Math.random() * 500000) + 100000 };
  });

  // 2. Student Demographics (Gender from enrollments profile, mocked for now)
  const demographicsData = [
    { name: 'Male', value: 55 },
    { name: 'Female', value: 42 },
    { name: 'Other', value: 3 }
  ];
  const demoColors = ['#3b82f6', '#ec4899', '#8b5cf6'];

  const avgAttendance = 78;
  const pieData = [
    { name: 'Present', value: avgAttendance },
    { name: 'Absent', value: 100 - avgAttendance }
  ];
  const pieColors = ['#10b981', '#334155'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div className="absolute left-20 bottom-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/2 animate-blob"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-blue-200 text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              {isAdmin ? 'Admin Control Center' : `Hello, ${facultyProfile?.user?.first_name || 'Faculty'}!`}
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base font-medium max-w-xl">
              {isAdmin
                ? 'Manage university operations, review applications, and orchestrate student lifecycles with absolute clarity.'
                : `${facultyProfile?.designation || 'Faculty Member'} · ${facultyProfile?.department?.name || ''}`
              }
            </p>
          </div>
          {facultyProfile?.faculty_enrollment_number && (
            <div className="mt-6 md:mt-0 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-1">Faculty ID</p>
              <p className="text-xl font-mono font-black">{facultyProfile.faculty_enrollment_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="🎓" label="Total Students" value={enrollments.length} color="blue" trend="+12%" />
        <StatCard icon="📋" label="Pending Applications" value={pendingApps} color="emerald" trend={pendingApps > 0 ? 'Action Required' : 'All Clear'} />
        <StatCard icon="💳" label="Fee Pending" value={pendingFees} color="amber" trend={pendingFees > 0 ? 'Needs Verification' : 'None'} />
        <StatCard icon="🏢" label="Active Programs" value={programs.length} color="purple" trend={`${departments.length} Depts`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Enrollment Area Chart */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[var(--text-primary)]">Enrollment Trends</h3>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] mt-1">Monthly enrollment trajectory over the year</p>
            </div>
            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">+18% YoY</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sidebar-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--sidebar-border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 800 }}
                  labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Donut */}
        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-black text-[var(--text-primary)] mb-1">Overall Attendance</h3>
          <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-4">University-wide average metric</p>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[var(--text-primary)]">{avgAttendance}%</span>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Average</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 px-2">
              {[
                { label: 'Computer Science', pct: 82, color: 'bg-emerald-500' },
                { label: 'Electronics', pct: 75, color: 'bg-blue-500' },
                { label: 'Mechanical', pct: 68, color: 'bg-amber-500' },
              ].map(d => (
                <div key={d.label} className="flex items-center space-x-3 group cursor-pointer">
                  <span className="text-xs font-bold text-[var(--text-secondary)] w-28 truncate group-hover:text-[var(--text-primary)] transition-colors">{d.label}</span>
                  <div className="flex-1 bg-[var(--sidebar-hover)] rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`${d.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${d.pct}%` }}></div>
                  </div>
                  <span className="text-xs font-black text-[var(--text-primary)] w-8 text-right">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Charts Row for Phase 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics Donut */}
        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-black text-[var(--text-primary)] mb-1">Student Demographics</h3>
          <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-4">Gender distribution</p>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={demoColors[index % demoColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--sidebar-border)', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 800 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[var(--text-primary)]">{enrollments.length}</span>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              {demographicsData.map((d, i) => (
                <div key={d.name} className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: demoColors[i] }}></div>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Revenue Area Chart */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[var(--text-primary)]">Fee Revenue</h3>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] mt-1">Monthly collection in USD</p>
            </div>
            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">+8% MoM</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sidebar-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontWeight: 600 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--sidebar-border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: 800 }}
                  labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Alerts + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] p-6 shadow-sm">
          <h3 className="text-base font-black text-[var(--text-primary)] mb-6 flex items-center">
            <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mr-3 shadow-inner border border-red-500/20">🔔</span>
            Action Items
          </h3>
          <div className="space-y-4">
            {pendingLeaves > 0 && (
              <AlertItem color="orange" icon="🗓" title="Pending Leave Requests" desc={`${pendingLeaves} leave requests need immediate review.`} />
            )}
            {pendingFees > 0 && (
              <AlertItem color="blue" icon="💳" title="Fee Verifications" desc={`${pendingFees} applicants are awaiting fee payment verification.`} />
            )}
            {pendingApps > 0 && (
              <AlertItem color="cyan" icon="📋" title="New Applications" desc={`${pendingApps} student applications are ready for review.`} />
            )}
            {pendingLeaves === 0 && pendingFees === 0 && pendingApps === 0 && (
              <div className="py-8 flex flex-col items-center justify-center text-center bg-[var(--sidebar-hover)] rounded-2xl border border-[var(--sidebar-border)] border-dashed">
                <span className="text-4xl mb-3">✨</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">You're all caught up!</p>
                <p className="text-xs text-[var(--text-tertiary)] font-medium mt-1">No pending action items require your attention.</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion + Department Snapshot */}
        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-black text-[var(--text-primary)] mb-6 flex items-center">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mr-3 shadow-inner border border-indigo-500/20">📊</span>
            University Snapshot
          </h3>
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="bg-[var(--sidebar-hover)] p-5 rounded-2xl border border-[var(--sidebar-border)]">
              <div className="flex justify-between items-end mb-3">
                <p className="text-sm font-bold text-[var(--text-secondary)]">Admissions Conversion Rate</p>
                <p className="text-xl font-black text-[var(--primary-gradient-end)]">{conversionRate}%</p>
              </div>
              <div className="w-full bg-[var(--sidebar-border)] rounded-full h-3 shadow-inner overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${conversionRate}%` }}></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Active Departments</p>
              <div className="flex flex-wrap gap-2">
                {departments.map((d: any) => (
                  <span key={d.id} className="bg-[var(--card-bg)] border border-[var(--sidebar-border)] px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] shadow-sm hover:shadow-md transition-shadow cursor-default">{d.name}</span>
                ))}
                {departments.length === 0 && <span className="text-xs font-medium text-[var(--text-tertiary)] italic">No departments loaded</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <MiniStat label="Active Courses" value={courses.length} />
              <MiniStat label="Total Faculty" value="60+" />
              <MiniStat label="Pending Leaves" value={pendingLeaves} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }: { icon: string; label: string; value: number | string; color: string; trend: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };
  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--sidebar-border)] hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-sm ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">{trend}</span>
      </div>
      <h4 className="text-[var(--text-tertiary)] text-[11px] font-black uppercase tracking-widest mb-1.5">{label}</h4>
      <p className="text-3xl font-black text-[var(--text-primary)] group-hover:text-[var(--primary-gradient-end)] transition-colors">{value}</p>
    </div>
  );
}

function AlertItem({ color, icon, title, desc }: { color: string; icon: string; title: string; desc: string }) {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-600',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
  };
  return (
    <div className={`flex items-center p-4 rounded-2xl border shadow-sm transition-transform hover:scale-[1.02] cursor-pointer ${colorMap[color]}`}>
      <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-lg mr-4 shrink-0 shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-black mb-0.5">{title}</p>
        <p className="text-[11px] font-semibold opacity-80 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center p-3 rounded-2xl bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xl font-black text-[var(--text-primary)]">{value}</p>
      <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
