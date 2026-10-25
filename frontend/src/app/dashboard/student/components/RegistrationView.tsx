'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Printer, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Check, 
  Layers, 
  Award,
  Calendar,
  CreditCard,
  Lock
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface CourseOption {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester: number;
  department_code: string;
  department_name: string;
  course_type: string;
  is_core: boolean;
  is_elective: boolean;
  description?: string;
}

interface RegistrationWindowData {
  student_name: string;
  enrollment_number: string;
  program_name: string;
  current_semester: number;
  target_semester: number;
  target_year: number;
  academic_year: string;
  term_name: string;
  is_registered: boolean;
  existing_registration: any;
  eligibility: {
    eligible: boolean;
    attendance_percentage: number;
    attendance_passed: boolean;
    fee_passed: boolean;
    message: string;
  };
  credit_rules: {
    min_credits: number;
    max_credits: number;
    recommended_credits: number;
  };
  available_courses: CourseOption[];
}

interface RegistrationViewProps {
  courses?: any[];
  enrollment?: any;
  user?: any;
  onNavigate?: (tab: string) => void;
}

export default function RegistrationView({ courses = [], enrollment, user, onNavigate }: RegistrationViewProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [windowData, setWindowData] = useState<RegistrationWindowData | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [printSlipModal, setPrintSlipModal] = useState<any | null>(null);

  // Load registration window & past registrations
  const loadData = async () => {
    try {
      setLoading(true);
      const [winRes, regsRes] = await Promise.all([
        fetchAPI('/academics/registrations/registration_window/'),
        fetchAPI('/academics/registrations/my_registrations/')
      ]);
      setWindowData(winRes);
      setMyRegistrations(Array.isArray(regsRes) ? regsRes : []);

      // If available courses loaded, pre-select all CORE courses
      if (winRes?.available_courses) {
        const coreIds = winRes.available_courses
          .filter((c: CourseOption) => c.is_core)
          .map((c: CourseOption) => c.id);
        setSelectedCourseIds(coreIds);
      }
    } catch (err) {
      console.error('Failed to load registration window:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute selected courses list and credit sum
  const selectedCourses = useMemo(() => {
    if (!windowData?.available_courses) return [];
    return windowData.available_courses.filter((c) => selectedCourseIds.includes(c.id));
  }, [windowData, selectedCourseIds]);

  const totalSelectedCredits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [selectedCourses]);

  const minCredits = windowData?.credit_rules?.min_credits || 12;
  const maxCredits = windowData?.credit_rules?.max_credits || 24;
  const isCreditValid = totalSelectedCredits >= minCredits && totalSelectedCredits <= maxCredits;

  // Toggle elective course
  const toggleCourse = (course: CourseOption) => {
    if (course.is_core) {
      // Core courses cannot be deselected
      return;
    }
    if (selectedCourseIds.includes(course.id)) {
      setSelectedCourseIds(prev => prev.filter(id => id !== course.id));
    } else {
      if (totalSelectedCredits + course.credits > maxCredits) {
        setErrorMsg(`Adding this course exceeds maximum credit limit of ${maxCredits} credits.`);
        return;
      }
      setErrorMsg(null);
      setSelectedCourseIds(prev => [...prev, course.id]);
    }
  };

  // Submit Registration
  const handleSubmitRegistration = async () => {
    if (!isCreditValid) {
      setErrorMsg(`Total credits must be between ${minCredits} and ${maxCredits}. Currently: ${totalSelectedCredits}`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await fetchAPI('/academics/registrations/register_semester/', {
        method: 'POST',
        body: JSON.stringify({
          target_semester: windowData?.target_semester || 2,
          course_ids: selectedCourseIds
        })
      });

      setSuccessResult(res);
      // Refresh my registrations
      const updatedRegs = await fetchAPI('/academics/registrations/my_registrations/');
      setMyRegistrations(Array.isArray(updatedRegs) ? updatedRegs : []);
      // Refresh window status
      const updatedWin = await fetchAPI('/academics/registrations/registration_window/');
      setWindowData(updatedWin);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to complete registration. Please verify eligibility.');
    } finally {
      setSubmitting(false);
    }
  };

  const studentName = windowData?.student_name || user?.first_name 
    ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() 
    : 'Brianna Carter';
  const enrollmentNumber = windowData?.enrollment_number || enrollment?.enrollment_number || 'ENR-BTECH-CSE-9757';
  const programName = windowData?.program_name || enrollment?.program_name || 'B.Tech Computer Science & Engineering';

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-700">Loading Academic Registration Gateway...</p>
        <p className="text-xs text-slate-400 mt-1">Verifying statutory attendance eligibility and curriculum matrix.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Subject Selection & Registration Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Curriculum Registration • {programName}
            </h1>
            <p className="text-slate-500 text-sm font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Student: <b className="text-slate-800">{studentName}</b></span>
              <span>•</span>
              <span>Roll No: <b className="font-mono text-indigo-700">{enrollmentNumber}</b></span>
              <span>•</span>
              <span>Current Status: <b className="text-blue-700">1st Year (Semester {windowData?.current_semester || 1})</b></span>
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'register' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Register Next Term</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'history' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Registered Terms ({myRegistrations.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: REGISTER FOR NEXT SEMESTER */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          
          {/* Eligibility Card */}
          <div className={`p-5 rounded-2xl border transition-all ${
            windowData?.eligibility?.eligible 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl text-lg ${
                  windowData?.eligibility?.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {windowData?.eligibility?.eligible ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {windowData?.eligibility?.eligible 
                      ? `Eligible for Semester ${windowData.target_semester} Course Registration`
                      : 'Registration Hold: Statutory Compliance Required'}
                  </h3>
                  <p className="text-xs opacity-90 font-medium mt-0.5">
                    {windowData?.eligibility?.message}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span className="text-slate-500">Attendance:</span>
                  <span className={windowData?.eligibility?.attendance_passed ? 'text-emerald-700' : 'text-rose-700'}>
                    {windowData?.eligibility?.attendance_percentage}% (Min 75%)
                  </span>
                </div>
                <div className="bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span className="text-slate-500">Term 1 Fees:</span>
                  <span className={windowData?.eligibility?.fee_passed ? 'text-emerald-700' : 'text-rose-700'}>
                    {windowData?.eligibility?.fee_passed ? 'Cleared' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Already Registered Notification Banner */}
          {windowData?.is_registered && (
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-blue-950">
                    Semester {windowData.target_semester} Registration Active & Approved!
                  </h4>
                  <p className="text-xs text-blue-800 font-medium mt-0.5">
                    You have enrolled in {windowData.existing_registration?.courses_details?.length || 5} courses ({windowData.existing_registration?.total_credits || 18} Credits).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintSlipModal(windowData.existing_registration)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Registration Slip</span>
              </button>
            </div>
          )}

          {/* Registration Form / Subject Selection Matrix */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Header & Credit Budget Tracker */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Semester {windowData?.target_semester || 2} Curriculum Matrix & Elective Options
                  </h3>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                    Autumn 2026-27
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Core courses are mandatory for departmental progression. Choose electives to satisfy degree credit requirements.
                </p>
              </div>

              {/* Credit Tracker Gauge */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl min-w-[260px] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Credit Load:</span>
                  <span className={isCreditValid ? 'text-emerald-700' : 'text-amber-600'}>
                    {totalSelectedCredits} / {maxCredits} Credits
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalSelectedCredits < minCredits
                        ? 'bg-amber-500'
                        : totalSelectedCredits <= maxCredits
                          ? 'bg-emerald-600'
                          : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, (totalSelectedCredits / maxCredits) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Min: {minCredits} Cr</span>
                  <span>Optimal: 15-20 Cr</span>
                  <span>Max: {maxCredits} Cr</span>
                </div>
              </div>
            </div>

            {/* SECTION 1: Core Compulsory Courses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    Compulsory Department Core Courses (Required)
                  </h4>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {windowData?.available_courses?.filter(c => c.is_core).length || 0} Core Courses
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {windowData?.available_courses?.filter(c => c.is_core).map(course => (
                  <div 
                    key={course.id}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                          Core Compulsory
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 truncate">
                        {course.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {course.department_name} • Academic Year 2026-27
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-sm font-black text-blue-700">
                        {course.credits} Credits
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded mt-1">
                        <Check className="w-3 h-3" /> Mandatory
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: Elective Subject Options */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    Department & Open Electives (Choose 1 or 2 to meet credit load)
                  </h4>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Select your subjects below
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {windowData?.available_courses?.filter(c => c.is_elective).map(course => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  return (
                    <div 
                      key={course.id}
                      onClick={() => toggleCourse(course)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected 
                          ? 'bg-indigo-50/70 border-indigo-400 shadow-sm ring-1 ring-indigo-400' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {course.code}
                          </span>
                          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            {course.course_type === 'OPEN_ELECTIVE' ? 'Open Elective' : 'Dept Elective'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {course.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {course.department_name}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-sm font-black text-slate-800">
                          {course.credits} Credits
                        </span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                          isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-between">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            )}

            {/* Success Message Banner */}
            {successResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>✓ {successResult.detail || 'Course registration successfully approved and recorded.'}</span>
                <button
                  type="button"
                  onClick={() => setPrintSlipModal(successResult.registration)}
                  className="underline hover:text-emerald-950 font-black ml-2"
                >
                  Print Slip
                </button>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">
                  Total Selection: <span className="text-blue-600 font-black">{selectedCourses.length} Courses</span> ({totalSelectedCredits} Credits)
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Statutory credit limits: Minimum {minCredits} Cr • Maximum {maxCredits} Cr.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={submitting || !isCreditValid || !windowData?.eligibility?.eligible}
                  onClick={handleSubmitRegistration}
                  className={`px-6 py-3 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 ${
                    submitting || !isCreditValid || !windowData?.eligibility?.eligible
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Processing Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit & Register for Semester {windowData?.target_semester || 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED TERMS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {myRegistrations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Term Registrations Found</h3>
              <p className="text-xs text-slate-400 mt-1">Registrations for each semester will appear here once finalized.</p>
            </div>
          ) : (
            myRegistrations.map((reg: any) => {
              const semCourses = reg.courses_details || [];
              const credits = reg.total_credits || semCourses.reduce((sum: number, c: any) => sum + (c.credits || 3), 0);
              return (
                <div key={reg.id} className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
                  {/* Term Header */}
                  <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded">
                          Semester {reg.semester}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          Academic Year {reg.academic_year || '2026-27'}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          {reg.status || 'Approved'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Registered on {reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : 'Term Induction'} • {semCourses.length} Courses • {credits} Total Credits
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPrintSlipModal(reg)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Registration Slip</span>
                    </button>
                  </div>

                  {/* Course Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8f9fa] text-xs uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5 font-bold w-12 text-center">#</th>
                          <th className="px-6 py-3.5 font-bold">Course Code & Name</th>
                          <th className="px-6 py-3.5 font-bold">Department</th>
                          <th className="px-6 py-3.5 font-bold text-center">Credits</th>
                          <th className="px-6 py-3.5 font-bold text-center">Course Type</th>
                          <th className="px-6 py-3.5 font-bold text-right">Enrollment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {semCourses.map((c: any, idx: number) => (
                          <tr key={c.id || c.code} className="hover:bg-slate-50/70 transition">
                            <td className="px-6 py-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                            <td className="px-6 py-3">
                              <span className="font-black text-slate-800">{c.code}</span>
                              <span className="text-xs text-slate-500 block">{c.name}</span>
                            </td>
                            <td className="px-6 py-3 text-xs font-semibold text-slate-600">
                              {c.department_name || c.department_code || 'Engineering'}
                            </td>
                            <td className="px-6 py-3 text-center font-bold text-slate-800">
                              {c.credits || 3}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                c.course_type === 'ELECTIVE' || c.course_type === 'OPEN_ELECTIVE'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {c.course_type || 'CORE'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PRINTABLE OFFICIAL REGISTRATION SLIP MODAL */}
      {printSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Actions Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official University Course Registration Slip
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setPrintSlipModal(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6">
              
              {/* Institutional Header */}
              <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
                <div className="text-xl font-black uppercase tracking-wider text-slate-900">
                  Veritas Grove University
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Office of the Academic Registrar • Course Enrollment Slip
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Academic Year 2026-2027 • Regular Session
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Enrollment ID</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{enrollmentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Degree Program</span>
                  <span className="font-bold text-slate-900">{programName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Registered Semester</span>
                  <span className="font-bold text-blue-700">Semester {printSlipModal.semester}</span>
                </div>
              </div>

              {/* Course Roster Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-2.5 text-center w-10">#</th>
                      <th className="p-2.5 text-left">Code</th>
                      <th className="p-2.5 text-left">Course Name</th>
                      <th className="p-2.5 text-center">Credits</th>
                      <th className="p-2.5 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(printSlipModal.courses_details || []).map((c: any, i: number) => (
                      <tr key={c.id || i}>
                        <td className="p-2.5 text-center text-slate-400">{i + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{c.code}</td>
                        <td className="p-2.5 text-slate-800 font-medium">{c.name}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{c.credits || 3}</td>
                        <td className="p-2.5 text-center font-semibold text-slate-600">{c.course_type || 'CORE'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Seal & Verification Footer */}
              <div className="pt-4 flex justify-between items-end border-t border-slate-100 text-[11px] text-slate-500">
                <div>
                  <p>Document Ref: <span className="font-mono font-bold text-slate-800">REG-2026-SEM{printSlipModal.semester}-{printSlipModal.id}</span></p>
                  <p>Status: <span className="text-emerald-700 font-bold">Official • Institutional Verified</span></p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-8 border-b border-dashed border-slate-400 mx-auto"></div>
                  <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Registrar Academic Seal</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
