import React from 'react';

interface StudentsTabProps {
  enrollments: any[];
  applications: any[];
  expandedRow: number | null;
  setExpandedRow: (id: number | null) => void;
}

export default function StudentsTab({ enrollments, applications, expandedRow, setExpandedRow }: StudentsTabProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
      <table className="min-w-full text-left">
        <thead className="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrollment #</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fee Paid</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Date</th>
            <th className="px-6 py-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {enrollments.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No enrollments found.</td></tr>
          ) : enrollments.map((e: any) => (
            <React.Fragment key={e.id}>
              <tr className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setExpandedRow(expandedRow === e.id ? null : e.id)}>
                <td className="px-6 py-4 text-sm font-mono font-bold text-cyan-500">{e.enrollment_number}</td>
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">UID-{e.user} <span className="text-xs text-slate-400 ml-2">(Click to view profile)</span></td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${e.fee_paid ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {e.fee_paid ? 'PAID' : 'UNPAID'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(e.enrolled_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right text-xs text-slate-400">{expandedRow === e.id ? 'Close' : 'View'}</td>
              </tr>
              {expandedRow === e.id && (
                <tr className="bg-slate-50/80">
                  <td colSpan={5} className="px-8 py-6 border-b border-slate-200">
                    {(() => {
                      // Find corresponding application to show profile details
                      const studentApp = applications.find(a => a.enrollment_number === e.enrollment_number);
                      return studentApp ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 text-sm mb-4">Profile Details</h4>
                            <div className="space-y-2">
                              <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Username:</span> <span className="text-slate-800">{studentApp.profile_details?.username}</span></p>
                              <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Email:</span> <span className="text-slate-800">{studentApp.profile_details?.email || 'N/A'}</span></p>
                              <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Phone:</span> <span className="text-slate-800">{studentApp.profile_details?.phone || 'N/A'}</span></p>
                              <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Entry Type:</span> <span className="text-slate-800">{studentApp.entry_type}</span></p>
                            </div>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 text-sm mb-4">Academic & Seat Info</h4>
                            <div className="space-y-2">
                              {studentApp.seat_allocation ? (
                                <>
                                  <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Department:</span> <span className="text-slate-800">{studentApp.seat_allocation.allocated_department}</span></p>
                                  <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Program:</span> <span className="text-slate-800">{studentApp.seat_allocation.allocated_program}</span></p>
                                  <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">Batch:</span> <span className="text-slate-800">{studentApp.seat_allocation.allocated_batch}</span></p>
                                </>
                              ) : (
                                <p className="text-sm text-slate-400 italic">No seat allocated yet.</p>
                              )}
                              <div className="border-t border-slate-100 my-2 pt-2"></div>
                              <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">10th %:</span> <span className="text-slate-800">{studentApp.tenth_percentage || 'N/A'}%</span></p>
                              <p className="text-sm"><span className="font-bold text-slate-500 w-24 inline-block">12th %:</span> <span className="text-slate-800">{studentApp.twelfth_percentage || 'N/A'}%</span></p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No application details found for this enrollment.</p>
                      );
                    })()}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
