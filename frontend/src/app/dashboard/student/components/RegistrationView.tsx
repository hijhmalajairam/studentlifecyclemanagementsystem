'use client';

export default function RegistrationView({ courses, enrollment }: { courses: any[]; enrollment?: any }) {
  // Use real registered courses if available, otherwise fallback
  const registrations = courses.length > 0 ? courses : [
    { id: 1, code: 'CS101', name: 'Intro to Programming', section: 'A', semester: 1, academic_year: '1st Year', type: 'Regular', grade: 'Pending', registered_on: '2026-08-10' },
    { id: 2, code: 'CS102', name: 'Data Structures', section: 'A', semester: 1, academic_year: '1st Year', type: 'Regular', grade: 'Pending', registered_on: '2026-08-10' },
    { id: 3, code: 'MA101', name: 'Engineering Mathematics I', section: 'A', semester: 1, academic_year: '1st Year', type: 'Regular', grade: 'Pending', registered_on: '2026-08-10' },
    { id: 4, code: 'PY101', name: 'Engineering Physics', section: 'A', semester: 1, academic_year: '1st Year', type: 'Regular', grade: 'Pending', registered_on: '2026-08-10' },
    { id: 5, code: 'CY101', name: 'Engineering Chemistry', section: 'A', semester: 1, academic_year: '1st Year', type: 'Regular', grade: 'Pending', registered_on: '2026-08-10' },
  ];

  // Group by semester
  const sem1 = registrations.filter(c => c.semester === 1 || c.semester === undefined);
  const totalCredits = sem1.reduce((sum, c) => sum + (Number(c.credits) || 3), 0);

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Institutional Registration Record
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Course Registration • 1st Year • Semester 1
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              {enrollment?.program_name || 'B.Tech Computer Science & Engineering'} • Section A • Academic Year 2026-2027
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="block text-xl font-black text-slate-900">{sem1.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Courses</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
              <span className="block text-xl font-black text-emerald-700">{totalCredits}</span>
              <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Credits</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              Approved
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-slate-800 text-base">Semester 1 Enrolled Course Register</h3>
            <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Current Term</span>
          </div>
          <div className="text-sm font-semibold text-slate-500">
            {sem1.length} courses registered ({totalCredits} Credits)
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-12 text-center">#</th>
                <th className="px-6 py-4 font-bold tracking-wider">Course</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Year & Sem</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Section</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Credits</th>
                <th className="px-6 py-4 font-bold tracking-wider">Instructor</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Type</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sem1.map((c, i) => (
                <tr key={c.id || c.code} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4 text-center text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{c.code}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{c.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{c.department_name || 'Engineering'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md text-xs">
                      {c.academic_year || '1st Year'} • Sem {c.semester || 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-center">{c.section || 'Section A'}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-center">{c.credits || 3}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-800">{c.faculty_name || 'Faculty Assigned'}</div>
                    <div className="text-[10px] text-slate-400">Course Mentor</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {c.type === 'Backlog' ? (
                      <span className="text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md text-xs">Backlog</span>
                    ) : (
                      <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs">Regular</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-md text-xs">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
              {sem1.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-medium">No courses registered in this semester.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
