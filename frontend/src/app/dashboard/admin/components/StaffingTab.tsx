'use client';

import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

const AVAILABLE_ROLES = [
  'HOD_CSE', 'HOD_ECE', 'HOD_DSAI', 'HOD_BSC',
  'DEAN_ENGINEERING', 'DEAN_STUDENT_AFFAIRS', 'BATCH_COORDINATOR',
  'CONTROLLER_OF_EXAMINATIONS', 'EXAM_SQUAD', 'CURRICULUM_COMMITTEE',
  'CHIEF_WARDEN', 'HOSTEL_WARDEN', 'DISCIPLINARY_HEAD', 'ANTI_RAGGING_COMMITTEE',
  'SPORTS_DIRECTOR', 'CULTURAL_CONVENER', 'PLACEMENT_DIRECTOR', 'ALUMNI_RELATIONS',
  'INDUSTRY_TIEUP_INCHARGE', 'LAB_INCHARGE', 'RESEARCH_GRANT_COORDINATOR'
];

export default function StaffingTab() {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/users/faculty/');
      setFacultyList(data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (faculty: any) => {
    setEditingUserId(faculty.id);
    setSelectedRoles(faculty.additional_roles || []);
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async (userId: number) => {
    try {
      await fetchAPI(`/users/${userId}/roles/`, {
        method: 'PATCH',
        body: JSON.stringify({ additional_roles: selectedRoles })
      });
      // Update local state
      setFacultyList(prev => prev.map(f => 
        f.id === userId ? { ...f, additional_roles: selectedRoles } : f
      ));
      setEditingUserId(null);
    } catch (error) {
      console.error('Failed to update roles:', error);
      alert('Failed to update roles.');
    }
  };

  const filteredFaculty = facultyList.filter(f => {
    const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
    const email = (f.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-bold text-slate-900">Staffing &amp; Roles</h2>
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl outline-none focus:border-cyan-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading faculty...</p>
      ) : (
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No faculty found.</td>
                </tr>
              ) : (
                filteredFaculty.map(f => (
                  <React.Fragment key={f.id}>
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {f.first_name} {f.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{f.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{f.profile?.department_name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{f.profile?.designation || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(f.additional_roles || []).map((r: string) => (
                            <span key={r} className="px-2 py-1 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-md text-[10px] font-bold">
                              {r.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditClick(f)}
                          className="text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit Roles
                        </button>
                      </td>
                    </tr>
                    {editingUserId === f.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-slate-50/80 border-b border-slate-200">
                          <div className="mb-4 text-sm font-bold text-slate-700">Assign Roles for {f.first_name}</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {AVAILABLE_ROLES.map(role => (
                              <label key={role} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                <input
                                  type="checkbox"
                                  checked={selectedRoles.includes(role)}
                                  onChange={() => handleRoleToggle(role)}
                                  className="rounded text-cyan-500 focus:ring-cyan-500 border-slate-300"
                                />
                                <span className="text-[11px] font-semibold">{role.replace(/_/g, ' ')}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveRoles(f.id)}
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                            >
                              Save Roles
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
      )}
    </div>
  );
}
