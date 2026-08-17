'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAPI('/users/profile/').then(data => {
      setProfile(data);
      setPhone(data.phone || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await fetchAPI('/users/profile/', {
        method: 'PATCH',
        body: JSON.stringify({ phone })
      });
      setProfile(updated);
      setMessage('Profile updated successfully!');
      // Update localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        user.phone = updated.phone;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <p className="text-slate-400">Unable to load profile.</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'from-red-500 to-orange-500',
    STUDENT: 'from-blue-500 to-cyan-500',
    PROSPECTIVE_STUDENT: 'from-blue-500 to-cyan-500',
    FACULTY: 'from-emerald-500 to-teal-500',
    PARENT: 'from-purple-500 to-pink-500',
  };

  const initials = `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">My Profile</h1>

          {/* Profile Card */}
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${roleColors[profile.role] || 'from-blue-500 to-purple-500'} flex items-center justify-center text-slate-900 text-2xl font-bold shadow-lg`}>
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-slate-400 text-sm">@{profile.username}</p>
                <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-400 border-blue-500/30">
                  {profile.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Read-only Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Username</p>
                <p className="text-sm font-bold text-slate-900">{profile.username}</p>
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-bold text-slate-900">{profile.email || '—'}</p>
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">First Name</p>
                <p className="text-sm font-bold text-slate-900">{profile.first_name || '—'}</p>
              </div>
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Last Name</p>
                <p className="text-sm font-bold text-slate-900">{profile.last_name || '—'}</p>
              </div>
            </div>

            {/* Editable Phone */}
            <form onSubmit={handleSave}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="flex space-x-3">
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="flex-1 bg-white border border-slate-300 text-slate-900 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-slate-500"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
              {message && (
                <p className={`mt-3 text-sm font-medium ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
