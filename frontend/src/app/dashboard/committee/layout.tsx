'use client';
import React from 'react';
import AuthGuard from '@/app/components/AuthGuard';

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['COMMITTEE', 'ADMIN']}>{children}</AuthGuard>;
}
