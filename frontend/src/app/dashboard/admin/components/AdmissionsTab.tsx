import React from 'react';
import { UserPlus, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export default function AdmissionsTab({
  isAdmin,
  applications,
  departments,
  programs,
  offlineForm,
  setOfflineForm,
  createOfflineApplication,
  expandedRow,
  setExpandedRow,
  updateStatus,
  allocationForms,
  setAllocationForms,
  allocateSeat,
  feeVerifications,
  setFeeVerifications,
  verifyFeePayment,
  showOfflineForm
}: any) {
  return (
    <div className="space-y-8">
      {/* Offline Application Form */}
      {showOfflineForm && (
        <form onSubmit={createOfflineApplication} className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--sidebar-border)] rounded-3xl p-8 grid md:grid-cols-3 gap-6 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="md:col-span-3 flex items-center justify-between mb-2">
            <h2 className="font-black text-xl text-[var(--text-primary)] flex items-center">
              <UserPlus className="w-6 h-6 mr-3 text-blue-500" /> Create Offline Application
            </h2>
            {!isAdmin && <span className="bg-[var(--card-bg)] border border-[var(--sidebar-border)] text-[var(--text-tertiary)] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center shadow-sm"><Lock className="w-3 h-3 mr-1.5" /> Admin Only</span>}
          </div>
          
          {[['first_name', 'First name'], ['last_name', 'Last name'], ['username', 'Username'], ['email', 'Email'], ['phone', 'Phone'], ['previous_school_name', 'Previous school / college'], ['previous_marks_percentage', 'Previous marks %']].map(([name, label]) => (
            <label key={name} className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">
              {label}
              <input 
                required={name !== 'phone' && name !== 'previous_marks_percentage'} 
                type={name === 'email' ? 'email' : name === 'previous_marks_percentage' ? 'number' : 'text'} 
                min={name === 'previous_marks_percentage' ? 0 : undefined} 
                max={name === 'previous_marks_percentage' ? 100 : undefined} 
                value={offlineForm[name as keyof typeof offlineForm]} 
                onChange={e => setOfflineForm((prev: any) => ({ ...prev, [name]: e.target.value }))} 
                disabled={!isAdmin}
                className="mt-2 block w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </label>
          ))}
          <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">
            Temporary password
            <input 
              required 
              type="password" 
              value={offlineForm.password} 
              onChange={e => setOfflineForm((prev: any) => ({ ...prev, password: e.target.value }))} 
              disabled={!isAdmin}
              className="mt-2 block w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
            />
          </label>
          <div className="md:col-span-3 pt-4 border-t border-[var(--sidebar-border)] flex justify-end">
            <button disabled={!isAdmin} className="bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-0 disabled:hover:scale-100 flex items-center">
              Submit Application
            </button>
          </div>
        </form>
      )}

      {/* Applications Table */}
      <div className="bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--sidebar-border)] rounded-3xl shadow-xl overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left">
            <thead className="bg-[var(--sidebar-hover)]/80 border-b border-[var(--sidebar-border)]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Applicant</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Entry Strategy</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sidebar-border)]">
              {applications.filter((a: any) => !['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-24 text-center text-[var(--text-tertiary)] font-bold text-sm bg-[var(--bg-primary)]/50">No applications ready for allocation or review at this time.</td></tr>
              ) : applications.filter((a: any) => !['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).map((app: any) => (
                <React.Fragment key={app.id}>
                  <tr className="hover:bg-[var(--sidebar-hover)] transition-colors group">
                    <td className="px-8 py-5">
                      <button onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)} className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500 hover:shadow-md transition-all shadow-sm">
                        {expandedRow === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black shadow-md shrink-0">
                          {(app.profile_details?.first_name?.[0] || 'A').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                            {app.profile_details?.first_name 
                              ? `${app.profile_details.first_name} ${app.profile_details.last_name || ''}` 
                              : app.profile_details?.username || `Applicant #${app.id}`}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5">{app.application_number || 'Not submitted'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest shadow-sm">
                        {app.entry_type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        app.status === 'SELECTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        app.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 shadow-[0_0_8px_currentColor] ${app.status === 'SELECTED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                        {app.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end space-x-2">
                        <button disabled={!isAdmin} onClick={() => updateStatus(app.id, 'SELECTED')} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                          Approve
                        </button>
                        <button disabled={!isAdmin} onClick={() => updateStatus(app.id, 'REJECTED')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                          Reject
                        </button>
                      </div>
                      {!isAdmin && <p className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mt-1 text-right">Admin access required</p>}
                    </td>
                  </tr>
                  
                  {expandedRow === app.id && (
                    <tr className="bg-[var(--sidebar-hover)]/50">
                      <td colSpan={5} className="px-8 py-8 border-b border-[var(--sidebar-border)]">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          
                          {/* Academic Profile & Interview Notes */}
                          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--sidebar-border)] shadow-sm space-y-6">
                            <h4 className="font-black text-[var(--text-primary)] text-sm flex items-center">
                              <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mr-3 border border-blue-500/20">🎓</span> 
                              Academic Profile
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--input-border)] shadow-sm">
                                <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1.5">10th Grade</p>
                                <p className="text-xs font-bold text-[var(--text-secondary)]">{app.tenth_board} ({app.tenth_passing_year})</p>
                                <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{app.tenth_percentage}%</p>
                              </div>
                              <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--input-border)] shadow-sm">
                                <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1.5">12th Grade</p>
                                <p className="text-xs font-bold text-[var(--text-secondary)]">{app.twelfth_board} ({app.twelfth_passing_year})</p>
                                <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{app.twelfth_percentage}%</p>
                              </div>
                            </div>
                            <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--input-border)] shadow-sm">
                              <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-2 flex items-center"><FileText className="w-3 h-3 mr-1.5" /> Interviewer Notes</p>
                              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed italic border-l-2 border-blue-500 pl-3">"{app.interviewer_notes || 'No notes provided by interviewer.'}"</p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--sidebar-border)] shadow-sm space-y-6">
                            <h4 className="font-black text-[var(--text-primary)] text-sm flex items-center">
                              <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mr-3 border border-purple-500/20">📄</span> 
                              Document Verification
                            </h4>
                            {app.documents?.length > 0 ? (
                              <div className="space-y-3">
                                {app.documents.map((doc: any) => (
                                  <div key={doc.id} className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--input-border)] flex items-center justify-between shadow-sm">
                                    <div>
                                      <span className="block font-bold text-sm text-[var(--text-primary)] mb-1.5">{doc.document_name}</span>
                                      <div className="flex items-center space-x-3">
                                        <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border shadow-sm flex items-center ${
                                          doc.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                          doc.status === 'FORGED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                          'bg-[var(--sidebar-hover)] text-[var(--text-tertiary)] border-[var(--sidebar-border)]'
                                        }`}>
                                          {doc.status === 'VERIFIED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                          {doc.status === 'FORGED' && <XCircle className="w-3 h-3 mr-1" />}
                                          {doc.status}
                                        </span>
                                        <a href={`http://localhost:8000${doc.file}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 font-bold hover:underline">View File ↗</a>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-32 bg-[var(--input-bg)] border border-[var(--input-border)] border-dashed rounded-2xl flex flex-col items-center justify-center">
                                <FileText className="w-6 h-6 text-[var(--text-tertiary)] mb-2" />
                                <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No Documents Uploaded</p>
                              </div>
                            )}
                          </div>

                          {/* Seat Allocation */}
                          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--sidebar-border)] shadow-sm space-y-6">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-[var(--text-primary)] text-sm flex items-center">
                                <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mr-3 border border-indigo-500/20">🏛</span> 
                                Seat Allocation
                              </h4>
                              {!isAdmin && <span className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-tertiary)] px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded flex items-center"><Lock className="w-3 h-3 mr-1.5" /> Restricted</span>}
                            </div>
                            
                            <p className="text-xs font-medium text-[var(--text-tertiary)] bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--input-border)]">
                              Contact: <strong className="text-[var(--text-secondary)]">{app.profile_details?.email}</strong> · <strong className="text-[var(--text-secondary)]">{app.profile_details?.phone || 'No phone'}</strong>
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <select disabled={!isAdmin} value={allocationForms[app.id]?.allocated_department || ''} onChange={e => setAllocationForms((prev: any) => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_department: e.target.value } }))} 
                                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 text-[var(--text-primary)]">
                                <option value="">Select Department</option>
                                {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                              </select>
                              <select disabled={!isAdmin} value={allocationForms[app.id]?.allocated_program || ''} onChange={e => setAllocationForms((prev: any) => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_program: e.target.value } }))} 
                                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 text-[var(--text-primary)]">
                                <option value="">Select Program</option>
                                {programs.filter((p: any) => !allocationForms[app.id]?.allocated_department || p.department_name === allocationForms[app.id].allocated_department || departments.find((d: any) => d.name === allocationForms[app.id].allocated_department)?.id === p.department).map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                              <input disabled={!isAdmin} placeholder="Batch (e.g. 2024-2028)" value={allocationForms[app.id]?.allocated_batch || ''} onChange={e => setAllocationForms((prev: any) => ({ ...prev, [app.id]: { ...(prev[app.id] || { allocated_department: '', allocated_program: '', allocated_batch: '' }), allocated_batch: e.target.value } }))} 
                                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 text-[var(--text-primary)] placeholder-[var(--text-tertiary)]" />
                            </div>
                            
                            <button onClick={() => allocateSeat(app.id)} disabled={!isAdmin || app.status !== 'SELECTED'} 
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl text-xs font-black tracking-widest shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-0 disabled:hover:scale-100 uppercase">
                              Allocate Seat
                            </button>
                            
                            {app.seat_allocation && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex flex-col shadow-inner mt-4">
                                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1.5 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Seat Successfully Allocated</p>
                                <p className="text-sm font-black text-[var(--text-primary)]">{app.seat_allocation.allocated_program}</p>
                                <p className="text-xs font-bold text-[var(--text-secondary)]">{app.seat_allocation.allocated_department} — {app.seat_allocation.allocated_batch}</p>
                              </div>
                            )}
                          </div>

                          {/* Fee Payment Verification */}
                          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--sidebar-border)] shadow-sm space-y-6">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-[var(--text-primary)] text-sm flex items-center">
                                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mr-3 border border-amber-500/20">💳</span> 
                                Fee & Enrollment
                              </h4>
                              {!isAdmin && <span className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-tertiary)] px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded flex items-center"><Lock className="w-3 h-3 mr-1.5" /> Restricted</span>}
                            </div>
                            
                            {app.status === 'FEE_PENDING' || app.status === 'ENROLLED' ? (
                              <div className="space-y-4">
                                <p className="text-xs font-medium text-[var(--text-secondary)]">Verify payment documents and manually approve to generate the student enrollment profile.</p>
                                <div className="flex gap-3">
                                  <input 
                                    placeholder="Type 'yes' to verify" 
                                    className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] shadow-sm"
                                    value={feeVerifications[app.id] || ''}
                                    onChange={e => setFeeVerifications((prev: any) => ({ ...prev, [app.id]: e.target.value }))}
                                    disabled={!isAdmin || app.status === 'ENROLLED'}
                                  />
                                  <button 
                                    onClick={() => verifyFeePayment(app.id)} 
                                    className={`px-6 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-sm ${app.status === 'ENROLLED' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 cursor-default' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30'}`}
                                    disabled={!isAdmin || app.status === 'ENROLLED' || feeVerifications[app.id]?.toLowerCase() !== 'yes'}
                                  >
                                    {app.status === 'ENROLLED' ? 'Enrolled' : 'Verify'}
                                  </button>
                                </div>
                                {app.enrollment_number && (
                                  <div className="mt-4 bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between shadow-inner">
                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center mb-1 sm:mb-0"><CheckCircle className="w-4 h-4 mr-1.5" /> Official Enrollment No.</span>
                                    <span className="text-2xl font-black text-emerald-500 font-mono tracking-tighter">{app.enrollment_number}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-[var(--sidebar-border)] bg-[var(--input-bg)] rounded-2xl p-6 text-center">
                                <Lock className="w-6 h-6 text-[var(--text-tertiary)] mb-3 opacity-50" />
                                <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Pending Phase</p>
                                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Application must reach FEE_PENDING status to process enrollment.</p>
                              </div>
                            )}
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
