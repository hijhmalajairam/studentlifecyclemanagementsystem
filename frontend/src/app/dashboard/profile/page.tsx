'use client';
import { useEffect, useState, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { 
  Camera, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Building, 
  Lock, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});
type ContactFormValues = z.infer<typeof contactSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUserRole(u.role);
    }
  }, []);

  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchAPI('/users/profile/'),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => fetchAPI('/academics/student-profiles/my_profile/'),
    enabled: userRole === 'STUDENT',
  });

  const { data: facultyProfile } = useQuery({
    queryKey: ['facultyProfile'],
    queryFn: () => fetchAPI('/academics/faculty/my_profile/'),
    enabled: userRole === 'FACULTY',
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    values: {
      phone: profile?.phone || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContactFormValues) => fetchAPI('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
      }
    },
  });

  const handleSave = (data: ContactFormValues) => {
    updateMutation.mutate(data);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMessage('Photo upload simulated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase();
  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-300 font-sans">
      
      {/* Success Notification */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-center shadow-sm">
          <p className="text-sm font-medium text-emerald-800">{message}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Subtle decorative top border */}
        <div className="h-2 bg-slate-900 w-full"></div>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-semibold text-slate-600 shadow-sm overflow-hidden">
                {initials}
                
                {/* Hover Overlay */}
                <div 
                  onClick={handlePhotoClick}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Basic Info */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center">
                {profile.email || profile.username}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {profile.role?.replace('_', ' ')}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Active Account
                </span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0">
             <button onClick={() => setActiveTab('personal')} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm">
               Edit Profile
             </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 sticky top-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Account Settings</h3>
          <TabButton 
            active={activeTab === 'personal'} 
            onClick={() => setActiveTab('personal')} 
            icon={<UserIcon className="w-4 h-4" />} 
            label="Personal Details" 
          />
          <TabButton 
            active={activeTab === 'institutional'} 
            onClick={() => setActiveTab('institutional')} 
            icon={<Building className="w-4 h-4" />} 
            label={userRole === 'STUDENT' ? "Academic Record" : "Institutional Details"} 
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
            icon={<Lock className="w-4 h-4" />} 
            label="Security & Login" 
          />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* PERSONAL DETAILS TAB */}
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your basic personal details.</p>
                </div>
                <dl className="divide-y divide-slate-100">
                  <InfoRow label="First Name" value={profile.first_name} />
                  <InfoRow label="Last Name" value={profile.last_name} />
                  <InfoRow label="Primary Email" value={profile.email} />
                  <InfoRow label="System Username" value={profile.username} />
                </dl>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
                  <p className="text-sm text-slate-500 mt-1">Update your contact details for official communication.</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmit(handleSave)} className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          className={`w-full bg-white border ${errors.phone ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'} text-slate-900 pl-10 pr-3 py-2.5 rounded-md outline-none focus:ring-2 transition-all text-sm shadow-sm`}
                          {...register('phone')}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone.message}</p>}
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* INSTITUTIONAL / ACADEMIC TAB */}
          {activeTab === 'institutional' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">
                    {userRole === 'STUDENT' ? 'Academic Record' : 'Institutional Details'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Your official university designations and assigned records.</p>
                </div>
                
                <dl className="divide-y divide-slate-100">
                  {userRole === 'STUDENT' && studentProfile ? (
                    <>
                      <InfoRow label="Enrollment Number" value={studentProfile.enrollment?.enrollment_number} />
                      <InfoRow label="Program Name" value={studentProfile.enrollment?.program?.name} />
                      <InfoRow label="Current Semester" value={studentProfile.enrollment?.current_semester ? `Semester ${studentProfile.enrollment.current_semester}` : null} />
                      <InfoRow label="Academic Status" value={studentProfile.enrollment?.status} />
                    </>
                  ) : userRole === 'FACULTY' && facultyProfile ? (
                    <>
                      <InfoRow label="Faculty ID" value={facultyProfile.faculty_id} />
                      <InfoRow label="Enrollment Number" value={facultyProfile.faculty_enrollment_number} />
                      <InfoRow label="Department" value={facultyProfile.department_name} />
                      <InfoRow label="Designation" value={facultyProfile.designation} />
                      <InfoRow label="Administrative Role" value={facultyProfile.admin_role !== 'None' ? facultyProfile.admin_role : null} />
                      <InfoRow label="Specialization" value={facultyProfile.specialization} />
                      <InfoRow label="Highest Qualification" value={facultyProfile.highest_qualification} />
                      <InfoRow label="Years of Experience" value={facultyProfile.years_of_experience} />
                      <InfoRow label="Employment Type" value={facultyProfile.employment_type} />
                      <InfoRow label="Institutional Email" value={facultyProfile.institutional_email} />
                      <InfoRow label="Office Room" value={facultyProfile.office_room} />
                      <InfoRow label="Current Status" value={facultyProfile.status} />
                    </>
                  ) : (
                    <>
                      <InfoRow label="Department" value={profile.role === 'ADMIN' ? 'System Administration' : 'General'} />
                      <InfoRow label="Designation" value={profile.role === 'ADMIN' ? 'System Administrator' : 'Staff Member'} />
                      <InfoRow label="Employee ID" value={profile.role === 'ADMIN' ? 'SYS-ADM-001' : null} />
                      <InfoRow label="Official Email" value={`official.${profile.username}@veritasgrove.edu`} />
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">Security & Authentication</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your account security and sign-in methods.</p>
                </div>
                
                <div className="divide-y divide-slate-100">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Account Password</h3>
                      <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    <button className="px-4 py-2 border border-slate-200 bg-white rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Two-Factor Authentication (2FA)</h3>
                      <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="px-4 py-2 border border-slate-200 bg-white rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-red-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-red-100 bg-red-50/30">
                  <h2 className="text-lg font-bold text-red-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Danger Zone
                  </h2>
                </div>
                
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-50/30 transition-colors">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Active Sessions</h3>
                    <p className="text-sm text-slate-500 mt-1">Log out of all other active sessions across your devices.</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap">
                    Sign Out All Devices
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all text-sm ${
        active 
          ? 'bg-slate-100 text-slate-900 font-semibold' 
          : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'text-slate-700' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const displayValue = value?.toString();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 font-medium sm:col-span-2">
        {displayValue && displayValue.trim() !== '' && displayValue !== '-' ? displayValue : <span className="text-slate-400 italic font-normal">Not provided</span>}
      </dd>
    </div>
  );
}
