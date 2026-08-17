'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import React from 'react';

export default function InterviewerDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [interviewDates, setInterviewDates] = useState<{[key: number]: string}>({});
  const [interviewerNotes, setInterviewerNotes] = useState<{[key: number]: string}>({});

  const refreshData = () => {
    fetchAPI('/admission/applications/pool_interviews/').then(data => setApplications(data)).catch(() => {});
  };

  useEffect(() => { refreshData(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(`/admission/applications/${id}/`, { 
        method: 'PATCH', 
        body: JSON.stringify({ 
          status,
          interviewer_notes: interviewerNotes[id] || '' 
        }) 
      });
      setApplications(apps => apps.filter(app => app.id !== id)); 
    } catch { alert("Failed to update status"); }
  };

  const scheduleInterview = async (id: number) => {
    const interview_date = interviewDates[id];
    if (!interview_date) return alert('Choose an interview date and time first.');
    try {
      const application = await fetchAPI(`/admission/applications/${id}/`, { method: 'PATCH', body: JSON.stringify({ status: 'INTERVIEW_SCHEDULED', interview_date }) });
      setApplications(apps => apps.map(app => app.id === id ? application : app));
    } catch { alert('Failed to schedule interview'); }
  };

  const verifyDocument = async (appId: number, docId: number, status: string) => {
    try {
      await fetchAPI(`/admission/documents/${docId}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setApplications(apps => apps.map(app => {
        if (app.id === appId) {
          return { ...app, documents: app.documents.map((d:any) => d.id === docId ? { ...d, status } : d) };
        }
        return app;
      }));
    } catch { alert("Failed to update doc"); }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Interviewer Dashboard</h1>
            <p className="text-slate-500 text-sm">Verify documents, take notes, and conduct interviews for pending applications.</p>
          </div>
          <div className="flex space-x-3 items-center">
            <div className="bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Pending</span>
              <span className="text-xl font-bold text-slate-900">{applications.length}</span>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Scheduled</span>
              <span className="text-xl font-bold text-amber-500">{applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length}</span>
            </div>
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Entry</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No applications pending interview.</td></tr>
              ) : applications.map(app => (
                <React.Fragment key={app.id}>
                  <tr className="hover:bg-slate-50 transition group bg-white">
                    <td className="px-6 py-4">
                      <button onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)} className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <svg className={`w-4 h-4 mr-2 transition-transform ${expandedRow === app.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        {expandedRow === app.id ? 'Close' : 'Review Profile'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900"><div>{app.profile_details?.username || `Applicant #${app.id}`}</div><div className="text-xs text-slate-500 font-medium">{app.application_number || 'Not submitted'}</div></td>
                    <td className="px-6 py-4 text-sm"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 text-xs font-bold">{app.entry_type}</span></td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        {app.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => updateStatus(app.id, 'INTERVIEW_PASSED')} className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200 transition">Pass Interview</button>
                      <button onClick={() => updateStatus(app.id, 'REJECTED')} className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 transition">Reject</button>
                    </td>
                  </tr>
                  {expandedRow === app.id && (
                    <tr className="bg-slate-50 border-b-2 border-blue-100">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          
                          {/* Academic Profile */}
                          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4 text-sm">🎓 Academic Details</h4>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">10th Grade</p>
                                  <p className="text-sm font-medium text-slate-700">{app.tenth_board} ({app.tenth_passing_year})</p>
                                  <p className="text-lg font-black text-slate-900 mt-1">{app.tenth_percentage}%</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">12th Grade</p>
                                  <p className="text-sm font-medium text-slate-700">{app.twelfth_board} ({app.twelfth_passing_year})</p>
                                  <p className="text-lg font-black text-slate-900 mt-1">{app.twelfth_percentage}%</p>
                                </div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Extracurriculars</p>
                                <p className="text-sm text-slate-700">{app.extra_curricular_achievements || 'None provided'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-4 text-sm">📄 Documents Verification</h4>
                            {app.documents?.length > 0 ? (
                              <div className="space-y-3">
                                {app.documents.map((doc: any) => (
                                  <div key={doc.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                      <span className="block font-bold text-sm text-slate-800 mb-1">{doc.document_name}</span>
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : doc.status === 'FORGED' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>{doc.status}</span>
                                        <a href={`http://localhost:8000${doc.file}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">View File ↗</a>
                                      </div>
                                    </div>
                                    <div className="space-x-1 flex">
                                      <button onClick={() => verifyDocument(app.id, doc.id, 'VERIFIED')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 transition" title="Verify">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                      </button>
                                      <button onClick={() => verifyDocument(app.id, doc.id, 'FORGED')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition" title="Flag Forged">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-sm text-slate-500 italic">No documents uploaded.</p>}
                          </div>

                          {/* Scheduling & Notes */}
                          <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
                            
                            {/* Schedule Interview */}
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm mb-3">🗓 Schedule Interview</h4>
                              <div className="flex gap-2">
                                <input type="datetime-local" value={interviewDates[app.id] || ''} onChange={e => setInterviewDates(prev => ({ ...prev, [app.id]: e.target.value }))} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                                <button onClick={() => scheduleInterview(app.id)} className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-6 rounded-lg text-sm font-bold border border-amber-200 transition">Schedule</button>
                              </div>
                              {app.interview_date && <p className="text-xs text-amber-600 font-bold mt-2">Currently Scheduled: {new Date(app.interview_date).toLocaleString()}</p>}
                            </div>

                            <hr className="border-slate-100" />

                            {/* Interview Notes */}
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm mb-2">📝 Interviewer Notes</h4>
                              <textarea 
                                rows={3}
                                placeholder="Add notes about the candidate's performance... (These will be saved when you Pass or Reject the candidate)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none placeholder-slate-400"
                                value={interviewerNotes[app.id] || ''}
                                onChange={e => setInterviewerNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                              ></textarea>
                            </div>

                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
