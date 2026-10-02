'use client';

const mentees = [
  {
    name: 'Aditya Kumar',
    enrollment: 'ENR-2026-0012',
    program: 'B.Tech Mathematics & Computing',
    semester: 3,
    cgpa: 8.72,
    attendance: '91%',
    status: 'On Track',
    lastMeeting: '2026-09-25',
    notes: 'Strong analytical aptitude. Recommended for research assistantship next semester.',
  },
  {
    name: 'Sneha Patel',
    enrollment: 'ENR-2026-0019',
    program: 'B.Tech Mathematics & Computing',
    semester: 3,
    cgpa: 9.14,
    attendance: '95%',
    status: 'On Track',
    lastMeeting: '2026-09-22',
    notes: 'Preparing for summer internship at IISc. Excellent progress in coursework.',
  },
  {
    name: 'Rahul Mehra',
    enrollment: 'ENR-2026-0041',
    program: 'B.Sc Mathematics',
    semester: 5,
    cgpa: 6.85,
    attendance: '62%',
    status: 'At Risk',
    lastMeeting: '2026-09-18',
    notes: 'Attendance below threshold. Counseling session scheduled. Family issues reported.',
  },
  {
    name: 'Priya Sharma',
    enrollment: 'ENR-2026-0058',
    program: 'B.Sc Mathematics',
    semester: 5,
    cgpa: 7.45,
    attendance: '65%',
    status: 'Needs Attention',
    lastMeeting: '2026-09-20',
    notes: 'Backlog in MATH301. Advised to attend remedial tutorials.',
  },
  {
    name: 'Vikram Singh',
    enrollment: 'ENR-2026-0025',
    program: 'B.Tech Mathematics & Computing',
    semester: 3,
    cgpa: 8.23,
    attendance: '88%',
    status: 'On Track',
    lastMeeting: '2026-09-26',
    notes: 'Interested in competitive mathematics. Recommended for Olympiad training camp.',
  },
];

const meetingLog = [
  { date: '2026-09-26', student: 'Vikram Singh', topic: 'Career guidance - Competitive math path', outcome: 'Enrolled in Olympiad prep' },
  { date: '2026-09-25', student: 'Aditya Kumar', topic: 'Research assistant application review', outcome: 'Application forwarded to dept head' },
  { date: '2026-09-22', student: 'Sneha Patel', topic: 'IISc internship preparation', outcome: 'Resume and SOP reviewed' },
  { date: '2026-09-20', student: 'Priya Sharma', topic: 'Academic performance review', outcome: 'Remedial plan created' },
  { date: '2026-09-18', student: 'Rahul Mehra', topic: 'Attendance counseling', outcome: 'Parent-teacher meeting scheduled' },
];

export default function FacultyMentoringTab() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Mentoring Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Track progress and well-being of your assigned mentees</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-blue-500 uppercase">Total Mentees</p>
            <p className="text-xl font-black text-blue-700">{mentees.length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-red-500 uppercase">At Risk</p>
            <p className="text-xl font-black text-red-700">{mentees.filter(m => m.status === 'At Risk').length}</p>
          </div>
        </div>
      </div>

      {/* Mentee Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {mentees.map((m, i) => (
          <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition ${m.status === 'At Risk' ? 'border-red-200' : m.status === 'Needs Attention' ? 'border-amber-200' : 'border-slate-200'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{m.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{m.enrollment}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  m.status === 'On Track' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  m.status === 'At Risk' ? 'bg-red-50 text-red-600 border border-red-200' :
                  'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>{m.status}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{m.program} • Sem {m.semester}</p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-slate-50 rounded-xl p-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">CGPA</p>
                  <p className="text-sm font-black text-slate-800">{m.cgpa}</p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl p-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Attend.</p>
                  <p className={`text-sm font-black ${parseFloat(m.attendance) >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{m.attendance}</p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl p-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Last Met</p>
                  <p className="text-sm font-black text-slate-600">{m.lastMeeting.slice(5)}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mentor Notes</p>
                <p className="text-xs text-slate-600 leading-relaxed">{m.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Meetings</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Date</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Student</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Topic</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {meetingLog.map((ml, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-600">{ml.date}</td>
                <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{ml.student}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{ml.topic}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{ml.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
