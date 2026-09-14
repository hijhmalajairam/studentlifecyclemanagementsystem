import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Users, ShieldCheck, CheckCircle2, Award, Search } from 'lucide-react';

export default function FacultyTab({ isAdmin, departments }: { isAdmin: boolean, departments: any[] }) {
  const [facultyProfiles, setFacultyProfiles] = useState<any[]>([]);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('');
  const [facultyDesigFilter, setFacultyDesigFilter] = useState('');
  const [facultyRoleFilter, setFacultyRoleFilter] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [editingFaculty, setEditingFaculty] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const designations = ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'Guest Faculty', 'Dean'];
  const employmentTypes = ['Permanent', 'Contract', 'Guest', 'Adjunct'];
  const statusOptions = ['Active', 'On Leave', 'Sabbatical', 'Resigned', 'Retired'];
  const adminRoles = ['None', 'Head of Department', 'Exam Controller', 'Warden', 'Placement Coordinator', 'Disciplinary Committee Head', 'Interviewer / Document Verifier'];

  useEffect(() => {
    fetchAPI('/academics/faculty/').then(data => setFacultyProfiles(data)).catch(() => {});
  }, []);

  const toggleFacultyAccess = async (id: number) => {
    if (!isAdmin) return alert("You don't have permission to modify access.");
    try {
      const res = await fetchAPI(`/academics/faculty/${id}/toggle_access/`, { method: 'POST' });
      setFacultyProfiles(prev => prev.map(f => f.id === id ? { ...f, is_active: res.is_active } : f));
      if (selectedFaculty?.id === id) setSelectedFaculty((prev: any) => ({ ...prev, is_active: res.is_active }));
    } catch { alert('Failed to toggle access'); }
  };

  const assignFacultyRole = async (id: number, adminRole: string) => {
    if (!isAdmin) return alert("You don't have permission to assign roles.");
    try {
      const res = await fetchAPI(`/academics/faculty/${id}/assign_role/`, { method: 'POST', body: JSON.stringify({ admin_role: adminRole }) });
      setFacultyProfiles(prev => prev.map(f => f.id === id ? res : f));
      if (selectedFaculty?.id === id) setSelectedFaculty(res);
    } catch { alert('Failed to assign role'); }
  };

  const saveFacultyEdit = async () => {
    if (!selectedFaculty || !isAdmin) return;
    try {
      const res = await fetchAPI(`/academics/faculty/${selectedFaculty.id}/`, { method: 'PATCH', body: JSON.stringify(editForm) });
      setFacultyProfiles(prev => prev.map(f => f.id === selectedFaculty.id ? res : f));
      setSelectedFaculty(res);
      setEditingFaculty(false);
      setEditForm({});
    } catch { alert('Failed to save changes'); }
  };

  const openFacultyProfile = (faculty: any) => {
    setSelectedFaculty(faculty);
    setEditingFaculty(false);
    setEditForm({});
  };

  const startEditingFaculty = () => {
    if (!isAdmin) return;
    setEditingFaculty(true);
    setEditForm({
      designation: selectedFaculty.designation,
      employment_type: selectedFaculty.employment_type,
      status: selectedFaculty.status,
      office_room: selectedFaculty.office_room,
      phone: selectedFaculty.phone,
      specialization: selectedFaculty.specialization,
      highest_qualification: selectedFaculty.highest_qualification,
      courses_taught: selectedFaculty.courses_taught,
      current_project: selectedFaculty.current_project,
      student_rating: selectedFaculty.student_rating,
    });
  };

  const filteredFaculty = facultyProfiles.filter(f => {
    const matchSearch = !facultySearch || 
      `${f.first_name} ${f.last_name}`.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.faculty_id?.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.specialization?.toLowerCase().includes(facultySearch.toLowerCase());
    const matchDept = !facultyDeptFilter || f.department === parseInt(facultyDeptFilter);
    const matchDesig = !facultyDesigFilter || f.designation === facultyDesigFilter;
    const matchRole = !facultyRoleFilter || (facultyRoleFilter === 'None' ? f.admin_role === 'None' : f.admin_role === facultyRoleFilter);
    return matchSearch && matchDept && matchDesig && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Faculty Header & Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Faculty" value={facultyProfiles.length} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard title="HODs" value={facultyProfiles.filter(f => f.admin_role === 'Head of Department').length} icon={<Award className="w-5 h-5" />} color="indigo" />
        <StatCard title="Active" value={facultyProfiles.filter(f => f.is_active && f.status === 'Active').length} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard title="With Roles" value={facultyProfiles.filter(f => f.admin_role !== 'None').length} icon={<ShieldCheck className="w-5 h-5" />} color="purple" />
      </div>

      {/* Search & Filters */}
      <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-5 h-5" />
            <input type="text" placeholder="Search by name, ID, or specialization..." value={facultySearch} onChange={e => setFacultySearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all shadow-sm" />
          </div>
          <select value={facultyDeptFilter} onChange={e => setFacultyDeptFilter(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-[var(--text-primary)] transition-all shadow-sm">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={facultyDesigFilter} onChange={e => setFacultyDesigFilter(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-[var(--text-primary)] transition-all shadow-sm">
            <option value="">All Designations</option>
            {designations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={facultyRoleFilter} onChange={e => setFacultyRoleFilter(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-[var(--text-primary)] transition-all shadow-sm">
            <option value="">All Roles</option>
            {adminRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-3 font-bold uppercase tracking-widest">{filteredFaculty.length} of {facultyProfiles.length} faculty shown</p>
      </div>

      {/* Faculty Grid + Profile Panel */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Faculty Card Grid */}
        <div className={`${selectedFaculty ? 'md:w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className={`grid grid-cols-1 ${selectedFaculty ? '' : 'lg:grid-cols-2 xl:grid-cols-3'} gap-4 max-h-[68vh] overflow-y-auto pr-2 custom-scrollbar`}>
            {filteredFaculty.length === 0 ? (
              <div className="col-span-full text-center py-16 text-[var(--text-tertiary)] font-bold">No faculty match your filters.</div>
            ) : filteredFaculty.map(f => (
              <div key={f.id} onClick={() => openFacultyProfile(f)}
                className={`bg-[var(--card-bg)] rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group ${selectedFaculty?.id === f.id ? 'border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20' : 'border-[var(--sidebar-border)]'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                    {f.first_name?.[0]}{f.last_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[var(--text-primary)] truncate group-hover:text-blue-500 transition-colors">{f.first_name} {f.last_name}</h3>
                      {!f.is_active && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black tracking-widest rounded-md border border-red-500/20">REVOKED</span>}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">{f.faculty_id} · {f.designation}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] px-2.5 py-1 rounded-md text-[10px] font-bold text-[var(--text-secondary)] truncate max-w-[120px]">{f.department_code || f.department_name}</span>
                      {f.admin_role && f.admin_role !== 'None' && (
                        <span className="bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md text-[10px] font-black text-indigo-500 shadow-sm">{f.admin_role}</span>
                      )}
                      <span className="text-[11px] font-black text-amber-500 ml-auto flex items-center">
                        <span className="mr-1 shadow-[0_0_8px_rgba(245,158,11,0.5)] bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">★</span>
                        {f.student_rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Profile Side Panel */}
        {selectedFaculty && (
          <div className="md:w-1/2 bg-[var(--card-bg)] rounded-3xl border border-[var(--sidebar-border)] shadow-2xl overflow-hidden flex flex-col max-h-[68vh]">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white relative shrink-0">
              <button onClick={() => { setSelectedFaculty(null); setEditingFaculty(false); }}
                className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-colors backdrop-blur-md">✕</button>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center text-3xl font-black">
                  {selectedFaculty.first_name?.[0]}{selectedFaculty.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedFaculty.first_name} {selectedFaculty.last_name}</h2>
                  <p className="text-blue-200 text-sm font-medium mt-1">{selectedFaculty.designation} · {selectedFaculty.department_name}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] bg-black/30 px-3 py-1 rounded-lg font-black tracking-widest">{selectedFaculty.faculty_id}</span>
                    {selectedFaculty.admin_role !== 'None' && (
                      <span className="text-[10px] bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-lg font-black text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]">{selectedFaculty.admin_role}</span>
                    )}
                    <span className={`text-[10px] px-3 py-1 rounded-lg font-black border ${selectedFaculty.is_active ? 'bg-green-400/20 border-green-400/30 text-green-300' : 'bg-red-400/20 border-red-400/30 text-red-300'}`}>
                      {selectedFaculty.is_active ? 'ACTIVE' : 'REVOKED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-4 bg-[var(--sidebar-hover)] border-b border-[var(--sidebar-border)] flex items-center gap-3 flex-wrap shrink-0">
              {!editingFaculty ? (
                <button onClick={startEditingFaculty} disabled={!isAdmin} className={`bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 ${!isAdmin ? 'opacity-50 cursor-not-allowed saturate-0' : ''}`}>Edit Profile</button>
              ) : (
                <>
                  <button onClick={saveFacultyEdit} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all">Save Changes</button>
                  <button onClick={() => { setEditingFaculty(false); setEditForm({}); }} className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] hover:bg-[var(--sidebar-border)] px-5 py-2 rounded-xl text-xs font-black transition-all">Cancel</button>
                </>
              )}
              <button onClick={() => toggleFacultyAccess(selectedFaculty.id)} disabled={!isAdmin}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all border shadow-sm ${selectedFaculty.is_active ? 'bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'} ${!isAdmin ? 'opacity-50 cursor-not-allowed saturate-0' : ''}`}>
                {selectedFaculty.is_active ? 'Revoke Access' : 'Grant Access'}
              </button>
              
              {!isAdmin && (
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest ml-2 bg-[var(--card-bg)] px-2 py-1 rounded-md border border-[var(--sidebar-border)]">Admin Only</span>
              )}
              
              {/* Role Assignment */}
              <div className="ml-auto flex items-center gap-3">
                <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Admin Role:</span>
                <select value={selectedFaculty.admin_role} onChange={e => assignFacultyRole(selectedFaculty.id, e.target.value)} disabled={!isAdmin}
                  className={`bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[var(--text-primary)] shadow-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {adminRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Personal Info */}
              <div>
                <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="Gender" value={selectedFaculty.gender} />
                  <InfoBox label="Date of Birth" value={selectedFaculty.date_of_birth || 'N/A'} />
                  <InfoBox label="Email" value={selectedFaculty.email} />
                  
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Phone</p>
                    {editingFaculty ? (
                      <input value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]" />
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.phone || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Office Room</p>
                    {editingFaculty ? (
                      <input value={editForm.office_room || ''} onChange={e => setEditForm({...editForm, office_room: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]" />
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.office_room || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Status</p>
                    {editingFaculty ? (
                      <select value={editForm.status || ''} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]">
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.status}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span> Academic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Designation</p>
                    {editingFaculty ? (
                      <select value={editForm.designation || ''} onChange={e => setEditForm({...editForm, designation: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]">
                        {designations.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.designation}</p>
                    )}
                  </div>
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Employment Type</p>
                    {editingFaculty ? (
                      <select value={editForm.employment_type || ''} onChange={e => setEditForm({...editForm, employment_type: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]">
                        {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.employment_type}</p>
                    )}
                  </div>
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)] col-span-2">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Qualification</p>
                    {editingFaculty ? (
                      <input value={editForm.highest_qualification || ''} onChange={e => setEditForm({...editForm, highest_qualification: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]" />
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.highest_qualification}</p>
                    )}
                  </div>
                  <InfoBox label="Alma Mater" value={selectedFaculty.alma_mater || 'N/A'} />
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Specialization</p>
                    {editingFaculty ? (
                      <input value={editForm.specialization || ''} onChange={e => setEditForm({...editForm, specialization: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]" />
                    ) : (
                      <p className="text-sm font-bold text-[var(--text-primary)]">{selectedFaculty.specialization}</p>
                    )}
                  </div>
                  <InfoBox label="Experience" value={`${selectedFaculty.years_of_experience} years`} />
                  <InfoBox label="Date of Joining" value={selectedFaculty.date_of_joining || 'N/A'} />
                  
                  <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)] col-span-2">
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Student Rating</p>
                    {editingFaculty ? (
                      <input type="number" step="0.1" min="0" max="5" value={editForm.student_rating || ''} onChange={e => setEditForm({...editForm, student_rating: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]" />
                    ) : (
                      <p className="text-sm font-black text-amber-500 flex items-center">
                        <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 shadow-[0_0_10px_rgba(245,158,11,0.5)]">★</span> 
                        {selectedFaculty.student_rating}/5.0
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Research */}
              <div>
                <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span> Research & Publications
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-indigo-500/10 rounded-2xl p-4 border border-indigo-500/20 text-center shadow-inner">
                    <p className="text-2xl font-black text-indigo-500">{selectedFaculty.research_publications}</p>
                    <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">Publications</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20 text-center shadow-inner">
                    <p className="text-2xl font-black text-purple-500">{selectedFaculty.research_grants_received}</p>
                    <p className="text-[9px] text-purple-500 font-black uppercase tracking-widest mt-1">Grants</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 text-center shadow-inner">
                    <p className="text-2xl font-black text-emerald-500">₹{Number(selectedFaculty.total_grant_amount || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-1">Total Grants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className="bg-[var(--card-bg)] p-5 rounded-3xl border border-[var(--sidebar-border)] shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner border ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-[var(--text-primary)] group-hover:text-[var(--primary-gradient-end)] transition-colors">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--sidebar-hover)] rounded-2xl p-4 border border-[var(--sidebar-border)]">
      <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{value}</p>
    </div>
  );
}
