import React from 'react';

interface FeesTabProps {
  fees: any[];
  enrollments: any[];
  feeForm: { enrollment: string; semester: string; amount: string; due_date: string };
  setFeeForm: (form: any) => void;
  createFee: (e: React.FormEvent) => void;
  isAdmin: boolean;
  hasWriteAccess: boolean;
}

export default function FeesTab({
  fees,
  enrollments,
  feeForm,
  setFeeForm,
  createFee,
  isAdmin,
  hasWriteAccess,
}: FeesTabProps) {
  return (
    <div className="space-y-8">
      <form onSubmit={createFee} className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Create Fee Record</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enrollment ID</label>
            <select
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              value={feeForm.enrollment}
              onChange={(e) => setFeeForm({ ...feeForm, enrollment: e.target.value })}
            >
              <option value="">-- Select --</option>
              {enrollments.map((e: any) => (
                <option key={e.id} value={e.id}>
                  {e.enrollment_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Semester</label>
            <input
              type="number"
              min="1"
              max="8"
              required
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              value={feeForm.semester}
              onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
            <input
              type="number"
              required
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              value={feeForm.amount}
              onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
            <input
              type="date"
              required
              className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
              style={{ colorScheme: 'light' }}
              value={feeForm.due_date}
              onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!hasWriteAccess}
          className={`bg-blue-600 text-slate-900 px-6 py-3 rounded font-bold transition ${
            !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
          }`}
        >
          Create Fee
        </button>
      </form>
      <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Enrollment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Semester</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Due Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No fee records.
                </td>
              </tr>
            ) : (
              fees.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-cyan-400">ENR-{f.enrollment}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{f.semester}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">₹{parseFloat(f.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{f.due_date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        f.status === 'PAID'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : f.status === 'OVERDUE'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
