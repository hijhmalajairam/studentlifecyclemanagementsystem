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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9FAFB] font-sans selection:bg-indigo-200">
        
        {/* Left Panel (Image) */}
        <div className="flex flex-col w-full h-[180px] lg:h-auto lg:w-[50%] xl:w-[55%] relative overflow-hidden flex-shrink-0">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/campus-bg.jpg')" }}
          ></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0A0F28]/85 via-[#0A0F28]/50 to-transparent"></div>

          <div className="relative z-10 flex flex-col h-full p-6 lg:p-12 xl:p-16">
            <button onClick={() => router.push('/dashboard/prospective/catalog')} className="text-white hover:text-indigo-200 flex items-center text-base font-semibold mb-4 lg:mb-12 transition-colors w-fit">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              Back to Catalog
            </button>
            
            <div className="hidden lg:flex flex-col flex-1 justify-center max-w-sm">
              <h2 className="text-3xl xl:text-4xl font-extrabold mb-2 text-white">Application Form</h2>
              <p className="text-gray-300 font-medium text-sm xl:text-base mb-10">Applying for {programName}</p>

              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="space-y-6 relative">
                  {/* Connector Line */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/10 -z-10"></div>
                  
                  {[
                    { id: 1, name: 'Personal Info' },
                    { id: 2, name: 'Contact Details' },
                    { id: 3, name: 'Parents/Guardian' },
                    { id: 4, name: 'Academic History' }
                  ].map(s => (
                    <div key={s.id} className={`flex items-center space-x-4 ${step === s.id ? 'opacity-100' : 'opacity-75'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 ${step === s.id ? 'bg-white text-slate-900' : (step > s.id ? 'bg-indigo-500 text-white' : 'bg-transparent text-white border-2 border-white/40')}`}>
                        {step > s.id ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> : s.id}
                      </div>
                      <span className="font-semibold tracking-wide text-white">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block mt-auto pt-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">VG</div>
                  <span className="text-white/80 font-medium text-sm tracking-widest uppercase">Begin your engineering journey.</span>
               </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel (Form) */}
        <div className="flex w-full lg:w-[50%] xl:w-[45%] min-w-[320px] sm:min-w-[440px] items-center justify-center p-6 sm:p-12 @container/form">
          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 relative">
            
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-indigo-600 tracking-wider">STEP {step} OF 4</span>
                  <div className="flex gap-1 flex-1 max-w-[100px] ml-2">
                     {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                     ))}
                  </div>
               </div>
               <h3 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
                  {step === 1 && 'Personal Information'}
                  {step === 2 && 'Contact Details'}
                  {step === 3 && 'Parents & Guardian'}
                  {step === 4 && 'Academic History'}
               </h3>
               <p className="text-sm text-gray-500">Please provide your details below.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm border border-red-200 shadow-sm flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </div>
            )}
            
            <form onSubmit={submitApplication}>
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 @[640px]/form:grid-cols-2 gap-5">
                    
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
                      <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    
                    <div className="flex flex-col relative">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
                      <select required value={gender} onChange={e => setGender(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900 appearance-none">
                        <option value="" disabled>Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                      <div className="absolute right-3.5 top-[34px] pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    
                    <div className="flex flex-col relative">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                      <select required value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900 appearance-none">
                        <option value="" disabled>Select category</option>
                        <option value="GEN">General</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                      </select>
                      <div className="absolute right-3.5 top-[34px] pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    
                    <div className="flex flex-col relative">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Blood Group</label>
                      <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900 appearance-none">
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      <div className="absolute right-3.5 top-[34px] pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Nationality <span className="text-red-500">*</span></label>
                      <input type="text" required value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. Indian" className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 @[640px]/form:grid-cols-2 gap-5">
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Student Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" required placeholder="e.g. +91 9876543210" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Permanent Address <span className="text-red-500">*</span></label>
                      <textarea rows={2} required placeholder="Enter full address..." value={permAddress} onChange={e => setPermAddress(e.target.value)} className="rounded-[10px] border border-gray-300 bg-white text-[15px] p-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900 resize-none" />
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Correspondence Address</label>
                      <textarea rows={2} placeholder="Leave blank if same as permanent" value={corrAddress} onChange={e => setCorrAddress(e.target.value)} className="rounded-[10px] border border-gray-300 bg-white text-[15px] p-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900 resize-none" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="City name" value={city} onChange={e => setCity(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="State name" value={state} onChange={e => setState(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="e.g. 110001" value={pincode} onChange={e => setPincode(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 @[640px]/form:grid-cols-2 gap-5">
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Father's Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="Full name" value={fatherName} onChange={e => setFatherName(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Mother's Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="Full name" value={motherName} onChange={e => setMotherName(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Local Guardian Name</label>
                      <input type="text" placeholder="Optional" value={guardianName} onChange={e => setGuardianName(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Guardian Occupation</label>
                      <input type="text" placeholder="Optional" value={guardianOcc} onChange={e => setGuardianOcc(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">Annual Family Income</label>
                      <input type="number" placeholder="e.g. 500000" value={familyIncome} onChange={e => setFamilyIncome(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 @[640px]/form:grid-cols-2 gap-5">
                    
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">10th School Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="Full school name" value={tenthSchool} onChange={e => setTenthSchool(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">10th Board <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="e.g. CBSE, ICSE, State" value={tenthBoard} onChange={e => setTenthBoard(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">10th Percentage <span className="text-red-500">*</span></label>
                      <input type="number" step="0.01" required placeholder="e.g. 85.50" value={tenthPercent} onChange={e => setTenthPercent(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2 mt-2">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">12th / Diploma School Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="Full school name" value={twelfthSchool} onChange={e => setTwelfthSchool(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">12th Board <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="e.g. CBSE, ICSE, State" value={twelfthBoard} onChange={e => setTwelfthBoard(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[14px] font-medium text-gray-700 mb-1.5">12th Percentage <span className="text-red-500">*</span></label>
                      <input type="number" step="0.01" required placeholder="e.g. 92.00" value={twelfthPercent} onChange={e => setTwelfthPercent(e.target.value)} className="h-12 rounded-[10px] border border-gray-300 bg-white text-[15px] px-[14px] focus:outline-none focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/20 text-gray-900" />
                    </div>

                    <div className="flex flex-col @[640px]/form:col-span-2 mt-2">
                      <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-[10px] cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" checked={gapYears} onChange={e => setGapYears(e.target.checked)} className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <span className="text-[15px] font-medium text-gray-700">I have taken one or more gap years</span>
                      </label>
                    </div>
                    <div className="flex flex-col @[640px]/form:col-span-2">
                      <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-[10px] cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" checked={scholarshipReq} onChange={e => setScholarshipReq(e.target.checked)} className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <span className="text-[15px] font-medium text-gray-700">I would like to apply for a scholarship</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <hr className="my-8 border-gray-200" />

              <div className="flex items-center justify-between">
                <div>
                   {step > 1 ? (
                     <button type="button" onClick={prevStep} className="px-5 py-2.5 rounded-[10px] font-medium text-[15px] text-gray-600 hover:bg-gray-100 transition-colors">
                       Back
                     </button>
                   ) : (
                     <button type="button" className="px-5 py-2.5 rounded-[10px] font-medium text-[15px] text-gray-400 hover:text-gray-600 transition-colors">
                       Save draft
                     </button>
                   )}
                </div>
                
                <button type="submit" disabled={submitting} className="px-8 py-[12px] bg-indigo-600 text-white font-medium text-[15px] rounded-[10px] shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-all focus:outline-none focus:ring-[3px] focus:ring-indigo-600/30 flex items-center">
                  {step < 4 ? 'Next Step' : (submitting ? 'Submitting...' : 'Submit Application')}
                  {step < 4 && !submitting && <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
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
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ApplicationFormContent />
    </Suspense>
  );
}
