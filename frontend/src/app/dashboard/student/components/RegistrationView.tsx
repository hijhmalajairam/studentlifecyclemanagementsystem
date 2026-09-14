'use client';

export default function RegistrationView({ courses }: { courses: any[] }) {
  // Mock data if courses are empty for presentation purposes
  const registrations = courses.length > 0 ? courses : [
    { id: 1, code: 'IS412', name: 'Database Management Systems', section: 'A', semester: 1, type: 'Regular', grade: 'Pending', registered_on: '2025-08-10' },
    { id: 2, code: 'IS413', name: 'Operating Systems', section: 'A', semester: 1, type: 'Regular', grade: 'Pending', registered_on: '2025-08-10' },
    { id: 3, code: 'IS414', name: 'Computer Networks', section: 'A', semester: 1, type: 'Regular', grade: 'Pending', registered_on: '2025-08-10' },
    { id: 4, code: 'IS415', name: 'Software Engineering', section: 'A', semester: 1, type: 'Regular', grade: 'Pending', registered_on: '2025-08-10' },
    { id: 5, code: 'IS416', name: 'Data Structures and Algorithms', section: 'A', semester: 1, type: 'Regular', grade: 'Pending', registered_on: '2025-08-10' },
    { id: 6, code: 'MA101', name: 'Mathematics I', section: 'A', semester: 1, type: 'Backlog', grade: 'Pending', registered_on: '2025-08-10' },
  ];

  // Group by semester
  const sem1 = registrations.filter(c => c.semester === 1 || c.semester === undefined);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="font-bold text-slate-800 text-lg">1st Semester</h2>
            <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Current</span>
          </div>
          <div className="text-sm font-semibold text-slate-500">
            {sem1.length} courses registered
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-12 text-center">#</th>
                <th className="px-6 py-4 font-bold tracking-wider">Course</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Section</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Sem</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Type</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Grade</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sem1.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4 text-center text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{c.code}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{c.name}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-center">{c.section || 'A'}</td>
                  <td className="px-6 py-4 text-slate-500 font-semibold text-center">{c.semester || 1}</td>
                  <td className="px-6 py-4 text-center">
                    {c.type === 'Backlog' ? (
                      <span className="text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md text-xs">Backlog</span>
                    ) : (
                      <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs">Regular</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {c.grade === 'Pending' || !c.grade ? (
                      <span className="text-slate-400 font-medium">Pending</span>
                    ) : (
                      <span className="font-black text-slate-800">{c.grade}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-right font-medium">
                    {c.registered_on || '10 Aug, 2025'}
                  </td>
                </tr>
              ))}
              {sem1.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">No courses registered in this semester.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
