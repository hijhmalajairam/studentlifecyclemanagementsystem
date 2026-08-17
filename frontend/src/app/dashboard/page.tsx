'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(stored);
      const role = user.role;
      const isAdmin = user.is_staff || role === 'ADMIN';

      if (isAdmin) {
        router.push('/dashboard/admin');
      } else if (role === 'STUDENT') {
        router.push('/dashboard/student');
      } else if (role === 'PROSPECTIVE_STUDENT') {
        router.push('/dashboard/prospective');
      } else if (role === 'FACULTY') {
        router.push('/dashboard/faculty');
      } else if (role === 'PARENT') {
        router.push('/dashboard/parent');
      } else {
        router.push('/dashboard/profile');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex justify-center items-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Redirecting to your portal...</p>
      </div>
    </div>
  );
}
