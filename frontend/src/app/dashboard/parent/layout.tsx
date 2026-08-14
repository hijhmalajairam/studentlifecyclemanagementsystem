'use client';

import AuthGuard from '@/app/components/AuthGuard';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['PARENT']}>
      {children}
    </AuthGuard>
  );
}
