'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { getDashboardPath } from '@/app/components/AuthGuard';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await fetchAPI('/users/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (data && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));

        // Route based on user role
        router.push(getDashboardPath(data.user));
      } else {
        setError('Invalid login response.');
      }
    } catch (err: any) {
      let msg = err.message || 'Login failed.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.detail) msg = parsed.detail;
      } catch { /* not JSON */ }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 30% 40%, #1e40af 0%, #172554 40%, #0f172a 100%)',
      }}
    >
      {/* Blurred accent lights */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-500 rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm px-6">
        
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 shadow-xl border border-white/5">
          <svg className="w-16 h-16 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm9 11v-1c0-3.859-3.141-7-7-7H10c-3.859 0-7 3.141-7 7v1h2v-1c0-2.757 2.243-5 5-5h4c2.757 0 5 2.243 5 5v1h2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-1 tracking-wide">
          Student Portal
        </h2>
        <p className="text-slate-400 text-xs mb-6">Sign in to continue</p>

        <form className="w-full space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2.5 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full bg-white/95 border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full bg-white/95 border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading} 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Link href="/register" className="text-slate-300 hover:text-white text-sm transition underline underline-offset-4 decoration-slate-600 hover:decoration-white">
            Apply as New Student
          </Link>
          <span className="text-slate-500 text-[10px] text-center px-4">
            Enrolled student accounts are provisioned by the Admin
          </span>
        </div>
      </div>

      {/* Bottom system icons */}
      <div className="absolute bottom-6 right-8 flex items-center space-x-4 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
        </svg>
      </div>
    </div>
  );
}
