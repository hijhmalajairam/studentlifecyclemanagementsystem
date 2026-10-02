'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function PresentAddress({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    present_address: '', present_city: '', present_state: '', present_pin: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        present_address: profile.present_address || '',
        present_city: profile.present_city || '',
        present_state: profile.present_state || '',
        present_pin: profile.present_pin || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setMessage('Address updated successfully.');
      onUpdate();
    } catch (err) {
      setMessage('Failed to update address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200">
      <div className="bg-[#1a365d] text-white px-4 py-2 rounded-t-md font-semibold text-sm flex justify-between items-center">
        <span>Present Address</span>
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
              <td className="py-3 font-semibold text-slate-700 w-1/4 align-top pt-4">Address</td>
              <td className="py-3 w-3/4" colSpan={3}>
                <textarea name="present_address" value={formData.present_address} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900 h-20 resize-none" />
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700 w-1/4">City</td>
              <td className="py-3 w-1/4">
                <input type="text" name="present_city" value={formData.present_city} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 w-1/4 pl-4">State</td>
              <td className="py-3 w-1/4">
                <input type="text" name="present_state" value={formData.present_state} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700 w-1/4">Pin</td>
              <td className="py-3 w-1/4">
                <input type="text" name="present_pin" value={formData.present_pin} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 w-1/4 pl-4"></td>
              <td className="py-3 w-1/4"></td>
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
