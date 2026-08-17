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
    const verifyAuth = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/users/profile/', {
          credentials: 'include'
        });

        if (res.ok) {
          const user = await res.json();
          // Update local storage so Navbar stays synced
          localStorage.setItem('user', JSON.stringify(user));

          if (allowedRoles && allowedRoles.length > 0) {
            const hasRole = allowedRoles.includes(user.role) || (allowedRoles.includes('ADMIN') && user.is_staff);
            if (!hasRole) {
              const correctPath = getDashboardPath(user);
              router.replace(correctPath);
              return;
            }
          }
          setAuthorized(true);
        } else {
          localStorage.removeItem('user');
          router.replace('/login');
        }
      } catch (e) {
        localStorage.removeItem('user');
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    };

    verifyAuth();
  }, [pathname]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Verifying access…</p>
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
  if (user.role === 'INTERVIEWER') return '/dashboard/interviewer';
  return '/dashboard/student';
}
