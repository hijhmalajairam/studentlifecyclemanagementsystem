'use client';

import AuthGuard from '@/app/components/AuthGuard';

export default function ProspectiveLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['PROSPECTIVE_STUDENT']}>{children}</AuthGuard>;
}
