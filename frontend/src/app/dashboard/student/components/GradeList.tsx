'use client';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function GradeList({ results }: { results: any }) {
  
  // Calculate grade distribution for the chart
  const gradeCounts: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
  const resultsArray = Array.isArray(results) ? results : (results?.results || []);

  resultsArray.forEach((r: any) => {
    if (r.grade && gradeCounts[r.grade] !== undefined) {
      gradeCounts[r.grade]++;
    }
  });

  const gradeChartData = Object.keys(gradeCounts).map(g => ({
    grade: g,
    count: gradeCounts[g]
  })).filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-lg">My Results</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-md">B.Tech - CSE</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Year</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Sem</th>
                <th className="px-6 py-4 font-bold tracking-wider text-left">Course Code</th>
                <th className="px-6 py-4 font-bold tracking-wider text-left">Course Name</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Credits</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Grade</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resultsArray.length > 0 ? (
                resultsArray.map((result: any, index: number) => (
                  <tr key={result.id || index} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4 text-center font-medium text-slate-500">1</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-500">1</td>
                    <td className="px-6 py-4 font-black text-slate-800 group-hover:text-blue-600 transition-colors">{result.course_code || (result.course && result.course.code)}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{result.course_name || (result.course && result.course.name)}</td>
                    <td className="px-6 py-4 text-center text-slate-500 font-semibold">{result.course?.credits || 3}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-black text-lg ${result.grade === 'F' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {result.grade === 'F' ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md text-xs">Fail</span>
                      ) : (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md text-xs">Pass</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No results found. End term results will be published here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {gradeChartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-6 uppercase tracking-wider">Grade Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" name="Courses" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
