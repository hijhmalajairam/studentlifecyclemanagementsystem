'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

interface LeaveRecord {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applied_on: string;
  enrollment_number?: string;
  program_name?: string;
}

interface StudentLeavesTabProps {
  user: any;
  enrollment: any;
}

export default function StudentLeavesTab({ user, enrollment }: StudentLeavesTabProps) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Medical Leave');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadLeaves = async () => {
    try {
      const data = await fetchAPI('/academics/leaves/my_leaves/');
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!startDate || !endDate || !reason.trim()) {
      setErrorMsg('Please fill in start date, end date, and reason.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }

    setSubmitting(true);
    try {
      const fullReason = `[${leaveType}] ${reason.trim()}`;
      await fetchAPI('/academics/leaves/', {
        method: 'POST',
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          reason: fullReason,
        }),
      });

      setSuccessMsg('Leave application submitted successfully! Awaiting review by administration.');
      setStartDate('');
      setEndDate('');
      setReason('');
      setShowApplyModal(false);
      await loadLeaves();
    } catch {
      setErrorMsg('Failed to submit leave application. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Attendance Protection System
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Student Leave & Absence Management
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium">
              {enrollment?.program_name || 'B.Tech Computer Science & Engineering'} • Section A • Approved leaves auto-tag lecture absences as <span className="text-emerald-300 font-bold">Excused / On-Duty</span> to protect statutory 75% eligibility.
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span className="text-base">📝</span> Apply for Leave / OD
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applied</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{leaves.length}</p>
          <span className="text-xs text-slate-500 font-medium">Formal Requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Approved Leaves</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
          <span className="text-xs text-emerald-700 font-medium">Excused Attendance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Under Review</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-xs text-amber-700 font-medium">Pending Decision</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rejected</span>
          <p className="text-2xl font-black text-slate-700 mt-1">{rejectedCount}</p>
          <span className="text-xs text-slate-500 font-medium">Unexcused</span>
        </div>
      </div>

      {/* Leave Application History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-slate-800 text-base">Your Leave Applications</h3>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
              Official Log
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">{leaves.length} Applications</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading leave records…</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl">
              📋
            </div>
            <p className="font-bold text-slate-700 text-base">No leave applications on record</p>
            <p className="text-xs text-slate-400 mt-1">If you fall ill or represent the university in an event, apply above to protect your attendance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider w-16">ID</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Dates & Duration</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Reason / Category</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Attendance Impact</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">
                      LV-{l.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-xs">
                        {l.start_date} <span className="text-slate-400 font-normal">to</span> {l.end_date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-700 max-w-md">{l.reason}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                          l.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : l.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {l.status === 'APPROVED' ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🛡️ Excused / Protected
                        </span>
                      ) : l.status === 'PENDING' ? (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Pending Review
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-red-500">
                          Counted as Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                      {new Date(l.applied_on).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">New Leave Application</h3>
                <p className="text-xs text-slate-500 mt-0.5">Submit your absence to prevent attendance penalties</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Medical Leave">Medical Leave (Doctor Advice / Illness)</option>
                  <option value="On-Duty / Academic Event">On-Duty / University Representation (OD)</option>
                  <option value="Personal Emergency">Personal Emergency / Bereavement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Detailed Reason & Medical Note
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain reason for absence, doctor consultation details, or event particulars..."
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-800">
                ℹ️ <b>Policy Notice:</b> Once approved by the department, all lectures missed within this date range will be recorded as <b>Excused / On-Duty</b> in your attendance calculation.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
