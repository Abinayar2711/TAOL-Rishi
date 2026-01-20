'use client';

type Props = {
  school: any;
  deskComments: any[];
  stateComments: any[];
  onAddComment: (role: 'desk' | 'state', schoolId: string) => void;
  onEditComment: (comment: any) => void;
  onDeleteComment: (id: string) => void;
};


export function SchoolExpandedRow({ school, deskComments,
  stateComments,
  onAddComment,
  onEditComment,
  onDeleteComment, }: Props) {
  const details = school.school_details; //?.[0];

  return (
    <tr>
      <td colSpan={6} className="bg-gray-50 px-6 py-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Batch */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-2">Batch</h4>
            <p><b>Type:</b> {details?.batch_type || '-'}</p>
            <p><b>Approved:</b> {details?.batch_approved ? 'Yes' : 'No'}</p>
            <p><b>Initiated:</b> {details?.batch_initiated ? 'Yes' : 'No'}</p>
          </div>

          {/* School POC */}
          <div>
            <h4 className="font-semibold mb-2">School POC</h4>
            <p><b>Name:</b> {details?.school_poc_name || '-'}</p>
            <p><b>Email:</b> {details?.school_poc_email || '-'}</p>
            <p><b>Phone:</b> {details?.school_poc_phone || '-'}</p>
          </div>

          {/* AOL POC */}
          <div>
            <h4 className="font-semibold mb-2">AOL POC</h4>
            <p><b>Name:</b> {details?.aol_poc_name || '-'}</p>
            <p><b>Email:</b> {details?.aol_poc_email || '-'}</p>
            <p><b>Phone:</b> {details?.aol_poc_phone || '-'}</p>
          </div>

        </div>
        {/* COMMENTS SECTION */}
<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

  {/* STATE REMARKS */}
  <div>
    <h4 className="font-semibold mb-2">State Coordinator Remarks</h4>

    {stateComments.length === 0 ? (
      <p className="text-xs text-gray-400">No remarks yet</p>
    ) : (
      stateComments.map(c => (
        <div key={c.id} className="border-l-2 pl-3 mb-2 text-sm">
          <p>{c.comment_text}</p>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{new Date(c.created_at).toLocaleDateString()}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onEditComment(c)}
                className="underline text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteComment(c.id)}
                className="underline text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))
    )}

    <button
      className="mt-2 text-xs underline"
      onClick={() => onAddComment('state', school.id)}
    >
      + Add State Remark
    </button>
  </div>

  {/* DESK COMMENTS */}
  <div>
    <h4 className="font-semibold mb-2">Program Desk Comments</h4>

    {deskComments.length === 0 ? (
      <p className="text-xs text-gray-400">No comments yet</p>
    ) : (
      deskComments.map(c => (
        <div key={c.id} className="border-l-2 pl-3 mb-2 text-sm">
          <p>{c.comment_text}</p>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{new Date(c.created_at).toLocaleDateString()}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onEditComment(c)}
                className="underline text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteComment(c.id)}
                className="underline text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))
    )}

    <button
      className="mt-2 text-xs underline"
      onClick={() => onAddComment('desk', school.id)}
    >
      + Add Desk Comment
    </button>
  </div>

</div>



        {school.updated_at && (
          <p className="mt-4 text-xs text-gray-500">
            Last updated on {new Date(school.updated_at).toLocaleDateString()}
          </p>
        )}
      </td>
    </tr>
  );
}

