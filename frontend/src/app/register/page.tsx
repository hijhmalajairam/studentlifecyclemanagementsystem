'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);

  // Step 4: Documents
  const [documents, setDocuments] = useState<File[]>([]);

  // Step 1: Account
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2: Profile
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 3: Academics
  const [prevSchool, setPrevSchool] = useState('');
  const [prevMarks, setPrevMarks] = useState('');
  const [scholarshipReq, setScholarshipReq] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create User
      const userRes = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username, email, password, first_name: firstName, last_name: lastName, role: 'PROSPECTIVE_STUDENT'
        }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.detail || userData.username?.[0] || userData.email?.[0] || 'Registration failed');

      if (userData.user) localStorage.setItem('user', JSON.stringify(userData.user));

      // 2. Create Profile
      const profileRes = await fetch('http://localhost:8000/api/admission/profiles/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          father_name: fatherName, mother_name: motherName, family_income: familyIncome || null, phone, address
        }),
      });
      if (!profileRes.ok) throw new Error('Failed to save profile details');

      // 3. Create Application
      const appRes = await fetch('http://localhost:8000/api/admission/applications/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          entry_type: 'ONLINE',
          previous_school_name: prevSchool,
          previous_marks_percentage: prevMarks || null,
          scholarship_requested: scholarshipReq
        }),
      });
      if (!appRes.ok) throw new Error('Failed to submit application');

      const appData = await appRes.json();
      setApplicationId(appData.id);

      // Move to document upload step
      setStep(4);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      for (const file of documents) {
        const formData = new FormData();
        formData.append('document_name', file.name);
        formData.append('file', file);
        formData.append('application', applicationId!.toString());

        await fetch('http://localhost:8000/api/admission/documents/', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      }
      
      router.push('/dashboard/prospective');
    } catch (err: any) {
      setError('Failed to upload documents. You can try again later in the dashboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 w-full text-white">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">Start Your Journey</h1>
          <p className="text-xl font-light text-indigo-100 max-w-md">
            Join thousands of bright minds shaping the future. Your first step towards excellence begins here.
          </p>
          <div className="mt-12 flex items-center space-x-2">
            <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`h-2 w-8 rounded-full ${step >= 4 ? 'bg-white' : 'bg-white/30'}`}></div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-24 bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] z-20 rounded-l-3xl -ml-6 border-l border-gray-100">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h2>
            <p className="text-gray-500">
              {step === 1 && "Let's start with your basic details."}
              {step === 2 && "Tell us a bit about your background."}
              {step === 3 && "Next, your academic history."}
              {step === 4 && "Finally, upload your supporting documents."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : step === 4 ? handleDocumentSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            
            {/* STEP 1: Account */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="johndoe123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="••••••••" />
                </div>
              </div>
            )}

            {/* STEP 2: Profile */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                    <input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                    <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Family Income ($)</label>
                  <input type="number" step="0.01" value={familyIncome} onChange={e => setFamilyIncome(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
                  <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none resize-none" placeholder="123 Main St, City, Country"></textarea>
                </div>
              </div>
            )}

            {/* STEP 3: Academics */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous School / College Name *</label>
                  <input type="text" required value={prevSchool} onChange={e => setPrevSchool(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="Springfield High School" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Marks Percentage (%) *</label>
                  <input type="number" step="0.01" max="100" min="0" required value={prevMarks} onChange={e => setPrevMarks(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" placeholder="85.50" />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center h-5">
                      <input type="checkbox" checked={scholarshipReq} onChange={e => setScholarshipReq(e.target.checked)} className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">Apply for Scholarship</span>
                      <span className="block text-xs text-gray-500 mt-1">Check this if you want to be considered for financial aid based on merit or need.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: Documents */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
                  <p className="text-sm text-indigo-800">
                    Your application has been created! To expedite the verification process, please upload your 10th/12th marksheets, ID proof, or any other required documents now.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                    <input 
                      type="file" 
                      multiple 
                      onChange={e => {
                        if (e.target.files) {
                          setDocuments(Array.from(e.target.files));
                        }
                      }}
                      className="hidden" 
                      id="doc-upload" 
                    />
                    <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
                      <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Browse files</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</span>
                    </label>
                  </div>
                  
                  {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {documents.map((doc, idx) => (
                          <li key={idx} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"></path></svg>
                            <span>{doc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6">
              {step > 1 ? (
                <button type="button" onClick={handlePrev} className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                  Back
                </button>
              ) : (
                <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Already have an account? Log in
                </Link>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="ml-auto px-8 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex items-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : step === 3 ? 'Save & Continue' : step === 4 ? (documents.length > 0 ? 'Upload & Finish' : 'Skip & Finish') : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
