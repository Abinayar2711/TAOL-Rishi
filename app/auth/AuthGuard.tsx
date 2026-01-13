'use client'

import { useAuth } from './useAuth'
import { useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return <p>Loading...</p>

  if (!user) {
    router.replace('/login')
    return null
  }

  return <>{children}</>
}

