import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight, 
  FileText,
  Search,
  Wallet,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Mock Data
const currentAidData = [
  { id: 1, name: 'University Merit Scholarship', amount: 5000, type: 'Scholarship', status: 'Active', disbursed: true },
  { id: 2, name: 'State Education Grant', amount: 2500, type: 'Grant', status: 'Active', disbursed: false },
];

const applicationsData = [
  { 
    id: 1, 
    name: 'STEM Future Leaders Fund', 
    dateApplied: 'Sep 10, 2026',
    status: 'review', // 'submitted' | 'review' | 'awarded'
    steps: [
      { id: 'submitted', label: 'Submitted', completed: true },
      { id: 'review', label: 'Under Review', completed: false, current: true },
      { id: 'awarded', label: 'Awarded', completed: false }
    ]
  },
  { 
    id: 2, 
    name: 'Alumni Association Grant', 
    dateApplied: 'Sep 25, 2026',
    status: 'submitted',
    steps: [
      { id: 'submitted', label: 'Submitted', completed: true, current: true },
      { id: 'review', label: 'Under Review', completed: false },
      { id: 'awarded', label: 'Awarded', completed: false }
    ]
  }
];

const availableScholarships = [
  { 
    id: 1, 
    name: 'Global Excellence Award', 
    amount: 10000, 
    deadline: 'Nov 15, 2026', 
    eligibility: ['GPA 3.8+', 'International Student', 'Junior/Senior'],
    matchScore: 95
  },
  { 
    id: 2, 
    name: 'First-Gen Scholars Grant', 
    amount: 3000, 
    deadline: 'Dec 01, 2026', 
    eligibility: ['First-Generation', 'Need-based', 'All majors'],
    matchScore: 82
  },
  { 
    id: 3, 
    name: 'Tech Innovators Scholarship', 
    amount: 5000, 
    deadline: 'Jan 10, 2027', 
    eligibility: ['Computer Science / Engineering', 'Completed sophomore year'],
    matchScore: 78
  },
  { 
    id: 4, 
    name: 'Community Service Fellowship', 
    amount: 1500, 
    deadline: 'Oct 30, 2026', 
    eligibility: ['100+ Volunteer Hours', 'Local resident'],
    matchScore: 60
  }
];

const FinancialAidTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalAid = currentAidData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Aid & Scholarships</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your active aid, track applications, and discover new funding opportunities.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tax Documents
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Apply for Aid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Current Aid & Status Tracker */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* My Current Aid Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 p-4 opacity-10">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-medium text-slate-300 mb-1">Total Active Aid</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">${totalAid.toLocaleString()}</span>
                  <span className="text-sm text-slate-400">/ Academic Year</span>
                </div>
              </div>
            </div>
            
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                {currentAidData.map((aid) => (
                  <div key={aid.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-slate-900">{aid.name}</h4>
                      <span className="text-sm font-bold text-emerald-600">${aid.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {aid.type}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${aid.disbursed ? 'text-slate-500' : 'text-amber-600'}`}>
                        {aid.disbursed ? (
                          <><CheckCircle2 className="w-3 h-3" /> Disbursed</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Pending Disbursement</>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Status Tracker */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Application Status</h3>
            </div>
            <div className="p-5 space-y-6">
              {applicationsData.map((app) => (
                <div key={app.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{app.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Applied: {app.dateApplied}</p>
                    </div>
                  </div>
                  
                  {/* Status Steps */}
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 rounded-full" />
                    <div className="relative flex justify-between">
                      {app.steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center relative z-10 border-2 ${
                            step.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : step.current 
                                ? 'bg-white border-emerald-500 text-emerald-500' 
                                : 'bg-white border-slate-300 text-slate-300'
                          }`}>
                            {step.completed ? <CheckCircle2 className="w-3 h-3" /> : <div className={`w-1.5 h-1.5 rounded-full ${step.current ? 'bg-emerald-500' : 'bg-transparent'}`} />}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-medium absolute -bottom-4 whitespace-nowrap ${
                            step.completed || step.current ? 'text-slate-800' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 text-right">
                    <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Available Scholarships */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Available Scholarships</h3>
                <p className="text-sm text-slate-500">Matches based on your profile.</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search opportunities..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-5 flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableScholarships.map((scholarship) => (
                  <div key={scholarship.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-50 rounded-md">
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            <Sparkles className="w-3 h-3" /> {scholarship.matchScore}% Match
                          </span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">${scholarship.amount.toLocaleString()}</span>
                      </div>
                      
                      <h4 className="text-base font-semibold text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
                        {scholarship.name}
                      </h4>
                      
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1.5 font-medium">Eligibility Criteria:</p>
                        <ul className="space-y-1">
                          {scholarship.eligibility.map((criterion, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                              {criterion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Due {scholarship.deadline}
                      </div>
                      <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Apply <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-center">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                View all scholarships
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialAidTab;
