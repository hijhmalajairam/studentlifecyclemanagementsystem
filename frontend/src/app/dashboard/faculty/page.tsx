'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function FacultyDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{[key: number]: string}>({});
  const [activeTab, setActiveTab] = useState('attendance');
  
  // Timetable state
  const [timetable, setTimetable] = useState<any[]>([]);

  // Grade entry state
  const [gradeEntries, setGradeEntries] = useState<{[key: number]: {marks: string, grade: string}}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/academics/courses/'),
      fetchAPI('/academics/registrations/'),
      fetchAPI('/academics/timetable/my_timetable/').catch(() => [])
    ]).then(([courseData, regData, ttData]) => {
      setCourses(courseData);
      setRegistrations(regData);
      setTimetable(ttData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getStudentsForCourse = (courseId: number) => {
    return registrations.filter(r => r.courses.includes(courseId)).map(r => r.enrollment);
  };

  const handleAttendanceChange = (enrollmentId: number, status: string) => {
    setAttendanceData(prev => ({ ...prev, [enrollmentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return;
    const studentsPayload = Object.keys(attendanceData).map(enrId => ({
      enrollment_id: parseInt(enrId),
      status: attendanceData[parseInt(enrId)]
    }));
    try {
      await fetchAPI('/academics/attendance/bulk_mark/', {
        method: 'POST',
        body: JSON.stringify({ course_id: selectedCourse.id, date: attendanceDate, students: studentsPayload })
      });
      alert('Attendance saved successfully!');
      setAttendanceData({});
    } catch { alert('Failed to save attendance'); }
  };

  const handleGradeChange = (enrollmentId: number, field: string, value: string) => {
    setGradeEntries(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value }
    }));
  };

  const submitGrades = async () => {
    if (!selectedCourse) return;
    let count = 0;
    for (const [enrId, entry] of Object.entries(gradeEntries)) {
      if (!entry.marks || !entry.grade) continue;
      try {
        await fetchAPI('/academics/results/', {
          method: 'POST',
          body: JSON.stringify({
            enrollment: parseInt(enrId),
            course: selectedCourse.id,
            marks_obtained: parseFloat(entry.marks),
            grade: entry.grade,
            is_backlog: false,
            is_revaluation: false
          })
        });
        count++;
      } catch { /* skip duplicates */ }
    }
    alert(`Grades submitted for ${count} students!`);
    setGradeEntries({});
  };

  // Module 7 State
  const [assessmentForm, setAssessmentForm] = useState<any>({ title: '', enrollment_id: '', max_marks: 100, marks_obtained: 0, weightage: 10, status: 'EVALUATED' });
  const [disciplineForm, setDisciplineForm] = useState({ enrollment_id: '', title: '', description: '', assessment_type: 'ASSIGNMENT', date_of_incident: new Date().toISOString().split('T')[0] });

  const submitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await fetchAPI('/academics/internal-assessments/', {
        method: 'POST',
        body: JSON.stringify({
          course: selectedCourse.id,
          enrollment: parseInt(assessmentForm.enrollment_id),
          title: assessmentForm.title,
          max_marks: assessmentForm.max_marks,
          marks_obtained: assessmentForm.marks_obtained,
          weightage: assessmentForm.weightage,
          status: assessmentForm.status
        })
      });
      alert('Internal assessment recorded!');
      setAssessmentForm(prev => ({ ...prev, title: '', enrollment_id: '', marks_obtained: 0 }));
    } catch { alert('Failed to record internal assessment'); }
  };

  const submitDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await fetchAPI('/academics/disciplinary-cases/', {
        method: 'POST',
        body: JSON.stringify({
          course: selectedCourse.id,
          enrollment: parseInt(disciplineForm.enrollment_id),
          title: disciplineForm.title,
          description: disciplineForm.description,
          assessment_type: disciplineForm.assessment_type,
          date_of_incident: disciplineForm.date_of_incident
        })
      });
      alert('Malpractice incident reported to the committee.');
      setDisciplineForm({ enrollment_id: '', title: '', description: '', assessment_type: 'ASSIGNMENT', date_of_incident: new Date().toISOString().split('T')[0] });
    } catch { alert('Failed to report incident'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading faculty portal…</p>
        </div>
      </div>
    );
  }

  const gradeOptions = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];
  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayNames: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday' };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                📚 Faculty Panel
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your schedule, mark attendance and submit exam grades.
              </p>
            </div>
            <div className="flex space-x-2 bg-slate-800/40 p-1.5 rounded-xl border border-slate-700/50">
              <button onClick={() => setActiveTab('attendance')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'attendance' ? 'bg-emerald-600/20 text-emerald-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>
                Attendance
              </button>
              <button onClick={() => setActiveTab('assessments')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'assessments' ? 'bg-emerald-600/20 text-emerald-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>
                Internal Assessments
              </button>
              <button onClick={() => setActiveTab('grades')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'grades' ? 'bg-emerald-600/20 text-emerald-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>
                Grades
              </button>
              <button onClick={() => setActiveTab('timetable')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'timetable' ? 'bg-emerald-600/20 text-emerald-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>
                Timetable
              </button>
              <button onClick={() => setActiveTab('discipline')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'discipline' ? 'bg-rose-600/20 text-rose-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>
                Report Malpractice
              </button>
            </div>
          </div>

          {activeTab === 'timetable' ? (
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">My Weekly Schedule</h2>
              {timetable.length > 0 ? (
                <div className="space-y-4">
                  {dayOrder.filter(d => timetable.some(t => t.day === d)).map(day => (
                    <div key={day}>
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">{dayNames[day]}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {timetable.filter(t => t.day === day).map((slot: any) => (
                          <div key={slot.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                            <p className="font-bold text-white">{slot.course_code}</p>
                            <p className="text-xs text-slate-400">{slot.course_name}</p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                              <span className="text-sm text-cyan-400 font-mono">{slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}</span>
                              {slot.room && <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">🏛 {slot.room}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                  <p className="text-slate-400">No classes assigned to you.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Course Selector */}
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Course</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3.5 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      onChange={e => {
                        const cId = parseInt(e.target.value);
                        setSelectedCourse(courses.find(c => c.id === cId) || null);
                        setAttendanceData({});
                        setGradeEntries({});
                      }}
                    >
                      <option value="">-- Choose a Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name} (Sem {c.semester})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Content */}
              {selectedCourse ? (
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                  
                  {activeTab === 'attendance' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Attendance — {selectedCourse.code}</h2>
                        <input type="date" className="bg-slate-800 border border-slate-600 text-slate-200 p-2.5 rounded-xl outline-none focus:border-emerald-500"
                          style={{ colorScheme: 'dark' }}
                          value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                      </div>

                      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-700/50">
                          <thead className="bg-slate-800/80">
                            <tr>
                              <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment ID</th>
                              <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/30">
                            {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                              <tr><td colSpan={2} className="px-8 py-12 text-center text-slate-500">No students registered.</td></tr>
                            ) : getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                              <tr key={enrId} className="hover:bg-slate-800/30 transition">
                                <td className="px-8 py-4 text-sm font-bold font-mono text-slate-300">ENR-{enrId}</td>
                                <td className="px-8 py-4 text-right">
                                  <div className="inline-flex items-center space-x-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                                    <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${attendanceData[enrId] === 'PRESENT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                                      <input type="radio" className="hidden" name={`att-${enrId}`} value="PRESENT" checked={attendanceData[enrId] === 'PRESENT'} onChange={() => handleAttendanceChange(enrId, 'PRESENT')} />
                                      Present
                                    </label>
                                    <label className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${attendanceData[enrId] === 'ABSENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                                      <input type="radio" className="hidden" name={`att-${enrId}`} value="ABSENT" checked={attendanceData[enrId] === 'ABSENT'} onChange={() => handleAttendanceChange(enrId, 'ABSENT')} />
                                      Absent
                                    </label>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button onClick={submitAttendance} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Save Attendance
                        </button>
                      </div>
                    </>
                  )}

                  {activeTab === 'grades' && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-6">Grade Entry — {selectedCourse.code}</h2>
                      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-700/50">
                          <thead className="bg-slate-800/80">
                            <tr>
                              <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment ID</th>
                              <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Marks (out of 100)</th>
                              <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/30">
                            {getStudentsForCourse(selectedCourse.id).length === 0 ? (
                              <tr><td colSpan={3} className="px-8 py-12 text-center text-slate-500">No students registered.</td></tr>
                            ) : getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                              <tr key={enrId} className="hover:bg-slate-800/30 transition">
                                <td className="px-8 py-4 text-sm font-bold font-mono text-slate-300">ENR-{enrId}</td>
                                <td className="px-8 py-4 text-center">
                                  <input type="number" min="0" max="100" placeholder="Marks"
                                    className="w-24 bg-slate-800 border border-slate-600 text-slate-200 p-2 rounded-lg text-center outline-none focus:border-emerald-500"
                                    value={gradeEntries[enrId]?.marks || ''}
                                    onChange={e => handleGradeChange(enrId, 'marks', e.target.value)} />
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <select className="bg-slate-800 border border-slate-600 text-slate-200 p-2 rounded-lg outline-none focus:border-emerald-500"
                                    value={gradeEntries[enrId]?.grade || ''}
                                    onChange={e => handleGradeChange(enrId, 'grade', e.target.value)}>
                                    <option value="">--</option>
                                    {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button onClick={submitGrades} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Submit Grades
                        </button>
                      </div>
                    </>
                  )}

                  {activeTab === 'assessments' && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-6">Internal Assessments — {selectedCourse.code}</h2>
                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                        <form onSubmit={submitAssessment} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Enrollment ID</label>
                              <select required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500"
                                value={assessmentForm.enrollment_id} onChange={e => setAssessmentForm({ ...assessmentForm, enrollment_id: e.target.value })}>
                                <option value="">-- Select Student --</option>
                                {getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                                  <option key={enrId} value={enrId}>ENR-{enrId}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assessment Title</label>
                              <input type="text" required placeholder="e.g. Midterm 1" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500"
                                value={assessmentForm.title} onChange={e => setAssessmentForm({ ...assessmentForm, title: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Marks Obtained</label>
                              <input type="number" required min="0" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500"
                                value={assessmentForm.marks_obtained} onChange={e => setAssessmentForm({ ...assessmentForm, marks_obtained: e.target.value === '' ? '' : parseFloat(e.target.value) })} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Marks</label>
                              <input type="number" required min="1" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500"
                                value={assessmentForm.max_marks} onChange={e => setAssessmentForm({ ...assessmentForm, max_marks: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weightage (%)</label>
                              <input type="number" required min="1" max="100" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500"
                                value={assessmentForm.weightage} onChange={e => setAssessmentForm({ ...assessmentForm, weightage: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                              <select required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500"
                                value={assessmentForm.status} onChange={e => setAssessmentForm({ ...assessmentForm, status: e.target.value })}>
                                <option value="PENDING">Pending Evaluation</option>
                                <option value="EVALUATED">Evaluated</option>
                                <option value="FLAGGED_MALPRACTICE">Flagged for Malpractice</option>
                              </select>
                            </div>
                          </div>
                          <button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition">Record Assessment</button>
                        </form>
                      </div>
                    </>
                  )}

                  {activeTab === 'discipline' && (
                    <>
                      <h2 className="text-xl font-bold text-rose-400 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Report Disciplinary Incident — {selectedCourse.code}
                      </h2>
                      <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-900/50">
                        <p className="text-rose-300 text-sm mb-6">Submitting this form will automatically put the student on Disciplinary Hold and forward the case to the Disciplinary Committee for review.</p>
                        <form onSubmit={submitDiscipline} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Student Enrollment ID</label>
                              <select required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                                value={disciplineForm.enrollment_id} onChange={e => setDisciplineForm({ ...disciplineForm, enrollment_id: e.target.value })}>
                                <option value="">-- Select Student --</option>
                                {getStudentsForCourse(selectedCourse.id).map((enrId: number) => (
                                  <option key={enrId} value={enrId}>ENR-{enrId}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Incident Date</label>
                              <input type="date" required style={{ colorScheme: 'dark' }} className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                                value={disciplineForm.date_of_incident} onChange={e => setDisciplineForm({ ...disciplineForm, date_of_incident: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Assessment Type</label>
                              <select required className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                                value={disciplineForm.assessment_type} onChange={e => setDisciplineForm({ ...disciplineForm, assessment_type: e.target.value })}>
                                <option value="ASSIGNMENT">Assignment</option>
                                <option value="INTERNAL_EXAM">Internal Exam</option>
                                <option value="PROJECT">Project</option>
                                <option value="SEMESTER_EXAM">Semester Exam</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Incident Title</label>
                              <input type="text" required placeholder="e.g. Plagiarism in Midterm" className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-rose-500"
                                value={disciplineForm.title} onChange={e => setDisciplineForm({ ...disciplineForm, title: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Detailed Description</label>
                              <textarea required placeholder="Describe the incident, evidence, and any actions taken so far..." className="w-full bg-slate-800 border border-slate-600 text-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 h-24 resize-none"
                                value={disciplineForm.description} onChange={e => setDisciplineForm({ ...disciplineForm, description: e.target.value })} />
                            </div>
                          </div>
                          <button type="submit" className="w-full mt-4 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-900/20">Report to Committee</button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/20">
                  <svg className="w-16 h-16 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <p className="text-lg font-medium">Select a course above to get started</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
