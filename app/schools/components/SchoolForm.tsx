'use client';
import React, { useState } from 'react';

type Props = {
  editing: boolean;
  states: { id: string; name: string }[];

  schoolName: string;
  city: string;
  board: string;
  stateId: string;

  batchType: string;
  batchApproved: boolean;
  batchInitiated: boolean;

  schoolPocName: string;
  schoolPocDesignation: string;
  schoolPocEmail: string;
  schoolPocPhone: string;

  aolPocName: string;
  aolPocEmail: string;
  aolPocPhone: string;
  primaryStateId: string;
  primaryStateName: string;
  
  onChange: {
    setSchoolName: (v: string) => void;
    setCity: (v: string) => void;
    setBoard: (v: string) => void;
    setStateId: (v: string) => void;

    setBatchType: (v: string) => void;
    setBatchApproved: (v: boolean) => void;
    setBatchInitiated: (v: boolean) => void;

    setSchoolPocName: (v: string) => void;
    setSchoolPocDesignation: (v: string) => void;
    setSchoolPocEmail: (v: string) => void;
    setSchoolPocPhone: (v: string) => void;

    setAolPocName: (v: string) => void;
    setAolPocEmail: (v: string) => void;
    setAolPocPhone: (v: string) => void;
  };

  onSave: () => void;
  onCancel: () => void;
};


export function SchoolForm({
  editing,
  states,
  schoolName,
  city,
  board,
  batchType,
  batchApproved,
  batchInitiated,
  schoolPocName,
  schoolPocDesignation,
  schoolPocEmail,
  schoolPocPhone,
  aolPocName,
  aolPocEmail,
  aolPocPhone,
  onChange,
  onSave,
  onCancel,primaryStateId, primaryStateName, stateId
}: Props) {

const [editingState, setEditingState] = useState(false);

const selectedStateName =
  states.find((s) => s.id === stateId)?.name || '';

  return (
    <div className="mb-6 rounded border p-4 space-y-4">
      <h3 className="font-medium">
        {editing ? 'Edit School' : 'Add School'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="border p-2"
          placeholder="School Name *"
          value={schoolName}
          onChange={(e) => onChange.setSchoolName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="City *"
          value={city}
          onChange={(e) => onChange.setCity(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Board"
          value={board}
          onChange={(e) => onChange.setBoard(e.target.value)}
        />

       <div>
  <label className="block text-sm font-medium mb-1">State *</label>

  {!editingState ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={selectedStateName || ''}
        disabled
        className="w-full border px-2 py-1 bg-gray-100 cursor-not-allowed"
      />
      <button
  type="button"
  className="text-blue-600 text-sm"
  onClick={() => setEditingState(true)}
>
  Change
</button>

    </div>
    
  ) : (
    <select
  className="border p-2 w-full"
  value={stateId ?? ''}
  onChange={(e) => {
    const newStateId = e.target.value;

    onChange.setStateId(newStateId); // 🔴 THIS WAS MISSING

  }}
>
  <option value="" disabled>
    Select state
  </option>

  {states.map((s) => (
    <option key={s.id} value={s.id}>
      {s.name}
    </option>
  ))}
</select>


  )}
</div>


      </div>
<h4 className="font-medium mt-4">School Point of Contact</h4>

<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <input
    className="border p-2"
    placeholder="POC Name"
    value={schoolPocName}
    onChange={(e) => onChange.setSchoolPocName(e.target.value)}
  />

  <input
    className="border p-2"
    placeholder="POC Designation"
    value={schoolPocDesignation}
    onChange={(e) => onChange.setSchoolPocDesignation(e.target.value)}
  />

  <input
    className="border p-2"
    placeholder="POC Email"
    value={schoolPocEmail}
    onChange={(e) => onChange.setSchoolPocEmail(e.target.value)}
  />

  <input
    className="border p-2"
    placeholder="POC Phone"
    value={schoolPocPhone}
    onChange={(e) => onChange.setSchoolPocPhone(e.target.value)}
  />
</div>
<h4 className="font-medium mt-6">AOL Point of Contact</h4>

<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <input
    className="border p-2"
    placeholder="AOL POC Name"
    value={aolPocName}
    onChange={(e) => onChange.setAolPocName(e.target.value)}
  />

  <input
    className="border p-2"
    placeholder="AOL POC Email"
    value={aolPocEmail}
    onChange={(e) => onChange.setAolPocEmail(e.target.value)}
  />

  <input
    className="border p-2"
    placeholder="AOL POC Phone"
    value={aolPocPhone}
    onChange={(e) => onChange.setAolPocPhone(e.target.value)}
  />
</div>
<h4 className="font-medium mt-6">Batch Status</h4>

<div className="flex flex-col gap-2">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={batchApproved}
      onChange={(e) => onChange.setBatchApproved(e.target.checked)}
    />
    Batch Approved
  </label>

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={batchInitiated}
      onChange={(e) => onChange.setBatchInitiated(e.target.checked)}
    />
    Batch Initiated
  </label>

  <input
    className="border p-2"
    placeholder="Batch Type"
    value={batchType}
    onChange={(e) => onChange.setBatchType(e.target.value)}
  />
</div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

