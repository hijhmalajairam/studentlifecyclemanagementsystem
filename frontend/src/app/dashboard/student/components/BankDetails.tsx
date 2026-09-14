'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function BankDetails({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    bank_name: '', branch: '', account_number: '', ifsc_code: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        bank_name: profile.bank_name || '',
        branch: profile.branch || '',
        account_number: profile.account_number || '',
        ifsc_code: profile.ifsc_code || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await fetchAPI(`/academics/student-profiles/${profile.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setMessage('Bank details updated successfully.');
      onUpdate();
    } catch (err) {
      setMessage('Failed to update details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200">
      <div className="bg-[#1a365d] text-white px-4 py-2 rounded-t-md font-semibold text-sm flex justify-between items-center">
        <span>Bank A/C Details</span>
      </div>
      
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex">
            <span className="w-40 font-semibold text-slate-700">Enrolment No</span>
            <span className="text-blue-600 font-bold">{profile?.enrollment_number}</span>
          </div>
          <div className="flex">
            <span className="w-40 font-semibold text-slate-700">Student Name</span>
            <span className="text-slate-900">{profile?.first_name} {profile?.last_name}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {message && <div className={`p-2 mb-4 text-sm rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
        
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700 w-1/4">Bank Name</td>
              <td className="py-3 w-1/4">
                <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 w-1/4 pl-4">Branch</td>
              <td className="py-3 w-1/4">
                <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700 w-1/4">Account Number</td>
              <td className="py-3 w-1/4">
                <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 w-1/4 pl-4">IFSC Code</td>
              <td className="py-3 w-1/4">
                <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-center mt-6 space-x-4">
          <button type="submit" disabled={saving} className="bg-[#1a365d] text-white px-6 py-1.5 rounded text-sm font-semibold shadow hover:bg-blue-900 transition-colors disabled:opacity-50">
            {saving ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className="bg-slate-500 text-white px-6 py-1.5 rounded text-sm font-semibold shadow hover:bg-slate-600 transition-colors">
            Close
          </button>
        </div>
      </form>
    </div>
  );
}
