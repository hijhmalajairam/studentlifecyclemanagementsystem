'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export default function MyClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeModal, setActiveModal] = useState<'attendance' | 'grading' | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // Data states
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [gradeData, setGradeData] = useState<Record<number, { marks: string; grade: string }>>({});

  useEffect(() => {
    fetchAPI('/academics/course-sections/my_classes/')
      .then(data => setClasses(Array.isArray(data) ? data : (data.results || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openModal = async (type: 'attendance' | 'grading', cls: any) => {
    setSelectedClass(cls);
    setActiveModal(type);
    setStudents([]);
    try {
      const studs = await fetchAPI(`/academics/course-sections/${cls.id}/students/`);
      setStudents(studs);
      
      if (type === 'attendance') {
        const initialAtt: Record<number, string> = {};
        studs.forEach((s: any) => initialAtt[s.enrollment_id] = 'PRESENT');
        setAttendanceData(initialAtt);
      } else {
        const initialGrades: Record<number, any> = {};
        studs.forEach((s: any) => initialGrades[s.enrollment_id] = { marks: '', grade: '' });
        setGradeData(initialGrades);
      }
    } catch (e) {
      console.error("Failed to load students", e);
    }
  };

  const submitAttendance = async () => {
    if (!selectedClass) return;
    const payload = Object.keys(attendanceData).map(enrId => ({
      enrollment_id: parseInt(enrId),
      status: attendanceData[parseInt(enrId)]
    }));

    try {
      await fetchAPI('/academics/attendance/bulk_mark/', {
        method: 'POST',
        body: JSON.stringify({
          course_id: selectedClass.course,
          date: attendanceDate,
          students: payload
        })
      });
      alert('Attendance saved successfully!');
      setActiveModal(null);
    } catch {
      alert('Failed to save attendance.');
    }
  };

  const submitGrades = async () => {
    if (!selectedClass) return;
    try {
      for (const [enrId, data] of Object.entries(gradeData)) {
        if (!data.marks || !data.grade) continue;
        await fetchAPI('/academics/results/', {
          method: 'POST',
          body: JSON.stringify({
            enrollment: parseInt(enrId),
            course: selectedClass.course,
            marks_obtained: parseFloat(data.marks),
            grade: data.grade,
            remarks: 'Faculty Entry'
          })
        });
      }
      alert('Grades submitted successfully!');
      setActiveModal(null);
    } catch {
      alert('Failed to submit grades. Some might already exist.');
    }
  };

  const gradeOptions = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🧑‍🏫</span> My Active Classes
        </h2>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl shadow-sm">Loading Classes...</div>
      ) : classes.length === 0 ? (
        <div className="py-20 text-center text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl shadow-sm">You are not assigned to any active classes this term.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {cls.course_code}
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black shadow-sm border border-emerald-100">{cls.term_name}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                {cls.course_name || 'Course Name Unknown'}
              </h3>
              <p className="text-xs font-bold text-slate-400 mb-6">Section {cls.id} • Capacity: {cls.capacity}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => openModal('attendance', cls)} className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-100 hover:border-transparent py-2.5 rounded-xl text-xs font-black transition-all text-center">
                  Mark Attendance
                </button>
                <button onClick={() => openModal('grading', cls)} className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 hover:border-transparent py-2.5 rounded-xl text-xs font-black transition-all text-center">
                  Grade Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ATTENDANCE MODAL */}
      {activeModal === 'attendance' && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Mark Attendance</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">{selectedClass.course_code} - {selectedClass.course_name}</p>
              </div>
              <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded-xl outline-none font-bold shadow-sm" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
              {students.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold">No students found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-l-xl">Student</th>
                      <th className="px-4 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-r-xl text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map(s => (
                      <tr key={s.enrollment_id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">{s.student_name}</p>
                          <p className="text-xs text-slate-500 font-mono">ENR-{s.enrollment_id}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-black transition-all ${attendanceData[s.enrollment_id] === 'PRESENT' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                              <input type="radio" className="hidden" checked={attendanceData[s.enrollment_id] === 'PRESENT'} onChange={() => setAttendanceData(p => ({...p, [s.enrollment_id]: 'PRESENT'}))} /> Present
                            </label>
                            <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-black transition-all ${attendanceData[s.enrollment_id] === 'ABSENT' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                              <input type="radio" className="hidden" checked={attendanceData[s.enrollment_id] === 'ABSENT'} onChange={() => setAttendanceData(p => ({...p, [s.enrollment_id]: 'ABSENT'}))} /> Absent
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={submitAttendance} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">Save Attendance</button>
            </div>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {activeModal === 'grading' && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Grade Entry</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">{selectedClass.course_code} - {selectedClass.course_name}</p>
              </div>
              <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-200 flex items-center">
                <span className="mr-2">⚠️</span> Once submitted, grades require Admin approval to change.
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
              {students.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold">No students found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-l-xl">Student</th>
                      <th className="px-4 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Marks (0-100)</th>
                      <th className="px-4 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-r-xl text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map(s => (
                      <tr key={s.enrollment_id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">{s.student_name}</p>
                          <p className="text-xs text-slate-500 font-mono">ENR-{s.enrollment_id}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="number" min="0" max="100" placeholder="0" value={gradeData[s.enrollment_id]?.marks || ''}
                            onChange={e => setGradeData(p => ({...p, [s.enrollment_id]: {...p[s.enrollment_id], marks: e.target.value}}))}
                            className="w-20 text-center bg-white border border-slate-300 text-slate-900 p-2 rounded-xl outline-none focus:border-indigo-500 font-bold shadow-sm" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <select value={gradeData[s.enrollment_id]?.grade || ''}
                            onChange={e => setGradeData(p => ({...p, [s.enrollment_id]: {...p[s.enrollment_id], grade: e.target.value}}))}
                            className="bg-white border border-slate-300 text-slate-900 p-2 rounded-xl outline-none focus:border-indigo-500 font-bold shadow-sm cursor-pointer">
                            <option value="">-</option>
                            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={submitGrades} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Submit Grades</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
