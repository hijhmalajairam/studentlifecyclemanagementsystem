'use client';

import React, { useMemo, useState } from "react";
import { 
  Shield, 
  BarChart2, 
  Zap, 
  Calculator, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  GraduationCap, 
  Award, 
  FileText, 
  Calendar, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  Percent,
  Check
} from "lucide-react";

type UpcomingCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: number; // 0 - 10 scale
};

interface StudentOverviewTabProps {
  attendance?: any[];
  results?: any;
  enrollment?: any;
  courses?: any[];
  user?: any;
  studentProfile?: any;
  onNavigate?: (tab: string) => void;
}

export default function StudentOverviewTab({ 
  attendance = [], 
  results, 
  enrollment, 
  courses = [], 
  user,
  studentProfile,
  onNavigate 
}: StudentOverviewTabProps) {

  // Student Identity metadata
  const studentName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : (studentProfile?.user?.first_name 
        ? `${studentProfile.user.first_name} ${studentProfile.user.last_name || ''}`.trim()
        : 'Brianna Carter');
        
  const enrollmentNumber = enrollment?.enrollment_number || 'ENR-BTECH-CSE-9757';
  const programName = enrollment?.program_name || 'B.Tech Computer Science & Engineering';
  const currentYear = enrollment?.current_year || 1;
  const currentSemester = enrollment?.current_semester || 1;
  const section = 'Section A';
  const academicYear = '2026-27';

  // Aggregate real attendance
  const attendanceList = Array.isArray(attendance) ? attendance : ((attendance as any)?.results || []);
  
  const realTotal = useMemo(() => {
    if (!attendanceList || attendanceList.length === 0) return 102;
    const sum = attendanceList.reduce((acc: number, c: any) => {
      if (c.total !== undefined) return acc + Number(c.total);
      return acc + 1;
    }, 0);
    return sum > 0 ? sum : 102;
  }, [attendanceList]);

  const realAttended = useMemo(() => {
    if (!attendanceList || attendanceList.length === 0) return 94;
    const sum = attendanceList.reduce((acc: number, c: any) => {
      if (c.present !== undefined) return acc + Number(c.present);
      if (c.status === 'PRESENT' || c.status === 'EXCUSED') return acc + 1;
      return acc;
    }, 0);
    return sum > 0 ? sum : 94;
  }, [attendanceList]);

  // Actual Attendance %
  const actualAttendancePercent = useMemo(() => {
    if (realTotal === 0) return 100;
    return Math.min(100, Math.max(0, (realAttended / realTotal) * 100));
  }, [realAttended, realTotal]);

  // Bunk Budget Interactive Simulation (+Classes to Attend, +Classes to Miss)
  const [simExtraAttend, setSimExtraAttend] = useState<number>(0);
  const [simExtraMiss, setSimExtraMiss] = useState<number>(0);

  const simulatedTotal = realTotal + simExtraAttend + simExtraMiss;
  const simulatedAttended = realAttended + simExtraAttend;
  
  const simulatedPercent = useMemo(() => {
    if (simulatedTotal === 0) return 100;
    return Math.min(100, Math.max(0, (simulatedAttended / simulatedTotal) * 100));
  }, [simulatedAttended, simulatedTotal]);

  // Allowed misses from current position to stay >= 75%
  // Formula: floor(attended / 0.75 - total)
  const allowedMisses = useMemo(() => {
    const raw = realAttended / 0.75 - realTotal;
    const val = Math.floor(raw);
    return val >= 0 ? val : 0;
  }, [realAttended, realTotal]);

  // Required consecutive attendances if below 75%
  // Formula: ceil((0.75 * total - attended) / 0.25)
  const requiredClasses = useMemo(() => {
    if (actualAttendancePercent >= 75) return 0;
    const raw = (0.75 * realTotal - realAttended) / 0.25;
    return Math.ceil(Math.max(0, raw));
  }, [realAttended, realTotal, actualAttendancePercent]);

  // Course-wise attendance integration
  const coursesWithAttendance = useMemo(() => {
    const statsByCode: Record<string, { present: number; total: number }> = {};
    attendanceList.forEach((r: any) => {
      const code = r.course?.code || r.course_code;
      if (!code) return;
      if (!statsByCode[code]) statsByCode[code] = { present: 0, total: 0 };
      if (r.total !== undefined && r.present !== undefined) {
        statsByCode[code].total += Number(r.total);
        statsByCode[code].present += Number(r.present);
      } else {
        statsByCode[code].total += 1;
        if (r.status === 'PRESENT' || r.status === 'EXCUSED') statsByCode[code].present += 1;
      }
    });

    const fallbackCourses = [
      { code: 'CS101', name: 'Intro to Programming', credits: 4, faculty_name: 'Dr. Alan Turing' },
      { code: 'CS102', name: 'Data Structures & Algorithms', credits: 4, faculty_name: 'Dr. Grace Hopper' },
      { code: 'MA101', name: 'Engineering Mathematics I', credits: 3, faculty_name: 'Prof. Katherine Johnson' },
      { code: 'PY101', name: 'Engineering Physics', credits: 3, faculty_name: 'Dr. Richard Feynman' },
      { code: 'CY101', name: 'Engineering Chemistry', credits: 3, faculty_name: 'Dr. Marie Curie' },
    ];

    const sourceList = Array.isArray(courses) && courses.length > 0 ? courses : fallbackCourses;

    return sourceList.slice(0, 5).map((c: any) => {
      const code = c.code || 'GEN101';
      const stat = statsByCode[code] || { present: 19, total: 20 };
      const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 95;
      return {
        ...c,
        code,
        present: stat.present,
        total: stat.total,
        percentage: pct,
        isSafe: pct >= 75
      };
    });
  }, [courses, attendanceList]);

  // Results & CGPA derivation
  const resultsList = Array.isArray(results) ? results : ((results as any)?.results || []);
  const initialCGPA = useMemo(() => {
    if (!resultsList || resultsList.length === 0) return 8.20;
    const gradePoints: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };
    let totalPoints = 0;
    let creditsSum = 0;
    for (const r of resultsList) {
      const cr = Number(r.course?.credits || 3);
      const gp = gradePoints[r.grade] ?? 8.0;
      totalPoints += gp * cr;
      creditsSum += cr;
    }
    return creditsSum > 0 ? Math.round((totalPoints / creditsSum) * 100) / 100 : 8.20;
  }, [resultsList]);

  const initialCompletedCredits = useMemo(() => {
    if (!resultsList || resultsList.length === 0) return 17;
    return resultsList.filter((r: any) => r.grade !== 'F').reduce((s: number, r: any) => s + (Number(r.course?.credits) || 3), 0);
  }, [resultsList]);

  // What-If GPA Simulator state
  const [currentCGPA, setCurrentCGPA] = useState<number>(initialCGPA);
  const [completedCredits, setCompletedCredits] = useState<number>(initialCompletedCredits);

  const defaultUpcoming = useMemo(() => {
    return coursesWithAttendance.map((c: any) => ({
      id: String(c.id || c.code),
      code: c.code,
      name: c.name || c.code,
      credits: Number(c.credits) || 3,
      grade: 8.5
    }));
  }, [coursesWithAttendance]);

  const [upcomingCourses, setUpcomingCourses] = useState<UpcomingCourse[]>(defaultUpcoming);

  React.useEffect(() => {
    if (defaultUpcoming.length > 0) {
      setUpcomingCourses(defaultUpcoming);
    }
  }, [defaultUpcoming]);

  // Calculations for What-If GPA projection
  const upcomingCredits = useMemo(() => upcomingCourses.reduce((s, c) => s + c.credits, 0), [upcomingCourses]);

  const projectedCGPA = useMemo(() => {
    const currentPoints = currentCGPA * completedCredits;
    const upcomingPoints = upcomingCourses.reduce((s, c) => s + c.grade * c.credits, 0);
    const totalCredits = completedCredits + upcomingCredits;
    if (totalCredits === 0) return currentCGPA;
    return Math.round(((currentPoints + upcomingPoints) / totalCredits) * 100) / 100;
  }, [currentCGPA, completedCredits, upcomingCourses, upcomingCredits]);

  const cgpaDelta = useMemo(() => Math.round((projectedCGPA - currentCGPA) * 100) / 100, [projectedCGPA, currentCGPA]);

  function updateCourseGrade(id: string, grade: number) {
    setUpcomingCourses((prev) => prev.map((c) => (c.id === id ? { ...c, grade } : c)));
  }

  function getLetterGrade(gp: number): { label: string; color: string } {
    if (gp >= 9.5) return { label: 'O (Outstanding)', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (gp >= 8.5) return { label: 'A+ (Excellent)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (gp >= 7.5) return { label: 'A (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (gp >= 6.5) return { label: 'B+ (Good)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (gp >= 5.5) return { label: 'B (Above Avg)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (gp >= 4.5) return { label: 'C (Average)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    if (gp >= 4.0) return { label: 'P (Pass)', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    return { label: 'F (Fail)', color: 'text-red-700 bg-red-50 border-red-200' };
  }

  const getCourseBadgeColor = (code: string) => {
    if (code.startsWith('CS')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (code.startsWith('MA')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (code.startsWith('PY')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (code.startsWith('CY')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Student Identity & Academic Context Hero Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Academic Standing: Good Standing • Regular Status
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Welcome back, {studentName}!
            </h1>
            
            <p className="text-slate-500 text-sm font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-slate-800">{programName}</span>
              <span>•</span>
              <span>Year {currentYear} ({`Semester ${currentSemester}`})</span>
              <span>•</span>
              <span className="text-blue-600 font-bold">{section}</span>
              <span>•</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {enrollmentNumber}
              </span>
            </p>
          </div>

          {/* Quick High-Level KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-slate-900">{currentCGPA.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current CGPA</span>
            </div>

            <div className={`border rounded-xl px-4 py-3 text-center min-w-[100px] ${
              actualAttendancePercent >= 75 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              <span className="block text-2xl font-black">
                {actualAttendancePercent.toFixed(1)}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {actualAttendancePercent >= 75 ? 'Attendance' : 'Shortage'}
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-blue-700">{coursesWithAttendance.length}</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Enrolled Courses</span>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-indigo-700">Cleared</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Tuition Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Attendance Health & Registered Courses */}
        <div className="space-y-6">
          
          {/* 1. Bunk Budget & Statutory Compliance Engine */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Bunk Budget & Attendance Health</h3>
                  <p className="text-xs text-slate-500 font-medium">Statutory 75% minimum compliance engine</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Min. 75.0%</span>
              </span>
            </div>

            {/* Attendance Progress & Gauge */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-600">Current Cumulative Attendance</span>
                <span className={`font-black text-sm ${
                  actualAttendancePercent >= 85 ? 'text-emerald-600' : actualAttendancePercent >= 75 ? 'text-blue-600' : 'text-rose-600'
                }`}>
                  {actualAttendancePercent.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar with 75% marker */}
              <div className="relative w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    actualAttendancePercent >= 85 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                      : actualAttendancePercent >= 75 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500" 
                        : "bg-gradient-to-r from-rose-500 to-red-600"
                  }`}
                  style={{ width: `${Math.min(100, actualAttendancePercent)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium mt-1.5 px-0.5">
                <span>0%</span>
                <span className="text-amber-600 font-bold">▲ 75% Statutory Threshold</span>
                <span>100%</span>
              </div>
            </div>

            {/* Safe Buffer or Shortage Callout Card */}
            <div className={`p-4 rounded-xl border ${
              actualAttendancePercent >= 75 
                ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950' 
                : 'bg-rose-50/60 border-rose-200/80 text-rose-950'
            }`}>
              {actualAttendancePercent >= 75 ? (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Safe Statutory Margin
                    </span>
                    <div className="text-2xl font-black text-emerald-800 mt-1">
                      {allowedMisses} {allowedMisses === 1 ? 'Class' : 'Classes'} Missable
                    </div>
                    <p className="text-xs text-emerald-700/80 mt-1 font-medium leading-relaxed">
                      You can safely miss up to <b>{allowedMisses} upcoming lecture slots</b> across courses while keeping your overall attendance comfortably above the mandatory 75% bar.
                    </p>
                  </div>
                  <div className="text-3xl p-2 bg-emerald-100/70 rounded-xl">🛡️</div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Critical Attendance Deficit
                    </span>
                    <div className="text-2xl font-black text-rose-800 mt-1">
                      Must Attend Next {requiredClasses} {requiredClasses === 1 ? 'Class' : 'Classes'}
                    </div>
                    <p className="text-xs text-rose-700/80 mt-1 font-medium leading-relaxed">
                      Consecutive attendance required to restore eligibility and lift the examination hall ticket debarment flag.
                    </p>
                  </div>
                  <div className="text-3xl p-2 bg-rose-100/70 rounded-xl">⚠️</div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total Classes: <b className="text-slate-800">{realTotal}</b></span>
                <span>Attended: <b className="text-slate-800">{realAttended}</b></span>
                <span>Missed: <b className="text-slate-800">{Math.max(0, realTotal - realAttended)}</b></span>
              </div>
            </div>

            {/* Interactive What-If Bunk Simulator */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Simulate Upcoming Lectures</span>
                </div>
                {(simExtraAttend > 0 || simExtraMiss > 0) && (
                  <button
                    onClick={() => {
                      setSimExtraAttend(0);
                      setSimExtraMiss(0);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Quick simulation buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSimExtraMiss((prev) => prev + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition"
                >
                  +1 Miss (Bunk)
                </button>
                <button
                  type="button"
                  onClick={() => setSimExtraMiss((prev) => prev + 3)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition"
                >
                  +3 Misses
                </button>
                <button
                  type="button"
                  onClick={() => setSimExtraAttend((prev) => prev + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  +1 Attend
                </button>
                <button
                  type="button"
                  onClick={() => setSimExtraAttend((prev) => prev + 5)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  +5 Attend
                </button>
              </div>

              {/* Simulation Result readout */}
              {(simExtraAttend > 0 || simExtraMiss > 0) && (
                <div className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-between ${
                  simulatedPercent >= 75 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50/70 border-rose-200 text-rose-800'
                }`}>
                  <div>
                    <span>Projected Attendance: <b>{simulatedPercent.toFixed(1)}%</b></span>
                    <p className="text-[10px] font-normal opacity-80 mt-0.5">
                      After attending +{simExtraAttend} and missing +{simExtraMiss} future classes
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    simulatedPercent >= 75 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {simulatedPercent >= 75 ? 'Eligible' : 'Debarment Risk'}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation link */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigate?.('attendance')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 group"
              >
                <span>Open Detailed Attendance Register & Daily Logs</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. Registered Courses Snapshot Card (Balances Left Column) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Enrolled Curriculum Snapshot</h3>
                <p className="text-xs text-slate-500 font-medium">Autumn Term 2026-27 • 1st Year (Semester 1)</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                {coursesWithAttendance.length} Courses
              </span>
            </div>

            {/* Course Cards List */}
            <div className="space-y-2.5">
              {coursesWithAttendance.map((course: any) => (
                <div 
                  key={course.code}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black border tracking-wider shrink-0 ${getCourseBadgeColor(course.code)}`}>
                      {course.code}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {course.credits || 3} Credits • {course.faculty_name || 'Department Faculty'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-black ${
                      course.percentage >= 75 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {course.percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      {course.present}/{course.total} Attended
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate?.('my_courses')}
                className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Course Details</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('timetable')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Weekly Timetable</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: What-If GPA Simulator & Term Actions */}
        <div className="space-y-6">
          
          {/* 1. What-If GPA Simulator Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">What-If GPA Simulator</h3>
                  <p className="text-xs text-slate-500 font-medium">Model hypothetical grades to project semester SGPA & CGPA</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                <Calculator className="w-3.5 h-3.5 text-slate-400" />
                <span>10.0 Scale</span>
              </span>
            </div>

            {/* Metrics Header: Current vs Projected CGPA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current CGPA</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {currentCGPA.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Based on {completedCredits} completed credits
                </span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Projected CGPA</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    cgpaDelta >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {cgpaDelta >= 0 ? `+${cgpaDelta.toFixed(2)}` : `${cgpaDelta.toFixed(2)}`}
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {projectedCGPA.toFixed(2)}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                  With {upcomingCredits} credits modelled
                </span>
              </div>
            </div>

            {/* Courses Interactive Grade Sliders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Model Anticipated Grades</span>
                <button
                  type="button"
                  onClick={() => setUpcomingCourses(defaultUpcoming)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Grades
                </button>
              </div>

              {upcomingCourses.map((course) => {
                const letter = getLetterGrade(course.grade);
                return (
                  <div key={course.id} className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {course.code} - {course.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {course.credits} Credits • Relative Grading
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-xs font-black border ${letter.color}`}>
                          {letter.label.split(' ')[0]} ({course.grade.toFixed(1)})
                        </span>
                      </div>
                    </div>

                    {/* Smooth Grade Slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={course.grade}
                        onChange={(e) => updateCourseGrade(course.id, Number(e.target.value))}
                        className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700 w-10 text-right">
                        {course.grade.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulator Footer note */}
            <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl text-xs text-blue-800 font-medium flex items-start gap-2">
              <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Calculated on Veritas Grove University 10-point credit grading scale: O (10), A+ (9), A (8), B+ (7), B (6), C (5), P (4), F (0).
              </span>
            </div>
          </div>

          {/* 2. Institutional Milestones & Quick Actions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Academic Standing & Quick Access</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => onNavigate?.('fees_billing')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Tuition & Bursar</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">₹75,000 Invoiced • Settled</p>
                <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-indigo-600 transition-colors">
                  View printable receipt →
                </p>
              </div>

              <div 
                onClick={() => onNavigate?.('clearance')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>Clearance & Bonafide</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">All Dues Cleared</p>
                <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-emerald-600 transition-colors">
                  Generate certificate →
                </p>
              </div>

              <div 
                onClick={() => onNavigate?.('leaves')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>Leave & On-Duty (OD)</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">Attendance Protection</p>
                <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors">
                  Submit absence request →
                </p>
              </div>

              <div 
                onClick={() => onNavigate?.('notice_board')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Circulars & Notices</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">Academic Notices</p>
                <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-amber-600 transition-colors">
                  Check announcements →
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
