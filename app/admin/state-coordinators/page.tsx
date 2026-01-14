'use client';

import { AuthGuard } from '@/app/auth/AuthGuard';
import StateCoordinatorsContent from './StateCoordinatorsContent';

export default function StateCoordinatorsPage() {
  return (
    <AuthGuard allow={['national']}>
      <StateCoordinatorsContent />
    </AuthGuard>
  );
}

