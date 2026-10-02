import React from 'react';
import { LETTER_GRADES } from '@/lib/constants';

interface GradeEntryTabProps {
  courses: any[];
  selectedCourse: any;
  setSelectedCourse: (course: any) => void;
  gradeEntries: { [key: number]: { marks: string; grade: string } };
  handleGradeChange: (enrollmentId: number, field: string, value: string) => void;
  submitGrades: () => void;
  getStudentsForCourse: (courseId: number) => number[];
}

export default function GradeEntryTab({
  courses,
  selectedCourse,
  setSelectedCourse,
  gradeEntries,
  handleGradeChange,
  submitGrades,
  getStudentsForCourse,
}: GradeEntryTabProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg p-8 shadow-2xl">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Course Grade Entry</h2>
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Course</label>
        <select
          className="w-full max-w-md bg-white border border-slate-300 text-slate-900 p-3 rounded outline-none"
          value={selectedCourse?.id || ''}
          onChange={(e) => setSelectedCourse(courses.find((c) => c.id === parseInt(e.target.value)) || null)}
        >
          <option value="">-- Select --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse ? (
        <>
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment ID</th>
                  <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Marks (out of 100)
                  </th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                      No students.
                    </td>
                  </tr>
                ) : (
                  getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                    <tr key={enrId} className="hover:bg-white/30 transition">
                      <td className="px-8 py-4 text-sm font-bold font-mono text-slate-700">ENR-{enrId}</td>
                      <td className="px-8 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Marks"
                          className="w-24 bg-white border border-slate-300 text-slate-900 p-2 rounded-lg text-center outline-none focus:border-purple-500"
                          value={gradeEntries[enrId]?.marks || ''}
                          onChange={(e) => handleGradeChange(enrId, 'marks', e.target.value)}
                        />
                      </td>
                      <td className="px-8 py-4 text-right">
                        <select
                          className="bg-white border border-slate-300 text-slate-900 p-2 rounded-lg outline-none focus:border-purple-500"
                          value={gradeEntries[enrId]?.grade || ''}
                          onChange={(e) => handleGradeChange(enrId, 'grade', e.target.value)}
                        >
                          <option value="">--</option>
                          {LETTER_GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={submitGrades}
              className="bg-blue-600 text-slate-900 px-8 py-3 rounded font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Grades
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
