'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  dob: z.string().min(1, 'Date of Birth is required'),
  institutional_email: z.string().optional(),
  personal_email: z.string().email('Invalid email format').min(1, 'Personal Email is required'),
  alternate_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  mobile_no: z.string().min(10, 'Mobile No must be at least 10 digits'),
  alternate_mobile_no: z.string().optional(),
  sip_mobile: z.string().optional(),
  skype_id: z.string().optional(),
  birth_place: z.string().optional(),
  native_place: z.string().optional(),
  home_town: z.string().optional(),
  home_state: z.string().optional()
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactDetails({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      dob: '', institutional_email: '', personal_email: '', alternate_email: '',
      mobile_no: '', alternate_mobile_no: '', sip_mobile: '', skype_id: '',
      birth_place: '', native_place: '', home_town: '', home_state: ''
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        dob: profile.dob || '',
        institutional_email: profile.institutional_email || '',
        personal_email: profile.personal_email || '',
        alternate_email: profile.alternate_email || '',
        mobile_no: profile.mobile_no || '',
        alternate_mobile_no: profile.alternate_mobile_no || '',
        sip_mobile: profile.sip_mobile || '',
        skype_id: profile.skype_id || '',
        birth_place: profile.birth_place || '',
        native_place: profile.native_place || '',
        home_town: profile.home_town || '',
        home_state: profile.home_state || ''
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ContactFormData) => {
    setSaving(true);
    setMessage('');
    try {
      await fetchAPI(`/academics/student-profiles/${profile.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      setMessage('Contact details updated successfully.');
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
        <span>Contact Details</span>
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

      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        {message && <div className={`p-2 mb-4 text-sm rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
        
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700 w-1/4">Date Of Birth<span className="text-red-500">*</span></td>
              <td className="py-3 w-1/4">
                <input type="date" {...register('dob')} className={`border rounded px-2 py-1 w-full text-slate-900 ${errors.dob ? 'border-red-500' : 'border-slate-300'}`} />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
              </td>
              <td className="py-3 font-semibold text-slate-700 w-1/4 pl-4">Institutional Email id</td>
              <td className="py-3 w-1/4">
                <input type="email" {...register('institutional_email')} readOnly className="border border-slate-200 bg-slate-100 rounded px-2 py-1 w-full text-slate-600 cursor-not-allowed" />
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700">Personal Email ID<span className="text-red-500">*</span></td>
              <td className="py-3">
                <input type="email" {...register('personal_email')} className={`border rounded px-2 py-1 w-full text-slate-900 ${errors.personal_email ? 'border-red-500' : 'border-slate-300'}`} />
                {errors.personal_email && <p className="text-red-500 text-xs mt-1">{errors.personal_email.message}</p>}
              </td>
              <td className="py-3 font-semibold text-slate-700 pl-4">Alternate Email ID</td>
              <td className="py-3">
                <input type="email" {...register('alternate_email')} className={`border rounded px-2 py-1 w-full text-slate-900 ${errors.alternate_email ? 'border-red-500' : 'border-slate-300'}`} />
                {errors.alternate_email && <p className="text-red-500 text-xs mt-1">{errors.alternate_email.message}</p>}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700">Mobile No<span className="text-red-500">*</span></td>
              <td className="py-3">
                <input type="text" {...register('mobile_no')} className={`border rounded px-2 py-1 w-full text-slate-900 ${errors.mobile_no ? 'border-red-500' : 'border-slate-300'}`} />
                {errors.mobile_no && <p className="text-red-500 text-xs mt-1">{errors.mobile_no.message}</p>}
              </td>
              <td className="py-3 font-semibold text-slate-700 pl-4">Alternate Mobile No</td>
              <td className="py-3">
                <input type="text" {...register('alternate_mobile_no')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700">SIP Mobile</td>
              <td className="py-3">
                <input type="text" {...register('sip_mobile')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 pl-4">Skype ID</td>
              <td className="py-3">
                <input type="text" {...register('skype_id')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 font-semibold text-slate-700">Birth Place</td>
              <td className="py-3">
                <input type="text" {...register('birth_place')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 pl-4">Native Place</td>
              <td className="py-3">
                <input type="text" {...register('native_place')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700">Home Town</td>
              <td className="py-3">
                <input type="text" {...register('home_town')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
              </td>
              <td className="py-3 font-semibold text-slate-700 pl-4">Home State</td>
              <td className="py-3">
                <input type="text" {...register('home_state')} className="border border-slate-300 rounded px-2 py-1 w-full text-slate-900" />
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
