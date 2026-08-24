'use client';
import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function CommitteeDashboard() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [decisionForm, setDecisionForm] = useState({ decision: '', remarks: '' });

  const fetchCases = async () => {
    try {
      const data = await fetchAPI('/academics/disciplinary-cases/');
      setCases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !decisionForm.decision) return;
    try {
      await fetchAPI(`/academics/disciplinary-cases/${selectedCase.id}/record_decision/`, {
        method: 'POST',
        body: JSON.stringify(decisionForm)
      });
      alert('Decision recorded successfully!');
      setSelectedCase(null);
      setDecisionForm({ decision: '', remarks: '' });
      fetchCases();
    } catch (err: any) {
      alert('Failed to record decision');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <h1 className="text-3xl font-bold mb-8">Disciplinary Committee Panel</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Active Cases</h2>
          {loading ? (
            <p>Loading...</p>
          ) : cases.length > 0 ? (
            <div className="space-y-4">
              {cases.map((c: any) => (
                <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-300" onClick={() => setSelectedCase(c)}>
                  <div>
                    <h3 className="font-bold text-lg">{c.title}</h3>
                    <p className="text-sm text-slate-500">Student Enrollment ID: {c.enrollment}</p>
                    <p className="text-sm text-slate-500">Status: <span className="font-semibold text-blue-600">{c.status}</span></p>
                  </div>
                  <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">Review</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No disciplinary cases found.</p>
          )}
        </div>

        <div>
          {selectedCase ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-24">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Case Review</h2>
                <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-4 mb-6 text-sm text-slate-700">
                <p><strong>Title:</strong> {selectedCase.title}</p>
                <p><strong>Date of Incident:</strong> {selectedCase.date_of_incident}</p>
                <p><strong>Reported By:</strong> {selectedCase.reported_by_name || 'System'}</p>
                <p><strong>Assessment Type:</strong> {selectedCase.assessment_type}</p>
                <p><strong>Description:</strong> {selectedCase.description}</p>
              </div>

              {selectedCase.status !== 'RESOLVED' ? (
                <form onSubmit={handleDecision} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Decision Outcome</label>
                    <select required
                      className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={decisionForm.decision} onChange={e => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                    >
                      <option value="">-- Select Decision --</option>
                      <option value="CLEARED">Cleared (No Action)</option>
                      <option value="MARKS_CANCELLED">Marks Cancelled (Fail/Backlog)</option>
                      <option value="SUSPENSION_YEAR_DROP">Suspension / Year Drop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Committee Remarks</label>
                    <textarea placeholder="Enter remarks and rationale for decision..." required
                      className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                      value={decisionForm.remarks} onChange={e => setDecisionForm({ ...decisionForm, remarks: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">Record Official Decision</button>
                </form>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 mb-2">Case Resolved</p>
                  <p className="text-sm"><strong>Decision:</strong> {selectedCase.committee_decision}</p>
                  <p className="text-sm mt-1"><strong>Remarks:</strong> {selectedCase.committee_remarks}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center h-64 flex flex-col items-center justify-center">
              <p className="text-slate-400">Select a case from the queue to review and record a decision.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
