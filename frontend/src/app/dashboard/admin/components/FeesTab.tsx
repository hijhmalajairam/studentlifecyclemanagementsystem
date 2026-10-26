'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  User, 
  GraduationCap, 
  Check, 
  X,
  Award,
  FileText,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import FeeReceiptModal from '../../student/components/FeeReceiptModal';

interface FeesTabProps {
  fees: any[];
  enrollments: any[];
  feeForm: { enrollment: string; semester: string; amount: string; due_date: string; scholarship_discount?: string };
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
  // Navigation sub-tab: 'ledger' or 'scholarships'
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'scholarships'>('ledger');

  // Fee state
  const [localFees, setLocalFees] = useState<any[]>(fees);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<any | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(null);

  // Scholarship state
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loadingScholarships, setLoadingScholarships] = useState(false);
  const [schSearchQuery, setSchSearchQuery] = useState('');
  const [schStatusFilter, setSchStatusFilter] = useState<'ALL' | 'APPLIED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedSchForApprove, setSelectedSchForApprove] = useState<any | null>(null);
  const [approveConcession, setApproveConcession] = useState<string>('25.00');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Sync props if parent updates fees
  useEffect(() => {
    setLocalFees(fees);
  }, [fees]);

  // Load scholarships from backend
  const loadScholarships = async () => {
    try {
      setLoadingScholarships(true);
      const data = await fetchAPI('/admission/scholarships/');
      const list = Array.isArray(data) ? data : (data?.results || []);
      setScholarships(list);
    } catch (err: any) {
      console.error('Failed to load scholarships', err);
    } finally {
      setLoadingScholarships(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, []);

  // Compute Financial Metrics
  const metrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let scholarshipCount = 0;
    let totalScholarshipValue = 0;

    localFees.forEach((f) => {
      const tuition = parseFloat(f.amount || 0);
      const discount = parseFloat(f.scholarship_discount || 0);
      const net = f.net_amount !== undefined 
        ? Number(f.net_amount) 
        : tuition * (1 - discount / 100);

      totalInvoiced += tuition;

      if (discount > 0) {
        scholarshipCount += 1;
        totalScholarshipValue += (tuition * discount) / 100;
      }

      if (f.status === 'PAID') {
        totalCollected += net;
      } else {
        totalPending += net;
      }
    });

    return {
      totalInvoiced,
      totalCollected,
      totalPending,
      scholarshipCount,
      totalScholarshipValue,
      count: localFees.length,
    };
  }, [localFees]);

  // Filtered Fees List
  const filteredFees = useMemo(() => {
    return localFees.filter((f) => {
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      if (semesterFilter !== 'ALL' && String(f.semester) !== semesterFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const studentName = (f.student_name || '').toLowerCase();
        const enrNo = (f.enrollment_number || `enr-${f.enrollment}`).toLowerCase();
        const prog = (f.program_name || f.program_code || '').toLowerCase();
        const sem = `semester ${f.semester}`.toLowerCase();
        if (!studentName.includes(query) && !enrNo.includes(query) && !prog.includes(query) && !sem.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [localFees, statusFilter, semesterFilter, searchQuery]);

  // Filtered Scholarships List
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      if (schStatusFilter !== 'ALL' && s.status !== schStatusFilter) return false;
      if (schSearchQuery.trim()) {
        const query = schSearchQuery.toLowerCase();
        const sName = (s.student_name || '').toLowerCase();
        const appNo = (s.application_number || '').toLowerCase();
        const enrNo = (s.enrollment_number || '').toLowerCase();
        const reason = (s.reason || '').toLowerCase();
        const prog = (s.program_name || s.program_code || '').toLowerCase();
        if (!sName.includes(query) && !appNo.includes(query) && !enrNo.includes(query) && !reason.includes(query) && !prog.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [scholarships, schStatusFilter, schSearchQuery]);

  const pendingScholarshipsCount = useMemo(() => {
    return scholarships.filter((s) => s.status === 'APPLIED').length;
  }, [scholarships]);

  // Mark Fee As Paid (Bursar desk offline recording)
  const handleMarkAsPaid = async (feeId: number) => {
    if (!window.confirm('Mark this invoice as PAID? This will update the student ledger, notify the student, and clear bursar dues.')) {
      return;
    }

    try {
      setProcessingPaymentId(feeId);
      const updated = await fetchAPI(`/academics/fees/${feeId}/pay_semester_fee/`, {
        method: 'POST',
      });

      setLocalFees((prev) =>
        prev.map((f) => (f.id === feeId ? { ...f, ...updated, status: 'PAID', paid_date: new Date().toISOString().split('T')[0] } : f))
      );

      setActionSuccessMsg(`Invoice #${feeId} successfully marked as PAID.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to process payment');
      setTimeout(() => setActionErrorMsg(null), 4000);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Approve Scholarship
  const handleApproveScholarship = async () => {
    if (!selectedSchForApprove) return;
    try {
      setActionLoadingId(selectedSchForApprove.id);
      const res = await fetchAPI(`/admission/scholarships/${selectedSchForApprove.id}/approve/`, {
        method: 'POST',
        body: JSON.stringify({ concession_percentage: approveConcession }),
      });

      setScholarships((prev) =>
        prev.map((s) => (s.id === selectedSchForApprove.id ? { ...s, ...res, status: 'APPROVED', concession_percentage: approveConcession } : s))
      );

      // Refresh fees to reflect synchronized discounts
      try {
        const updatedFees = await fetchAPI('/academics/fees/');
        if (Array.isArray(updatedFees)) setLocalFees(updatedFees);
      } catch (e) {}

      setActionSuccessMsg(`Scholarship approved for ${selectedSchForApprove.student_name} at ${approveConcession}% concession. Fee ledger synchronized!`);
      setSelectedSchForApprove(null);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to approve scholarship');
      setTimeout(() => setActionErrorMsg(null), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Scholarship
  const handleRejectScholarship = async (sch: any) => {
    const reason = window.prompt(`Enter remarks/reason for declining ${sch.student_name}'s application:`, 'Does not meet current academic or financial eligibility criteria.');
    if (reason === null) return;

    try {
      setActionLoadingId(sch.id);
      const res = await fetchAPI(`/admission/scholarships/${sch.id}/reject/`, {
        method: 'POST',
        body: JSON.stringify({ remarks: reason }),
      });

      setScholarships((prev) =>
        prev.map((s) => (s.id === sch.id ? { ...s, ...res, status: 'REJECTED' } : s))
      );

      setActionSuccessMsg(`Application for ${sch.student_name} marked as REJECTED.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to reject scholarship');
      setTimeout(() => setActionErrorMsg(null), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── UNIFIED HEADER & SUB-NAVIGATION ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 uppercase tracking-wider">
              Bursar & Financial Operations Desk
            </span>
            <span className="text-xs font-semibold text-slate-400">Admin & Finance Incharge</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>Fees, Invoicing & Scholarships Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage semester fee collections, verify scholarship applications, issue fee concessions, and enforce no-dues clearance.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center space-x-2 ${
              activeSubTab === 'ledger'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Ledger</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {localFees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('scholarships')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center space-x-2 ${
              activeSubTab === 'scholarships'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Scholarship Requests</span>
            {pendingScholarshipsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">
                {pendingScholarshipsCount} Pending
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {scholarships.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SUB-VIEW 1: FEE LEDGER & INVOICING                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          {/* Bursar Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  ₹{metrics.totalInvoiced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{metrics.count} Issued Invoices</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  ₹{metrics.totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h3>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Bursar Cleared</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  ₹{metrics.totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h3>
                <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Pending / Overdue</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scholarships Awarded</p>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">
                  {metrics.scholarshipCount} Scholars
                </h3>
                <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">
                  ₹{metrics.totalScholarshipValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Concessions
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Create Invoice Accordion */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/60 transition flex justify-between items-center text-left"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Issue New Fee Invoice</h3>
                  <p className="text-xs text-slate-500">Bill a registered student for an upcoming term or supplementary semester</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                <span>{isCreateOpen ? 'Collapse' : 'Expand Form'}</span>
                {isCreateOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isCreateOpen && (
              <form onSubmit={createFee} className="p-6 border-t border-slate-200 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Enrollment</label>
                    <select
                      required
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={feeForm.enrollment}
                      onChange={(e) => setFeeForm({ ...feeForm, enrollment: e.target.value })}
                    >
                      <option value="">-- Select Student --</option>
                      {enrollments.map((e: any) => (
                        <option key={e.id} value={e.id}>
                          {e.enrollment_number} ({e.user?.first_name || e.user?.username || 'Student'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={feeForm.semester}
                      onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tuition Fee (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 75000"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scholarship Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Auto from aid"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={feeForm.scholarship_discount || ''}
                      onChange={(e) => setFeeForm({ ...feeForm, scholarship_discount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Due Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={feeForm.due_date}
                      onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!hasWriteAccess}
                    className={`bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
                  >
                    Issue Invoice & Notify Student
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student name, enrollment #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-2" />

              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-slate-100 border-none text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg outline-none cursor-pointer"
              >
                <option value="ALL">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
              </select>
            </div>
          </div>

          {/* Fee Invoices Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f8f9fa] border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Student & Enrollment</th>
                    <th className="px-5 py-3.5">Program & Term</th>
                    <th className="px-5 py-3.5">Base Tuition</th>
                    <th className="px-5 py-3.5">Scholarship</th>
                    <th className="px-5 py-3.5">Net Payable</th>
                    <th className="px-5 py-3.5">Due Date</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-600">No fee records match your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((f: any) => {
                      const tuition = parseFloat(f.amount || 0);
                      const discount = parseFloat(f.scholarship_discount || 0);
                      const net = f.net_amount !== undefined 
                        ? Number(f.net_amount) 
                        : tuition * (1 - discount / 100);

                      const displayEnr = f.enrollment_number || `ENR-${f.enrollment}`;
                      const displayStudent = f.student_name || 'Enrolled Student';
                      const displayProg = f.program_name || f.program_code || 'Degree Program';

                      return (
                        <tr key={f.id} className="hover:bg-slate-50/80 transition group">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{displayStudent}</div>
                            <div className="font-mono text-xs text-indigo-600 font-semibold">{displayEnr}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-xs font-semibold text-slate-800">{displayProg}</div>
                            <div className="text-[11px] text-slate-500 font-medium">Semester {f.semester}</div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-600">
                            ₹{tuition.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5">
                            {discount > 0 ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-200">
                                {discount}% Concession
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                            ₹{Number(net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            <div>{f.due_date}</div>
                            {f.paid_date && (
                              <div className="text-[10px] text-emerald-600 font-medium">Paid: {f.paid_date}</div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                f.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : f.status === 'OVERDUE'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  f.status === 'PAID'
                                    ? 'bg-emerald-500'
                                    : f.status === 'OVERDUE'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {f.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {f.status !== 'PAID' ? (
                                <button
                                  onClick={() => handleMarkAsPaid(f.id)}
                                  disabled={processingPaymentId === f.id}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition flex items-center space-x-1 shadow-sm disabled:opacity-50"
                                  title="Record offline payment received at bursar desk"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{processingPaymentId === f.id ? 'Recording...' : 'Mark Paid'}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedFeeForReceipt(f)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition flex items-center space-x-1"
                                  title="View & Print Official Receipt"
                                >
                                  <Printer className="w-3 h-3 text-slate-500" />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>Showing {filteredFees.length} of {localFees.length} invoices</span>
              <span>Bursar & Accounts Central Registry</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SUB-VIEW 2: SCHOLARSHIPS & FINANCIAL AID REQUESTS         */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeSubTab === 'scholarships' && (
        <div className="space-y-6">
          {/* Scholarship KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{scholarships.length}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Undergraduate & Graduate</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Verification</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingScholarshipsCount}</h3>
                <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Requires Bursar Review</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Awards</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {scholarships.filter((s) => s.status === 'APPROVED').length}
                </h3>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Active Fee Concessions</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Concession Rate</p>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">
                  {scholarships.length > 0
                    ? `${(
                        scholarships.reduce((acc, s) => acc + parseFloat(s.concession_percentage || 0), 0) /
                        scholarships.length
                      ).toFixed(0)}%`
                    : '0%'}
                </h3>
                <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">Tuition Discount</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Scholarship Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search scholar name, roll #, scheme..."
                value={schSearchQuery}
                onChange={(e) => setSchSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              {(['ALL', 'APPLIED', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSchStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    schStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'APPLIED' ? 'Pending Review' : st}
                </button>
              ))}

              <button
                onClick={loadScholarships}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition ml-2"
                title="Refresh scholarship list"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scholarship Applications Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
            {loadingScholarships ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs">Loading scholarship applications...</p>
              </div>
            ) : filteredScholarships.length === 0 ? (
              <div className="p-12 text-center">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Scholarship Requests Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  No applications match the selected status or query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#f8f9fa] border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Student & ID</th>
                      <th className="px-5 py-3.5">Program & Income</th>
                      <th className="px-5 py-3.5">Scholarship Scheme & Grounds</th>
                      <th className="px-5 py-3.5">Requested Concession</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredScholarships.map((sch) => {
                      const discount = parseFloat(sch.concession_percentage || 0);
                      const displayStudent = sch.student_name || 'Student';
                      const displayRoll = sch.enrollment_number || sch.application_number || `APP-${sch.application}`;
                      const displayProg = sch.program_name || sch.program_code || 'Academic Program';

                      return (
                        <tr key={sch.id} className="hover:bg-slate-50/80 transition group">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{displayStudent}</div>
                            <div className="font-mono text-xs text-indigo-600 font-semibold">{displayRoll}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="text-xs font-semibold text-slate-800">{displayProg}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Income: {sch.family_income || 'Verified EWS'}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 max-w-md">
                            <p className="text-xs text-slate-700 font-medium line-clamp-2" title={sch.reason}>
                              {sch.reason || 'Merit concession application'}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-extrabold border border-indigo-200 inline-block font-mono">
                              {discount}% Tuition Waiver
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                sch.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : sch.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  sch.status === 'APPROVED'
                                    ? 'bg-emerald-500'
                                    : sch.status === 'REJECTED'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {sch.status === 'APPLIED' ? 'Pending Review' : sch.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {sch.status !== 'APPROVED' && (
                                <button
                                  onClick={() => {
                                    setSelectedSchForApprove(sch);
                                    setApproveConcession(String(sch.concession_percentage || '25.00'));
                                  }}
                                  disabled={actionLoadingId === sch.id}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm disabled:opacity-50"
                                  title="Approve scholarship and synchronize with fee ledger"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {sch.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleRejectScholarship(sch)}
                                  disabled={actionLoadingId === sch.id}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-slate-200 hover:border-rose-200 disabled:opacity-50"
                                  title="Decline scholarship application"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>Showing {filteredScholarships.length} of {scholarships.length} applications</span>
              <span>Financial Aid & Concession Committee</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL: APPROVE SCHOLARSHIP DIALOG                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedSchForApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Approve Financial Aid / Scholarship</h3>
              </div>
              <button
                onClick={() => setSelectedSchForApprove(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900">
                <p className="font-bold">{selectedSchForApprove.student_name}</p>
                <p className="text-[11px] text-indigo-700 font-mono mt-0.5">
                  {selectedSchForApprove.enrollment_number || selectedSchForApprove.application_number} • {selectedSchForApprove.program_name}
                </p>
                <p className="mt-2 text-slate-600 italic font-sans">
                  "{selectedSchForApprove.reason}"
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirmed Tuition Concession (%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={approveConcession}
                    onChange={(e) => setApproveConcession(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex space-x-1">
                    {['15.00', '25.00', '50.00'].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setApproveConcession(pct)}
                        className={`px-2 py-1 rounded text-xs font-bold transition border ${
                          approveConcession === pct
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {parseFloat(pct)}%
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Approving will automatically re-calculate net payable tuition across all current and future fee bills for this student.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSchForApprove(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveScholarship}
                  disabled={actionLoadingId === selectedSchForApprove.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{actionLoadingId === selectedSchForApprove.id ? 'Applying...' : 'Confirm & Grant Waiver'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedFeeForReceipt && (
        <FeeReceiptModal
          fee={selectedFeeForReceipt}
          user={{ first_name: selectedFeeForReceipt.student_name, username: selectedFeeForReceipt.student_username }}
          enrollment={{ enrollment_number: selectedFeeForReceipt.enrollment_number, program: { name: selectedFeeForReceipt.program_name } }}
          isOpen={!!selectedFeeForReceipt}
          onClose={() => setSelectedFeeForReceipt(null)}
        />
      )}
    </div>
  );
}
