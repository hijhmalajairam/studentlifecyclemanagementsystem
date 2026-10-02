import React from 'react';

interface RevaluationsTabProps {
  revaluations: any[];
  updateRevalStatus: (id: number, status: string) => void;
  isAdmin: boolean;
  hasWriteAccess: boolean;
}

export default function RevaluationsTab({
  revaluations,
  updateRevalStatus,
  isAdmin,
  hasWriteAccess,
}: RevaluationsTabProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg p-8">
      {revaluations.length > 0 ? (
        <div className="space-y-3">
          {revaluations.map((r: any) => (
            <div key={r.id} className="bg-slate-50/50 p-5 border border-slate-200 rounded-md flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-bold text-slate-900">{r.course_code}</span>
                  <span className="text-xs text-slate-400">
                    Original: {r.original_grade} ({r.original_marks})
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      r.status === 'COMPLETED'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : r.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{r.reason}</p>
              </div>
              {r.status === 'PENDING' && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => updateRevalStatus(r.id, 'COMPLETED')}
                    disabled={!hasWriteAccess}
                    className={`bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600/30'
                    }`}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateRevalStatus(r.id, 'REJECTED')}
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
          ))}
        </div>
      ) : (
        <p className="text-slate-400 italic text-center py-12">No revaluation requests.</p>
      )}
    </div>
  );
}
