'use client';

export default function FacultyProfileSection({ profile, user }: { profile: any, user: any }) {
  if (!profile || !user) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {profile.gender === 'FEMALE' ? 'Prof. (Ms.)' : 'Prof. (Mr.)'} {user.first_name} {user.last_name}
          </h2>
          <div className="flex space-x-4 mt-2">
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-400">Faculty ID:</span> <span className="font-bold text-slate-700">{profile.faculty_id || "N/A"}</span></p>
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-400">Department:</span> <span className="font-bold text-slate-700">{profile.department_name || "N/A"}</span></p>
            <p className="text-sm text-slate-500 font-medium"><span className="text-slate-400">Designation:</span> <span className="font-bold text-slate-700">{profile.designation || "N/A"}</span></p>
          </div>
        </div>
        <button onClick={() => window.print()} className="mt-4 md:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Download Profile (PDF)
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center shadow-sm">
        <div className="bg-emerald-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div className="flex-1">
          <p className="text-emerald-800 font-medium text-sm">Profile active. Contact IT support for any corrections to official records.</p>
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
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Faculty ID</td><td className="w-2/3 font-semibold text-slate-800">{profile.faculty_id || "N/A"}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Department</td><td className="w-2/3 font-semibold text-slate-800">{profile.department_name || "N/A"}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Designation</td><td className="w-2/3 font-semibold text-slate-800">{profile.designation || "N/A"}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Specialization</td><td className="w-2/3 font-semibold text-slate-800">{profile.specialization || "N/A"}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Joining Date</td><td className="w-2/3 font-semibold text-slate-800">{profile.date_of_joining || "N/A"}</td></tr>
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
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Full Name</td><td className="w-2/3 font-semibold text-slate-800">{user.first_name} {user.last_name}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Email</td><td className="w-2/3 font-semibold text-slate-800">{user.email || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Phone</td><td className="w-2/3 font-semibold text-slate-800">{profile.phone || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">DOB</td><td className="w-2/3 font-semibold text-slate-800">{profile.dob || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Office Location</td><td className="w-2/3 font-semibold text-slate-800">{profile.office_room || '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Contact & Availability</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Office Hours</td><td className="w-2/3 font-semibold text-slate-800">{profile.office_hours || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Inst. Email</td><td className="w-2/3 font-semibold text-blue-600">{user.email || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Personal Email</td><td className="w-2/3 font-semibold text-slate-800">{profile.personal_email || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Extension</td><td className="w-2/3 font-semibold text-slate-800">{profile.extension_number || '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Research */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Research & Publications</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Research Interests</td><td className="w-2/3 font-semibold text-slate-800">{profile.research_interests || '—'}</td></tr>
                <tr className="flex py-2"><td className="w-1/3 text-slate-500 font-medium">Publications</td><td className="w-2/3 font-semibold text-slate-800">{profile.publications || '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
