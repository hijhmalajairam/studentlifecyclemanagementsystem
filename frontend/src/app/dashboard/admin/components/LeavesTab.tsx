import React from 'react';

interface LeavesTabProps {
  leaves: any[];
  updateLeaveStatus: (id: number, status: string) => void;
  isAdmin: boolean;
  hasWriteAccess: boolean;
}

export default function LeavesTab({ leaves, updateLeaveStatus, isAdmin, hasWriteAccess }: LeavesTabProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Pending Leave Requests</h2>
        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">
          {leaves.filter((l) => l.status === 'PENDING').length} pending
        </span>
      </div>
      {leaves.length > 0 ? (
        <div className="space-y-3">
          {leaves.map((l: any) => (
            <div key={l.id} className="bg-slate-50/50 p-5 border border-slate-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-sm font-bold text-slate-700">ENR-{l.enrollment}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        l.status === 'APPROVED'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : l.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">
                    {l.start_date} → {l.end_date}
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-slate-300 mt-2">
                    "{l.reason}"
                  </p>
                </div>
                {l.status === 'PENDING' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => updateLeaveStatus(l.id, 'APPROVED')}
                      disabled={!hasWriteAccess}
                      className={`bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition ${
                        !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600/30'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateLeaveStatus(l.id, 'REJECTED')}
                      disabled={!hasWriteAccess}
                      className={`bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 transition ${
                        !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600/30'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 italic text-center py-12">No leave requests found.</p>
      )}
    </div>
  );
}
