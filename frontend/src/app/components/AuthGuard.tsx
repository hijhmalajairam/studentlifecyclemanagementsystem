'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = allowedRoles.includes(user.role) || (allowedRoles.includes('ADMIN') && user.is_staff);
        if (!hasRole) {
          // Redirect to correct dashboard
          const correctPath = getDashboardPath(user);
          router.replace(correctPath);
          return;
        }
      }

      setAuthorized(true);
    } catch {
      router.replace('/login');
    } finally {
      setChecking(false);
    }
  }, [pathname]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Verifying access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function getDashboardPath(user: any): string {
  if (user.is_staff || user.role === 'ADMIN') return '/dashboard/admin';
  if (user.role === 'PROSPECTIVE_STUDENT') return '/dashboard/prospective';
  if (user.role === 'FACULTY') return '/dashboard/faculty';
  if (user.role === 'PARENT') return '/dashboard/parent';
  return '/dashboard/student';
}
