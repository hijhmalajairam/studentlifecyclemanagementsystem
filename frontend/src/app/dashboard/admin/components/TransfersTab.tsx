import React from 'react';

interface TransfersTabProps {
  transfers: any[];
  updateTransferStatus: (id: number, status: string) => void;
  isAdmin: boolean;
  hasWriteAccess: boolean;
}

export default function TransfersTab({
  transfers,
  updateTransferStatus,
  isAdmin,
  hasWriteAccess,
}: TransfersTabProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg p-8">
      {transfers.length > 0 ? (
        <div className="space-y-3">
          {transfers.map((t: any) => (
            <div key={t.id} className="bg-slate-50/50 p-5 border border-slate-200 rounded-md flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-mono text-sm font-bold text-slate-700">ENR-{t.enrollment}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs text-slate-400">
                    {t.request_type.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === 'APPROVED'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : t.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{t.reason}</p>
              </div>
              {t.status === 'PENDING' && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => updateTransferStatus(t.id, 'APPROVED')}
                    disabled={!hasWriteAccess}
                    className={`bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold border border-green-500/30 transition ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600/30'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateTransferStatus(t.id, 'REJECTED')}
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
        <p className="text-slate-400 italic text-center py-12">No transfer/exit requests.</p>
      )}
    </div>
  );
}
