'use client';
import React from 'react';
import { SchoolExpandedRow } from './SchoolExpandedRow';

type School = {
  id: string;
  school_name: string;
  city: string;
  board: string;
  states?: { name: string }[];
};

type Props = {
  schools: any[];
  expandedSchoolId: string | null;
  onToggleExpand: (id: string) => void;
  onEdit: (school: any) => void;
  // 👇 ADD THESE
  deskComments: any[];
  stateComments: any[];
  onAddComment: (role: 'desk' | 'state', schoolId: string) => void;
  onEditComment: (comment: any) => void;
  onDeleteComment: (id: string) => void;
  onDeprecate: (school: any) => void;

};


export function SchoolsTable({ schools, expandedSchoolId,
  onToggleExpand, onEdit, deskComments,
  stateComments,
  onAddComment,
  onEditComment,
  onDeleteComment,onDeprecate,  }: Props) {
  if (schools.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-4">
        No schools added yet.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">School</th>
            <th className="border px-3 py-2 text-left">City</th>
            <th className="border px-3 py-2 text-left">State</th>
            <th className="border px-3 py-2 text-left">Board</th>
            <th className="border px-3 py-2">Actions</th>

          </tr>
        </thead>

        <tbody>
  {schools.map((school) => (
<React.Fragment key={school.id}>

      {/* MAIN ROW */}
      <tr
        key={school.id}
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => onToggleExpand(school.id)}
      >
        <td className="border px-3 py-2">{school.school_name}</td>
        <td className="border px-3 py-2">{school.city}</td>
        <td className="border px-3 py-2">
          {Array.isArray(school.states)
            ? school.states[0]?.name
            : school.states?.name || '-'}
        </td>
        <td className="border px-3 py-2">{school.board || '-'}</td>
        <td className="border px-3 py-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(school);
            }}
            className="text-sm text-blue-600 underline"
          >
            Edit
          </button>
          <button
  onClick={(e) => {
    e.stopPropagation();
    onDeprecate(school);
  }}
  className="ml-3 text-sm text-red-600 underline"
>
  Deprecate
</button>

        </td>
      </tr>

      {/* EXPANDED ROW */}
      {expandedSchoolId === school.id && (
        <SchoolExpandedRow school={school}
         deskComments={deskComments}
  stateComments={stateComments}
  onAddComment={onAddComment}
  onEditComment={onEditComment}
  onDeleteComment={onDeleteComment} />
      )}
    </React.Fragment>
  ))}
</tbody>

      </table>
    </div>
  );
}

