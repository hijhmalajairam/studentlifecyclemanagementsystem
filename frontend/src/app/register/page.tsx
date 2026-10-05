'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Account
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('PROSPECTIVE_STUDENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create User
      const userRes = await fetchAPI('/users/register/', {
        method: 'POST',
        body: JSON.stringify({
          username, email, password, first_name: firstName, last_name: lastName, role
        }),
      });
      const userData = userRes;

      if (userData.user) localStorage.setItem('user', JSON.stringify(userData.user));

      if (role === 'PROSPECTIVE_STUDENT') {
        router.push('/dashboard/prospective/apply');
      } else if (role === 'FACULTY') {
        router.push('/dashboard/faculty');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
      suppressHydrationWarning
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)'
      }}
    >
      {/* Decorative blurred background circles */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm px-6">
        
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-5 shadow-lg border border-slate-200">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-wide">
          Create an Account
        </h2>
        <p className="text-slate-500 text-xs mb-6">Join Veritas Grove University</p>

        <form className="w-full space-y-3" onSubmit={handleSubmit} suppressHydrationWarning>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="First Name" 
              className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm"
              value={firstName} 
              onChange={(e: any) => setFirstName(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm"
              value={lastName} 
              onChange={(e: any) => setLastName(e.target.value)} 
              required 
            />
          </div>

          <input 
            type="text" 
            placeholder="Username" 
            className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm"
            value={username} 
            onChange={(e: any) => setUsername(e.target.value)} 
            required 
          />

          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm"
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
            required 
          />

          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-slate-400 shadow-sm"
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
            required 
          />

          <select 
            className="w-full bg-white border border-slate-300 rounded-lg text-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm appearance-none"
            value={role} 
            onChange={(e: any) => setRole(e.target.value)}
          >
            <option value="PROSPECTIVE_STUDENT">Student (Prospective)</option>
            <option value="FACULTY">Faculty Member</option>
          </select>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3.5 mt-2 transition flex justify-center items-center shadow-md shadow-blue-500/20 disabled:opacity-70"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm transition font-medium underline underline-offset-4 decoration-blue-200 hover:decoration-blue-600">
            Already have an account? Log in
          </Link>
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute bottom-6 right-8 flex items-center space-x-4 text-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
        </svg>
      </div>
    </div>
  );
}
