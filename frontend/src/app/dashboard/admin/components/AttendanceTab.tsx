'use client';
import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { 
  Calendar, 
  Check, 
  CheckCheck, 
  X, 
  RotateCcw, 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  GraduationCap,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AttendanceTabProps {
  courses: any[];
  departments?: any[];
  selectedCourse: any;
  setSelectedCourse: (course: any) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  attendanceData: { [key: number]: string };
  handleAttendanceChange: (enrollmentId: number, status: string) => void;
  submitAttendance: () => void;
  getStudentsForCourse?: (courseId: number) => number[];
}

interface RosterStudent {
  enrollment_id: number;
  enrollment_number: string;
  student_name: string;
  student_email: string;
  academic_status: string;
  current_year: number;
  current_semester: number;
  attendance_status: string;
  is_already_saved: boolean;
  overall_total_classes: number;
  overall_attended: number;
  overall_percentage: number;
  has_approved_leave: boolean;
  leave_reason: string;
}

export default function AttendanceTab({
  courses,
  departments = [],
  selectedCourse,
  setSelectedCourse,
  attendanceDate,
  setAttendanceDate,
  attendanceData,
  handleAttendanceChange,
}: AttendanceTabProps) {
  // Cascading Filters
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSem, setSelectedSem] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allDepartments, setAllDepartments] = useState<any[]>(departments);

  // Roster state
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  // Load departments if not passed as prop
  useEffect(() => {
    if (departments.length > 0) {
      setAllDepartments(departments);
    } else {
      fetchAPI('/academics/departments/')
        .then(data => setAllDepartments(Array.isArray(data) ? data : (data?.results || [])))
        .catch(() => {});
    }
  }, [departments]);

  // Fetch live roster whenever selectedCourse or attendanceDate changes
  useEffect(() => {
    if (!selectedCourse) {
      setRoster([]);
      return;
    }

    const loadRoster = async () => {
      try {
        setLoadingRoster(true);
        setErrorMsg(null);
        const data = await fetchAPI(
          `/academics/attendance/course_roster/?course_id=${selectedCourse.id}&date=${attendanceDate}`
        );
        const studentList: RosterStudent[] = data.students || [];
        setRoster(studentList);
        setAlreadyMarked(data.already_marked || false);

        // Pre-populate parent attendanceData state
        studentList.forEach(s => {
          handleAttendanceChange(s.enrollment_id, s.attendance_status || 'PRESENT');
        });
      } catch (err: any) {
        console.error('Failed to load course roster:', err);
        setErrorMsg('Failed to load course student roster.');
      } finally {
        setLoadingRoster(false);
      }
    };

    loadRoster();
  }, [selectedCourse, attendanceDate]);

  // Department Badge Helper
  const getDeptBadgeTheme = (deptCode: string) => {
    const code = (deptCode || '').toUpperCase();
    if (code.includes('CSE') || code.includes('CS')) {
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    }
    if (code.includes('ECE') || code.includes('EC')) {
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    }
    if (code.includes('MECH') || code.includes('ME')) {
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    }
    if (code.includes('CIVIL') || code.includes('CE')) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    }
    if (code.includes('MGMT') || code.includes('MB')) {
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    }
    if (code.includes('LAW') || code.includes('LW')) {
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    }
    if (code.includes('PHAR') || code.includes('PHR')) {
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    }
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  };

  // Filter courses by department, semester, and search query
  const filteredCourses = courses.filter((c: any) => {
    if (selectedDept && c.department?.toString() !== selectedDept && c.department_id?.toString() !== selectedDept) {
      return false;
    }
    if (selectedSem && c.semester?.toString() !== selectedSem) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const code = (c.code || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      return code.includes(q) || name.includes(q);
    }
    return true;
  });

  // Speed controls
  const handleMarkAllPresent = () => {
    roster.forEach(s => {
      const newStatus = s.has_approved_leave ? 'EXCUSED' : 'PRESENT';
      handleAttendanceChange(s.enrollment_id, newStatus);
    });
  };

  const handleMarkAllAbsent = () => {
    roster.forEach(s => {
      const newStatus = s.has_approved_leave ? 'EXCUSED' : 'ABSENT';
      handleAttendanceChange(s.enrollment_id, newStatus);
    });
  };

  const handleInvert = () => {
    roster.forEach(s => {
      const current = attendanceData[s.enrollment_id] || s.attendance_status;
      if (s.has_approved_leave) return;
      const inverted = current === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      handleAttendanceChange(s.enrollment_id, inverted);
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) return;
    try {
      setSavingAttendance(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const studentsPayload = roster.map(s => ({
        enrollment_id: s.enrollment_id,
        status: attendanceData[s.enrollment_id] || s.attendance_status || 'PRESENT'
      }));

      const res = await fetchAPI('/academics/attendance/bulk_mark/', {
        method: 'POST',
        body: JSON.stringify({
          course_id: selectedCourse.id,
          date: attendanceDate,
          students: studentsPayload
        })
      });

      setSuccessMsg(res.detail || `Attendance recorded for ${roster.length} students in ${selectedCourse.code}.`);
      setAlreadyMarked(true);

      const data = await fetchAPI(
        `/academics/attendance/course_roster/?course_id=${selectedCourse.id}&date=${attendanceDate}`
      );
      if (data.students) setRoster(data.students);
    } catch (err: any) {
      console.error('Failed to save attendance:', err);
      setErrorMsg(err.detail || err.message || 'Failed to submit attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Stats for the active roster
  const totalRosterCount = roster.length;
  const presentCount = roster.filter(s => (attendanceData[s.enrollment_id] || s.attendance_status) === 'PRESENT').length;
  const absentCount = roster.filter(s => (attendanceData[s.enrollment_id] || s.attendance_status) === 'ABSENT').length;
  const excusedCount = roster.filter(s => (attendanceData[s.enrollment_id] || s.attendance_status) === 'EXCUSED').length;
  const dailyAttendancePct = totalRosterCount > 0 ? Math.round(((presentCount + excusedCount) / totalRosterCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ─── TOP SECTION: CASCADING FILTERS & SEARCH ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Attendance Engine</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Management & Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an academic department, semester, and course to review the class roster, track leaves, and mark statutory attendance.
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shrink-0">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Lecture Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filters Bar: Department ➔ Semester ➔ Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-5">
          {/* 1. Department */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              1. Academic Department
            </label>
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setSelectedCourse(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Academic Departments ({allDepartments.length})</option>
              {allDepartments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.code ? `(${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Semester */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              2. Academic Semester
            </label>
            <select
              value={selectedSem}
              onChange={e => {
                setSelectedSem(e.target.value);
                setSelectedCourse(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Semesters (1 - 8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                const yr = Math.floor((s + 1) / 2);
                const suffix = yr === 1 ? 'st' : yr === 2 ? 'nd' : yr === 3 ? 'rd' : 'th';
                return (
                  <option key={s} value={s}>
                    Semester {s} • {yr}{suffix} Year
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Search input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              3. Search Course Code or Title
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search code or title (e.g. CS101, Data)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border border-slate-300 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── NOTIFICATIONS & TOAST FEEDBACK ─── */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── CASE A: NO COURSE SELECTED -> VISUAL COURSE SELECTOR CARDS ─── */}
      {!selectedCourse ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select a Course to Open Roster ({filteredCourses.length} classes available)
            </h3>
            {(selectedDept || selectedSem || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDept('');
                  setSelectedSem('');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No courses match the active filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting "All Academic Departments" or clear your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((c: any) => {
                const yr = Math.floor(((c.semester || 1) + 1) / 2);
                const suffix = yr === 1 ? 'st' : yr === 2 ? 'nd' : yr === 3 ? 'rd' : 'th';
                const deptName = c.department_name || allDepartments.find(d => d.id === c.department || d.id === c.department_id)?.name || 'General';
                const deptCode = c.department_code || allDepartments.find(d => d.id === c.department || d.id === c.department_id)?.code || '';
                const deptTheme = getDeptBadgeTheme(deptCode || c.code);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourse(c)}
                    className="group bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-xl rounded-2xl p-5.5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${deptTheme.bg} ${deptTheme.text} ${deptTheme.border}`}>
                          {c.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {c.credits || 3} Credits
                        </span>
                      </div>

                      {/* Course Title */}
                      <h4 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                        {c.name}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {deptName}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                        <span>{yr}{suffix} Year</span>
                        <span>•</span>
                        <span>Sem {c.semester || 1}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                        <span>Open Roster</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ─── CASE B: COURSE IS SELECTED -> RICH STUDENT ROSTER ─── */
        <div className="space-y-6">
          {/* Active Course Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="mt-1 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-sm shrink-0"
                  title="Back to All Courses"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      {selectedCourse.code}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {selectedCourse.credits || 3} Credits • Semester {selectedCourse.semester || 1} • Section A
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedCourse.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedCourse.department_name || allDepartments.find(d => d.id === selectedCourse.department)?.name || 'General Department'}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                {alreadyMarked ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Attendance Logged for {attendanceDate}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending Submission for {attendanceDate}</span>
                  </span>
                )}

                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all"
                >
                  Change Course
                </button>
              </div>
            </div>
          </div>

          {/* Faculty Speed Controls & Live Class Metrics */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Quick Mark:</span>
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-emerald-600/20"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Mark All Absent</span>
                </button>

                <button
                  type="button"
                  onClick={handleInvert}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Invert</span>
                </button>
              </div>

              {/* Stats Chips */}
              <div className="flex items-center space-x-2.5 text-xs font-bold">
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
                  Total: {totalRosterCount}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Present: {presentCount}
                </span>
                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  Absent: {absentCount}
                </span>
                {excusedCount > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    Excused: {excusedCount}
                  </span>
                )}
                <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold">
                  Session Rate: {dailyAttendancePct}%
                </span>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
            {loadingRoster ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Student Roster & Leave Protection Logs...</p>
              </div>
            ) : roster.length === 0 ? (
              <div className="p-16 text-center">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No students are currently registered for this course.</p>
                <p className="text-xs text-slate-400 mt-1">Check that Semester Registrations have been provisioned.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Student & ID</th>
                      <th className="px-6 py-4">Current Course Attendance</th>
                      <th className="px-6 py-4">Leave / OD Status</th>
                      <th className="px-6 py-4 text-center">Attendance For {attendanceDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map(student => {
                      const currentStatus = attendanceData[student.enrollment_id] || student.attendance_status || 'PRESENT';
                      const isShortage = student.overall_percentage < 75.0;

                      return (
                        <tr
                          key={student.enrollment_id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Student Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                {student.student_name ? student.student_name[0].toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">
                                  {student.student_name}
                                </div>
                                <div className="font-mono text-[11px] text-blue-600 font-medium">
                                  {student.enrollment_number}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cumulative Attendance % */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`font-black text-sm ${isShortage ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {student.overall_percentage}%
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isShortage 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {isShortage ? 'Shortage (< 75%)' : 'Good Standing'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              Attended {student.overall_attended} of {student.overall_total_classes} sessions
                            </p>
                          </td>

                          {/* Leave / OD Protection */}
                          <td className="px-6 py-4">
                            {student.has_approved_leave ? (
                              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Approved Leave (OD)</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">No active leaves</span>
                            )}
                          </td>

                          {/* 3-State Segmented Toggle */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 max-w-[310px] mx-auto shadow-inner">
                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(student.enrollment_id, 'PRESENT')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Present
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(student.enrollment_id, 'ABSENT')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Absent
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAttendanceChange(student.enrollment_id, 'EXCUSED')}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === 'EXCUSED'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Excused / OD
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Submit Footer */}
            {roster.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Submitting will update the university attendance registry, notify low-attendance students, and count towards statutory exam eligibility.
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingAttendance ? 'Recording Attendance...' : 'Save Attendance Record'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}