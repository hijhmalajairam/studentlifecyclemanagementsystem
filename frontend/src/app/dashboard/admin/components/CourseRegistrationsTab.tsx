'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Printer, 
  User, 
  Building, 
  ShieldCheck, 
  Award, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface CourseRegistrationsTabProps {
  isAdmin?: boolean;
}

export default function CourseRegistrationsTab({ isAdmin = true }: CourseRegistrationsTabProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'APPROVED' | 'PENDING_APPROVAL'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/academics/registrations/');
      const list = Array.isArray(data) ? data : (data?.results || []);
      setRegistrations(list);
    } catch (err) {
      console.error('Failed to load registrations', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalRegs = registrations.length;
    let totalCredits = 0;
    const uniquePrograms = new Set<string>();

    registrations.forEach(r => {
      totalCredits += Number(r.total_credits || 0);
      if (r.program_name) uniquePrograms.add(r.program_name);
    });

    const avgCredits = totalRegs > 0 ? (totalCredits / totalRegs).toFixed(1) : '0';

    return {
      totalRegs,
      totalCredits,
      uniqueProgramsCount: uniquePrograms.size,
      avgCredits,
    };
  }, [registrations]);

  // Filtered List
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
      if (selectedSemester !== 'ALL' && String(r.semester) !== selectedSemester) return false;
      if (selectedProgram !== 'ALL' && r.program_name !== selectedProgram) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sName = (r.student_name || '').toLowerCase();
        const enrNo = (r.enrollment_number || '').toLowerCase();
        const prog = (r.program_name || '').toLowerCase();
        const courses = (r.courses_details || []).map((c: any) => `${c.code} ${c.title}`).join(' ').toLowerCase();

        if (!sName.includes(query) && !enrNo.includes(query) && !prog.includes(query) && !courses.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, selectedStatus, selectedSemester, selectedProgram, searchQuery]);

  // Extract unique programs for dropdown
  const programOptions = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach(r => {
      if (r.program_name) set.add(r.program_name);
    });
    return Array.from(set).sort();
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* ─── ACADEMIC GOVERNANCE & FACULTY INCHARGE HERO ─── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Office of Academic Affairs & Course Governance</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-indigo-400" />
              <span>Student Course Registrations Registry</span>
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Central university audit desk for course enrollments, elective selections, credit loads, and departmental curriculum compliance.
            </p>
          </div>

          {/* Institutional Incharge Profile Chip */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 flex items-center space-x-4 max-w-sm shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
              JV
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Faculty Incharge & Head</div>
              <div className="text-sm font-extrabold text-white">Prof. Jennifer Vargas</div>
              <div className="text-xs text-indigo-200 font-medium">Dean of Academic Affairs</div>
              <div className="text-[10px] text-indigo-300/80 font-mono mt-0.5">Academic Block A, Suite 402 • Ext. 1021</div>
            </div>
          </div>
        </div>

        {/* Department HODs Incharge Row */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mr-2">Department Chairs & Approvers:</span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            CSE: Prof. Jennifer Vargas
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            ECE: Prof. Valerie Robinson
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            Civil: Prof. Laura Ellis
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            Mech: Prof. Robert Miller
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            MBA: Prof. Nathan Branch
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            Law: Prof. Garrett Maxwell
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-200 text-[11px] font-semibold">
            Pharm: Prof. Tyler Friedman
          </span>
        </div>
      </div>

      {/* ─── KPI METRICS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.totalRegs}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Enrolled semester slots</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Credits Enrolled</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{metrics.totalCredits}</h3>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Earnable credit load</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Degree Cohorts</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{metrics.uniqueProgramsCount} Programs</h3>
            <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">Engineering, Law, MBA, Pharm</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Credit Load</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.avgCredits} Cr</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Within 12 - 24 range</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── SEARCH & FILTER TOOLBAR ─── */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student, enrollment #, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="bg-slate-100 border-none text-xs font-bold text-slate-700 py-2 px-3 rounded-lg outline-none cursor-pointer"
          >
            <option value="ALL">All Academic Programs</option>
            {programOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-slate-100 border-none text-xs font-bold text-slate-700 py-2 px-3 rounded-lg outline-none cursor-pointer"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-100 border-none text-xs font-bold text-slate-700 py-2 px-3 rounded-lg outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>

          <button
            onClick={loadRegistrations}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Registration Ledger"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── COURSE REGISTRATIONS TABLE ─── */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold uppercase tracking-wider">Auditing Course Registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No Course Registrations Match Filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Try resetting the semester or program filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student & Roll #</th>
                  <th className="px-5 py-3.5">Program & Term</th>
                  <th className="px-5 py-3.5">Academic Year</th>
                  <th className="px-5 py-3.5">Total Credits</th>
                  <th className="px-5 py-3.5">Registered Subjects</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => {
                  const isExpanded = expandedId === reg.id;
                  const courses = reg.courses_details || [];

                  return (
                    <React.Fragment key={reg.id}>
                      <tr className="hover:bg-slate-50/80 transition group">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{reg.student_name || 'Student'}</div>
                          <div className="font-mono text-xs text-indigo-600 font-semibold">{reg.enrollment_number}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="text-xs font-semibold text-slate-800">{reg.program_name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">Semester {reg.semester}</div>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {reg.academic_year || '2026-27'}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-sm text-slate-900">{reg.total_credits}</span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Credits</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {courses.length} Courses
                          </span>
                        </td>

                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {courses.slice(0, 3).map((c: any) => (
                              <span
                                key={c.id}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-bold"
                                title={`${c.title} (${c.credits} Cr)`}
                              >
                                {c.code}
                              </span>
                            ))}
                            {courses.length > 3 && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                                className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold hover:bg-indigo-100"
                              >
                                +{courses.length - 3} more
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              reg.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                reg.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {reg.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition flex items-center space-x-1"
                              title="Audit enrolled courses"
                            >
                              <span>{isExpanded ? 'Hide' : 'Audit'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            <button
                              onClick={() => setSelectedSlip(reg)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                              title="View & Print Official Registration Slip"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Slip</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Course Breakdown Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={7} className="px-8 py-5">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <div className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                                  <BookOpen className="w-4 h-4 text-indigo-600" />
                                  <span>Enrolled Curriculum Schedule for Semester {reg.semester}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-indigo-600">
                                  Total {reg.total_credits} Statutory Credits
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {courses.map((c: any) => (
                                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center space-x-1.5">
                                        <span className="font-mono text-xs font-black text-indigo-700">{c.code}</span>
                                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded text-[9px] font-bold">
                                          {c.course_type || 'CORE'}
                                        </span>
                                      </div>
                                      <div className="text-xs font-bold text-slate-800 mt-0.5">{c.title}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">Department: {c.department_name || reg.program_name}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-extrabold text-xs text-slate-900 font-mono">{c.credits}</span>
                                      <span className="text-[10px] text-slate-400 block uppercase">Credits</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Showing {filteredRegistrations.length} of {registrations.length} student registrations</span>
          <span>Dean of Academic Affairs Registry</span>
        </div>
      </div>

      {/* ─── PRINTABLE REGISTRATION SLIP MODAL ─── */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden print:m-0 print:border-none print:shadow-none">
            {/* Modal Controls */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center print:hidden">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-500">OFFICIAL REGISTRATION SLIP</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slip Paper */}
            <div className="p-8 space-y-6">
              {/* Slip Header */}
              <div className="text-center border-b border-slate-200 pb-5">
                <div className="inline-block p-2 bg-indigo-50 rounded-xl mb-2 text-indigo-700">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">VERITAS GROVE UNIVERSITY</h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Office of the Academic Registrar</p>
                <h3 className="text-sm font-extrabold text-indigo-700 uppercase tracking-wider mt-2">
                  Official Course Registration Slip • Semester {selectedSlip.semester}
                </h3>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Student Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedSlip.student_name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Enrollment Number</span>
                  <span className="font-mono font-extrabold text-indigo-600 text-sm">{selectedSlip.enrollment_number}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Degree Program</span>
                  <span className="font-bold text-slate-800">{selectedSlip.program_name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Academic Term</span>
                  <span className="font-bold text-slate-800">Semester {selectedSlip.semester} • AY {selectedSlip.academic_year || '2026-27'}</span>
                </div>
              </div>

              {/* Course Ledger */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registered Courses & Credits</h4>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Course Title</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedSlip.courses_details || []).map((c: any) => (
                      <tr key={c.id}>
                        <td className="p-2.5 font-mono font-bold text-indigo-600">{c.code}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{c.title}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">
                            {c.course_type || 'CORE'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">{c.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right text-slate-600">Total Registered Credits:</td>
                      <td className="p-2.5 text-right text-indigo-700 font-mono text-sm">{selectedSlip.total_credits}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Endorsement Footnote */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                <div>
                  <div className="font-mono text-[10px] text-slate-400">STATUS: APPROVED & CLEARED</div>
                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">REF: VG-REG-2026-{selectedSlip.id}</div>
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-300 mb-1"></div>
                  <div className="font-bold text-slate-700">Dean of Academic Affairs</div>
                  <div className="text-[10px] text-slate-400">Veritas Grove University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
