'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { AuthGuard } from '@/app/auth/AuthGuard'
import { RequireRole } from '@/app/auth/RequireRole'

export function StateCoordinatorsContent() {

  const [coordinators, setCoordinators] = useState<any[]>([])	
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [stateId, setStateId] = useState('')
  const [states, setStates] = useState<any[]>([])




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
  async function loadData() {
    setLoading(true)

    const { data: scData } = await supabase
      .from('state_coordinators')
      .select(`
        id,
        profiles ( email ),
        states ( name )
      `)

    setCoordinators(scData || [])

    const { data: statesData } = await supabase
      .from('states')
      .select('id, name')
      .order('name')

    setStates(statesData || [])
    setLoading(false)
  }

  loadData()
}, [])

  



  if (loading) return <p className="p-6">Loading...</p>
  

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
};
export default function StateCoordinatorsPage() {
  return (
    <AuthGuard>
      <RequireRole role="national">
        <StateCoordinatorsContent />
      </RequireRole>
    </AuthGuard>
  )
}
