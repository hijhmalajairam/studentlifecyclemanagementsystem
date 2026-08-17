'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Program {
  id: number;
  name: string;
  code: string;
  department_name: string;
  duration_years: number;
  description: string;
}

export default function ProgramCatalog() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/academics/programs/')
      .then(res => res.json())
      .then(data => {
        setPrograms(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleApplyClick = (programId: number) => {
    router.push(`/dashboard/prospective/apply?programId=${programId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans selection:bg-indigo-200">
      <div className="bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-sm font-semibold tracking-wider mb-6 backdrop-blur-md">
              ADMISSIONS OPEN 2024
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Discover Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Future Program</span>
            </h1>
            <p className="text-xl text-indigo-200 font-light max-w-2xl leading-relaxed">
              Explore our world-class departments and choose the program that aligns with your passion. Start your application process today.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120H1440V0C1440 0 1140 120 720 120C300 120 0 0 0 0V120Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Available Programs</h2>
            <p className="text-slate-500 mt-2">Select a program to begin your application</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div key={program.id} className="group relative bg-white rounded-3xl p-1 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full">
              <div className="p-8 flex-grow flex flex-col">
                
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase line-clamp-1">{program.department_name}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors line-clamp-2">
                  {program.name}
                </h3>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {program.duration_years} Years
                  </span>
                  <span className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                    {program.code}
                  </span>
                </div>
                
                <p className="text-slate-500 leading-relaxed mb-8 flex-grow line-clamp-3">
                  {program.description || "An intensive curriculum designed to equip you with the skills and knowledge required for a successful career in this field."}
                </p>
                
                <button 
                  onClick={() => handleApplyClick(program.id)}
                  className="w-full mt-auto py-4 rounded-2xl bg-indigo-50 text-indigo-700 font-semibold text-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300"
                >
                  Apply Now
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
