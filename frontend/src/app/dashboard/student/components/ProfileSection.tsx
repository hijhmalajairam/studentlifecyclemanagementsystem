'use client';

export default function ProfileSection({ profile }: { profile: any }) {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {profile.gender === 'FEMALE' ? 'Ms.' : 'Mr.'} {profile.first_name} {profile.last_name}
          </h2>
          <div className="flex space-x-4 mt-2">
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-400">Enrolment No:</span> <span className="font-bold text-slate-700">{profile.enrollment_number}</span></p>
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-400">Program:</span> <span className="font-bold text-slate-700">B.Tech</span></p>
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-400">Branch:</span> <span className="font-bold text-slate-700">Computer Science & Engineering</span></p>
          </div>
        </div>
        <button className="mt-4 md:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Download Personal Data Form (PDF)
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center shadow-sm">
        <div className="bg-emerald-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div className="flex-1">
          <p className="text-emerald-800 font-medium text-sm">Profile Submitted — If you need to make changes, please contact your Dean's Office.</p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Academic Details</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Enrolment No</td><td className="w-2/3 font-semibold text-slate-800">{profile.enrollment_number}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Application ID</td><td className="w-2/3 font-semibold text-slate-800">APP-2025-{profile.id}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Program</td><td className="w-2/3 font-semibold text-slate-800">B.Tech</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Branch</td><td className="w-2/3 font-semibold text-slate-800">Computer Science & Engineering</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Semester</td><td className="w-2/3 font-semibold text-slate-800">1</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Section</td><td className="w-2/3 font-semibold text-slate-800">A</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Status</td><td className="w-2/3"><span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded uppercase">Active</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Personal Details</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Full Name</td><td className="w-2/3 font-semibold text-slate-800">{profile.first_name} {profile.last_name}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">DOB</td><td className="w-2/3 font-semibold text-slate-800">{profile.dob || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Gender</td><td className="w-2/3 font-semibold text-slate-800">{profile.gender || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Blood Group</td><td className="w-2/3 font-semibold text-slate-800">{profile.blood_group || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Nationality</td><td className="w-2/3 font-semibold text-slate-800">{profile.nationality || 'Indian'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Religion</td><td className="w-2/3 font-semibold text-slate-800">{profile.religion || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Category</td><td className="w-2/3 font-semibold text-slate-800">{profile.category || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Differently Abled</td><td className="w-2/3 font-semibold text-slate-800">{profile.differently_abled || 'No'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Contact</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Mobile No.</td><td className="w-2/3 font-semibold text-slate-800">{profile.mobile_no || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Alt Mobile No.</td><td className="w-2/3 font-semibold text-slate-800">{profile.alternate_mobile_no || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Inst. Email</td><td className="w-2/3 font-semibold text-blue-600">{profile.institutional_email || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Personal Email</td><td className="w-2/3 font-semibold text-slate-800">{profile.personal_email || '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Name as per Official Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Name as per Official Documents</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">SSC / 10th</td><td className="w-2/3 font-semibold text-slate-800">{profile.name_as_per_ssc || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Aadhaar Name</td><td className="w-2/3 font-semibold text-slate-800">{profile.name_as_per_aadhaar || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Aadhaar No.</td><td className="w-2/3 font-semibold text-slate-800">{profile.aadhaar_number || '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      {/* Academic Record Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Academic Record</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-bold">Class</th>
                <th className="px-5 py-3 font-bold">School/College Name</th>
                <th className="px-5 py-3 font-bold text-center">City</th>
                <th className="px-5 py-3 font-bold text-center">Board/Univ</th>
                <th className="px-5 py-3 font-bold text-center">Medium</th>
                <th className="px-5 py-3 font-bold text-center">Year</th>
                <th className="px-5 py-3 font-bold text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 font-bold text-slate-700">X (SSC)</td>
                <td className="px-5 py-3">{profile.class_10_school || '—'}</td>
                <td className="px-5 py-3 text-center">{profile.class_10_city || '—'}</td>
                <td className="px-5 py-3 text-center">{profile.class_10_board || '—'}</td>
                <td className="px-5 py-3 text-center">{profile.class_10_medium || '—'}</td>
                <td className="px-5 py-3 text-center font-medium">{profile.class_10_year || '—'}</td>
                <td className="px-5 py-3 text-right font-bold">{profile.class_10_percentage || '—'}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 font-bold text-slate-700">XII (Inter)</td>
                <td className="px-5 py-3">{profile.class_12_school || '—'}</td>
                <td className="px-5 py-3 text-center">{profile.class_12_city || '—'}</td>
                <td className="px-5 py-3 text-center">{profile.class_12_board || '—'}</td>
                <td className="px-5 py-3 text-center">{profile.class_12_medium || '—'}</td>
                <td className="px-5 py-3 text-center font-medium">{profile.class_12_year || '—'}</td>
                <td className="px-5 py-3 text-right font-bold">{profile.class_12_percentage || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permanent Address */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Permanent Address</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-800 leading-relaxed min-h-[40px]">{profile.permanent_address || '—'}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
              <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">City</span><span className="font-bold">{profile.permanent_city || '—'}</span></div>
              <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">State</span><span className="font-bold">{profile.permanent_state || '—'}</span></div>
              <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">PIN</span><span className="font-bold">{profile.permanent_pin || '—'}</span></div>
            </div>
          </div>
        </div>

        {/* Mailing Address */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Mailing Address</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-800 leading-relaxed min-h-[40px]">{profile.mailing_address || '—'}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
              <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">City</span><span className="font-bold">{profile.mailing_city || '—'}</span></div>
              <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">State</span><span className="font-bold">{profile.mailing_state || '—'}</span></div>
              <div><span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">PIN</span><span className="font-bold">{profile.mailing_pin || '—'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Father's Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Father's Details</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div><span className="text-slate-500 font-medium block mb-1">Name</span><span className="font-semibold text-slate-800">{profile.father_name || '—'}</span></div>
            <div><span className="text-slate-500 font-medium block mb-1">Mobile</span><span className="font-semibold text-slate-800">{profile.father_mobile || '—'}</span></div>
            <div><span className="text-slate-500 font-medium block mb-1">Email</span><span className="font-semibold text-slate-800">{profile.father_email || '—'}</span></div>
            <div><span className="text-slate-500 font-medium block mb-1">Qualification</span><span className="font-semibold text-slate-800">{profile.father_qualification || '—'}</span></div>
            <div><span className="text-slate-500 font-medium block mb-1">Occupation</span><span className="font-semibold text-slate-800">{profile.father_occupation || '—'}</span></div>
            <div><span className="text-slate-500 font-medium block mb-1">Designation</span><span className="font-semibold text-slate-800">{profile.father_designation || '—'}</span></div>
            <div className="lg:col-span-2"><span className="text-slate-500 font-medium block mb-1">Organisation</span><span className="font-semibold text-slate-800">{profile.father_organisation || '—'}</span></div>
            <div><span className="text-slate-500 font-medium block mb-1">Annual Income</span><span className="font-semibold text-slate-800">{profile.father_income ? `₹ ${profile.father_income}` : '—'}</span></div>
            <div className="lg:col-span-3"><span className="text-slate-500 font-medium block mb-1">Office Address</span><span className="font-semibold text-slate-800">{profile.father_office_address || '—'}</span></div>
          </div>
        </div>
      </div>

    </div>
  );
}
