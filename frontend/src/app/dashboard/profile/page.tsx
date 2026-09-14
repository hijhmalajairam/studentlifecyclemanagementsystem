'use client';
import { useEffect, useState, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { Camera, User as UserIcon, Mail, Phone, Shield, Building, MapPin, Calendar, CheckCircle2, Lock, Edit3, BookOpen, Fingerprint, Hash, Briefcase } from 'lucide-react';
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
    // Placeholder for actual photo upload logic
    if (e.target.files && e.target.files[0]) {
      setMessage('Photo upload simulated successfully! (Backend endpoint needed)');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase();
  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cover Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative -mt-20 md:-mt-24 px-4 sm:px-8 flex flex-col md:flex-row gap-6 items-start md:items-end">
        
        {/* Avatar with Camera Icon */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gradient-to-tr from-slate-100 to-slate-200 shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-slate-400 overflow-hidden relative">
            {initials}
            
            {/* Hover Overlay */}
            <div 
              onClick={handlePhotoClick}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <button 
            onClick={handlePhotoClick}
            className="absolute bottom-2 right-2 p-2.5 bg-white text-blue-600 rounded-full shadow-lg border border-slate-100 hover:bg-blue-50 hover:scale-105 transition-all md:hidden"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Name and Basic Info */}
        <div className="flex-1 pb-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{displayName}</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center">
            <Mail className="w-4 h-4 mr-2" /> {profile.email || profile.username}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {profile.role?.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="mx-4 sm:mx-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-sm animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" />
          <p className="text-sm font-semibold text-emerald-700">{message}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-0 sm:px-4">
        
        {/* Left Sidebar - Tabs */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Settings Menu</h3>
            </div>
            <div className="flex flex-col p-2 gap-1">
              <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={<UserIcon className="w-4 h-4" />} label="Personal Details" />
              <TabButton active={activeTab === 'institutional'} onClick={() => setActiveTab('institutional')} icon={<Building className="w-4 h-4" />} label={userRole === 'STUDENT' ? "Academic Record" : "Institutional Details"} />
              <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock className="w-4 h-4" />} label="Security & Login" />
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* PERSONAL DETAILS TAB */}
          {activeTab === 'personal' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage your personal details and contact preferences.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileDetail label="First Name" value={profile.first_name || '-'} icon={<UserIcon className="w-4 h-4 text-slate-400" />} />
                <ProfileDetail label="Last Name" value={profile.last_name || '-'} icon={<UserIcon className="w-4 h-4 text-slate-400" />} />
                <ProfileDetail label="Primary Email" value={profile.email || '-'} icon={<Mail className="w-4 h-4 text-slate-400" />} />
                <ProfileDetail label="System Username" value={profile.username} icon={<Fingerprint className="w-4 h-4 text-slate-400" />} />
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-6">Contact Phone Number</h4>
                <form onSubmit={handleSubmit(handleSave)} className="flex flex-col sm:flex-row gap-4 max-w-lg">
                  <div className="flex-1 w-full relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-300 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} text-slate-900 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:ring-4 transition-all font-semibold shadow-sm`}
                      {...register('phone')}
                    />
                    {errors.phone && <span className="text-xs text-red-500 mt-2 block font-bold">{errors.phone.message}</span>}
                  </div>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Update'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* INSTITUTIONAL / ACADEMIC TAB */}
          {activeTab === 'institutional' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{userRole === 'STUDENT' ? 'Academic Record' : 'Institutional Details'}</h3>
                  <p className="text-sm text-slate-500 mt-1">Your official university designations and records.</p>
                </div>
              </div>
              
              {userRole === 'STUDENT' && studentProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProfileDetail label="Enrollment Number" value={studentProfile.enrollment?.enrollment_number || '-'} icon={<Hash className="w-4 h-4 text-slate-400" />} />
                  <ProfileDetail label="Program Name" value={studentProfile.enrollment?.program?.name || '-'} icon={<BookOpen className="w-4 h-4 text-slate-400" />} />
                  <ProfileDetail label="Current Semester" value={`Semester ${studentProfile.enrollment?.current_semester || '-'}`} icon={<Calendar className="w-4 h-4 text-slate-400" />} />
                  <ProfileDetail label="Status" value={studentProfile.enrollment?.status || '-'} icon={<CheckCircle2 className="w-4 h-4 text-slate-400" />} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProfileDetail label="Department" value={profile.role === 'ADMIN' ? 'System Administration' : 'General Department'} icon={<Building className="w-4 h-4 text-slate-400" />} />
                  <ProfileDetail label="Designation" value={profile.role === 'ADMIN' ? 'System Administrator' : 'Staff Member'} icon={<Briefcase className="w-4 h-4 text-slate-400" />} />
                  <ProfileDetail label="Employee ID" value={profile.role === 'ADMIN' ? 'SYS-ADM-001' : 'EMP-PENDING'} icon={<Hash className="w-4 h-4 text-slate-400" />} />
                  <ProfileDetail label="Official Email" value={`official.${profile.username}@veritas.edu`} icon={<Mail className="w-4 h-4 text-slate-400" />} />
                </div>
              )}
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Security & Login</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage your account security settings.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Account Password</p>
                      <p className="text-xs text-slate-500 mt-0.5">Last changed recently</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-200 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">
                    Enable 2FA
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
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-50 text-blue-700 font-bold' 
          : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ProfileDetail({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start space-x-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all">
      <div className="mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
    </div>
  );
}
