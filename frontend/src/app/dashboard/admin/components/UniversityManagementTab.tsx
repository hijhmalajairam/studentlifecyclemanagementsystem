'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

interface Department { id: number; name: string; code: string; description: string; }
interface Program { id: number; name: string; code: string; department: number; department_name: string; duration_years: number; description: string; }
interface Course { id: number; code: string; name: string; credits: number; semester: number; }

type ActiveEntity = 'departments' | 'programs' | 'courses';

export default function UniversityManagementTab() {
  const [activeEntity, setActiveEntity] = useState<ActiveEntity>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [progForm, setProgForm] = useState({ name: '', code: '', department: '', duration_years: '4', description: '' });
  const [courseForm, setCourseForm] = useState({ code: '', name: '', credits: '3', semester: '1' });

  const refresh = async () => {
    setLoading(true);
    try {
      const [d, p, c] = await Promise.all([
        fetchAPI('/academics/departments/'),
        fetchAPI('/academics/programs/'),
        fetchAPI('/academics/courses/'),
      ]);
      setDepartments(d); setPrograms(p); setCourses(c);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const resetForms = () => {
    setDeptForm({ name: '', code: '', description: '' });
    setProgForm({ name: '', code: '', department: '', duration_years: '4', description: '' });
    setCourseForm({ code: '', name: '', credits: '3', semester: '1' });
    setShowForm(false);
    setEditingId(null);
  };

  // CRUD handlers
  const saveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchAPI(`/academics/departments/${editingId}/`, { method: 'PUT', body: JSON.stringify(deptForm) });
      } else {
        await fetchAPI('/academics/departments/', { method: 'POST', body: JSON.stringify(deptForm) });
      }
      resetForms(); refresh();
    } catch { alert('Failed to save department. Check that name and code are unique.'); }
  };

  const saveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { ...progForm, department: parseInt(progForm.department), duration_years: parseInt(progForm.duration_years) };
      if (editingId) {
        await fetchAPI(`/academics/programs/${editingId}/`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await fetchAPI('/academics/programs/', { method: 'POST', body: JSON.stringify(body) });
      }
      resetForms(); refresh();
    } catch { alert('Failed to save program. Check that code is unique.'); }
  };

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { ...courseForm, credits: parseInt(courseForm.credits), semester: parseInt(courseForm.semester) };
      if (editingId) {
        await fetchAPI(`/academics/courses/${editingId}/`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await fetchAPI('/academics/courses/', { method: 'POST', body: JSON.stringify(body) });
      }
      resetForms(); refresh();
    } catch { alert('Failed to save course. Check that code is unique.'); }
  };

  const deleteEntity = async (entity: string, id: number) => {
    if (!confirm(`Are you sure you want to delete this ${entity}?`)) return;
    try {
      await fetchAPI(`/academics/${entity}/${id}/`, { method: 'DELETE' });
      refresh();
    } catch { alert(`Failed to delete ${entity}.`); }
  };

  const startEdit = (entity: ActiveEntity, item: any) => {
    setActiveEntity(entity);
    setEditingId(item.id);
    setShowForm(true);
    if (entity === 'departments') setDeptForm({ name: item.name, code: item.code, description: item.description || '' });
    if (entity === 'programs') setProgForm({ name: item.name, code: item.code, department: String(item.department), duration_years: String(item.duration_years), description: item.description || '' });
    if (entity === 'courses') setCourseForm({ code: item.code, name: item.name, credits: String(item.credits), semester: String(item.semester) });
  };

  const entityTabs = [
    { id: 'departments' as ActiveEntity, label: 'Departments', count: departments.length, emoji: '🏢' },
    { id: 'programs' as ActiveEntity, label: 'Programs', count: programs.length, emoji: '🎓' },
    { id: 'courses' as ActiveEntity, label: 'Courses', count: courses.length, emoji: '📚' },
  ];

  const inputCls = "w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 transition-all";
  const labelCls = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="space-y-6">
      {/* Entity Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        {entityTabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveEntity(tab.id); resetForms(); }}
            className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${activeEntity === tab.id
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/25'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
            <span>{tab.emoji}</span>
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeEntity === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
          </button>
        ))}
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="ml-auto px-5 py-3 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
          <span className="text-lg leading-none">{showForm ? '×' : '+'}</span>
          {showForm ? 'Cancel' : `Add ${activeEntity === 'departments' ? 'Department' : activeEntity === 'programs' ? 'Program' : 'Course'}`}
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg">
          <h3 className="text-lg font-black text-slate-900 mb-6">
            {editingId ? 'Edit' : 'Create New'} {activeEntity === 'departments' ? 'Department' : activeEntity === 'programs' ? 'Program' : 'Course'}
          </h3>

          {activeEntity === 'departments' && (
            <form onSubmit={saveDepartment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Department Name</label><input required className={inputCls} placeholder="e.g. Computer Science and Engineering" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} /></div>
                <div><label className={labelCls}>Code</label><input required className={inputCls} placeholder="e.g. CSE" value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} /></div>
              </div>
              <div><label className={labelCls}>Description</label><textarea className={inputCls + " min-h-[80px]"} placeholder="Optional description..." value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} /></div>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">{editingId ? 'Update' : 'Create'} Department</button>
            </form>
          )}

          {activeEntity === 'programs' && (
            <form onSubmit={saveProgram} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Program Name</label><input required className={inputCls} placeholder="e.g. B.Tech in Computer Science" value={progForm.name} onChange={e => setProgForm({ ...progForm, name: e.target.value })} /></div>
                <div><label className={labelCls}>Code</label><input required className={inputCls} placeholder="e.g. BTECH-CS" value={progForm.code} onChange={e => setProgForm({ ...progForm, code: e.target.value })} /></div>
                <div>
                  <label className={labelCls}>Department</label>
                  <select required className={inputCls} value={progForm.department} onChange={e => setProgForm({ ...progForm, department: e.target.value })}>
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Duration (Years)</label><input type="number" min="1" max="6" required className={inputCls} value={progForm.duration_years} onChange={e => setProgForm({ ...progForm, duration_years: e.target.value })} /></div>
              </div>
              <div><label className={labelCls}>Description</label><textarea className={inputCls + " min-h-[80px]"} placeholder="Optional description..." value={progForm.description} onChange={e => setProgForm({ ...progForm, description: e.target.value })} /></div>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">{editingId ? 'Update' : 'Create'} Program</button>
            </form>
          )}

          {activeEntity === 'courses' && (
            <form onSubmit={saveCourse} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className={labelCls}>Course Code</label><input required className={inputCls} placeholder="e.g. CS301" value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} /></div>
                <div><label className={labelCls}>Course Name</label><input required className={inputCls} placeholder="e.g. Data Structures" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} /></div>
                <div><label className={labelCls}>Credits</label><input type="number" min="1" max="10" required className={inputCls} value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: e.target.value })} /></div>
                <div><label className={labelCls}>Semester</label><input type="number" min="1" max="8" required className={inputCls} value={courseForm.semester} onChange={e => setCourseForm({ ...courseForm, semester: e.target.value })} /></div>
              </div>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">{editingId ? 'Update' : 'Create'} Course</button>
            </form>
          )}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold">Loading...</div>
        ) : (
          <>
            {/* DEPARTMENTS TABLE */}
            {activeEntity === 'departments' && (
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Programs</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-bold">No departments yet. Create one above!</td></tr>
                  ) : departments.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4"><span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-lg text-xs font-black border border-blue-500/20">{d.code}</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{d.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{programs.filter(p => p.department === d.id).length} programs</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit('departments', d)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">Edit</button>
                          <button onClick={() => deleteEntity('departments', d.id)} className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* PROGRAMS TABLE */}
            {activeEntity === 'programs' && (
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold">No programs yet. Create one above!</td></tr>
                  ) : programs.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4"><span className="bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black border border-indigo-500/20">{p.code}</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.department_name || departments.find(d => d.id === p.department)?.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.duration_years} years</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit('programs', p)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">Edit</button>
                          <button onClick={() => deleteEntity('programs', p.id)} className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* COURSES TABLE */}
            {activeEntity === 'courses' && (
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credits</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold">No courses yet. Create one above!</td></tr>
                  ) : courses.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black border border-emerald-500/20">{c.code}</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{c.credits}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">Sem {c.semester}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit('courses', c)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">Edit</button>
                          <button onClick={() => deleteEntity('courses', c.id)} className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
