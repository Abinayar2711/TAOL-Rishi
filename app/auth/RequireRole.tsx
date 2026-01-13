'use client'

import { useAuth } from './useAuth'
import { useRouter } from 'next/navigation'

export function RequireRole({
  role,
  children,
}: {
  role: 'national' | 'coordinator'
  children: React.ReactNode
}) {
  const { profile, loading } = useAuth()
  const router = useRouter()

  if (loading) return <p>Loading...</p>

  if (!profile || profile.role !== role) {
    router.replace('/')
    return null
  }

  return <>{children}</>
}

