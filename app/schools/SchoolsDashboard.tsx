'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

  states?: {
    name: string;
  }[];

  school_details?: SchoolDetails[] | null;
};

export function SchoolsDashboard() {
  // ---------------- CORE STATE ----------------
  const [schools, setSchools] = useState<School[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // ---------------- UI STATE ----------------
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
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

  // ---------------- DERIVED ----------------
  const activeSchools = schools.filter(s => !s.is_deprecated);
  const deprecatedSchools = schools.filter(s => s.is_deprecated);

  const filteredActiveSchools = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return activeSchools.filter(s =>
      s.school_name?.toLowerCase().includes(term) ||
      s.city?.toLowerCase().includes(term) ||
      s.states?.[0].name?.toLowerCase().includes(term)
    );
  }, [activeSchools, searchTerm]);

  // ---------------- DATA FETCH ----------------

  const fetchStates = async () => {
    const { data } = await supabase
      .from('states')
      .select('id, name')
      .order('name');

    setStates(data || []);
  };

  const fetchSchools = async () => {
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
        states ( name ),
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
  }, [sortOrder]);

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

      {loadingSchools && <p>Loading schools...</p>}
    </div>
  );
}

