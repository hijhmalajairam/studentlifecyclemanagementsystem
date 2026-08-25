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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading committee portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                ⚖️ Disciplinary Committee Panel
              </h1>
              <p className="text-slate-400 mt-1">
                Review active malpractice cases and record official decisions.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Active Cases</h2>
                {cases.length > 0 ? (
                  <div className="space-y-4">
                    {cases.map((c: any) => (
                      <div key={c.id} 
                        className={`bg-slate-900/50 p-6 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-lg ${selectedCase?.id === c.id ? 'border-indigo-500 shadow-indigo-500/20' : 'border-slate-700/50 hover:border-indigo-400/50'}`}
                        onClick={() => setSelectedCase(c)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{c.title}</h3>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-sm font-mono text-slate-400">Student ID: ENR-{c.enrollment}</p>
                          </div>
                          <button className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-600/40 hover:text-white transition">
                            Review Case
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium text-slate-400">No disciplinary cases found.</p>
                    <p className="text-sm text-slate-500 mt-1">All clear on the academic front.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              {selectedCase ? (
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 sticky top-8 shadow-2xl">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-bold text-white">Case Review</h2>
                    <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="space-y-5 mb-8">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</p>
                      <p className="text-slate-200 font-medium">{selectedCase.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                        <p className="text-slate-300 text-sm font-mono">{selectedCase.date_of_incident}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</p>
                        <p className="text-slate-300 text-sm">{selectedCase.assessment_type}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reported By</p>
                      <p className="text-indigo-400 font-medium text-sm">{selectedCase.reported_by_name || 'System'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <p className="text-slate-300 text-sm leading-relaxed">{selectedCase.description}</p>
                      </div>
                    </div>
                  </div>

                  {selectedCase.status !== 'RESOLVED' ? (
                    <form onSubmit={handleDecision} className="space-y-5 bg-slate-900/30 p-6 rounded-2xl border border-indigo-900/30">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Committee Action
                      </h3>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Decision Outcome</label>
                        <select required
                          className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
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
                        <textarea placeholder="Enter rationale for decision..." required
                          className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-28 resize-none transition"
                          value={decisionForm.remarks} onChange={e => setDecisionForm({ ...decisionForm, remarks: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/20 active:scale-[0.98]">
                        Record Official Decision
                      </button>
                    </form>
                  ) : (
                    <div className="bg-emerald-950/30 p-6 rounded-2xl border border-emerald-900/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="font-bold text-emerald-400 text-lg">Case Resolved</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Final Decision</p>
                          <p className="text-slate-200 font-medium">{selectedCase.committee_decision}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</p>
                          <p className="text-slate-300 text-sm">{selectedCase.committee_remarks}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center h-64 flex flex-col items-center justify-center">
                  <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <p className="text-slate-400 font-medium">Select a case from the queue<br/>to review and record a decision.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
