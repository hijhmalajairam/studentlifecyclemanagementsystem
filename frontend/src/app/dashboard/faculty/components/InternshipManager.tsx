'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import FacultyOpportunities from './FacultyOpportunities';

export default function InternshipManager() {
  const [internships, setInternships] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [viewDetailsId, setViewDetailsId] = useState<number | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [completeId, setCompleteId] = useState<number | null>(null);
  
  // Approval Form State
  const [mentorId, setMentorId] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Faculty List (for mentor assignment)
  const [facultyList, setFacultyList] = useState<any[]>([]);
  
  // Assign Internship Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    enrollment_number: '',
    company_id: '',
    role: '',
    description: '',
    start_date: '',
    end_date: '',
    stipend: 0,
    location: '',
    work_mode: 'ONSITE',
  });
  const [companies, setCompanies] = useState<any[]>([]);
  
  const selectedInternship = internships.find(i => i.id === viewDetailsId);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/academics/internships/?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;
      
      const [intData, statData, facData, compData] = await Promise.all([
        fetchAPI(url),
        fetchAPI('/academics/internships/analytics/'),
        fetchAPI('/users/faculty/'), // Get faculty list for mentors
        fetchAPI('/academics/companies/')
      ]);
      setInternships(intData.results || intData);
      setAnalytics(statData);
      setFacultyList(facData.results || facData);
      setCompanies(compData.results || compData);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/academics/internships/assign_to_student/', {
        method: 'POST',
        body: JSON.stringify(assignFormData)
      });
      alert('Internship assigned successfully!');
      setShowAssignModal(false);
      fetchData();
    } catch(e: any) {
      alert(e.message || 'Error assigning internship');
    }
  };

  const updateStatus = async (id: number, status: string, payload: any = {}) => {
    try {
      await fetchAPI(`/academics/internships/${id}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status, ...payload })
      });
      alert(`Internship ${status.toLowerCase()} successfully!`);
      setApproveId(null);
      setCompleteId(null);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700/50 pb-2">
        <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 font-bold text-sm transition ${activeTab === 'requests' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Student Requests</button>
        <button onClick={() => setActiveTab('opportunities')} className={`px-4 py-2 font-bold text-sm transition ${activeTab === 'opportunities' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Opportunities</button>
      </div>

      {activeTab === 'opportunities' ? (
        <FacultyOpportunities />
      ) : (
        <>
          {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
            <p className="text-slate-400 text-sm font-bold">Total Requests</p>
            <p className="text-3xl font-bold text-white">{analytics.total}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl">
            <p className="text-yellow-500 text-sm font-bold">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{analytics.pending}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
            <p className="text-blue-500 text-sm font-bold">Active</p>
            <p className="text-3xl font-bold text-blue-400">{analytics.active}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
            <p className="text-green-500 text-sm font-bold">Completed</p>
            <p className="text-3xl font-bold text-green-400">{analytics.completed}</p>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Internship Management</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setShowAssignModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap">+ Assign to Student</button>
            <input 
              type="text" 
              placeholder="Search student, company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 flex-1"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400 text-center py-10">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                  <th className="px-4 py-3 font-bold rounded-tl-xl">Student / ENR</th>
                  <th className="px-4 py-3 font-bold">Role & Company</th>
                  <th className="px-4 py-3 font-bold">Duration</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map(int => (
                  <tr key={int.id} className="border-b border-slate-700/50 hover:bg-slate-800/40 transition">
                    <td className="px-4 py-4">
                      <p className="text-sm text-white font-bold">{int.student_name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">ENR-{int.enrollment_number || int.enrollment}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-white font-bold">
                      {int.role} <span className="text-slate-400 font-normal">at</span> {int.company_details?.name || int.company_name}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {int.start_date} <br/>to {int.end_date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                        ['APPROVED', 'COMPLETED', 'ACTIVE'].includes(int.status) ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        int.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>{int.status}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {['PENDING', 'RESUBMITTED'].includes(int.status) && (
                          <button onClick={() => setApproveId(int.id)} className="bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold transition">Review</button>
                        )}
                        {int.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(int.id, 'ACTIVE')} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap">Mark Active</button>
                        )}
                        {int.status === 'ACTIVE' && (
                          <button onClick={() => setCompleteId(int.id)} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap">Mark Completed</button>
                        )}
                        <button onClick={() => setViewDetailsId(int.id)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition border border-transparent hover:border-slate-600" title="View Details">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {internships.length === 0 && <p className="text-slate-400 text-center py-10">No records found matching criteria.</p>}
          </div>
        )}
      </div>


      {/* Assign to Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Assign Internship to Student</h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Enrollment No.</label>
                  <input required type="text" placeholder="e.g. ENR-XYZ123" value={assignFormData.enrollment_number} onChange={e => setAssignFormData({...assignFormData, enrollment_number: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company</label>
                  <select required value={assignFormData.company_id} onChange={e => setAssignFormData({...assignFormData, company_id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Title</label>
                  <input required type="text" value={assignFormData.role} onChange={e => setAssignFormData({...assignFormData, role: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input required type="date" value={assignFormData.start_date} onChange={e => setAssignFormData({...assignFormData, start_date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                  <input required type="date" value={assignFormData.end_date} onChange={e => setAssignFormData({...assignFormData, end_date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stipend (/month)</label>
                  <input required type="number" min="0" value={assignFormData.stipend} onChange={e => setAssignFormData({...assignFormData, stipend: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Mode</label>
                  <select value={assignFormData.work_mode} onChange={e => setAssignFormData({...assignFormData, work_mode: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="ONSITE">On-site</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <input type="text" value={assignFormData.location} onChange={e => setAssignFormData({...assignFormData, location: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Details</label>
                <textarea required value={assignFormData.description} onChange={e => setAssignFormData({...assignFormData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[100px]" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/50">Assign Internship</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Review Modal (Approve/Reject) */}
      {approveId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Review Application</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty Mentor (Optional)</label>
                <select value={mentorId} onChange={e => setMentorId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                  <option value="">-- No Mentor --</option>
                  {Array.isArray(facultyList) && facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                <textarea 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[100px]"
                  placeholder="Optional notes for approval, or reason for rejection..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setApproveId(null)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition">Cancel</button>
              <button onClick={() => updateStatus(approveId, 'REJECTED', { remarks })} className="px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold rounded-xl transition">Reject</button>
              <button onClick={() => {
                if (!remarks) { alert("Please provide remarks for requested changes."); return; }
                updateStatus(approveId, 'CHANGES_REQUIRED', { remarks });
              }} className="px-5 py-2.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 font-bold rounded-xl transition">Request Changes</button>
              <button onClick={() => updateStatus(approveId, 'APPROVED', { faculty_mentor: mentorId, remarks })} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/50">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completeId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-white mb-4">Evaluate & Complete</h3>
            <p className="text-sm text-slate-400 mb-6">Rate the student's performance out of 5.</p>
            <div className="space-y-4 mb-6">
              {['technical_skills', 'communication', 'teamwork', 'problem_solving', 'professionalism', 'attendance'].map(skill => (
                <div key={skill} className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300 capitalize">{skill.replace('_', ' ')}</label>
                  <select id={skill} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white outline-none w-24 text-center">
                    <option value="5">5 - Excel</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Avg</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Fail</option>
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Final Remarks</label>
                <textarea id="eval_remarks" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[100px]" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCompleteId(null)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition">Cancel</button>
              <button onClick={() => {
                const payload = {
                  technical_skills_rating: (document.getElementById('technical_skills') as HTMLSelectElement).value,
                  communication_rating: (document.getElementById('communication') as HTMLSelectElement).value,
                  teamwork_rating: (document.getElementById('teamwork') as HTMLSelectElement).value,
                  problem_solving_rating: (document.getElementById('problem_solving') as HTMLSelectElement).value,
                  professionalism_rating: (document.getElementById('professionalism') as HTMLSelectElement).value,
                  attendance_rating: (document.getElementById('attendance') as HTMLSelectElement).value,
                  faculty_remarks: (document.getElementById('eval_remarks') as HTMLTextAreaElement).value
                };
                updateStatus(completeId, 'COMPLETED', payload);
              }} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-900/50">Submit Evaluation</button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Drawer */}
      {viewDetailsId && selectedInternship && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewDetailsId(null)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl p-8 flex flex-col animate-slide-in-right">
            <button onClick={() => setViewDetailsId(null)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Internship Details</h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold border border-slate-700">ENR-{selectedInternship.enrollment_number}</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-bold border border-emerald-500/20">{selectedInternship.status}</span>
              </div>
            </div>

            <div className="space-y-8 flex-1">
              {/* Student & Role */}
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Student & Role</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-500">Name</p><p className="text-white font-medium">{selectedInternship.student_name}</p></div>
                  <div><p className="text-slate-500">Department</p><p className="text-white font-medium">{selectedInternship.department || 'N/A'}</p></div>
                  <div><p className="text-slate-500">Role</p><p className="text-white font-medium">{selectedInternship.role}</p></div>
                  <div><p className="text-slate-500">Company</p><p className="text-white font-medium">{selectedInternship.company_details?.name || selectedInternship.company_name}</p></div>
                  <div><p className="text-slate-500">Mode</p><p className="text-white font-medium capitalize">{selectedInternship.work_mode.toLowerCase()}</p></div>
                  <div><p className="text-slate-500">Stipend</p><p className="text-white font-medium">₹{selectedInternship.stipend}/mo</p></div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Documents</h3>
                <div className="flex flex-col gap-2">
                  {selectedInternship.documents && selectedInternship.documents.length > 0 ? (
                    selectedInternship.documents.map((doc: any) => {
                      const fullUrl = doc.file.startsWith('http') ? doc.file : `http://localhost:8000${doc.file}`;
                      return (
                        <div key={doc.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-sm text-slate-300 capitalize block font-bold">{doc.document_type.replace('_', ' ')}</span>
                            {doc.file_name && <span className="text-xs text-slate-500">{doc.file_name}</span>}
                          </div>
                          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded-lg transition shrink-0 ml-4">View Document</a>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 text-sm">No documents uploaded.</p>
                  )}
                </div>
              </div>

              {/* Timeline (Audit Logs) */}
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {selectedInternship.audit_logs?.map((log: any, idx: number) => (
                    <div key={log.id} className="relative pl-6 border-l-2 border-slate-700">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                      <p className="text-xs text-emerald-400 font-bold mb-1">{log.action}</p>
                      <p className="text-sm text-white">{log.remarks || 'Status updated.'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                  {(!selectedInternship.audit_logs || selectedInternship.audit_logs.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No activity recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
