'use client';

import AuthGuard from '@/app/components/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      {children}
    </AuthGuard>
  );
}
