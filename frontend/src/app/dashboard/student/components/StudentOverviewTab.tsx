import React, { useMemo, useState } from "react";
import { Shield, BarChart2, Zap, Calculator, Activity } from "lucide-react";

type UpcomingCourse = {
  id: string;
  name: string;
  credits: number;
  grade: number; // 0 - 10 scale
};

export default function StudentOverviewTab({ attendance }: { attendance?: any[] }) {
  // Aggregate real attendance
  const realTotal = useMemo(() => {
    if (!attendance || !Array.isArray(attendance)) return 100;
    const sum = attendance.reduce((acc, c) => acc + (c.total || 0), 0);
    return sum > 0 ? sum : 100;
  }, [attendance]);

  const realAttended = useMemo(() => {
    if (!attendance || !Array.isArray(attendance)) return 85;
    const sum = attendance.reduce((acc, c) => acc + (c.present || 0), 0);
    return sum > 0 ? sum : 85;
  }, [attendance]);

  // Bunk Budget state (initialized with real data)
  const [totalClasses, setTotalClasses] = useState<number>(realTotal);
  const [attendedClasses, setAttendedClasses] = useState<number>(realAttended);

  React.useEffect(() => {
    if (realTotal > 0 && realAttended >= 0) {
      setTotalClasses(realTotal);
      setAttendedClasses(realAttended);
    }
  }, [realTotal, realAttended]);

  const attendancePercent = useMemo(() => {
    if (totalClasses === 0) return 100;
    return Math.min(100, Math.max(0, (attendedClasses / totalClasses) * 100));
  }, [attendedClasses, totalClasses]);

  const allowedMisses = useMemo(() => {
    // Find max m such that attended / (total + m) >= 0.75
    const raw = attendedClasses / 0.75 - totalClasses;
    const val = Math.floor(raw);
    return val >= 0 ? val : 0;
  }, [attendedClasses, totalClasses]);

  const requiredClasses = useMemo(() => {
    // If < 75%, find min k such that (attended + k) / (total + k) >= 0.75
    if (attendancePercent >= 75) return 0;
    const raw = (0.75 * totalClasses - attendedClasses) / 0.25;
    return Math.ceil(Math.max(0, raw));
  }, [attendedClasses, totalClasses, attendancePercent]);

  // What-If GPA Simulator state
  const [currentCGPA, setCurrentCGPA] = useState<number>(7.6); // on 10 scale
  const [completedCredits, setCompletedCredits] = useState<number>(90);

  const [upcomingCourses, setUpcomingCourses] = useState<UpcomingCourse[]>([
    { id: "c1", name: "Math", credits: 4, grade: 8.0 },
    { id: "c2", name: "Physics", credits: 3, grade: 7.5 },
    { id: "c3", name: "Elective", credits: 2, grade: 9.0 },
  ]);

  // Derived calculations for GPA projection
  const upcomingCredits = useMemo(() => upcomingCourses.reduce((s, c) => s + c.credits, 0), [upcomingCourses]);

  const projectedCGPA = useMemo(() => {
    const currentPoints = currentCGPA * completedCredits;
    const upcomingPoints = upcomingCourses.reduce((s, c) => s + c.grade * c.credits, 0);
    const totalCredits = completedCredits + upcomingCredits;
    if (totalCredits === 0) return 0;
    return Math.round(((currentPoints + upcomingPoints) / totalCredits) * 100) / 100;
  }, [currentCGPA, completedCredits, upcomingCourses, upcomingCredits]);

  const cgpaDelta = useMemo(() => Math.round((projectedCGPA - currentCGPA) * 100) / 100, [projectedCGPA, currentCGPA]);

  function updateCourseGrade(id: string, grade: number) {
    setUpcomingCourses((prev) => prev.map((c) => (c.id === id ? { ...c, grade } : c)));
  }

  function updateCourseCredits(id: string, credits: number) {
    setUpcomingCourses((prev) => prev.map((c) => (c.id === id ? { ...c, credits } : c)));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Bunk Budget Card */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-200 text-slate-800">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bunk Budget</h3>
                <p className="text-sm text-slate-500">Attendance health & safe-miss estimate</p>
              </div>
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span>75% minimum</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Current Attendance</div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{attendancePercent.toFixed(1)}%</div>
            </div>

            {/* Health bar */}
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  attendancePercent >= 90
                    ? "bg-emerald-500"
                    : attendancePercent >= 75
                    ? "bg-blue-600"
                    : "bg-rose-500"
                }`}
                style={{ width: `${attendancePercent}%` }}
              />
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              {attendancePercent >= 75 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Safe Buffer</span>
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {allowedMisses} {allowedMisses === 1 ? 'class' : 'classes'}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">You can safely miss without dropping below 75%</p>
                  </div>
                  <div className="text-3xl">🛡️</div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                      ⚠️ Critical Shortage
                    </span>
                    <div className="text-2xl font-black text-red-600 mt-0.5">
                      Must Attend {requiredClasses} {requiredClasses === 1 ? 'Class' : 'Classes'}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Consecutive attendance required to reach 75% eligibility</p>
                  </div>
                  <div className="text-3xl">🚨</div>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Total Classes: <b>{totalClasses}</b></span>
                <span>Attended: <b>{attendedClasses}</b></span>
                <span>Absent: <b>{Math.max(0, totalClasses - attendedClasses)}</b></span>
              </div>
            </div>

            {/* What-If Future Simulator */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Simulate Future Classes</span>
                {(totalClasses !== realTotal || attendedClasses !== realAttended) && (
                  <button
                    onClick={() => {
                      setTotalClasses(realTotal);
                      setAttendedClasses(realAttended);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Reset to Actual
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Total Classes</label>
                  <input
                    type="number"
                    min={1}
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Attended Classes</label>
                  <input
                    type="number"
                    min={0}
                    max={totalClasses}
                    value={attendedClasses}
                    onChange={(e) => setAttendedClasses(Math.min(totalClasses, Math.max(0, Number(e.target.value))))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What-If GPA Simulator Card */}
        <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">What-If GPA Simulator</h3>
                <p className="text-sm text-slate-500">Play with upcoming grades to see projected CGPA</p>
              </div>
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-400" />
              <span>Projected CGPA</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-500">Current CGPA</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currentCGPA.toFixed(2)}</div>
                <div className="text-xs text-slate-400">Completed Credits: {completedCredits}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={currentCGPA}
                    onChange={(e) => setCurrentCGPA(Math.max(0, Math.min(10, Number(e.target.value))))}
                    className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                  <input
                    type="number"
                    min={0}
                    value={completedCredits}
                    onChange={(e) => setCompletedCredits(Math.max(0, Number(e.target.value)))}
                    className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl">
                <div className="text-xs text-emerald-600">Projected CGPA</div>
                <div className="text-3xl font-bold text-emerald-700">{projectedCGPA.toFixed(2)}</div>
                <div className={`mt-2 text-sm ${cgpaDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {cgpaDelta >= 0 ? `+${cgpaDelta.toFixed(2)} from current` : `${cgpaDelta.toFixed(2)} from current`}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingCourses.map((course) => (
                <div key={course.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{course.name}</div>
                      <div className="text-xs text-slate-500">Credits: {course.credits}</div>
                    </div>
                    <div className="text-sm text-slate-500">Projected Grade: {course.grade.toFixed(1)}</div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={course.grade}
                      onChange={(e) => updateCourseGrade(course.id, Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="w-28 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={course.grade}
                        onChange={(e) => updateCourseGrade(course.id, Math.max(0, Math.min(10, Number(e.target.value))))}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs text-slate-500 w-20">Credits</label>
                    <input
                      type="number"
                      min={0}
                      value={course.credits}
                      onChange={(e) => updateCourseCredits(course.id, Math.max(0, Number(e.target.value)))}
                      className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-slate-500">Tip: Drag sliders to see how different results affect your CGPA</div>
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> Upcoming Credits: {upcomingCredits}
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-400">This simulator uses a simple weighted average on a 0-10 scale. Adjust scales to match your institution's scheme if needed.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
