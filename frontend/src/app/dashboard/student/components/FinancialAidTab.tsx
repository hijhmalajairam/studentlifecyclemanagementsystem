'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText,
  Search,
  Wallet,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CreditCard,
  TrendingDown,
  ShieldCheck,
  Receipt,
  X,
  AlertCircle
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface FinancialAidTabProps {
  user?: any;
  enrollment?: any;
  onNavigate?: (tab: string) => void;
}

const AVAILABLE_SCHOLARSHIPS = [
  { 
    id: 'merit', 
    name: 'Dean’s Academic Merit Scholarship', 
    benefit: '25% Tuition Waiver', 
    concessionPercent: 25,
    deadline: 'Nov 30, 2026', 
    eligibility: ['Minimum 8.5 CGPA or 85%+ in Higher Secondary', 'Clean disciplinary record', 'Full-time enrolled student'],
    category: 'Merit-Based',
    matchScore: 95
  },
  { 
    id: 'ews', 
    name: 'EWS Need-Based Financial Aid', 
    benefit: 'Up to 50% Tuition Relief', 
    concessionPercent: 50,
    deadline: 'Dec 15, 2026', 
    eligibility: ['Annual family income below ₹3,50,000', 'Income certificate from competent authority', 'All degree programs'],
    category: 'Need-Based',
    matchScore: 88
  },
  { 
    id: 'sports', 
    name: 'Sports & Cultural Excellence Grant', 
    benefit: '20% Tuition Waiver', 
    concessionPercent: 20,
    deadline: 'Jan 10, 2027', 
    eligibility: ['Representation at State/National/AIU level', 'Active university team participation', 'Passing all registered credits'],
    category: 'Talent & Athletics',
    matchScore: 75
  },
  { 
    id: 'women-stem', 
    name: 'Women in STEM Leadership Concession', 
    benefit: '15% Concession + Mentorship', 
    concessionPercent: 15,
    deadline: 'Jan 30, 2027', 
    eligibility: ['Female scholar enrolled in Engineering / CS', 'Completion of first semester with 7.5+ CGPA'],
    category: 'Diversity & Equity',
    matchScore: 82
  }
];

export default function FinancialAidTab({ user, enrollment, onNavigate }: FinancialAidTabProps) {
  const [scholarship, setScholarship] = useState<any | null>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [applyForm, setApplyForm] = useState({
    schemeName: 'Dean’s Academic Merit Scholarship',
    reason: '',
    annualIncome: '',
    cgpa: '',
    agreeTerms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [schData, feeData] = await Promise.all([
        fetchAPI('/admission/scholarships/my_scholarship/').catch(() => null),
        fetchAPI('/academics/fees/my_fees/').catch(() => [])
      ]);

      if (schData && !schData.detail && schData.id) {
        setScholarship(schData);
      } else {
        setScholarship(null);
      }

      const feeList = Array.isArray(feeData) ? feeData : (feeData?.results || []);
      setFees(feeList);
    } catch (err) {
      console.error('Failed to load financial aid data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Compute live financial totals from fees
  const totalTuitionInvoiced = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const totalConcessionSaved = fees.reduce((sum, f) => {
    const amt = parseFloat(f.amount || 0);
    const disc = parseFloat(f.scholarship_discount || 0);
    return sum + (amt * (disc / 100));
  }, 0);
  const netTuitionPayable = fees.reduce((sum, f) => {
    const net = f.net_amount !== undefined 
      ? (typeof f.net_amount === 'function' ? f.net_amount() : f.net_amount)
      : (parseFloat(f.amount) * (1 - (parseFloat(f.scholarship_discount || 0) / 100)));
    return sum + Number(net);
  }, 0);

  const activeConcessionPercent = scholarship?.concession_percentage 
    ? parseFloat(scholarship.concession_percentage) 
    : (fees.find(f => parseFloat(f.scholarship_discount || 0) > 0)?.scholarship_discount || 0);

  const handleOpenApply = (scheme?: any) => {
    if (scheme) {
      setSelectedScheme(scheme);
      setApplyForm(prev => ({ ...prev, schemeName: scheme.name }));
    } else {
      setSelectedScheme(AVAILABLE_SCHOLARSHIPS[0]);
      setApplyForm(prev => ({ ...prev, schemeName: AVAILABLE_SCHOLARSHIPS[0].name }));
    }
    setSubmitSuccess(null);
    setSubmitError(null);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.agreeTerms) {
      setSubmitError('Please certify that your application details are true and correct.');
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      const justification = `[${applyForm.schemeName}] ${applyForm.reason.trim()} ${
        applyForm.cgpa ? `| Current CGPA: ${applyForm.cgpa}` : ''
      } ${applyForm.annualIncome ? `| Reported Annual Income: ₹${applyForm.annualIncome}` : ''}`;

      const res = await fetchAPI('/admission/scholarships/', {
        method: 'POST',
        body: JSON.stringify({
          reason: justification
        })
      });

      if (res) {
        setSubmitSuccess('Your scholarship and financial aid request has been submitted for Academic Committee review.');
        await loadFinancialData();
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setSubmitSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      console.error('Scholarship application error:', err);
      setSubmitError(err?.message || 'Failed to submit financial aid application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSchemes = AVAILABLE_SCHOLARSHIPS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.eligibility.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans text-slate-900">
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Aid & Fee Concessions</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track your institutional fee concessions, verify active tuition waivers, and apply for grant assistance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {onNavigate && (
            <button 
              onClick={() => onNavigate('fees_billing')}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Fees & Billing Ledger</span>
            </button>
          )}
          <button 
            onClick={() => handleOpenApply()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply for Aid</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Concession Saved</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ₹{totalConcessionSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              Deducted across {fees.filter(f => parseFloat(f.scholarship_discount || 0) > 0).length} semester bills
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Concession Rate</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {Number(activeConcessionPercent) > 0 ? `${activeConcessionPercent}% Concession` : 'Standard Rate'}
            </h3>
            <div className="mt-1">
              {scholarship?.status === 'APPROVED' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Approved & Active
                </span>
              ) : scholarship?.status === 'APPLIED' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3 mr-1" /> Under Committee Review
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">No active waiver assigned</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Tuition Payable</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ₹{netTuitionPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Original Invoiced: ₹{totalTuitionInvoiced.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
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
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Active Concession
                </span>
                <h3 className="text-xl font-black text-white">
                  {scholarship ? `${scholarship.concession_percentage}% Tuition Waiver` : 'Institutional Aid'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {scholarship?.reason || 'No approved concession linked to this student ID yet.'}
                </p>
                {enrollment && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Enrollment ID:</span>
                    <span className="font-mono font-bold text-indigo-300">{enrollment.enrollment_number}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Disbursement Method:</span>
                <span className="font-semibold text-slate-800">Auto-Deduction on Fees</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Concession Category:</span>
                <span className="font-semibold text-indigo-600">Institutional Scholarship</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Verification Status:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  scholarship?.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {scholarship?.status === 'APPROVED' ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Verified & Applied</>
                  ) : (
                    <><Clock className="w-3.5 h-3.5" /> Pending Review</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Application Status Tracker */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1">Application Lifecycle</h3>
            <p className="text-xs text-slate-500 mb-6">Review stages for institutional aid requests</p>
            
            <div className="space-y-6">
              <div className="relative pl-6 pb-6 border-l-2 border-emerald-500 last:border-l-0 last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Application Submitted</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {scholarship?.application_number ? `App #${scholarship.application_number}` : 'Admission Enrollment Portal'}
                  </p>
                </div>
              </div>

              <div className={`relative pl-6 pb-6 border-l-2 last:border-l-0 last:pb-0 ${
                scholarship?.status === 'APPROVED' ? 'border-emerald-500' : 'border-slate-200'
              }`}>
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  scholarship?.status === 'APPROVED'
                    ? 'bg-emerald-500 text-white'
                    : scholarship?.status === 'APPLIED'
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {scholarship?.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Document Verification & Merit Review</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {scholarship?.status === 'APPROVED' ? 'Verified by Academic Committee' : 'Under evaluation by Dean/Accounts Office'}
                  </p>
                </div>
              </div>

              <div className="relative pl-6">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  scholarship?.status === 'APPROVED'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {scholarship?.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Concession Assigned to Fees</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {scholarship?.status === 'APPROVED' 
                      ? `${scholarship.concession_percentage}% concession active on fee schedule`
                      : 'Pending award notification'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Need to modify details?</span>
              <button 
                onClick={() => handleOpenApply()}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Submit New Request
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Fee Concession Ledger & Available Scholarships */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real Fee Concession Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Semester Fee Concession Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500">Live reflection of your scholarship discount across semester invoices</p>
              </div>
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('fees_billing')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Pay or View Receipts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs">Loading concession ledger...</p>
              </div>
            ) : fees.length === 0 ? (
              <div className="p-8 text-center">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Semester Fees Issued Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Once your semester fee invoices are generated by the admin, scholarship concessions will be deducted here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8f9fa] text-slate-500 uppercase border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-5 py-3">Semester</th>
                      <th className="px-5 py-3">Tuition Bill</th>
                      <th className="px-5 py-3">Concession %</th>
                      <th className="px-5 py-3 text-emerald-700">Saved Amount</th>
                      <th className="px-5 py-3">Net Payable</th>
                      <th className="px-5 py-3 text-center">Billing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {fees.map((fee) => {
                      const tuition = parseFloat(fee.amount || 0);
                      const discount = parseFloat(fee.scholarship_discount || 0);
                      const saved = tuition * (discount / 100);
                      const net = fee.net_amount !== undefined 
                        ? (typeof fee.net_amount === 'function' ? fee.net_amount() : fee.net_amount)
                        : (tuition - saved);

                      return (
                        <tr key={fee.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 font-bold text-slate-800">
                            Semester {fee.semester}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-600">
                            ₹{tuition.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5">
                            {discount > 0 ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 text-[11px]">
                                {discount}% Concession
                              </span>
                            ) : (
                              <span className="text-slate-400">0% (None)</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">
                            -₹{saved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-black text-slate-900">
                            ₹{Number(net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              fee.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {fee.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Available Institutional Scholarships */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Available University Schemes</h3>
                <p className="text-xs text-slate-500">Apply for merit grants, EWS relief, or athletics assistance</p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search scholarship schemes..." 
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-56"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-5 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSchemes.map((scheme) => (
                  <div 
                    key={scheme.id} 
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          <Sparkles className="w-3 h-3" /> {scheme.matchScore}% Match
                        </span>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {scheme.benefit}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                        {scheme.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-400 mb-2">{scheme.category}</p>
                      
                      <div className="space-y-1 mb-4">
                        {scheme.eligibility.map((criterion, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                            <span>{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Due {scheme.deadline}
                      </span>
                      <button 
                        onClick={() => handleOpenApply(scheme)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        Apply <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Institutional Aid Application
                </span>
                <h3 className="text-lg font-bold text-white">Apply for Financial Aid & Concession</h3>
              </div>
              <button 
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto space-y-4">
              
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Scholarship / Concession Scheme
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={applyForm.schemeName}
                  onChange={(e) => setApplyForm({ ...applyForm, schemeName: e.target.value })}
                >
                  {AVAILABLE_SCHOLARSHIPS.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.benefit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Current CGPA / Percentage
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 8.75 or 88%" 
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={applyForm.cgpa}
                    onChange={(e) => setApplyForm({ ...applyForm, cgpa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Annual Family Income (₹)
                  </label>
                  <input 
                    type="number" 
                    placeholder="e.g. 250000" 
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={applyForm.annualIncome}
                    onChange={(e) => setApplyForm({ ...applyForm, annualIncome: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Statement of Justification / Need *
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Detail your academic milestones, financial circumstances, or athletic achievements..." 
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-2.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    required
                    checked={applyForm.agreeTerms}
                    onChange={(e) => setApplyForm({ ...applyForm, agreeTerms: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500" 
                  />
                  <span className="text-[11px] text-slate-500 leading-tight">
                    I certify that all statements submitted are accurate. I understand that approved concessions are automatically adjusted against semester tuition fees.
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm shadow-emerald-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit Aid Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
