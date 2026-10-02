import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function InternshipsTab() {
  const [internships, setInternships] = useState<any[]>([]);
  const [windows, setWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intData, winData] = await Promise.all([
        fetchAPI('/academics/internships/'),
        fetchAPI('/academics/internship-windows/')
      ]);
      setInternships(intData);
      setWindows(winData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Internships & Training</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Manage student internships and open internship windows</p>
      </div>

      <div className="p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Active Internship Windows</h3>
        {windows.length === 0 ? (
          <p className="text-slate-500 mb-8">No internship windows active.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {windows.map((w: any) => (
              <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800">{w.title}</h4>
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded ${w.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {w.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  <p>Min Semester: {w.min_semester}</p>
                  <p>Min CGPA: {w.min_cgpa}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 className="text-lg font-bold text-slate-800 mb-4">Student Internships</h3>
        {loading ? (
          <p>Loading...</p>
        ) : internships.length === 0 ? (
          <p className="text-slate-500">No student internships logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Student Enr.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internships.map((int: any) => (
                  <tr key={int.id}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{int.enrollment}</td>
                    <td className="px-4 py-3 text-slate-600">{int.company_name}</td>
                    <td className="px-4 py-3 text-slate-600">{int.role}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${int.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : int.status === 'WAIVED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {int.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
