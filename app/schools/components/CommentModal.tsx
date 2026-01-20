'use client';

type Props = {
  open: boolean;
  role: 'desk' | 'state' | null;
  text: string;
  onChangeText: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function CommentModal({
  open,
  role,
  text,
  onChangeText,
  onClose,
  onSave,
}: Props) {
  if (!open || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">
          {role === 'desk' ? 'Desk Comment' : 'State Remark'}
        </h3>

        <textarea
          className="w-full border p-2 text-sm"
          rows={4}
          placeholder="Enter comment"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!text.trim()}
            onClick={onSave}
            className={`px-4 py-2 rounded text-sm text-white ${
              text.trim()
                ? 'bg-black'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

