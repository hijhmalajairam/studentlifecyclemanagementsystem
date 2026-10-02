'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchProfile = async () => {
  const res = await fetch('http://localhost:8000/api/admission/profiles/my_profile/', { credentials: 'include' });
  if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

const fetchApplications = async () => {
  const res = await fetch('http://localhost:8000/api/admission/applications/my_applications/', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
};

export default function ProspectiveDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Document upload state
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const { data: apps, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
    enabled: !!profile,
  });

  if (profileError) {
    router.push('/login');
    return null;
  }

  const application = apps && apps.length > 0 ? apps[0] : null;

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('http://localhost:8000/api/admission/documents/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: () => {
      setDocName('');
      setDocFile(null);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: () => {
      alert('Upload failed');
    }
  });

  const payFeesMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await fetch(`http://localhost:8000/api/admission/applications/${appId}/pay_fees/`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Payment failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: () => {
      alert('Failed to process fee payment.');
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !application) return;
    const formData = new FormData();
    formData.append('application', application.id);
    formData.append('document_name', docName);
    formData.append('file', docFile);
    uploadMutation.mutate(formData);
  };

  if (profileLoading || appsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const STATUS_STEPS = ['DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'FEE_PENDING', 'ENROLLED'];
  const currentStepIndex = application ? STATUS_STEPS.indexOf(application.status) : 0;

  if (!application) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-indigo-600 p-8 flex flex-col items-center justify-center text-white text-center">
            <svg className="w-20 h-20 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            <h2 className="text-2xl font-bold tracking-tight">Begin Your Journey</h2>
          </div>
          <div className="w-full md:w-2/3 p-10 lg:p-14 text-center md:text-left flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Welcome to Veritas Grove!</h1>
            <p className="text-slate-500 mb-8 text-lg leading-relaxed">
              You haven't started an application yet. Explore our world-class programs and take the first step towards your future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => router.push('/dashboard/prospective/apply')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all font-semibold"
              >
                Start Your Application
              </button>
              <button 
                onClick={() => router.push('/dashboard/prospective/catalog')}
                className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 hover:-translate-y-0.5 transition-all font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.user?.first_name || profile?.user?.username || 'Student'}!</h1>
            <p className="text-gray-500 mt-1">Application No: {application?.application_number || 'N/A'}</p>
          </div>
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
                onClick={() => payFeesMutation.mutate(application.id)} 
                disabled={payFeesMutation.isPending}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
              >
                {payFeesMutation.isPending ? 'Processing...' : 'Pay Fees Now'}
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
              <button disabled={uploadMutation.isPending} type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center">
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
