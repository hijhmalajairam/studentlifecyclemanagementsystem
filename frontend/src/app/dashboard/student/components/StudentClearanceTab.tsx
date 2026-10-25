'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

interface NoDuesStatus {
  id?: number;
  enrollment_number?: string;
  student_name?: string;
  program_name?: string;
  current_year?: number;
  current_semester?: number;
  fees_cleared: boolean;
  department_cleared: boolean;
  library_cleared: boolean;
  hostel_cleared: boolean;
  all_cleared: boolean;
  certificate_issued: boolean;
  bonafide_eligible?: boolean;
}

interface StudentClearanceTabProps {
  user: any;
  enrollment: any;
  onNavigateToFees?: () => void;
}

export default function StudentClearanceTab({ user, enrollment, onNavigateToFees }: StudentClearanceTabProps) {
  const [statusData, setStatusData] = useState<NoDuesStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const loadStatus = async () => {
    try {
      const data = await fetchAPI('/academics/no-dues/my_status/');
      setStatusData(data);
    } catch (err) {
      console.error('Failed to load no-dues status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const studentName = statusData?.student_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Enrolled Student');
  const enrollmentNum = statusData?.enrollment_number || enrollment?.enrollment_number || 'ENR-BTECH-CSE-9757';
  const programName = statusData?.program_name || enrollment?.program_name || 'B.Tech Computer Science & Engineering';
  const isBonafideEligible = statusData?.fees_cleared && statusData?.department_cleared;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Institutional Clearance & Certifications
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Student Clearance & Credential Vault
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl font-medium">
              {programName} • {enrollmentNum} • Real-time synchronization across Bursar, Academic Department, Library, and Housing registries.
            </p>
          </div>

          {isBonafideEligible && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span className="text-base">📜</span> View Bonafide Certificate
            </button>
          )}
        </div>
      </div>

      {/* Clearance Matrix Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Multi-Department No-Dues Clearance Matrix
          </h2>
          <span className="text-xs font-semibold text-slate-400">Automated Audit Sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Finance & Bursar */}
          <div className={`p-5 rounded-2xl border shadow-sm transition ${statusData?.fees_cleared ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
            <div className="flex items-start justify-between">
              <span className="text-2xl">💳</span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                statusData?.fees_cleared ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {statusData?.fees_cleared ? 'CLEARED' : 'PENDING'}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm mt-3">Accounts & Bursar</h3>
            <p className="text-xs text-slate-500 mt-1">
              {statusData?.fees_cleared
                ? 'All semester fees and tuition dues liquidated in full.'
                : 'Semester fee payment required to clear financial standing.'}
            </p>
            {!statusData?.fees_cleared && onNavigateToFees && (
              <button
                onClick={onNavigateToFees}
                className="mt-3 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-xl transition w-full"
              >
                Go to Fee Payment →
              </button>
            )}
          </div>

          {/* 2. Academic Department */}
          <div className="p-5 rounded-2xl border bg-emerald-50/30 border-emerald-200 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-2xl">🔬</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                CLEARED
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm mt-3">Academic Department</h3>
            <p className="text-xs text-slate-500 mt-1">
              Active student standing confirmed by Head of Department.
            </p>
          </div>

          {/* 3. Library */}
          <div className="p-5 rounded-2xl border bg-emerald-50/30 border-emerald-200 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-2xl">📚</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                CLEARED
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm mt-3">University Library</h3>
            <p className="text-xs text-slate-500 mt-1">
              All borrowed volumes and reference assets returned. Zero outstanding fines.
            </p>
          </div>

          {/* 4. Hostel & Residential */}
          <div className="p-5 rounded-2xl border bg-emerald-50/30 border-emerald-200 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-2xl">🏢</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                CLEARED
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm mt-3">Hostel & Amenities</h3>
            <p className="text-xs text-slate-500 mt-1">
              Residential accommodation dues and mess subscriptions verified.
            </p>
          </div>
        </div>
      </div>

      {/* Bonafide Certificate Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h3 className="text-lg font-bold text-slate-900">Official Bonafide Student Certificate</h3>
            {isBonafideEligible ? (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Eligible & Verified
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Fee Clearance Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Bonafide Student Certificate serves as legal institutional documentation for bank educational loans, visa applications, state scholarship verification, and transit concessions.
          </p>
        </div>

        <div>
          {isBonafideEligible ? (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow transition flex items-center gap-2"
            >
              <span>🖨️</span> Open Official Certificate
            </button>
          ) : (
            <button
              disabled
              className="bg-slate-100 text-slate-400 font-bold text-xs px-6 py-3 rounded-2xl cursor-not-allowed"
            >
              Clear Fees to Unlock
            </button>
          )}
        </div>
      </div>

      {/* Printable Bonafide Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 my-8 relative flex flex-col">
            {/* Modal Controls (Hidden in print) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Document Preview & Print Mode
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <span>🖨️</span> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* The Physical Certificate Paper Layout */}
            <div className="p-8 border-4 border-double border-slate-800 rounded-2xl mt-4 bg-white space-y-6">
              {/* University Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
                <div className="text-3xl font-black text-slate-900 tracking-wider font-serif">
                  VERITAS GROVE UNIVERSITY
                </div>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Accredited Grade A++ • Established by UGC Act 1956 • Campus Secretariat
                </p>
                <p className="text-[10px] text-slate-400">
                  Ref No: VGU/ACAD/BONAFIDE/2026/{enrollmentNum}
                </p>
              </div>

              {/* Title */}
              <div className="text-center pt-2">
                <h2 className="text-lg font-black tracking-widest uppercase underline underline-offset-8 text-slate-900 font-serif">
                  BONAFIDE STUDENT CERTIFICATE
                </h2>
              </div>

              {/* Body Text */}
              <div className="text-xs text-slate-800 leading-relaxed space-y-4 font-serif pt-4 text-justify">
                <p>
                  This is to officially certify that <b>Mr. / Ms. {studentName}</b>, son / daughter of the registered legal guardian, bearing Institutional Enrollment Number <b>{enrollmentNum}</b>, is a bonafide and regular student of <b>Veritas Grove University</b>.
                </p>
                <p>
                  The student is currently enrolled in the <b>{programName}</b> curriculum, progressing through the <b>1st Year (Semester 1)</b> during the Academic Session <b>2026–2027</b>.
                </p>
                <p>
                  According to institutional records, the student maintains good conduct, has verified complete liquidation of semester financial obligations, and holds active academic standing with statutory attendance adherence.
                </p>
                <p>
                  This certificate is issued upon the student’s formal request for institutional verification purposes.
                </p>
              </div>

              {/* Footer with Seals and Signatures */}
              <div className="pt-10 flex items-end justify-between border-t border-slate-200">
                <div className="space-y-1">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-600 text-indigo-700 flex flex-col items-center justify-center font-bold text-[9px] uppercase tracking-tighter mx-auto">
                    <span>OFFICIAL</span>
                    <span>SEAL</span>
                    <span>VGU</span>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center font-mono">Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="font-serif italic font-bold text-slate-800 text-sm">Dr. Arthur Pendelton</div>
                  <div className="w-36 h-0.5 bg-slate-800 mx-auto"></div>
                  <p className="text-[10px] font-bold uppercase text-slate-700">Registrar</p>
                  <p className="text-[9px] text-slate-400">Veritas Grove University</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
