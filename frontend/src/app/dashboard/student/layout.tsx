'use client';

import AuthGuard from '@/app/components/AuthGuard';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['STUDENT', 'PROSPECTIVE_STUDENT']}>
      {children}
    </AuthGuard>
  );
}
