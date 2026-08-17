'use client';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ApplicationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programIdParam = searchParams.get('programId');
  const selectedProgram = programIdParam ? parseInt(programIdParam) : null;
  
  const [programName, setProgramName] = useState('Selected Program');
  const [loading, setLoading] = useState(true);
  
  // Application form state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Personal Details
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('M');
  const [category, setCategory] = useState('GEN');
  const [bloodGroup, setBloodGroup] = useState('');
  const [nationality, setNationality] = useState('Indian');

  // Step 2: Contact
  const [phone, setPhone] = useState('');
  const [permAddress, setPermAddress] = useState('');
  const [corrAddress, setCorrAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 3: Parents
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianOcc, setGuardianOcc] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');

  // Step 4: Academics
  const [tenthSchool, setTenthSchool] = useState('');
  const [tenthBoard, setTenthBoard] = useState('');
  const [tenthYear, setTenthYear] = useState('');
  const [tenthPercent, setTenthPercent] = useState('');
  const [twelfthSchool, setTwelfthSchool] = useState('');
  const [twelfthBoard, setTwelfthBoard] = useState('');
  const [twelfthYear, setTwelfthYear] = useState('');
  const [twelfthPercent, setTwelfthPercent] = useState('');
  const [extraCurr, setExtraCurr] = useState('');
  const [gapYears, setGapYears] = useState(false);
  const [scholarshipReq, setScholarshipReq] = useState(false);

  useEffect(() => {
    if (!selectedProgram) {
      router.push('/dashboard/prospective/catalog');
      return;
    }

    fetch('http://localhost:8000/api/academics/programs/')
      .then(res => res.json())
      .then(data => {
        const programs = Array.isArray(data) ? data : data.results || [];
        const prog = programs.find((p: any) => p.id === selectedProgram);
        if (prog) setProgramName(prog.name);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedProgram, router]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      // 1. Create Profile
      const profileRes = await fetch('http://localhost:8000/api/admission/profiles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date_of_birth: dob, gender, category, blood_group: bloodGroup, nationality,
          phone, permanent_address: permAddress, correspondence_address: corrAddress,
          city, state, pincode,
          father_name: fatherName, mother_name: motherName,
          guardian_name: guardianName, guardian_occupation: guardianOcc,
          family_income: familyIncome || null
        }),
      });
      
      // 2. Create Application
      const appRes = await fetch('http://localhost:8000/api/admission/applications/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          program: selectedProgram,
          entry_type: 'ONLINE',
          tenth_school_name: tenthSchool,
          tenth_board: tenthBoard,
          tenth_passing_year: tenthYear || null,
          tenth_percentage: tenthPercent || null,
          twelfth_school_name: twelfthSchool,
          twelfth_board: twelfthBoard,
          twelfth_passing_year: twelfthYear || null,
          twelfth_percentage: twelfthPercent || null,
          extra_curricular_achievements: extraCurr,
          any_gap_years: gapYears,
          scholarship_requested: scholarshipReq,
          status: 'SUBMITTED'
        }),
      });
      
      if (!appRes.ok) {
        const errorData = await appRes.json();
        throw new Error(JSON.stringify(errorData) || 'Failed to submit application');
      }

      router.push('/dashboard/prospective');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-6 sm:p-12 font-sans selection:bg-indigo-200">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Sidebar Tracker */}
        <div className="w-full md:w-1/3 bg-indigo-900 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <button onClick={() => router.push('/dashboard/prospective/catalog')} className="relative z-10 text-indigo-200 hover:text-white flex items-center text-sm font-medium mb-8 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Catalog
          </button>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Application Form</h2>
            <p className="text-indigo-200 text-sm mb-12">Applying for {programName}</p>

            <div className="space-y-6">
              {[
                { id: 1, name: 'Personal Info' },
                { id: 2, name: 'Contact Details' },
                { id: 3, name: 'Parents/Guardian' },
                { id: 4, name: 'Academic History' }
              ].map(s => (
                <div key={s.id} className={`flex items-center space-x-4 ${step === s.id ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s.id ? 'bg-white text-indigo-900' : 'bg-indigo-800 text-white border border-indigo-700'}`}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className="font-medium tracking-wide">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Form Area */}
        <div className="w-full md:w-2/3 p-8 lg:p-12 bg-white relative">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm border-l-4 border-red-500 shadow-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={submitApplication}>
            
            {/* STEP 1: Personal */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none">
                      <option value="GEN">General</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                    <input type="text" placeholder="e.g. O+" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                    <input type="text" required value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Contact */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Student Phone Number</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Address</label>
                    <textarea rows={2} required value={permAddress} onChange={e => setPermAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correspondence Address</label>
                    <textarea rows={2} value={corrAddress} onChange={e => setCorrAddress(e.target.value)} placeholder="Leave blank if same as permanent" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input type="text" required value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input type="text" required value={pincode} onChange={e => setPincode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Parents */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Parent/Guardian Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                    <input type="text" required value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label>
                    <input type="text" required value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Name</label>
                    <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="If applicable" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Occupation</label>
                    <input type="text" value={guardianOcc} onChange={e => setGuardianOcc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Annual Family Income (₹)</label>
                    <input type="number" required value={familyIncome} onChange={e => setFamilyIncome(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Academics */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Academic History</h3>
                
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">10th Standard</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">School Name</label>
                      <input type="text" required value={tenthSchool} onChange={e => setTenthSchool(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Board</label>
                      <input type="text" required value={tenthBoard} onChange={e => setTenthBoard(e.target.value)} placeholder="CBSE/ICSE/State" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Passing Year</label>
                      <input type="number" required value={tenthYear} onChange={e => setTenthYear(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Percentage (%)</label>
                      <input type="number" step="0.01" required value={tenthPercent} onChange={e => setTenthPercent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">12th Standard / Diploma</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">School/College Name</label>
                      <input type="text" required value={twelfthSchool} onChange={e => setTwelfthSchool(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Board / University</label>
                      <input type="text" required value={twelfthBoard} onChange={e => setTwelfthBoard(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Passing Year</label>
                      <input type="number" required value={twelfthYear} onChange={e => setTwelfthYear(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Percentage (%)</label>
                      <input type="number" step="0.01" required value={twelfthPercent} onChange={e => setTwelfthPercent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Extra-Curricular Achievements</label>
                  <textarea rows={3} value={extraCurr} onChange={e => setExtraCurr(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={gapYears} onChange={e => setGapYears(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm font-medium text-slate-700">Any Gap Years?</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={scholarshipReq} onChange={e => setScholarshipReq(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm font-medium text-slate-700">Apply for Scholarship</span>
                  </label>
                </div>

              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex justify-between border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  Back
                </button>
              ) : <div></div>}
              
              <button type="submit" disabled={submitting} className="px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center">
                {step < 4 ? 'Next Step' : (submitting ? 'Submitting...' : 'Submit Application')}
                {step < 4 && !submitting && <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationForm() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ApplicationFormContent />
    </Suspense>
  );
}
