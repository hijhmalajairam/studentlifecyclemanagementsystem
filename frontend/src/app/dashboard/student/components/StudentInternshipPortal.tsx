'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function StudentInternshipPortal({ enrollment }: { enrollment: any }) {
  const [activeTab, setActiveTab] = useState('my-applications');
  
  // My Applications
  const [myInternships, setMyInternships] = useState<any[]>([]);
  
  // Opportunities
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    description: '',
    start_date: '',
    end_date: '',
    stipend: 0,
    location: '',
    work_mode: 'ONSITE',
    contact_email: '',
    contact_phone: ''
  });

  // Documents
  const [documents, setDocuments] = useState<{ type: string, file: File | null }[]>([
    { type: 'RESUME', file: null },
    { type: 'OFFER_LETTER', file: null }
  ]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [changesRequiredId, setChangesRequiredId] = useState<number | null>(null);
  const [changesRemarks, setChangesRemarks] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [intData, oppData] = await Promise.all([
        fetchAPI('/academics/internships/my_internships/').catch(() => []),
        fetchAPI('/academics/internship-opportunities/').catch(() => [])
      ]);
      setMyInternships(intData);
      setOpportunities(oppData.results || oppData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDocChange = (idx: number, file: File | null) => {
    const newDocs = [...documents];
    newDocs[idx].file = file;
    setDocuments(newDocs);
  };

  const uploadDocs = async (internshipId: number) => {
    for (const doc of documents) {
      if (doc.file) {
        const docForm = new FormData();
        docForm.append('internship', internshipId.toString());
        docForm.append('document_type', doc.type);
        docForm.append('file', doc.file);
        try {
          await fetchAPI('/academics/internship-documents/', {
            method: 'POST',
            body: docForm
          });
        } catch (e) {
          console.error(`Failed to upload ${doc.type}`, e);
        }
      }
    }
  };

  const submitFoundInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // 1. Create Internship (Status = DRAFT by default)
      const res = await fetchAPI('/academics/internships/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // 2. Upload Documents
      await uploadDocs(res.id);

      // 3. Mark as SUBMITTED
      await fetchAPI(`/academics/internships/${res.id}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: 'SUBMITTED' })
      });

      alert('Internship application submitted successfully!');
      setFormData({
        company_name: '', role: '', description: '', start_date: '', end_date: '',
        stipend: 0, location: '', work_mode: 'ONSITE', contact_email: '', contact_phone: ''
      });
      setDocuments([{ type: 'RESUME', file: null }, { type: 'OFFER_LETTER', file: null }]);
      setActiveTab('my-applications');
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Error submitting internship');
    }
    setActionLoading(false);
  };

  const applyToOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setActionLoading(true);
    try {
      // Create Internship linked to Opportunity
      const res = await fetchAPI('/academics/internships/', {
        method: 'POST',
        body: JSON.stringify({
          opportunity: selectedOpp.id,
          company_name: selectedOpp.company_details?.name,
          role: selectedOpp.role,
          description: selectedOpp.description,
          start_date: new Date().toISOString().split('T')[0], // Temp
          end_date: new Date(Date.now() + selectedOpp.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Temp
          stipend: selectedOpp.stipend,
          location: selectedOpp.location,
          work_mode: selectedOpp.work_mode
        })
      });
      
      // Upload Docs
      await uploadDocs(res.id);

      // Mark as SUBMITTED
      await fetchAPI(`/academics/internships/${res.id}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: 'SUBMITTED' })
      });

      alert('Application submitted successfully!');
      setSelectedOpp(null);
      setActiveTab('my-applications');
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Error applying');
    }
    setActionLoading(false);
  };

  const resolveChanges = async (id: number) => {
    setActionLoading(true);
    try {
      await fetchAPI(`/academics/internships/${id}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: 'RESUBMITTED', remarks: changesRemarks })
      });
      alert('Application resubmitted successfully!');
      setChangesRequiredId(null);
      setChangesRemarks('');
      fetchData();
    } catch(e: any) {
      alert(e.message || 'Error resolving changes');
    }
    setActionLoading(false);
  };

  const acceptAssignment = async (id: number) => {
    setActionLoading(true);
    try {
      // First upload documents if any
      await uploadDocs(id);
      
      await fetchAPI(`/academics/internships/${id}/accept_assignment/`, {
        method: 'POST'
      });
      alert('Internship assignment accepted successfully!');
      fetchData();
    } catch(e: any) {
      alert(e.message || 'Error accepting assignment');
    }
    setActionLoading(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('my-applications')} className={`px-4 py-2 font-bold text-sm transition ${activeTab === 'my-applications' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}>My Applications</button>
        <button onClick={() => setActiveTab('find')} className={`px-4 py-2 font-bold text-sm transition ${activeTab === 'find' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}>Find Your Own</button>
        <button onClick={() => setActiveTab('opportunities')} className={`px-4 py-2 font-bold text-sm transition ${activeTab === 'opportunities' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}>Available Opportunities</button>
      </div>

      {activeTab === 'my-applications' && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">My Internship Applications</h3>
          {loading ? <p className="text-slate-500 text-center py-10">Loading...</p> : (
            <div className="space-y-4">
              {myInternships.map(int => (
                <div key={int.id} className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{int.role} at {int.company_details?.name || int.company_name}</h4>
                      <p className="text-xs text-slate-500">{int.start_date} to {int.end_date}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-50 text-emerald-400 rounded-lg text-xs font-bold border border-slate-200">{int.status}</span>
                  </div>
                  
                  {int.status === 'ASSIGNED' && (
                    <div className="mt-4 p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-4">
                      <p className="text-sm font-bold text-blue-700">Faculty has assigned this internship to you.</p>
                      <p className="text-sm text-blue-600/80">Please upload any required documents (e.g. Offer Letter / Resume) and accept the assignment.</p>
                      
                      <div className="bg-white p-4 rounded-xl border border-blue-200">
                        <h4 className="text-xs font-bold text-slate-900 mb-3">Required Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {documents.map((doc, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{doc.type.replace('_', ' ')}</label>
                              <input type="file" onChange={(e) => handleDocChange(idx, e.target.files?.[0] || null)} className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => setDocuments([...documents, { type: 'OTHER', file: null }])} className="text-[10px] text-blue-600 font-bold mt-3 hover:text-blue-500">+ Add Another Document</button>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <button onClick={() => acceptAssignment(int.id)} disabled={actionLoading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-200">Accept Assignment</button>
                      </div>
                    </div>
                  )}
                  
                  {int.status === 'CHANGES_REQUIRED' && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-sm font-bold text-yellow-500 mb-2">Faculty requested changes:</p>
                      <p className="text-sm text-yellow-400/80 italic mb-4">"{int.audit_logs?.[int.audit_logs.length-1]?.remarks || 'Please update your application.'}"</p>
                      
                      {changesRequiredId === int.id ? (
                        <div className="space-y-3">
                          <textarea 
                            value={changesRemarks} 
                            onChange={e => setChangesRemarks(e.target.value)} 
                            placeholder="Explain what changes you made..." 
                            className="w-full bg-white border border-yellow-500/30 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-yellow-500"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setChangesRequiredId(null)} className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-bold">Cancel</button>
                            <button onClick={() => resolveChanges(int.id)} disabled={actionLoading} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg text-sm font-bold transition">Resubmit</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setChangesRequiredId(int.id)} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg text-sm font-bold transition">Resolve Changes</button>
                      )}
                    </div>
                  )}

                  {int.status === 'REJECTED' && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm font-bold text-red-500 mb-2">Application Rejected</p>
                      <p className="text-sm text-red-400/80 italic">Reason: {int.rejection_reason || int.audit_logs?.[int.audit_logs.length-1]?.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
              {myInternships.length === 0 && <p className="text-slate-500 text-center py-10">No applications found.</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'find' && (
        <form onSubmit={submitFoundInternship} className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Found Internship</h3>
          <p className="text-sm text-slate-500 mb-6">Found an internship independently? Submit the details and supporting documents here for faculty review.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
              <input required type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Title</label>
              <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
              <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
              <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stipend (/month)</label>
              <input required type="number" min="0" value={formData.stipend} onChange={e => setFormData({...formData, stipend: parseFloat(e.target.value)})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Work Mode</label>
              <select value={formData.work_mode} onChange={e => setFormData({...formData, work_mode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500">
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Required Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{doc.type.replace('_', ' ')}</label>
                  <input type="file" required={doc.type === 'OFFER_LETTER'} onChange={(e) => handleDocChange(idx, e.target.files?.[0] || null)} className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setDocuments([...documents, { type: 'OTHER', file: null }])} className="text-xs text-emerald-400 font-bold mt-4 hover:text-emerald-300">+ Add Another Document</button>
          </div>

          <button type="submit" disabled={actionLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-200">Submit Application</button>
        </form>
        )
      )}

      {activeTab === 'opportunities' && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Faculty Provided Opportunities</h3>
          {loading ? <p className="text-slate-500 text-center py-10">Loading...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.filter(o => o.is_active).map(opp => (
                <div key={opp.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition cursor-pointer" onClick={() => setSelectedOpp(opp)}>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{opp.role}</h4>
                  <p className="text-sm text-emerald-400 font-bold mb-4">{opp.company_details?.name}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {opp.duration_months} months</span>
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ₹{opp.stipend}/mo</span>
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {opp.work_mode}</span>
                  </div>
                </div>
              ))}
              {opportunities.filter(o => o.is_active).length === 0 && <p className="text-slate-500 text-center col-span-full py-10">No active opportunities available right now.</p>}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Apply Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedOpp.role}</h3>
            <p className="text-emerald-400 font-bold mb-6">{selectedOpp.company_details?.name}</p>
            
            <div className="prose max-w-none mb-8">
              <p>{selectedOpp.description}</p>
              {selectedOpp.required_skills && (
                <>
                  <h4 className="text-slate-600">Required Skills</h4>
                  <p>{selectedOpp.required_skills}</p>
                </>
              )}
              {selectedOpp.eligibility && (
                <>
                  <h4 className="text-slate-600">Eligibility</h4>
                  <p>{selectedOpp.eligibility}</p>
                </>
              )}
            </div>

            <form onSubmit={applyToOpportunity} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Required Documents to Apply</h4>
              <div className="space-y-4 mb-6">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{doc.type.replace('_', ' ')}</label>
                    <input type="file" required={doc.type === 'RESUME'} onChange={(e) => handleDocChange(idx, e.target.files?.[0] || null)} className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setSelectedOpp(null)} className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-bold transition">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-200">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
