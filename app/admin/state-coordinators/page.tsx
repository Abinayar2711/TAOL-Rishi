'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function StateCoordinatorsPage() {
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
    }

    loadProfile()
  }, [])

  if (!profile) return <p>Loading...</p>

  if (profile.role !== 'national') {
    router.push('/')
    return null
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        State Coordinators
      </h1>

      {/* Add Coordinator Form will go here */}
    </div>
  )
}

