'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function StateCoordinatorsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [coordinators, setCoordinators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()


  useEffect(() => {
  async function loadProfileAndData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)
    if (!profile) return null
    if (profileData?.role === 'national') {
      const { data: scData } = await supabase
        .from('state_coordinators')
        .select(`
          id,
          state_id,
          user_id,
          profiles ( email ),
          states ( name )
        `)

      setCoordinators(scData || [])
    }

    setLoading(false)
  }

  loadProfileAndData()
}, [])


  if (loading) return <p className="p-6">Loading...</p>


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
      <table className="w-full border text-sm">
  <thead>
    <tr className="bg-gray-100">
      <th className="border px-2 py-1">Email</th>
      <th className="border px-2 py-1">State</th>
    </tr>
  </thead>
  <tbody>
    {coordinators.map((c) => (
      <tr key={c.id}>
        <td className="border px-2 py-1">
          {c.profiles?.email}
        </td>
        <td className="border px-2 py-1">
          {c.states?.name}
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  )
}

