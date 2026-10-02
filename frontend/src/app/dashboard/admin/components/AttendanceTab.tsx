import React from 'react';

interface AttendanceTabProps {
  courses: any[];
  selectedCourse: any;
  setSelectedCourse: (course: any) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  attendanceData: { [key: number]: string };
  handleAttendanceChange: (enrollmentId: number, status: string) => void;
  submitAttendance: () => void;
  getStudentsForCourse: (courseId: number) => number[];
}

export default function AttendanceTab({
  courses,
  selectedCourse,
  setSelectedCourse,
  attendanceDate,
  setAttendanceDate,
  attendanceData,
  handleAttendanceChange,
  submitAttendance,
  getStudentsForCourse,
}: AttendanceTabProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg shadow-2xl p-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-50/50 p-5 rounded-md border border-slate-200">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course</label>
          <select
            className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none focus:border-cyan-500"
            onChange={(e) => {
              const cId = parseInt(e.target.value);
              setSelectedCourse(courses.find((c) => c.id === cId) || null);
            }}
          >
            <option value="">-- Choose --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
          <input
            type="date"
            className="w-full bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none focus:border-cyan-500"
            style={{ colorScheme: 'light' }}
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>
      {selectedCourse ? (
        <>
          <div className="bg-slate-50/50 rounded-md border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase">Enrollment</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-8 py-12 text-center text-slate-400">
                      No students.
                    </td>
                  </tr>
                ) : (
                  getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                    <tr key={enrId} className="hover:bg-white/30 transition">
                      <td className="px-8 py-4 text-sm font-bold font-mono text-slate-700">ENR-{enrId}</td>
                      <td className="px-8 py-4 text-right">
                        <div className="inline-flex space-x-2 bg-slate-50 p-1 rounded border border-slate-200">
                          <label
                            className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                              attendanceData[enrId] === 'PRESENT'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'text-slate-400 border border-transparent'
                            }`}
                          >
                            <input
                              type="radio"
                              className="hidden"
                              name={`s-${enrId}`}
                              checked={attendanceData[enrId] === 'PRESENT'}
                              onChange={() => handleAttendanceChange(enrId, 'PRESENT')}
                            />{' '}
                            Present
                          </label>
                          <label
                            className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                              attendanceData[enrId] === 'ABSENT'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'text-slate-400 border border-transparent'
                            }`}
                          >
                            <input
                              type="radio"
                              className="hidden"
                              name={`s-${enrId}`}
                              checked={attendanceData[enrId] === 'ABSENT'}
                              onChange={() => handleAttendanceChange(enrId, 'ABSENT')}
                            />{' '}
                            Absent
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={submitAttendance}
              className="bg-blue-600 text-slate-900 px-8 py-3 rounded font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Save Attendance
            </button>
          </div>
        </>
      ) : (
        <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-md">
          Select a course above
        </div>
      )}
    </div>
  );
}
