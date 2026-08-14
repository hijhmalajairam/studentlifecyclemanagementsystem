'use client';

import AuthGuard from '@/app/components/AuthGuard';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['FACULTY']}>
      {children}
    </AuthGuard>
  );
}
