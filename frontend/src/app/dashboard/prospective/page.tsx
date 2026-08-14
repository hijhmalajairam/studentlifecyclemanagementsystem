'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProspectiveDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Document upload state
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [payingFees, setPayingFees] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Profile
      const profRes = await fetch('http://localhost:8000/api/admission/profiles/my_profile/', {
        credentials: 'include'
      });
      if (profRes.status === 401 || profRes.status === 403) {
        router.push('/login');
        return;
      }
      if (profRes.ok) {
        setProfile(await profRes.json());
      }

      // Fetch Applications
      const appRes = await fetch('http://localhost:8000/api/admission/applications/my_applications/', {
        credentials: 'include'
      });
      if (appRes.ok) {
        const apps = await appRes.json();
        if (apps.length > 0) {
          setApplication(apps[0]); // User's active application
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !application) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('application', application.id);
    formData.append('document_name', docName);
    formData.append('file', docFile);

    try {
      const res = await fetch('http://localhost:8000/api/admission/documents/', {
        credentials: 'include',
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setDocName('');
        setDocFile(null);
        fetchData(); // refresh data
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handlePayFees = async () => {
    if (!application) return;
    setPayingFees(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admission/applications/${application.id}/pay_fees/`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchData(); // Refresh to get ENROLLED status and enrollment_number
      } else {
        alert('Failed to process fee payment.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPayingFees(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const STATUS_STEPS = ['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'FEE_PENDING', 'ENROLLED'];
  const currentStepIndex = application ? STATUS_STEPS.indexOf(application.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.username || 'Student'}!</h1>
            <p className="text-gray-500 mt-1">Application No: {application?.application_number || 'N/A'}</p>
          </div>
          <button onClick={async () => { 
            await fetch('http://localhost:8000/api/users/logout/', { method: 'POST', credentials: 'include' });
            localStorage.clear(); 
            router.push('/login'); 
          }} className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
            Sign Out
          </button>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Application Status</h2>
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
              <div style={{ width: `${Math.max(10, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"></div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 px-2">
              <span className={currentStepIndex >= 1 ? 'text-indigo-600' : ''}>Submitted</span>
              <span className={currentStepIndex >= 2 ? 'text-indigo-600' : ''}>Interview</span>
              <span className={currentStepIndex >= 3 ? 'text-indigo-600' : ''}>Selected</span>
              <span className={currentStepIndex >= 4 ? 'text-indigo-600' : ''}>Fee Pending</span>
              <span className={currentStepIndex >= 5 ? 'text-indigo-600' : ''}>Enrolled</span>
            </div>
          </div>

          {application?.status === 'INTERVIEW_SCHEDULED' && application?.interview_date && (
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-800">Interview Scheduled!</h3>
              <p className="text-blue-700 mt-1">Your interview is scheduled for: <strong>{new Date(application.interview_date).toLocaleString()}</strong></p>
            </div>
          )}

          {application?.status === 'SELECTED' && (
            <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
              <p className="text-green-700 mt-1">You have been selected for admission. Please wait while the admissions office allocates your seat, after which you can pay your fees.</p>
            </div>
          )}
          
          {application?.status === 'FEE_PENDING' && (
            <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-purple-800">Seat Allocated!</h3>
              <p className="text-purple-700 mt-1">
                You have been allocated to <strong>{application.seat_allocation?.allocated_program}</strong> in the <strong>{application.seat_allocation?.allocated_department}</strong> department. 
              </p>
              <button 
                onClick={handlePayFees} 
                disabled={payingFees}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
              >
                {payingFees ? 'Processing...' : 'Pay Fees Now'}
              </button>
            </div>
          )}

          {application?.status === 'ENROLLED' && (
            <div className="mt-8 relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 p-8 rounded-2xl shadow-xl text-white">
              <div className="absolute top-0 right-0 opacity-10">
                <svg className="w-48 h-48 transform translate-x-16 -translate-y-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-3xl font-extrabold mb-2">Welcome to Veritas Grove University!</h3>
              <p className="text-teal-50 text-lg mb-6">Your fees have been received and your enrollment is confirmed.</p>
              
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 inline-block">
                <p className="text-teal-50 text-sm font-semibold uppercase tracking-wider mb-1">Official Enrollment Number</p>
                <p className="text-4xl font-black tracking-tight">{application.enrollment_number}</p>
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Documents</h2>
            {application?.documents?.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-3">
                {application?.documents?.map((doc: any) => (
                  <li key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{doc.document_name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      doc.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                      doc.status === 'FORGED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name (e.g. 12th Marksheet)</label>
                <input type="text" required value={docName} onChange={e => setDocName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF/Image)</label>
                <input type="file" required onChange={e => setDocFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
              <button disabled={uploading} type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center">
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
