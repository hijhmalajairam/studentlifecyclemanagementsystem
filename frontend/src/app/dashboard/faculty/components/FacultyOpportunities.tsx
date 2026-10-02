'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function FacultyOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    description: '',
    required_skills: '',
    eligibility: '',
    duration_months: 6,
    stipend: 0,
    location: '',
    work_mode: 'ONSITE',
    application_deadline: '',
    available_positions: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oppData, compData] = await Promise.all([
        fetchAPI('/academics/internship-opportunities/'),
        fetchAPI('/academics/companies/')
      ]);
      setOpportunities(oppData.results || oppData);
      setCompanies(compData.results || compData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetchAPI('/academics/internship-opportunities/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Opportunity created successfully!');
      setShowModal(false);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Error creating opportunity');
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Faculty Provided Internships</h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-900/50">
          + Post Opportunity
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-10">Loading opportunities...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <div key={opp.id} className="bg-slate-900/50 border border-slate-700/50 p-5 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{opp.role}</h3>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${opp.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {opp.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-emerald-400 text-sm font-bold mb-4">{opp.company_details?.name}</p>
              
              <div className="space-y-2 text-xs text-slate-400">
                <p><strong className="text-slate-300">Stipend:</strong> ₹{opp.stipend}/mo</p>
                <p><strong className="text-slate-300">Duration:</strong> {opp.duration_months} months</p>
                <p><strong className="text-slate-300">Deadline:</strong> {opp.application_deadline}</p>
                <p><strong className="text-slate-300">Mode:</strong> {opp.work_mode}</p>
              </div>
            </div>
          ))}
          {opportunities.length === 0 && (
            <p className="text-slate-400 col-span-full text-center py-10">No opportunities posted yet.</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Post New Opportunity</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company</label>
                  <select required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Title</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Months)</label>
                  <input required type="number" min="1" value={formData.duration_months} onChange={e => setFormData({...formData, duration_months: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stipend (/month)</label>
                  <input required type="number" min="0" value={formData.stipend} onChange={e => setFormData({...formData, stipend: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Mode</label>
                  <select value={formData.work_mode} onChange={e => setFormData({...formData, work_mode: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="ONSITE">On-site</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Application Deadline</label>
                  <input required type="date" value={formData.application_deadline} onChange={e => setFormData({...formData, application_deadline: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Positions</label>
                  <input required type="number" min="1" value={formData.available_positions} onChange={e => setFormData({...formData, available_positions: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[80px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</label>
                <textarea value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[80px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Eligibility</label>
                <textarea value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 min-h-[80px]" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/50">Create Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
