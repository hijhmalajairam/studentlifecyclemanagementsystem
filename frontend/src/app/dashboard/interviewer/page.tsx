'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [interviewerNotes, setInterviewerNotes] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admission/applications/assigned_interviews/', {
        credentials: 'include'
      });
      if (res.ok) {
        setApplications(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admission/applications/${appId}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, interviewer_notes: interviewerNotes })
      });
      if (res.ok) {
        setExpandedApp(null);
        setInterviewerNotes('');
        fetchApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Verification & Interview</h1>
            <p className="text-gray-500 mt-1">Review your assigned applicants</p>
          </div>
          <button onClick={async () => { 
            await fetch('http://localhost:8000/api/users/logout/', { method: 'POST', credentials: 'include' });
            localStorage.clear(); 
            router.push('/login'); 
          }} className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">App No.</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No applicants assigned for interview at the moment.</td>
                </tr>
              ) : (
                applications.map((app: any) => (
                  <React.Fragment key={app.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{app.profile_details?.first_name} {app.profile_details?.last_name}</div>
                        <div className="text-sm text-gray-500">{app.profile_details?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {app.application_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {app.interview_date ? new Date(app.interview_date).toLocaleString() : 'Not Set'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            if (expandedApp === app.id) {
                              setExpandedApp(null);
                            } else {
                              setExpandedApp(app.id);
                              setInterviewerNotes(app.interviewer_notes || '');
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition"
                        >
                          {expandedApp === app.id ? 'Close Panel' : 'Verify & Evaluate'}
                        </button>
                      </td>
                    </tr>
                    
                    {expandedApp === app.id && (
                      <tr className="bg-gray-50 border-b-2 border-indigo-100">
                        <td colSpan={4} className="px-8 py-6">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Academic Details</h4>
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                  <dt className="text-xs font-medium text-gray-500">Previous School</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{app.previous_school_name}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-gray-500">Marks %</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{app.previous_marks_percentage}%</dd>
                                </div>
                              </dl>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Evaluation Notes</h4>
                              <textarea 
                                value={interviewerNotes}
                                onChange={(e) => setInterviewerNotes(e.target.value)}
                                placeholder="Add your remarks on document authenticity, interview performance, etc."
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner bg-white"
                              ></textarea>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider flex items-center justify-between">
                                Documents Provided
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{app.documents?.length || 0} Files</span>
                              </h4>
                              {app.documents?.length === 0 ? (
                                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200">No documents uploaded.</p>
                              ) : (
                                <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                  {app.documents?.map((doc: any) => (
                                    <li key={doc.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800">{doc.document_name}</span>
                                        <span className="text-xs text-gray-400">Status: {doc.status}</span>
                                      </div>
                                      <a href={`http://localhost:8000${doc.file}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition">View File</a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4 bg-gray-100 -mx-8 -mb-6 px-8 py-4 rounded-b-lg">
                            <button 
                              onClick={() => handleUpdateStatus(app.id, 'INTERVIEW_FAILED')}
                              className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-semibold transition shadow-sm"
                            >
                              Fail / Not Eligible
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(app.id, 'INTERVIEW_PASSED')}
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition shadow-sm"
                            >
                              Pass / Eligible
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
