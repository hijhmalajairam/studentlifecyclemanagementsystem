'use client';

const gradingData = [
  {
    course: 'MATH101 - Calculus I',
    section: 'A',
    totalStudents: 58,
    graded: 58,
    avgMarks: 72.4,
    gradeDistribution: { 'O': 4, 'A+': 8, 'A': 14, 'B+': 12, 'B': 10, 'C': 6, 'P': 3, 'F': 1 },
    status: 'SUBMITTED',
  },
  {
    course: 'MATH201 - Linear Algebra',
    section: 'B',
    totalStudents: 38,
    graded: 30,
    avgMarks: 68.1,
    gradeDistribution: { 'O': 2, 'A+': 5, 'A': 8, 'B+': 7, 'B': 5, 'C': 2, 'P': 1, 'F': 0 },
    status: 'IN_PROGRESS',
  },
];

const recentGrades = [
  { student: 'Aditya Kumar', enrollment: 'ENR-2026-0012', course: 'MATH101', marks: 92, grade: 'O', date: '2026-09-28' },
  { student: 'Sneha Patel', enrollment: 'ENR-2026-0019', course: 'MATH101', marks: 85, grade: 'A+', date: '2026-09-28' },
  { student: 'Vikram Singh', enrollment: 'ENR-2026-0025', course: 'MATH201', marks: 78, grade: 'A', date: '2026-09-27' },
  { student: 'Megha Roy', enrollment: 'ENR-2026-0033', course: 'MATH201', marks: 64, grade: 'B', date: '2026-09-27' },
  { student: 'Deepak Joshi', enrollment: 'ENR-2026-0041', course: 'MATH101', marks: 45, grade: 'P', date: '2026-09-28' },
  { student: 'Ritu Verma', enrollment: 'ENR-2026-0048', course: 'MATH101', marks: 88, grade: 'A+', date: '2026-09-28' },
];

const gradeColors: Record<string, string> = {
  'O': 'bg-emerald-100 text-emerald-800',
  'A+': 'bg-blue-100 text-blue-800',
  'A': 'bg-blue-50 text-blue-700',
  'B+': 'bg-cyan-50 text-cyan-700',
  'B': 'bg-amber-50 text-amber-700',
  'C': 'bg-orange-50 text-orange-700',
  'P': 'bg-slate-100 text-slate-600',
  'F': 'bg-red-100 text-red-700',
};

export default function FacultyGradingTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Grading Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Review grade submissions and distributions across your courses</p>
      </div>

      {/* Course Grade Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {gradingData.map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{c.course}</h3>
                <p className="text-xs text-slate-400">Section {c.section} • {c.totalStudents} students</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                {c.status === 'SUBMITTED' ? 'Submitted' : 'In Progress'}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Graded</p>
                  <p className="text-lg font-black text-slate-800">{c.graded}/{c.totalStudents}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Marks</p>
                  <p className="text-lg font-black text-blue-600">{c.avgMarks}%</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(c.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${gradeColors[grade] || 'bg-slate-100 text-slate-600'}`}>
                    {grade}: {count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Grade Entries */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Grade Entries</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Student</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Course</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase">Marks</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase">Grade</th>
              <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentGrades.map((g, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-slate-800">{g.student}</p>
                  <p className="text-xs text-slate-400 font-mono">{g.enrollment}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{g.course}</td>
                <td className="px-5 py-4 text-center text-sm font-bold text-slate-800">{g.marks}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${gradeColors[g.grade] || 'bg-slate-100'}`}>{g.grade}</span>
                </td>
                <td className="px-5 py-4 text-right text-sm text-slate-500">{g.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
