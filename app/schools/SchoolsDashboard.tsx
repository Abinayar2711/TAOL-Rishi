'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SchoolForm } from '@/app/schools/components/SchoolForm';
import { SchoolsTable } from '@/app/schools/components/SchoolsTable';
import { SchoolExpandedRow } from '@/app/schools/components/SchoolExpandedRow';
import { useSchoolComments } from './hooks/useSchoolComments';
import { CommentModal } from './components/CommentModal';
import { DeprecateModal } from './components/DeprecateModal';
import { useAuth } from '@/app/auth/useAuth';


type State = {
  id: string;
  name: string;
};

type SchoolDetails = {
  batch_type?: string | null;
  batch_approved?: boolean;
  batch_initiated?: boolean;

  school_poc_name?: string | null;
  school_poc_designation?: string | null;
  school_poc_email?: string | null;
  school_poc_phone?: string | null;

  aol_poc_name?: string | null;
  aol_poc_email?: string | null;
  aol_poc_phone?: string | null;
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

  states?: State | State[];

  school_details?: SchoolDetails[] | null;
};

export function SchoolsDashboard() {
  // ---------------- CORE STATE ----------------
  const [schools, setSchools] = useState<School[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // ---------------- UI STATE ----------------

  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ---------------- FORM STATE ----------------
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [board, setBoard] = useState('');
  const [stateId, setStateId] = useState('');

  const [batchType, setBatchType] = useState('');
  const [batchApproved, setBatchApproved] = useState(false);
  const [batchInitiated, setBatchInitiated] = useState(false);

  const [schoolPocName, setSchoolPocName] = useState('');
  const [schoolPocDesignation, setSchoolPocDesignation] = useState('');
  const [schoolPocEmail, setSchoolPocEmail] = useState('');
  const [schoolPocPhone, setSchoolPocPhone] = useState('');

  const [aolPocName, setAolPocName] = useState('');
  const [aolPocEmail, setAolPocEmail] = useState('');
  const [aolPocPhone, setAolPocPhone] = useState('');
  const [editingSchool, setEditingSchool] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  //Deprecate
  const [showDeprecateModal, setShowDeprecateModal] = useState(false);
const [deprecatingSchool, setDeprecatingSchool] = useState<any | null>(null);
const [deprecateReason, setDeprecateReason] = useState('');
  //State primary
  const { profile } = useAuth();  
  const primaryStateId: string =
  profile?.primary_state_id ? String(profile.primary_state_id) : '';
  const primaryStateName =
    states.find(s => s.id === primaryStateId)?.name || '';
  const isCrossState = stateId !== primaryStateId;


  //modal state for comments
 const {
  deskComments,
  stateComments,
  commentCountMap,
  fetchCommentCounts,
  fetchCommentsForSchool,
  saveComment,
  deleteComment,
} = useSchoolComments();
const handleSaveComment = async () => {
  if (!commentSchoolId || !commentRole) return;

  try {
    await saveComment(
      commentSchoolId,
      commentRole,
      commentText,
      editingComment?.id
    );

    await fetchCommentsForSchool(commentSchoolId);
    await fetchCommentCounts();

    setShowCommentModal(false);
    setCommentText('');
    setEditingComment(null);
  } catch (err: any) {
    alert(err.message || 'Failed to save comment');
  }
};

const handleConfirmDeprecate = async () => {
  if (!deprecatingSchool) return;

  const { error } = await supabase
    .from('schools')
    .update({
      is_deprecated: true,
      deprecated_reason: deprecateReason,
      deprecated_at: new Date().toISOString(),
    })
    .eq('id', deprecatingSchool.id);

  if (error) {
    alert(error.message);
    return;
  }

  setShowDeprecateModal(false);
  setDeprecatingSchool(null);
  setDeprecateReason('');

  fetchSchools();
};

const [showCommentModal, setShowCommentModal] = useState(false);
const [commentText, setCommentText] = useState('');
const [commentRole, setCommentRole] = useState<'desk' | 'state' | null>(null);
const [commentSchoolId, setCommentSchoolId] = useState<string | null>(null);
const [editingComment, setEditingComment] = useState<any | null>(null);
const isEditMode = !!editingSchool;

  // ---------------- DERIVED ----------------
  const activeSchools = schools.filter(
  (s) => s && s.is_deprecated === false
);

const deprecatedSchools = schools.filter(
  (s) => s && s.is_deprecated === true
);
	

  const filteredActiveSchools = useMemo(() => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return activeSchools;

  return activeSchools.filter((s) => {
    const schoolName = s.school_name?.toLowerCase() || '';
    const city = s.city?.toLowerCase() || '';

    const stateName =
  Array.isArray(s.states)
    ? s.states[0]?.name?.toLowerCase() || ''
    : s.states?.name?.toLowerCase() || '';



    return (
      schoolName.includes(term) ||
      city.includes(term) ||
      stateName.includes(term)
    );
  });
}, [activeSchools, searchTerm]);

 
  // ---------------- DATA FETCH ----------------
  const saveSchool = async () => {
  if (!schoolName || !city || !stateId) {
    alert('School name, city and state are required');
    return;
  }
console.log('ADD SCHOOL PAYLOAD', {
    school_name: schoolName,
    city,
    board,
    state_id: stateId,
  });
  let schoolId = editingSchool?.id;

  if (!schoolId) {
    const { error } = await supabase
  .from('schools')
  .insert([{
    school_name: schoolName,
    city,
    board,
    state_id: stateId,
    is_cross_state: isCrossState,
  }]);


  // setSchools(prev => [data, ...prev]); // prepend
     const { data: insertedSchool } = await supabase
  .from('schools')
  .select('id')
  .eq('school_name', schoolName)
  .eq('city', city)
  .eq('state_id', stateId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

   if (!insertedSchool) {
    throw new Error('Failed to fetch inserted school');
   }

   schoolId = insertedSchool.id;





    if (error) {
      alert(error.message);
      return;
    }
    
    await fetchSchools();
    setShowForm(false);
    resetForm();
    // schoolId = data.id;
    
  } else {
    const { error } = await supabase
      .from('schools')
      .update({
        school_name: schoolName,
        city,
        board,
        state_id: stateId,
        is_cross_state: isCrossState,
      })
      .eq('id', schoolId);

    if (error) {
      alert(error.message);
      return;
    }
    setShowForm(false);
    resetForm();

  }

  const { error: detailsError } = await supabase
    .from('school_details')
    .upsert({
      school_id: schoolId,
      batch_type: batchType || null,
      batch_approved: batchApproved,
      batch_initiated: batchInitiated,
      school_poc_name: schoolPocName || null,
      school_poc_designation: schoolPocDesignation || null,
      school_poc_email: schoolPocEmail || null,
      school_poc_phone: schoolPocPhone || null,
      aol_poc_name: aolPocName || null,
      aol_poc_email: aolPocEmail || null,
      aol_poc_phone: aolPocPhone || null,
    }, { onConflict: 'school_id' });

  if (detailsError) {
    alert(detailsError.message);
    return;
  }


await fetchSchools(); 
// reset UI filters so new data is visible
setSearchTerm('');
setSortOrder('desc'); // optional
setShowForm(false);
resetForm();
};




  const fetchStates = async () => {
    const { data } = await supabase
      .from('states')
      .select('id, name')
      .order('name');

    setStates(data || []);
  };

  const fetchSchools = async () => {  

    setLoadingSchools(true);
  
    const { data,error } = await supabase
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
        states (id, name ),
        school_details (
          batch_type,
          batch_approved,
          batch_initiated,
          school_poc_name,
          school_poc_designation,
          school_poc_email,
          school_poc_phone,
          aol_poc_name,
          aol_poc_email,
          aol_poc_phone
        )
      `)
      .order('created_at', { ascending: sortOrder === 'asc' });

    setSchools(data || []);
    setLoadingSchools(false);
    
  };

  useEffect(() => {
    fetchSchools();
    fetchStates();
    fetchCommentCounts();
  }, [sortOrder]);
  useEffect(() => {
  if (showForm && !isEditMode && profile?.primary_state_id) {
    setStateId(String(profile.primary_state_id));
  }
}, [showForm, isEditMode, profile]);


  // ---------------- FORM HELPERS ----------------

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
 
  // ---------------- UI ----------------

  return (


    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Schools</h1>

      <p className="text-sm text-gray-400 mb-4 italic">
        Dashboard skeleton — UI wiring comes next
      </p>
      <button
  onClick={() => {
  setEditingSchool(null);
  setShowForm(true);

  setSchoolName('');
  setCity('');
  setBoard('');

  // 🔑 THIS IS THE MISSING LINE
  setStateId(primaryStateId ? String(primaryStateId) : '');

}}

  
  className="mb-4 rounded bg-black px-4 py-2 text-white"
>
  + Add School
</button>

<div className="flex items-center justify-between mb-4">
  <input
    type="text"
    placeholder="Search schools, city, state..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border rounded px-3 py-2 text-sm w-72"
  />

  <button
    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
    className="text-sm border px-3 py-1 rounded"
  >
    Sort by date {sortOrder === 'asc' ? '↑' : '↓'}
  </button>
</div>
      {showForm && (
  <SchoolForm
    editing={!!editingSchool}
    states={states}

    schoolName={schoolName}
    city={city}
    board={board}
    stateId={stateId}

    batchType={batchType}
    batchApproved={batchApproved}
    batchInitiated={batchInitiated}

    schoolPocName={schoolPocName}
    schoolPocDesignation={schoolPocDesignation}
    schoolPocEmail={schoolPocEmail}
    schoolPocPhone={schoolPocPhone}

    aolPocName={aolPocName}
    aolPocEmail={aolPocEmail}
    aolPocPhone={aolPocPhone}
    primaryStateId={primaryStateId}
    primaryStateName={primaryStateName}
    onChange={{
      setSchoolName,
      setCity,
      setBoard,
      setStateId,
      setBatchType,
      setBatchApproved,
      setBatchInitiated,
      setSchoolPocName,
      setSchoolPocDesignation,
      setSchoolPocEmail,
      setSchoolPocPhone,
      setAolPocName,
      setAolPocEmail,
      setAolPocPhone,
    }}

    onSave={saveSchool}
    onCancel={resetForm}
  />
)}
<SchoolsTable
  schools={filteredActiveSchools}
   expandedSchoolId={expandedSchoolId}
   
  onToggleExpand={(id) => {
  const isOpening = expandedSchoolId !== id;
  setExpandedSchoolId(isOpening ? id : null);

  if (isOpening) {
    fetchCommentsForSchool(id);
  }
}}
onDeprecate={(school) => {
  setDeprecatingSchool(school);
  setDeprecateReason('');
  setShowDeprecateModal(true);
}}

  onEdit={(school) => {
  setEditingSchool(school);
  setShowForm(true);

  setSchoolName(school.school_name);
  setCity(school.city);
  setBoard(school.board || '');
  setStateId(school.state_id);

  const details = school.school_details; //?.[0];

  setBatchType(details?.batch_type || '');	
  setBatchApproved(!!details?.batch_approved);
  setBatchInitiated(!!details?.batch_initiated);

  setSchoolPocName(details?.school_poc_name || '');
  setSchoolPocDesignation(details?.school_poc_designation || '');
  setSchoolPocEmail(details?.school_poc_email || '');
  setSchoolPocPhone(details?.school_poc_phone || '');

  setAolPocName(details?.aol_poc_name || '');
  setAolPocEmail(details?.aol_poc_email || '');
  setAolPocPhone(details?.aol_poc_phone || '');
}}
 deskComments={deskComments}
  stateComments={stateComments}
onAddComment={(role, schoolId) => {
    setCommentRole(role);
    setCommentSchoolId(schoolId);
    setShowCommentModal(true);
  }}

  onEditComment={(comment) => {
    setEditingComment(comment);
    setCommentText(comment.comment_text);
    setCommentRole(comment.comment_role);
    setCommentSchoolId(comment.school_id);
    setShowCommentModal(true);
  }}

  onDeleteComment={async (id) => {
    await deleteComment(id);
    fetchCommentsForSchool(expandedSchoolId!);
    fetchCommentCounts();
  }}

/>

<CommentModal
  open={showCommentModal}
  role={commentRole}
  text={commentText}
  onChangeText={setCommentText}
  onClose={() => {
    setShowCommentModal(false);
    setCommentText('');
    setEditingComment(null);
  }}
  onSave={handleSaveComment}
/>
<DeprecateModal
  open={showDeprecateModal}
  schoolName={deprecatingSchool?.school_name}
  reason={deprecateReason}
  onChangeReason={setDeprecateReason}
  onClose={() => setShowDeprecateModal(false)}
  onConfirm={handleConfirmDeprecate}
/>
{deprecatedSchools.length > 0 && (
  <div className="mt-10">
    <h3 className="font-semibold mb-3">Deprecated Schools</h3>

    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-3 py-2">School</th>
          <th className="border px-3 py-2">Reason</th>
          <th className="border px-3 py-2">Deprecated On</th>
        </tr>
      </thead>
      <tbody>
        {deprecatedSchools.map(s => (
          <tr key={s.id}>
            <td className="border px-3 py-2">{s.school_name}</td>
            <td className="border px-3 py-2">
              {s.deprecated_reason || '-'}
            </td>
            <td className="border px-3 py-2">
              {s.deprecated_at
                ? new Date(s.deprecated_at).toLocaleDateString()
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}



    </div>
  );
}

