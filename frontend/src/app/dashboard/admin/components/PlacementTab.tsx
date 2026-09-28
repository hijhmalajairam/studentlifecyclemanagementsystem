import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Award, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Sparkles,
  ChevronRight,
  Download
} from 'lucide-react';

// Mock Data
const stats = [
  { label: 'Total Active Drives', value: '24', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Highest Package', value: '45.5 LPA', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Average Package', value: '12.4 LPA', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { label: 'Students Placed', value: '68%', icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
];

const companyDrives = [
  {
    id: 1,
    company: 'TechCorp Innovators',
    role: 'Software Development Engineer',
    package: '18.0 LPA',
    eligibility: 'B.Tech CSE/IT, CGPA 8.0+',
    status: 'Ongoing',
    applicants: 245
  },
  {
    id: 2,
    company: 'Global Finance Solutions',
    role: 'Data Analyst',
    package: '14.5 LPA',
    eligibility: 'All Branches, CGPA 7.5+',
    status: 'Upcoming',
    applicants: 120
  },
  {
    id: 3,
    company: 'CloudScale Systems',
    role: 'Cloud Architect',
    package: '24.0 LPA',
    eligibility: 'B.Tech CSE, CGPA 8.5+',
    status: 'Ongoing',
    applicants: 85
  },
  {
    id: 4,
    company: 'Quantum Dynamics',
    role: 'Research Engineer',
    package: '32.0 LPA',
    eligibility: 'M.Tech/Ph.D, CGPA 9.0+',
    status: 'Closed',
    applicants: 42
  }
];

const studentReadiness = [
  {
    id: 'STU001',
    name: 'Aisha Sharma',
    course: 'B.Tech CSE - 4th Year',
    matchScore: 94,
    skillGaps: ['System Design', 'Go'],
    status: 'Highly Ready'
  },
  {
    id: 'STU002',
    name: 'Rahul Verma',
    course: 'B.Tech IT - 4th Year',
    matchScore: 82,
    skillGaps: ['Advanced React', 'GraphQL'],
    status: 'Ready'
  },
  {
    id: 'STU003',
    name: 'Priya Patel',
    course: 'B.Tech ECE - 4th Year',
    matchScore: 65,
    skillGaps: ['Data Structures', 'Python Basics'],
    status: 'Needs Prep'
  },
  {
    id: 'STU004',
    name: 'Karan Singh',
    course: 'B.Tech CSE - 4th Year',
    matchScore: 88,
    skillGaps: ['Cloud Architecture (AWS)'],
    status: 'Ready'
  }
];

const PlacementTab = () => {
  const [driveSearch, setDriveSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Placement Administration</h1>
          <p className="text-slate-500 mt-1">Manage company drives, monitor student readiness, and track placement metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Reports
          </button>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            New Drive
          </button>
        </div>
      </div>

      {/* Top Recruiter Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Company Drives Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Company Drives</h2>
              <p className="text-sm text-slate-500 mt-1">Ongoing and upcoming recruitment drives.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search companies..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent w-full sm:w-64 bg-slate-50"
                value={driveSearch}
                onChange={(e) => setDriveSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company & Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Package & Eligibility</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyDrives.map((drive) => (
                  <tr key={drive.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{drive.company}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{drive.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{drive.package}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{drive.eligibility}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        drive.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' : 
                        drive.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {drive.status === 'Ongoing' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {drive.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-1.5">{drive.applicants} applicants</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-center mt-auto">
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View all drives <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student Readiness Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Student Readiness
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Identify skill gaps and placement probability.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-48 bg-slate-50"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Match & Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identified Skill Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentReadiness.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{student.id} • {student.course}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full rounded-full ${
                              student.matchScore >= 90 ? 'bg-emerald-500' : 
                              student.matchScore >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${student.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{student.matchScore}%</span>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        student.status === 'Highly Ready' ? 'text-emerald-600' : 
                        student.status === 'Ready' ? 'text-indigo-600' : 'text-amber-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.skillGaps.map((gap, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-center mt-auto">
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View all students <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlacementTab;
