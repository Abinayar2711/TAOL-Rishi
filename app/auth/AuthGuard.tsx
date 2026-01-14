'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from './useAuth';

type Props = {
  children: ReactNode;
  allow: Array<'national' | 'coordinator'>;
};

export function AuthGuard({ children, allow }: Props) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (role === 'national' && !allow.includes('national')) {
      router.replace('/admin/state-coordinators');
      return;
    }

    if (role === 'coordinator' && !allow.includes('coordinator')) {
      router.replace('/');
      return;
    }
  }, [user, role, loading, allow, router]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user || !role) {
    return null;
  }

  return <>{children}</>;
}

