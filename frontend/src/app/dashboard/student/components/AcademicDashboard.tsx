'use client';
import { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function AcademicDashboard({ results, attendance }: { results: any[], attendance: any[] }) {
  const [activeTab, setActiveTab] = useState('sgpa_cgpa');

  // Dummy data for charts since some endpoints might not have this detailed data yet
  const componentMarksData = [
    { subject: 'DBMS', mid1: 18, mid2: 22, assignment: 9, quiz: 4 },
    { subject: 'OS', mid1: 15, mid2: 20, assignment: 8, quiz: 5 },
    { subject: 'CN', mid1: 21, mid2: 19, assignment: 10, quiz: 4 },
    { subject: 'DSA', mid1: 24, mid2: 23, assignment: 10, quiz: 5 },
    { subject: 'SE', mid1: 19, mid2: 21, assignment: 9, quiz: 4 },
  ];

  const coAttainmentData = [
    { subject: 'CO1', A: 80, fullMark: 100 },
    { subject: 'CO2', A: 75, fullMark: 100 },
    { subject: 'CO3', A: 90, fullMark: 100 },
    { subject: 'CO4', A: 65, fullMark: 100 },
    { subject: 'CO5', A: 85, fullMark: 100 },
    { subject: 'CO6', A: 70, fullMark: 100 },
  ];

  const attendanceData = [
    { name: 'Present', value: 85, color: '#10b981' }, // emerald-500
    { name: 'Absent', value: 15, color: '#ef4444' }, // red-500
  ];

  const sgpaCgpaData = [
    { semester: 'Sem 1', sgpa: 8.5, cgpa: 8.5 },
    { semester: 'Sem 2', sgpa: 8.2, cgpa: 8.35 },
    { semester: 'Sem 3', sgpa: 9.0, cgpa: 8.56 },
    { semester: 'Sem 4', sgpa: 8.8, cgpa: 8.62 },
    { semester: 'Sem 5', sgpa: 9.2, cgpa: 8.74 },
  ];

  // Calculations from real data (if available)
  const currentSgpa = sgpaCgpaData[sgpaCgpaData.length - 1].sgpa;
  const currentCgpa = sgpaCgpaData[sgpaCgpaData.length - 1].cgpa;
  
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SGPA</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">{currentSgpa.toFixed(2)}</h3>
          <p className="text-sm font-semibold text-emerald-600 mt-1">CGPA: {currentCgpa.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credits Earned</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">112</h3>
          <p className="text-sm font-semibold text-blue-600 mt-1">Cumulative</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Risk</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">1</h3>
          <p className="text-sm font-semibold text-amber-600 mt-1">Courses &lt; 75%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">COs Below Target</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">0</h3>
          <p className="text-sm font-semibold text-emerald-600 mt-1">All targets met</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center shadow-sm">
        <div className="bg-amber-100 text-amber-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div className="flex-1">
          <p className="text-amber-800 font-medium text-sm">1 course with attendance below 75% — CT eligibility at risk.</p>
        </div>
        <button className="text-amber-700 font-bold text-sm bg-amber-200 hover:bg-amber-300 px-4 py-1.5 rounded-lg transition-colors">
          View details
        </button>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {[
            { id: 'sgpa_cgpa', label: 'SGPA / CGPA' },
            { id: 'component_marks', label: 'Component Marks' },
            { id: 'co_attainment', label: 'CO Attainment' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'performance', label: 'Performance Trend' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'sgpa_cgpa' && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sgpaCgpaData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="semester" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="sgpa" name="SGPA" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Line type="monotone" dataKey="cgpa" name="CGPA" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'component_marks' && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={componentMarksData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="mid1" name="Mid Term 1" stackId="a" fill="#60a5fa" />
                  <Bar dataKey="mid2" name="Mid Term 2" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="assignment" name="Assignment" stackId="a" fill="#818cf8" />
                  <Bar dataKey="quiz" name="Quiz" stackId="a" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'co_attainment' && (
            <div className="h-80 w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={coAttainmentData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Radar name="Attainment %" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="h-80 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Percentage']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-[-40px]">
                <span className="text-4xl font-black text-emerald-500">85%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Overall</span>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sgpaCgpaData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="semester" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="sgpa" name="SGPA" stroke="#3b82f6" strokeWidth={3} dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
