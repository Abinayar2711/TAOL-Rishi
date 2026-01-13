'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type State = {
  id: string;
  name: string;
};

type School = {
  id: string;
  school_name: string;
  city: string;
  board: string;
  state_id: string;
  created_at?: string | null; 
  updated_at?: string | null; 
  is_deprecated?: boolean;
  deprecated_reason?: string | null;
  deprecated_at?: string | null;

  states?: {
    name: string;
  };
  // 👇 NESTED table
  school_details?: SchoolDetails | null;
};

type SchoolDetails = {
  batch_type?: string | null;
  batch_approved?: boolean;
  batch_initiated?: boolean;

  // School POC
  school_poc_name?: string | null;
  school_poc_designation?: string | null;
  school_poc_email?: string | null;
  school_poc_phone?: string | null;

  // AOL POC
  aol_poc_name?: string | null;
  aol_poc_email?: string | null;
  aol_poc_phone?: string | null;
};


export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [schools, setSchools] = useState<School[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  
  const [showDeprecateDialog, setShowDeprecateDialog] = useState(false);
  const [schoolToDeprecate, setSchoolToDeprecate] = useState<School | null>(null);
  const [deprecateReason, setDeprecateReason] = useState('');

	

  // core
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [board, setBoard] = useState('');
  const [stateId, setStateId] = useState('');

  // batch
  const [batchType, setBatchType] = useState('');
  const [batchApproved, setBatchApproved] = useState(false);
  const [batchInitiated, setBatchInitiated] = useState(false);

  // School POC
  const [schoolPocName, setSchoolPocName] = useState('');
  const [schoolPocDesignation, setSchoolPocDesignation] = useState('');
  const [schoolPocEmail, setSchoolPocEmail] = useState('');
  const [schoolPocPhone, setSchoolPocPhone] = useState('');

  // AOL POC
  const [aolPocName, setAolPocName] = useState('');
  const [aolPocEmail, setAolPocEmail] = useState('');
  const [aolPocPhone, setAolPocPhone] = useState('');
  
  //sorting
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  //State
  const [searchTerm, setSearchTerm] = useState('');
  
  //Comments
  const [commentCounts, setCommentCounts] = useState<any[]>([]);
  const [deskComments, setDeskComments] = useState<any[]>([]);
  const [stateComments, setStateComments] = useState<any[]>([]);
  const [showAddComment, setShowAddComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRole, setCommentRole] = useState<'desk' | 'state' | null>(null);
  const [commentSchoolId, setCommentSchoolId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<any | null>(null);

  //AUTH
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

    // ---------------- DERIVED DATA ----------------

  const activeSchools = schools.filter(
    (s) => !s.is_deprecated
  );

  const deprecatedSchools = schools.filter(
    (s) => s.is_deprecated
  );

  const filteredActiveSchools = activeSchools.filter((s) => {
  const term = searchTerm.toLowerCase();

  return (
    s.school_name?.toLowerCase().includes(term) ||
    s.city?.toLowerCase().includes(term) ||
    s.states?.name?.toLowerCase().includes(term)
  );
});

 // -------------- Comments -------------------
 const commentCountMap = useMemo(() => {
  return Object.fromEntries(
    (commentCounts || []).map(c => [
      c.school_id,
      { desk: c.desk_count, state: c.state_count }
    ])
  );
}, [commentCounts]);


  /* ---------------- AUTH ---------------- */

  const router = useRouter();

useEffect(() => {
  async function init() {
    const { data: { session } } = await supabase.auth.getSession();

    const user = session?.user ?? null;
    setUser(user);

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'national') {
      router.push('/admin/state-coordinators');
      return;
    }

    setLoading(false);
  }

  init();

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => setUser(session?.user ?? null)
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, [router]);


  /* ---------------- DATA ---------------- */

  const fetchCommentCounts = async () => {
  const { data, error } = await supabase
    .from('school_comment_counts')
    .select('*');

  if (error) {
    console.error('Failed to fetch comment counts:', error.message);
    return;
  }

  setCommentCounts(data || []);
};

const fetchCommentsForSchool = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('school_comments')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }

  setDeskComments(data.filter(c => c.comment_role === 'desk'));
  setStateComments(data.filter(c => c.comment_role === 'state'));
};

const deleteComment = async (commentId: string) => {
  if (!confirm('Delete this comment?')) return;

  const { error } = await supabase
    .from('school_comments')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId);

  if (error) {
    alert(error.message);
    return;
  }

  fetchCommentsForSchool(expandedSchoolId!);
  fetchCommentCounts();
};

  const fetchSchools= async () => {
  setLoadingSchools(true);
  

  const { data } = await supabase
    .from('schools')
    .select(`
      id,
      school_name,
      city,
      board,
      state_id,
      created_at,
      updated_at,
      is_deprecated,
      deprecated_reason,
      deprecated_at,
      school_comment_counts (
    desk_count,
    state_count,
    total_count
  ),
      states ( name ),

      school_details (
        school_poc_name,
        school_poc_designation,
        school_poc_email,
        school_poc_phone,

        aol_poc_name,
        aol_poc_email,
        aol_poc_phone,

        batch_type,
        batch_approved,
        batch_initiated
      )
    `)
    .order('created_at', { ascending: sortOrder === 'asc' });


  // 🔁 Flatten school_details into each row
  const formatted = (data || []).map((s: any) => ({
    ...s,
    ...(s.school_details || {}),
  }));

  setSchools(formatted);
  setLoadingSchools(false);
};

  useEffect(() => {
    if (!user) return;
    fetchSchools();
    fetchStates();
    fetchCommentCounts(); // ✅ ADD HERE
  }, [user, sortOrder]);

  const fetchStates = async () => {
    const { data } = await supabase
      .from('states')
      .select('id, name')
      .order('name');

    setStates(data || []);
  };
  
  const filteredSchools = schools.filter((s) => {
  const term = searchTerm.toLowerCase();

  return (
    s.school_name?.toLowerCase().includes(term) ||
    s.city?.toLowerCase().includes(term) ||
    s.states?.name?.toLowerCase().includes(term)
  );
});

  /* ---------------- FORM ---------------- */

  const resetForm = () => {
    setSchoolName('');
    setCity('');
    setBoard('');
    setStateId('');

    setBatchType('');
    setBatchApproved(false);
    setBatchInitiated(false);

    setSchoolPocName('');
    setSchoolPocDesignation('');
    setSchoolPocEmail('');
    setSchoolPocPhone('');

    setAolPocName('');
    setAolPocEmail('');
    setAolPocPhone('');

    setEditingSchool(null);
    setShowForm(false);
  };

  const startEdit = (s: School) => {
    setEditingSchool(s);
    console.log('Editing school object:', s);
   
    setSchoolName(s.school_name);
    setCity(s.city);
    setBoard(s.board);
    setStateId(s.state_id);

    setBatchType(s.school_details?.batch_type ?? '');
    setBatchApproved(!!s.school_details?.batch_approved);
    setBatchInitiated(!!s.school_details?.batch_initiated);

    setSchoolPocName(s.school_details?.school_poc_name ?? '');
    setSchoolPocDesignation(s.school_details?.school_poc_designation ?? '');
    setSchoolPocEmail(s.school_details?.school_poc_email ?? '');
    setSchoolPocPhone(s.school_details?.school_poc_phone ?? '');

    setAolPocName(s.school_details?.aol_poc_name ?? '');
    setAolPocEmail(s.school_details?.aol_poc_email ?? '');
    setAolPocPhone(s.school_details?.aol_poc_phone ?? '');

    setShowForm(true);
  };
  const startEditComment = (comment: any) => {
  setEditingComment(comment);
  setCommentText(comment.comment_text);
  setCommentRole(comment.comment_role);
  setCommentSchoolId(comment.school_id);
  setShowAddComment(true);
};

  const saveSchool = async () => {
    console.log('Saving school. EditingSchool ID:', editingSchool?.id);
    if (!schoolName || !city || !stateId) {
      alert('School name, city and state are required');
      return;
    }

    if (batchInitiated && (!batchApproved || !batchType)) {
      alert('Batch must be approved and have a type before initiation');
      return;
    }

    try {
    let schoolId = editingSchool?.id;

    // ===============================
    // ADD MODE → insert into schools
    // ===============================
    if (!schoolId) {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          school_name: schoolName,
          city,
          state_id: stateId,
          board,
        })
        .select()
        .single();

      if (schoolError) {
        alert(schoolError.message);
        return;
      }

      schoolId = school.id;
    }

    // ==================================
    // ADD + EDIT → upsert school_details
    // ==================================
    const { error: detailsError } = await supabase
      .from('school_details')
      .upsert(
        {
          school_id: schoolId,

          // School POC
          school_poc_name: schoolPocName || null,
          school_poc_designation: schoolPocDesignation || null,
          school_poc_email: schoolPocEmail || null,
          school_poc_phone: schoolPocPhone || null,

          // AOL POC
          aol_poc_name: aolPocName || null,
          aol_poc_email: aolPocEmail || null,
          aol_poc_phone: aolPocPhone || null,

          // Batch
          batch_type: batchType || null,
          batch_approved: batchApproved,
          batch_initiated: batchInitiated,
        },
        {
          onConflict: 'school_id',
        }
      );

    if (detailsError) {
      alert(detailsError.message);
      return;
    }

    resetForm();
    fetchSchools();
  } catch (err) {
    console.error(err);
    alert('Something went wrong while saving');
  }
};


  /* ---------------- AUTH ---------------- */

  const signInWithPassword = async () => {
  setAuthLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setAuthLoading(false);

  if (error) {
    alert(error.message);
  }
};

const resetPassword = async () => {
  if (!email) {
    alert('Enter email first');
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });

  if (error) alert(error.message);
  else alert('Password reset email sent');
};




  /* ---------------- UI ---------------- */

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 space-y-4 border p-6 rounded">
        <h1 className="text-xl font-semibold">Sign in</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signInWithPassword}
          disabled={authLoading}
          className="w-full bg-black text-white py-2"
        >
          {authLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <button
          onClick={resetPassword}
          className="w-full text-sm underline"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}


  return (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-4">My Schools</h1>
<p className="text-s text-gray-400 mb-4 italic">
  Click on a school row to view detailed information
</p>
{searchTerm && (
  <p className="text-xs text-gray-500 mb-2">
    Showing {filteredSchools.length} result(s)
  </p>
)}

<div className="flex items-center justify-between mb-4">

    <button
    disabled={showForm && editingSchool !== null}
    onClick={() => {
	    resetForm();        // clears old data
	    setEditingSchool(null); // EXPLICITLY add mode
	    setShowForm(true);
    }}
    className="mb-4 rounded bg-black px-4 py-2 text-white"
	>
	  + Add School
	</button>
	 {/* Middle: Search */}
  <input
    type="text"
    placeholder="Search schools, city, state..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border rounded px-3 py-2 text-sm w-72"
  />
 {/* Right side */}
  <button
  onClick={() => {
     setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));

    // 👇 force user to see the newest item
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
className="
  text-sm text-gray-600 
  border border-gray-300 
  rounded px-3 py-1 
  hover:bg-gray-100
"

>
  Sort by added date {sortOrder === 'asc' ? '↑' : '↓'}
</button>

</div>
    {/* -------- FORM -------- */}
    {showForm && (
      <div className="mb-6 rounded border p-4 space-y-4">
        <h3 className="font-medium">
	  {editingSchool ? 'Edit School' : 'Add School'}
	</h3>


	<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
	  <input
	    className="border p-2"
	    placeholder="School Name *"
	    value={schoolName}
	    onChange={(e) => setSchoolName(e.target.value)}
	  />

	  <input
	    className="border p-2"
	    placeholder="City *"
	    value={city}
	    onChange={(e) => setCity(e.target.value)}
	  />

	  <input
	    className="border p-2"
	    placeholder="Board"
	    value={board}
	    onChange={(e) => setBoard(e.target.value)}
	  />

	  <select
	    className="border p-2"
	    value={stateId}
	    onChange={(e) => setStateId(e.target.value)}
	  >
	    <option value="">Select State *</option>
	    {states.map((st) => (
	      <option key={st.id} value={st.id}>
		{st.name}
	      </option>
	    ))}
	  </select>
	</div>

        <h3 className="font-medium">School POC (School-side)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border p-2"
            placeholder="POC Name"
            value={schoolPocName}
            onChange={(e) => setSchoolPocName(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Designation"
            value={schoolPocDesignation}
            onChange={(e) => setSchoolPocDesignation(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Email"
            value={schoolPocEmail}
            onChange={(e) => setSchoolPocEmail(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Phone"
            value={schoolPocPhone}
            onChange={(e) => setSchoolPocPhone(e.target.value)}
          />
        </div>
	<h3 className="font-medium">AOL POC</h3>

	<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
	  <input
	    className="border p-2"
	    placeholder="AOL POC Name"
	    value={aolPocName}
	    onChange={(e) => setAolPocName(e.target.value)}
	  />

	  <input
	    className="border p-2"
	    placeholder="AOL POC Email"
	    value={aolPocEmail}
	    onChange={(e) => setAolPocEmail(e.target.value)}
	  />

	  <input
	    className="border p-2"
	    placeholder="AOL POC Phone"
	    value={aolPocPhone}
	    onChange={(e) => setAolPocPhone(e.target.value)}
	  />
	</div>
	<h3 className="font-medium">Batch</h3>

	<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
	  <input
	    className="border p-2"
	    placeholder="Batch Type"
	    value={batchType}
	    onChange={(e) => setBatchType(e.target.value)}
	  />

	  <label className="flex items-center gap-2">
	    <input
	      type="checkbox"
	      checked={batchApproved}
	      onChange={(e) => setBatchApproved(e.target.checked)}
	    />
	    Approved
	  </label>

	  <label className="flex items-center gap-2">
	    <input
	      type="checkbox"
	      checked={batchInitiated}
	      onChange={(e) => setBatchInitiated(e.target.checked)}
	    />
	    Initiated
	  </label>
	</div>


        <div className="flex gap-2">
          <button	
            onClick={saveSchool}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Save
          </button>
          <button
            onClick={resetForm}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* -------- TABLE -------- */}
{loadingSchools ? (
  <p>Loading schools...</p>
) : schools.length === 0 ? (
  <p className="text-gray-500">No schools available</p>
) : (
  <table className="w-full border-collapse border text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="border px-3 py-2 text-left">School</th>
        <th className="border px-3 py-2 text-left">City</th>
        <th className="border px-3 py-2 text-left">State</th>
        <th className="border px-3 py-2 text-left">State Remarks📝</th>
        <th className="border px-3 py-2 text-left">Desk Comments💬</th>
        <th className="border px-3 py-2 text-left">Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredActiveSchools.map((s) => (
        <>
          
          {/* MAIN ROW */}
          <tr
            className="cursor-pointer hover:bg-gray-50"
            onClick={() =>
              {
		  const isOpening = expandedSchoolId !== s.id;
		  setExpandedSchoolId(isOpening ? s.id : null);

		  if (isOpening) {
		    fetchCommentsForSchool(s.id);
		  }
		}
            }
          >
            <td className="border px-3 py-2">
<div className="font-medium">{s.school_name}</div>

  {s.created_at && (
    <div className="text-xs text-gray-400">
      Added on {new Date(s.created_at).toLocaleDateString()}
    </div>
  )}
            </td>

            <td className="border px-3 py-2">{s.city}</td>

            <td className="border px-3 py-2">{s.states?.name}</td>
           <td className="border px-3 py-2 text-center">
  {commentCountMap[s.id]?.state ?? 0}
</td>

<td className="border px-3 py-2 text-center">
  {commentCountMap[s.id]?.desk ?? 0}
</td>

            <td className="border px-3 py-2">
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(s);
                }}
                className="text-blue-600 underline"
              >
                Edit
              </button>
              <button
		    onClick={(e) => {
		      e.stopPropagation();
		      setSchoolToDeprecate(s);
		      setShowDeprecateDialog(true);
		    }}
		    className="text-red-600 underline"
		  >
		    Deprecate
	      </button>
	       </div>
            </td>
          </tr>

          {/* EXPANDED DETAILS ROW */}
          {expandedSchoolId === s.id && (
            <tr>
              <td colSpan={4} className="bg-gray-50 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
		  <div className="md:col-span-2">
			  <h4 className="font-semibold mb-2">Batch</h4>

			  <p>
			    <b>Type:</b> {s.school_details?.batch_type || '-'}
			  </p>

			  <p>
			    <b>Approved:</b>{' '}
			    {s.school_details?.batch_approved ? 'Yes' : 'No'}
			  </p>

			  <p>
			    <b>Initiated:</b>{' '}
			    {s.school_details?.batch_initiated ? 'Yes' : 'No'}
			  </p>
		  </div>
                  <div>
                    <h4 className="font-semibold mb-2">School POC</h4>
                    <p><b>Name:</b> {s.school_details?.school_poc_name || '-'}</p>
                    <p><b>Email:</b> {s.school_details?.school_poc_email || '-'}</p>
                    <p><b>Phone:</b> {s.school_details?.school_poc_phone || '-'}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">AOL POC</h4>
                    <p><b>Name:</b> {s.school_details?.aol_poc_name || '-'}</p>
                    <p><b>Email:</b> {s.school_details?.aol_poc_email || '-'}</p>
                    <p><b>Phone:</b> {s.school_details?.aol_poc_phone || '-'}</p>
                  </div>

                  {/* STATE REMARKS */}
            <div>
	    <h4 className="font-semibold mb-2">State Coordinator Remarks</h4>

	    {stateComments.length === 0 ? (
	      <p className="text-sm text-gray-400">No remarks yet</p>
	    ) : (
	      stateComments.map(c => (
		<div key={c.id} className="text-sm border-l-2 pl-3 mb-2">
		  <p>{c.comment_text}</p>
		  <div className="flex items-center justify-between text-xs text-gray-400">
    <span>{new Date(c.created_at).toLocaleDateString()}</span>

    <div className="flex gap-2">
      <button
        onClick={(e) => {
    e.stopPropagation();
    startEditComment(c)}}
        className="text-blue-600 underline"
      >
        Edit
      </button>
      <button
        onClick={(e) => {
    e.stopPropagation();
    deleteComment(c.id)}}
        className="text-red-600 underline"
      >
        Delete
      </button>
    </div>
  </div>
		</div>
	      ))
	    )}
	    <button
  className="mt-2 text-xs text-blue-600 underline"
  onClick={(e) => {
  e.stopPropagation();
    setCommentRole('state');
    setCommentSchoolId(s.id);
    setShowAddComment(true);
  }}
>
  + Add State Remark
</button>

	  </div>

	  {/* DESK COMMENTS */}
	  <div>
	    <h4 className="font-semibold mb-2">Program Desk Comments</h4>

	    {deskComments.length === 0 ? (
	      <p className="text-sm text-gray-400">No comments yet</p>
	    ) : (
	      deskComments.map(c => (
		<div key={c.id} className="text-sm border-l-2 pl-3 mb-2">
		  <p>{c.comment_text}</p>
		  <div className="flex items-center justify-between text-xs text-gray-400">
    <span>{new Date(c.created_at).toLocaleDateString()}</span>

    <div className="flex gap-2">
      <button
        onClick={(e) => {
    e.stopPropagation();
    startEditComment(c)}}
        className="text-blue-600 underline"
      >
        Edit
      </button>
      <button
        onClick={(e) => {
    e.stopPropagation();
    deleteComment(c.id)}}
        className="text-red-600 underline"
      >
        Delete
      </button>
    </div>
  </div>
		</div>
	      ))
	    )}
	    <button
  className="mt-2 text-xs text-blue-600 underline"
  onClick={(e) => {
  e.stopPropagation();
    setCommentRole('desk');
    setCommentSchoolId(s.id);
    setShowAddComment(true);
  }}
>
  + Add Desk Comment
</button>

	  </div>
	  

                </div>
                

                {s.updated_at && (
  <p className="mt-4 text-xs text-gray-500">
    Last updated on:{' '}
    {new Date(s.updated_at).toLocaleDateString()}
  </p>
)}

              </td>
            </tr>
          )}

        </>
      ))}
    </tbody>
   </table>
)}

{/* ---- DEPRECATED SCHOOLS ---- */}
{deprecatedSchools.length > 0 && (
  <div className="mt-10">
    <h3 className="text-lg font-semibold text-gray-500 mb-3">
      Deprecated Schools
    </h3>
<p className="text-s text-gray-400 mb-4 italic">
  Click a school to view why it was deprecated
</p>

    <table className="w-full border-collapse border text-sm opacity-70">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-3 py-2 text-left">School</th>
          <th className="border px-3 py-2 text-left">City</th>
          <th className="border px-3 py-2 text-left">State</th>
        </tr>
      </thead>

      <tbody>
        {deprecatedSchools.map((s) => (
        <>
          <tr
        key={s.id}
        className="cursor-pointer hover:bg-gray-50"
        onClick={() =>
          setExpandedSchoolId(
            expandedSchoolId === s.id ? null : s.id
          )
        }
      >
            <td className="border px-3 py-2 font-medium">
              {s.school_name}
            </td>
            <td className="border px-3 py-2">{s.city}</td>
            <td className="border px-3 py-2">{s.states?.name}</td>
          </tr>
          {expandedSchoolId === s.id && (
        <tr>
          <td colSpan={3} className="bg-gray-50 px-6 py-4 text-sm">
            <p>
              <span className="font-semibold text-red-600">
                Deprecation reason:
              </span>{' '}
              {s.deprecated_reason || 'No reason provided'}
            </p>

            {s.deprecated_at && (
              <p className="mt-1 text-gray-500">
                Deprecated on:{' '}
                {new Date(s.deprecated_at).toLocaleDateString()}
              </p>
            )}
          </td>
        </tr>
      )}
          </>
        ))}
      </tbody>
    </table>
  </div>
)}
{showDeprecateDialog && schoolToDeprecate && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white rounded p-6 w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold text-red-600">
        Deprecate School
      </h3>

      <p>
        Are you sure you want to deprecate{' '}
        <b>{schoolToDeprecate.school_name}</b>?
      </p>

      <textarea
        className="w-full border p-2"
        placeholder="Reason for deprecation"
        value={deprecateReason}
        onChange={(e) => setDeprecateReason(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={() => {
            setShowDeprecateDialog(false);
            setSchoolToDeprecate(null);
            setDeprecateReason('');
          }}
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
  if (!schoolToDeprecate) return;

  const { error } = await supabase
    .from('schools')
    .update({
      is_deprecated: true,
      deprecated_reason: deprecateReason || null,
      deprecated_at: new Date().toISOString(),
    })
    .eq('id', schoolToDeprecate.id);

  if (error) {
    alert(error.message);
    return;
  }

  setShowDeprecateDialog(false);
  setSchoolToDeprecate(null);
  setDeprecateReason('');
  fetchSchools(); // refresh list
}}
disabled={!deprecateReason.trim()}
  className={`px-4 py-2 rounded text-white ${
    deprecateReason.trim()
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-red-300 cursor-not-allowed'
  }`}
        >
          Deprecate
        </button>
      </div>
    </div>
  </div>
)}
{showAddComment && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white rounded p-6 w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">
        Add {commentRole === 'desk' ? 'Desk Comment' : 'State Remark'}
      </h3>

      <textarea
        className="w-full border p-2"
        rows={4}
        placeholder="Enter comment"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowAddComment(false);
            setCommentText('');
            setEditingComment(null);
          }}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
  disabled={!commentText.trim()}
  onClick={async () => {
    if (!commentSchoolId || !commentRole) return;

    let error;

    if (editingComment?.id) {
      const res = await supabase
        .from('school_comments')
        .update({
          comment_text: commentText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingComment.id);

      error = res.error;
    } else {
      const res = await supabase
        .from('school_comments')
        .insert({
          school_id: commentSchoolId,
          comment_text: commentText,
          comment_role: commentRole,
        });

      error = res.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    // 🔄 Refresh UI
    fetchCommentsForSchool(commentSchoolId);
    fetchCommentCounts();

    // 🧹 Cleanup modal state
    setShowAddComment(false);
    setCommentText('');
    setEditingComment(null);
  }}
  className={`px-4 py-2 rounded text-white ${
    commentText.trim()
      ? 'bg-black'
      : 'bg-gray-300 cursor-not-allowed'
  }`}
>
  Save
</button>

      </div>
    </div>
  </div>
)}

</div>  
);


}

