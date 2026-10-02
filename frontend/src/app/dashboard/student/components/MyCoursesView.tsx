import React from 'react';

interface MyCoursesViewProps {
  courses: any[];
}

export default function MyCoursesView({ courses }: MyCoursesViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-xl shadow-sm">
        <h2 className="font-bold text-slate-800 text-lg">My Enrolled Courses</h2>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-md">{courses?.length || 0} Courses</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses || []).map((c: any, index: number) => (
          <div key={c.id || index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition">
            <div className={`h-2 ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-slate-400 text-sm">{c.code}</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">Section A</span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4">{c.name}</h3>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  Course Coordinator TBA
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  {c.credits} Credits
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 p-3 bg-slate-50 flex justify-end space-x-2">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">Syllabus</button>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">Materials</button>
            </div>
          </div>
        ))}
        {(!courses || courses.length === 0) && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No courses enrolled for the current semester.
          </div>
        )}
      </div>
    </div>
  );
}
