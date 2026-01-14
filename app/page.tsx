'use client';

import { AuthGuard } from '@/app/auth/AuthGuard';
import { SchoolsDashboard } from '@/app/schools/SchoolsDashboard';

export default function Page() {
  return (
    <AuthGuard allow={['coordinator']}>
      <SchoolsDashboard />
    </AuthGuard>
  );
}

