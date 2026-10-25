'use client';
import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowRight, 
  RefreshCw, 
  AlertOctagon, 
  Users, 
  ShieldCheck,
  CreditCard,
  Clock
} from 'lucide-react';

interface ProgressionTabProps {
  isAdmin?: boolean;
  hasWriteAccess?: boolean;
}

interface AuditRecord {
  enrollment_id: number;
  enrollment_number: string;
  student_name: string;
  program_id: number;
  program_name: string;
  program_code: string;
  current_year: number;
  current_semester: number;
  target_semester: number;
  target_year: number;
  attendance_percentage: number;
  attendance_passed: boolean;
  fee_passed: boolean;
  eligible: boolean;
}

export default function ProgressionTab({ isAdmin = true, hasWriteAccess = true }: ProgressionTabProps) {
  const [auditData, setAuditData] = useState<AuditRecord[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideChecks, setOverrideChecks] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      let url = '/academics/enrollment/progression_audit/?';
      if (selectedProgram) url += `program_id=${selectedProgram}&`;
      if (selectedSemester) url += `semester=${selectedSemester}&`;
      
      const [auditRes, progsRes] = await Promise.all([
        fetchAPI(url),
        programs.length === 0 ? fetchAPI('/academics/programs/') : Promise.resolve(programs)
      ]);

      setAuditData(Array.isArray(auditRes) ? auditRes : []);
      if (programs.length === 0) {
        setPrograms(Array.isArray(progsRes) ? progsRes : (progsRes?.results || []));
      }
    } catch (err: any) {
      console.error('Failed to load progression audit:', err);
      setErrorMessage(err.message || 'Failed to load student progression data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [selectedProgram, selectedSemester]);

  const handlePromoteSingle = async (enrollmentId: number, studentName: string, targetSem: number) => {
    if (!hasWriteAccess) {
      alert('Read-only mode: Cannot promote students.');
      return;
    }

    if (!confirm(`Confirm academic promotion for ${studentName} to Semester ${targetSem}?`)) {
      return;
    }

    try {
      setActionLoading(enrollmentId);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetchAPI(`/academics/enrollment/${enrollmentId}/progress_semester/`, {
        method: 'POST',
        body: JSON.stringify({ override_checks: overrideChecks }),
      });

      setSuccessMessage(res.detail || `Successfully promoted ${studentName}!`);
      await fetchAuditData();
    } catch (err: any) {
      console.error('Promotion error:', err);
      setErrorMessage(err.detail || err.message || 'Failed to promote student.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRollover = async () => {
    if (!hasWriteAccess) {
      alert('Read-only mode: Cannot execute bulk rollover.');
      return;
    }

    const eligibleCount = auditData.filter(s => overrideChecks || s.eligible).length;
    const confirmPrompt = overrideChecks
      ? `WARNING: Dean Override is ENABLED. You are about to FORCE-PROMOTE all ${eligibleCount} students, ignoring attendance and fee criteria. Proceed?`
      : `Promote all ${eligibleCount} eligible students to their next academic semester?`;

    if (!confirm(confirmPrompt)) return;

    try {
      setBulkLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const body: any = { override_checks: overrideChecks };
      if (selectedProgram) body.program_id = selectedProgram;
      if (selectedSemester) body.current_semester = selectedSemester;

      const res = await fetchAPI('/academics/enrollment/bulk_rollover/', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setSuccessMessage(res.detail || 'Bulk rollover completed successfully.');
      await fetchAuditData();
    } catch (err: any) {
      console.error('Bulk rollover error:', err);
      setErrorMessage(err.detail || err.message || 'Failed to complete bulk rollover.');
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredStudents = auditData.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.student_name.toLowerCase().includes(q) ||
      s.enrollment_number.toLowerCase().includes(q) ||
      s.program_code.toLowerCase().includes(q)
    );
  });

  const totalCount = auditData.length;
  const eligibleCount = auditData.filter(s => s.eligible).length;
  const attDeficitCount = auditData.filter(s => !s.attendance_passed).length;
  const feeDeficitCount = auditData.filter(s => !s.fee_passed).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-400/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Academic Lifecycle Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Academic Term Progression & Rollover</h1>
            <p className="text-blue-200/80 text-sm mt-1 max-w-2xl">
              Audit statutory 75% attendance and fee clearance to promote students to the next semester, issue new curriculum registrations, and generate term fee invoices automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAuditData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Audit</span>
            </button>

            <button
              onClick={handleBulkRollover}
              disabled={bulkLoading || (!overrideChecks && eligibleCount === 0)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/30"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{bulkLoading ? 'Processing Rollover...' : `Run Batch Rollover (${overrideChecks ? totalCount : eligibleCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total In Scope</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">{totalCount}</div>
          <p className="text-xs text-slate-400 mt-1">Active student enrollments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Eligible For Promotion</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3">{eligibleCount}</div>
          <p className="text-xs text-slate-400 mt-1">Passed attendance & dues criteria</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Deficit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-3">{attDeficitCount}</div>
          <p className="text-xs text-slate-400 mt-1">Below statutory 75% minimum</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unpaid Term Fees</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-3">{feeDeficitCount}</div>
          <p className="text-xs text-slate-400 mt-1">Outstanding term fee balance</p>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Program Filter */}
            <div className="min-w-[180px]">
              <select
                value={selectedProgram}
                onChange={e => setSelectedProgram(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Academic Programs</option>
                {programs.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="min-w-[140px]">
              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student name, enrollment #..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dean Override Toggle */}
          <div className="flex items-center space-x-2 pl-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0">
            <input
              type="checkbox"
              id="deanOverride"
              checked={overrideChecks}
              onChange={e => setOverrideChecks(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="deanOverride" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Dean / Council Override</span>
            </label>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auditing Academic Standing...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active students match this filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the semester or program filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Student & ID</th>
                  <th className="px-6 py-3.5">Program</th>
                  <th className="px-6 py-3.5">Current Standing</th>
                  <th className="px-6 py-3.5">Next Promotion</th>
                  <th className="px-6 py-3.5">Attendance Compliance</th>
                  <th className="px-6 py-3.5">Term Fee Status</th>
                  <th className="px-6 py-3.5">Eligibility</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map(student => {
                  const isEligible = student.eligible || overrideChecks;
                  const isGraduating = student.current_semester === 8;

                  return (
                    <tr key={student.enrollment_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{student.student_name}</div>
                        <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-medium">{student.enrollment_number}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{student.program_code}</span>
                        <div className="text-[10px] text-slate-400">{student.program_name}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Year {student.current_year} • Sem {student.current_semester}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                          <span>{isGraduating ? 'Graduation' : `Sem ${student.target_semester}`}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-slate-400 font-normal">{isGraduating ? 'Degree Awarded' : `Year ${student.target_year}`}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${student.attendance_passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {student.attendance_percentage}%
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.attendance_passed 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {student.attendance_passed ? '≥ 75% OK' : 'Shortage'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.fee_passed
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {student.fee_passed ? 'Cleared' : 'Unpaid Dues'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isEligible ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>{overrideChecks && !student.eligible ? 'Override Eligible' : 'Eligible'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            <span>Hold / Deficit</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handlePromoteSingle(student.enrollment_id, student.student_name, student.target_semester)}
                          disabled={!isEligible || actionLoading === student.enrollment_id}
                          className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          {actionLoading === student.enrollment_id ? 'Promoting...' : isGraduating ? 'Graduate' : 'Promote'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
