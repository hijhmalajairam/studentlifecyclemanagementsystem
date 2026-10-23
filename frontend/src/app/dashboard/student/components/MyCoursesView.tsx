'use client';

import React, { useState } from 'react';

interface CourseItem {
  id?: number;
  code: string;
  name: string;
  credits: number;
  semester?: number;
  semester_label?: string;
  academic_year?: string;
  class_label?: string;
  section?: string;
  department_code?: string;
  department_name?: string;
  faculty_name?: string;
  description?: string;
}

interface MyCoursesViewProps {
  courses: CourseItem[];
  enrollment?: any;
}

// Course details and syllabus outlines mapped by code
const COURSE_DETAILS_MAP: Record<string, {
  category: string;
  weeklyHours: string;
  objectives: string[];
  units: { title: string; topics: string }[];
  materials: { name: string; type: string; size: string }[];
}> = {
  'CS101': {
    category: 'Department Core',
    weeklyHours: '3 Lectures + 2 Lab Hrs/wk',
    objectives: [
      'Master structured problem solving and algorithmic logic in C/Python.',
      'Understand memory organization, pointers, and file operations.',
      'Design modular programs utilizing functions and recursive paradigms.'
    ],
    units: [
      { title: 'Unit 1: Fundamentals of Computing & C Syntax', topics: 'Von Neumann architecture, compilers, data types, operators, branching & loops.' },
      { title: 'Unit 2: Modular Programming & Pointers', topics: 'Function prototypes, call by value/reference, memory addresses, pointer arithmetic.' },
      { title: 'Unit 3: Compound Data Types & Strings', topics: 'Arrays, multi-dimensional structures, string manipulation, union and bit-fields.' },
      { title: 'Unit 4: File I/O & Dynamic Allocation', topics: 'malloc/calloc/free, file pointers, streams, preprocessor directives & debugging.' }
    ],
    materials: [
      { name: 'CS101_Lecture_Notes_Complete.pdf', type: 'Lecture Notes', size: '4.8 MB' },
      { name: 'CS101_Lab_Manual_v2.0.pdf', type: 'Lab Manual', size: '2.1 MB' },
      { name: 'The_C_Programming_Language_Kernighan_Ritchie.pdf', type: 'Reference Book', size: '6.4 MB' }
    ]
  },
  'CS102': {
    category: 'Department Core',
    weeklyHours: '3 Lectures + 2 Lab Hrs/wk',
    objectives: [
      'Analyze asymptotic time and space computational complexity.',
      'Implement linear and non-linear data structures from first principles.',
      'Select optimal structures for high-performance data processing.'
    ],
    units: [
      { title: 'Unit 1: Asymptotic Analysis & Stacks/Queues', topics: 'Big-O/Omega/Theta notation, stack applications, circular queues, priority queues.' },
      { title: 'Unit 2: Linked Structures', topics: 'Singly, doubly, and circular linked lists; sparse matrices; memory management.' },
      { title: 'Unit 3: Trees & Hierarchical Structures', topics: 'Binary search trees, AVL trees, B-trees, traversals, heap algorithms.' },
      { title: 'Unit 4: Graphs & Hashing', topics: 'BFS/DFS traversals, Dijkstra, topological sorting, collision resolution, hash maps.' }
    ],
    materials: [
      { name: 'CS102_Data_Structures_Slides.pdf', type: 'Lecture Notes', size: '7.2 MB' },
      { name: 'CS102_Algorithms_Worksheet_Set1.pdf', type: 'Assignments', size: '1.5 MB' },
      { name: 'Introduction_To_Algorithms_Cormen_CLRS.pdf', type: 'Reference Book', size: '12.8 MB' }
    ]
  },
  'MA101': {
    category: 'Basic Engineering Sciences',
    weeklyHours: '4 Lectures/wk',
    objectives: [
      'Apply multivariable calculus and matrix algebra to engineering equations.',
      'Evaluate double and triple integrals over complex topological domains.',
      'Diagnose differential equations modeling dynamic physical systems.'
    ],
    units: [
      { title: 'Unit 1: Linear Algebra & Matrix Calculus', topics: 'Rank of matrices, Gaussian elimination, eigenvalues, Cayley-Hamilton theorem.' },
      { title: 'Unit 2: Differential Calculus of Several Variables', topics: 'Partial derivatives, Jacobians, Taylor series in 2 variables, Lagrange multipliers.' },
      { title: 'Unit 3: Vector Calculus & Integrals', topics: 'Gradient, divergence, curl, Green’s theorem, Stokes’ theorem, Gauss divergence theorem.' },
      { title: 'Unit 4: Ordinary Differential Equations', topics: 'First-order exact ODEs, higher-order linear ODEs with constant coefficients, Laplace transforms.' }
    ],
    materials: [
      { name: 'MA101_Engineering_Maths_Handbook.pdf', type: 'Course Reader', size: '5.6 MB' },
      { name: 'MA101_Calculus_Tutorial_Problems.pdf', type: 'Tutorial Sheets', size: '1.9 MB' }
    ]
  },
  'PY101': {
    category: 'Basic Engineering Sciences',
    weeklyHours: '3 Lectures + 2 Lab Hrs/wk',
    objectives: [
      'Understand quantum mechanical phenomena and wave-particle duality.',
      'Explore laser physics and fiber-optic communication mechanisms.',
      'Investigate electromagnetic waves through Maxwell’s equations.'
    ],
    units: [
      { title: 'Unit 1: Quantum Mechanics', topics: 'de Broglie hypothesis, Heisenberg uncertainty principle, Schrödinger wave equation, 1D box.' },
      { title: 'Unit 2: Wave Optics & Interference', topics: 'Thin film interference, Newton rings, Fraunhofer diffraction, diffraction gratings.' },
      { title: 'Unit 3: Lasers & Fiber Optics', topics: 'Stimulated emission, Einstein coefficients, population inversion, optical fibers, numerical aperture.' },
      { title: 'Unit 4: Electromagnetism & Dielectrics', topics: 'Maxwell equations in differential form, Poynting vector, dielectric polarization.' }
    ],
    materials: [
      { name: 'PY101_Physics_Formula_Deck.pdf', type: 'Lecture Notes', size: '3.4 MB' },
      { name: 'PY101_Optics_Lab_Guide.pdf', type: 'Lab Manual', size: '2.8 MB' }
    ]
  },
  'CY101': {
    category: 'Basic Engineering Sciences',
    weeklyHours: '3 Lectures + 2 Lab Hrs/wk',
    objectives: [
      'Evaluate thermodynamic principles in electrochemical power cells.',
      'Analyze corrosion mechanics, cathodic protection, and phase equilibria.',
      'Examine polymeric and nano-materials for high-tech engineering.'
    ],
    units: [
      { title: 'Unit 1: Electrochemistry & Battery Technologies', topics: 'Nernst equation, standard potentials, lithium-ion cells, fuel cells, supercapacitors.' },
      { title: 'Unit 2: Corrosion Engineering & Coatings', topics: 'Electrochemical corrosion mechanisms, galvanic series, Pilling-Bedworth ratio, galvanization.' },
      { title: 'Unit 3: Water Chemistry & Treatment', topics: 'Hardness determination, EDTA titration, zeolite softener, reverse osmosis desalination.' },
      { title: 'Unit 4: Engineering Materials & Spectroscopy', topics: 'Conducting polymers, carbon nanotubes, UV-Vis and FTIR analytical spectroscopy.' }
    ],
    materials: [
      { name: 'CY101_Complete_Notes.pdf', type: 'Lecture Notes', size: '4.1 MB' },
      { name: 'CY101_Chemistry_Lab_Protocols.pdf', type: 'Lab Manual', size: '1.7 MB' }
    ]
  }
};

export default function MyCoursesView({ courses, enrollment }: MyCoursesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [activeModalCourse, setActiveModalCourse] = useState<CourseItem | null>(null);
  const [modalTab, setModalTab] = useState<'syllabus' | 'materials'>('syllabus');

  // Academic metadata
  const programName = enrollment?.program_name || 'B.Tech Computer Science & Engineering';
  const academicYear = '1st Year (2026-2027)';
  const currentSemester = enrollment?.current_semester ? `Semester ${enrollment.current_semester}` : 'Semester 1';
  const section = 'Section A';

  // Filter list
  const departments = Array.from(new Set(courses.map(c => c.department_name || c.department_code || 'General'))).filter(Boolean);

  const filteredCourses = (courses || []).filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.faculty_name && c.faculty_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const dept = c.department_name || c.department_code || 'General';
    const matchesDept = selectedDeptFilter === 'ALL' || dept === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const totalCredits = (courses || []).reduce((acc, curr) => acc + (Number(curr.credits) || 3), 0);

  const getCourseDetails = (code: string) => {
    return COURSE_DETAILS_MAP[code] || {
      category: 'Program Core',
      weeklyHours: '3 Lectures + 1 Tutorial/wk',
      objectives: ['Master fundamental principles and analytical techniques of the subject.'],
      units: [
        { title: 'Unit 1: Foundational Theory', topics: 'Core concepts, definitions, analytical models, and historical developments.' },
        { title: 'Unit 2: Applied Methodologies', topics: 'Standard operational frameworks, mathematical models, problem formulation.' },
        { title: 'Unit 3: Advanced Systems', topics: 'Complex integrations, case studies, state-of-the-art implementations.' },
        { title: 'Unit 4: Projects & Real-World Lab', topics: 'Synthesis of principles, laboratory assignments, capstone problem analysis.' }
      ],
      materials: [
        { name: `${code}_Syllabus_Outline.pdf`, type: 'Syllabus', size: '1.2 MB' },
        { name: `${code}_Lecture_Slides.pdf`, type: 'Lecture Notes', size: '3.5 MB' }
      ]
    };
  };

  const getInitials = (name?: string) => {
    if (!name) return 'FA';
    const clean = name.replace(/^Prof\.\s*/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Context Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Enrolled Curriculum • Autumn 2026-27
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              My Courses • 1st Year • {currentSemester}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium">
              {programName} • <span className="text-blue-300 font-bold">{section}</span> • Regular Academic Term
            </p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-white">{courses?.length || 0}</span>
              <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Enrolled</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-emerald-300">{totalCredits}</span>
              <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Credits</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-amber-300">100%</span>
              <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search course code, title, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Department:</span>
          <button
            onClick={() => setSelectedDeptFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedDeptFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedDeptFilter === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((c, index) => {
          const details = getCourseDetails(c.code);
          const facultyName = c.faculty_name || 'Course Coordinator TBA';
          const academicYearTag = c.academic_year || '1st Year';
          const semesterTag = c.semester_label || `Semester ${c.semester || 1}`;
          const sectionTag = c.section || 'Section A';
          const deptName = c.department_name || (c.department_code ? `Dept of ${c.department_code}` : 'Engineering Sciences');

          return (
            <div
              key={c.id || c.code}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
            >
              {/* Card Color Accent Header */}
              <div className={`h-2.5 ${
                index % 4 === 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                index % 4 === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                index % 4 === 2 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}></div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-md bg-slate-900 text-white tracking-wider">
                      {c.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                        {academicYearTag} • Sem {c.semester || 1}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 text-[11px] font-black px-2 py-0.5 rounded-full border border-indigo-200">
                        {sectionTag}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors leading-snug mb-2">
                    {c.name}
                  </h3>

                  {/* Department & Credits */}
                  <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-500">
                    <span>🏢 {deptName}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-700">{c.credits || 3} Credits</span>
                  </div>

                  {/* Weekly Conduction & Category */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Category</span>
                      <span className="font-bold text-slate-700">{details.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Teaching Load</span>
                      <span className="font-bold text-blue-600">{details.weeklyHours}</span>
                    </div>
                  </div>

                  {/* Instructor Details */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                      {getInitials(facultyName)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{facultyName}</p>
                      <p className="text-[11px] text-slate-400 font-medium">Assigned Faculty Mentor</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveModalCourse(c);
                      setModalTab('syllabus');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Syllabus
                  </button>
                  <button
                    onClick={() => {
                      setActiveModalCourse(c);
                      setModalTab('materials');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Materials
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl">
              🔍
            </div>
            <p className="font-bold text-slate-700 text-base">No matching enrolled courses found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or department filter</p>
          </div>
        )}
      </div>

      {/* Interactive Course Syllabus & Materials Modal */}
      {activeModalCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded bg-slate-900 text-white">
                    {activeModalCourse.code}
                  </span>
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    1st Year • Sem {activeModalCourse.semester || 1} • Section A
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {activeModalCourse.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Instructor: <span className="text-slate-800 font-bold">{activeModalCourse.faculty_name || 'Course Coordinator TBA'}</span> • {activeModalCourse.department_name || 'CSE'}
                </p>
              </div>
              <button
                onClick={() => setActiveModalCourse(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-100 pt-4 pb-2">
              <button
                onClick={() => setModalTab('syllabus')}
                className={`text-xs font-bold pb-2 transition border-b-2 ${
                  modalTab === 'syllabus'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📖 Course Syllabus & Modules
              </button>
              <button
                onClick={() => setModalTab('materials')}
                className={`text-xs font-bold pb-2 transition border-b-2 ${
                  modalTab === 'materials'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📁 Handouts & Textbooks
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              {modalTab === 'syllabus' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course Objectives</h4>
                    <ul className="space-y-1.5">
                      {getCourseDetails(activeModalCourse.code).objectives.map((obj, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-blue-500 font-bold">✓</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Units & Topics</h4>
                    <div className="space-y-2.5">
                      {getCourseDetails(activeModalCourse.code).units.map((unit, i) => (
                        <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-800">{unit.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{unit.topics}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Curriculum Resource Repository</h4>
                  {getCourseDetails(activeModalCourse.code).materials.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{file.type} • {file.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading verified institutional copy of ${file.name}`)}
                        className="text-xs font-bold bg-white border border-slate-200 group-hover:border-blue-400 group-hover:text-blue-600 px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModalCourse(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
