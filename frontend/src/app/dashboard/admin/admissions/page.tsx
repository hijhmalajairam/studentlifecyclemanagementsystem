'use client';
import { useState, useEffect } from 'react';

export default function AdminAdmissionsDashboard() {
  const [activeTab, setActiveTab] = useState<'review' | 'offline' | 'allocation'>('review');
  const [applications, setApplications] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Application List State
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);

  // Scheduling State
  const [scheduleAppId, setScheduleAppId] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');

  // Offline Form State
  const [offUsername, setOffUsername] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [offPassword, setOffPassword] = useState('');
  const [offFirstName, setOffFirstName] = useState('');
  const [offLastName, setOffLastName] = useState('');
  const [offPhone, setOffPhone] = useState('');
  const [offPrevSchool, setOffPrevSchool] = useState('');
  const [offMarks, setOffMarks] = useState('');
  const [offSubmitMsg, setOffSubmitMsg] = useState('');

  // Allocation State
  const [allocAppId, setAllocAppId] = useState('');
  const [allocProgram, setAllocProgram] = useState('');
  const [allocDept, setAllocDept] = useState('');
  const [allocBatch, setAllocBatch] = useState('');
  const [allocMsg, setAllocMsg] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/users/interviewers/', {
        credentials: 'include'
      });
      if (res.ok) {
        setInterviewers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admission/applications/', {
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

  const submitOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        user: {
          username: offUsername,
          email: offEmail,
          password: offPassword,
          first_name: offFirstName,
          last_name: offLastName,
          phone: offPhone
        },
        profile: {
          phone: offPhone
        },
        application: {
          previous_school_name: offPrevSchool,
          previous_marks_percentage: offMarks || null
        }
      };

      const res = await fetch('http://localhost:8000/api/admission/applications/create_offline/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setOffSubmitMsg('Successfully created offline application!');
        fetchApplications();
        // clear form
        setOffUsername(''); setOffEmail(''); setOffPassword(''); setOffFirstName(''); setOffLastName(''); setOffPhone(''); setOffPrevSchool(''); setOffMarks('');
      } else {
        const err = await res.json();
        setOffSubmitMsg('Error: ' + JSON.stringify(err));
      }
    } catch (err) {
      setOffSubmitMsg('Error creating offline application.');
    }
  };

  const allocateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/admission/allocations/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application: allocAppId,
          allocated_department: allocDept,
          allocated_program: allocProgram,
          allocated_batch: allocBatch
        })
      });
      if (res.ok) {
        setAllocMsg('Seat allocated successfully! Student moved to FEE PENDING.');
        fetchApplications();
        setAllocAppId(''); setAllocProgram(''); setAllocDept(''); setAllocBatch('');
      } else {
        const err = await res.json();
        setAllocMsg('Error: ' + JSON.stringify(err));
      }
    } catch (err) {
      setAllocMsg('Error allocating seat.');
    }
  };

  const updateStatus = async (appId: number, newStatus: string, additionalData: any = {}) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admission/applications/${appId}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, ...additionalData })
      });
      if (res.ok) {
        setScheduleAppId(null);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleAppId || !selectedInterviewer || !scheduleDate) return;
    updateStatus(scheduleAppId, 'INTERVIEW_SCHEDULED', {
      interviewer: selectedInterviewer,
      interview_date: scheduleDate
    });
  };

  const getTimelineSteps = (status: string) => {
    const STATUS_STEPS = ['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_PASSED', 'SELECTED', 'FEE_PENDING', 'ENROLLED'];
    // INTERVIEW_FAILED is a terminal side state, so we handle it specially.
    let currentIdx = STATUS_STEPS.indexOf(status);
    if (status === 'INTERVIEW_FAILED') currentIdx = 2; // stops after interview
    if (status === 'REJECTED') currentIdx = 0; // or similar
    return { steps: STATUS_STEPS, currentIdx };
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admissions Office</h1>
            <p className="text-gray-500 mt-1">Manage all online and offline student applications.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-max">
          <button onClick={() => setActiveTab('review')} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'review' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Review Applications</button>
          <button onClick={() => setActiveTab('offline')} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'offline' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>New Offline Entry</button>
          <button onClick={() => setActiveTab('allocation')} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'allocation' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Seat Allocation</button>
        </div>

        {/* Tab 1: Review */}
        {activeTab === 'review' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-4 font-medium rounded-tl-lg border-b">Applicant & Identifiers</th>
                    <th className="p-4 font-medium border-b">Type</th>
                    <th className="p-4 font-medium border-b">Status</th>
                    <th className="p-4 font-medium border-b">Marks</th>
                    <th className="p-4 font-medium rounded-tr-lg border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {applications.map(app => (
                    <React.Fragment key={app.id}>
                      <tr className={`border-b border-gray-50 transition-colors ${expandedAppId === app.id ? 'bg-indigo-50/30' : 'hover:bg-gray-50/50'}`}>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{app.profile_details?.first_name} {app.profile_details?.last_name}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-1">App: {app.application_number}</div>
                          <div className="text-xs text-gray-500 font-mono">Reg: {app.profile_details?.registration_number}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.entry_type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {app.entry_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            app.status === 'ENROLLED' ? 'bg-green-100 text-green-700 border-green-200' :
                            app.status === 'INTERVIEW_FAILED' || app.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700 font-medium">{app.previous_marks_percentage}%</td>
                        <td className="p-4 space-x-2">
                          <button 
                            onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)} 
                            className="px-3 py-1 bg-white text-gray-700 hover:bg-gray-100 rounded text-xs font-medium border border-gray-200 shadow-sm"
                          >
                            {expandedAppId === app.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedAppId === app.id && (
                        <tr className="bg-gray-50 border-b-2 border-indigo-100 shadow-inner">
                          <td colSpan={5} className="p-8">
                            <div className="mb-8">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Application Timeline</h3>
                              <div className="relative pt-2">
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                  <div style={{ width: `${Math.max(5, (getTimelineSteps(app.status).currentIdx / (getTimelineSteps(app.status).steps.length - 1)) * 100)}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${app.status === 'INTERVIEW_FAILED' || app.status === 'REJECTED' ? 'bg-red-500' : 'bg-indigo-600'}`}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 uppercase tracking-widest">
                                  <span className={getTimelineSteps(app.status).currentIdx >= 1 ? 'text-indigo-600' : ''}>Submitted</span>
                                  <span className={getTimelineSteps(app.status).currentIdx >= 2 ? 'text-indigo-600' : ''}>Interview</span>
                                  <span className={getTimelineSteps(app.status).currentIdx >= 3 ? 'text-indigo-600' : ''}>Verified</span>
                                  <span className={getTimelineSteps(app.status).currentIdx >= 4 ? 'text-indigo-600' : ''}>Selected</span>
                                  <span className={getTimelineSteps(app.status).currentIdx >= 5 ? 'text-indigo-600' : ''}>Fee Pend</span>
                                  <span className={getTimelineSteps(app.status).currentIdx >= 6 ? 'text-indigo-600' : ''}>Enrolled</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                              {/* Applicant Data */}
                              <div className="col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Profile Details</h4>
                                <dl className="space-y-3 text-sm">
                                  <div><dt className="text-gray-500 text-xs">Full Name</dt><dd className="font-medium text-gray-900">{app.profile_details?.first_name} {app.profile_details?.last_name}</dd></div>
                                  <div><dt className="text-gray-500 text-xs">Email</dt><dd className="font-medium text-gray-900">{app.profile_details?.email}</dd></div>
                                  <div><dt className="text-gray-500 text-xs">Phone</dt><dd className="font-medium text-gray-900">{app.profile_details?.phone || 'N/A'}</dd></div>
                                  <div><dt className="text-gray-500 text-xs">Parents</dt><dd className="font-medium text-gray-900">{app.profile_details?.father_name} & {app.profile_details?.mother_name}</dd></div>
                                  <div><dt className="text-gray-500 text-xs">Family Income</dt><dd className="font-medium text-gray-900">₹{app.profile_details?.family_income || 'N/A'}</dd></div>
                                  <div><dt className="text-gray-500 text-xs">Previous School</dt><dd className="font-medium text-gray-900">{app.previous_school_name}</dd></div>
                                </dl>
                              </div>

                              {/* Documents & Interview */}
                              <div className="col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Documents</h4>
                                {app.documents?.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic">No documents uploaded.</p>
                                ) : (
                                  <ul className="space-y-2 mb-4">
                                    {app.documents?.map((doc: any) => (
                                      <li key={doc.id} className="flex justify-between items-center text-xs">
                                        <a href={`http://localhost:8000${doc.file}`} target="_blank" className="text-indigo-600 hover:underline font-medium truncate w-32">{doc.document_name}</a>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{doc.status}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mt-6 mb-2 pb-2 border-b border-gray-100">Verification Notes</h4>
                                <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 min-h-[60px] italic">
                                  {app.interviewer_notes || 'No remarks left yet.'}
                                </p>
                              </div>

                              {/* Admin Actions */}
                              <div className="col-span-1 bg-gray-100 p-5 rounded-xl border border-gray-200">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Admin Actions</h4>
                                <div className="flex flex-col space-y-3">
                                  {app.status === 'SUBMITTED' && (
                                    <button onClick={() => setScheduleAppId(app.id)} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">Schedule Verification</button>
                                  )}
                                  {app.status === 'INTERVIEW_PASSED' && (
                                    <button onClick={() => updateStatus(app.id, 'SELECTED')} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-sm">Mark as Selected</button>
                                  )}
                                  {(app.status === 'SUBMITTED' || app.status === 'INTERVIEW_FAILED' || app.status === 'INTERVIEW_PASSED') && (
                                    <button onClick={() => updateStatus(app.id, 'REJECTED')} className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition shadow-sm">Reject Application</button>
                                  )}
                                  {app.status === 'ENROLLED' && (
                                    <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200 text-center">
                                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Enrollment Number</p>
                                      <p className="text-lg font-black text-gray-900">{app.enrollment_number}</p>
                                    </div>
                                  )}
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
        )}

        {/* Schedule Interview Modal */}
        {scheduleAppId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule Interview</h3>
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Interviewer / Verifier</label>
                  <select required value={selectedInterviewer} onChange={e => setSelectedInterviewer(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none">
                    <option value="">-- Select Interviewer --</option>
                    {interviewers.map(i => (
                      <option key={i.id} value={i.id}>{i.first_name} {i.last_name} ({i.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" required value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button type="button" onClick={() => setScheduleAppId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Offline Entry */}
        {activeTab === 'offline' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Manual Offline Application Entry</h2>
            {offSubmitMsg && <div className="mb-4 p-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm">{offSubmitMsg}</div>}
            <form onSubmit={submitOffline} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1 text-gray-700">First Name</label><input type="text" required value={offFirstName} onChange={e=>setOffFirstName(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
                <div><label className="block text-sm mb-1 text-gray-700">Last Name</label><input type="text" required value={offLastName} onChange={e=>setOffLastName(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1 text-gray-700">Username</label><input type="text" required value={offUsername} onChange={e=>setOffUsername(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
                <div><label className="block text-sm mb-1 text-gray-700">Email</label><input type="email" required value={offEmail} onChange={e=>setOffEmail(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
              </div>
              <div><label className="block text-sm mb-1 text-gray-700">Temporary Password</label><input type="text" required value={offPassword} onChange={e=>setOffPassword(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
              
              <hr className="border-gray-100" />
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1 text-gray-700">Phone</label><input type="text" required value={offPhone} onChange={e=>setOffPhone(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
                <div><label className="block text-sm mb-1 text-gray-700">Marks %</label><input type="number" step="0.01" value={offMarks} onChange={e=>setOffMarks(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
              </div>
              <div><label className="block text-sm mb-1 text-gray-700">Previous School</label><input type="text" value={offPrevSchool} onChange={e=>setOffPrevSchool(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-600" /></div>
              
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Submit Offline Application</button>
            </form>
          </div>
        )}

        {/* Tab 3: Seat Allocation */}
        {activeTab === 'allocation' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Allocate Seat to Selected Student</h2>
            {allocMsg && <div className="mb-4 p-4 bg-purple-50 text-purple-700 rounded-lg text-sm">{allocMsg}</div>}
            <form onSubmit={allocateSeat} className="space-y-6">
              <div>
                <label className="block text-sm mb-1 text-gray-700">Select Student Application (Must be 'SELECTED')</label>
                <select required value={allocAppId} onChange={e=>setAllocAppId(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-600">
                  <option value="">-- Choose Application --</option>
                  {applications.filter(a => a.status === 'SELECTED').map(app => (
                    <option key={app.id} value={app.id}>{app.application_number} - {app.profile_details?.username} ({app.previous_marks_percentage}%)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Department</label>
                  <select required value={allocDept} onChange={e=>setAllocDept(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-600">
                    <option value="">-- Select --</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Business">Business</option>
                    <option value="Law">Law</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">Program</label>
                  <select required value={allocProgram} onChange={e=>setAllocProgram(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-600">
                    <option value="">-- Select --</option>
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                    <option value="MBA">MBA</option>
                    <option value="LLB">LLB</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">Batch</label>
                <input type="text" required value={allocBatch} onChange={e=>setAllocBatch(e.target.value)} placeholder="e.g. 2024-2028 Section A" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>
              <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Confirm Allocation & Request Fees</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
