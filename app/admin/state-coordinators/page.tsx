'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function StateCoordinatorsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [coordinators, setCoordinators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [stateId, setStateId] = useState('')
  const [states, setStates] = useState<any[]>([])


  const router = useRouter()

  async function handleAddCoordinator() {
  if (!email || !stateId) {
    alert('Email and state required')
    return
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    alert('Not authenticated')
    return
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-coordinator`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, stateId }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    alert(text)
    return
  }

  // reload coordinators
  const { data: scData } = await supabase
    .from('state_coordinators')
    .select(`
      id,
      profiles ( email ),
      states ( name )
    `)

  setCoordinators(scData || [])
  setEmail('')
  setStateId('')
};

  useEffect(() => {
  async function loadProfileAndData() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false) 
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData) {
      setLoading(false)
      return
    }

    setProfile(profileData)

    // Only national loads coordinators
    if (profileData.role === 'national') {
      const { data: scData, error: scError } = await supabase
        .from('state_coordinators')
        .select(`
          id,
          state_id,
          user_id,
          profiles ( email ),
          states ( name )
        `)
      
	console.log('scError', scError)
	console.log('scData', scData)
      setCoordinators(scData || [])
    }

    const { data: statesData } = await supabase
      .from('states')
      .select('id, name')
      .order('name')

    setStates(statesData || [])
    setLoading(false)
  }

  loadProfileAndData()
}, [router])



  if (loading) return <p className="p-6">Loading...</p>


  if (!profile) {
  return <p className="p-6">Profile not found</p>
}
		

  if (profile.role !== 'national') {
  return <p className="p-6">Access denied</p>
}


  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        State Coordinators
      </h1>
   <div className="border p-4 mb-6">
  <h2 className="font-medium mb-2">Add State Coordinator</h2>

  <input
    className="border p-2 w-full mb-2"
    placeholder="Coordinator email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <select
    className="border p-2 w-full mb-2"
    value={stateId}
    onChange={(e) => setStateId(e.target.value)}
  >
    <option value="">Select state</option>
    {states.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>

  <button
    className="bg-black text-white px-4 py-2"
    onClick={handleAddCoordinator}
  >
    Add Coordinator
  </button>
</div>

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

