import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function DisciplineTab() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/academics/disciplinary-cases/');
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await fetchAPI(`/academics/disciplinary-cases/${selectedCase.id}/record_decision/`, {
        method: 'POST',
        body: JSON.stringify({ decision, remarks })
      });
      alert('Decision recorded successfully!');
      setSelectedCase(null);
      setDecision('');
      setRemarks('');
      fetchCases();
    } catch (error: any) {
      alert(error.message || 'Failed to record decision');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Disciplinary Cases</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Review and resolve reported academic malpractices</p>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <p>Loading cases...</p>
        ) : cases.length === 0 ? (
          <p className="text-slate-500">No disciplinary cases reported.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Student Enr.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c: any) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{c.title}</td>
                    <td className="px-4 py-3 text-slate-600">{c.enrollment}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(c.date_of_incident).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.status !== 'RESOLVED' ? (
                        <button 
                          onClick={() => setSelectedCase(c)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{c.committee_decision}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedCase && (
          <div className="mt-8 p-6 bg-slate-50 rounded-md border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Record Decision for: {selectedCase.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{selectedCase.description}</p>
            <form onSubmit={handleDecision} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Committee Decision</label>
                <select 
                  className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:border-blue-500"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  required
                >
                  <option value="">-- Select Decision --</option>
                  <option value="CLEARED">Cleared (Remove Hold)</option>
                  <option value="MARKS_CANCELLED">Marks Cancelled (Backlog Path)</option>
                  <option value="SUSPENSION_YEAR_DROP">Suspension / Year Drop (Dropout)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                <textarea
                  className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:border-blue-500"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Submit Decision</button>
                <button type="button" onClick={() => setSelectedCase(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
