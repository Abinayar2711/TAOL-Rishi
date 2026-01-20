'use client';

type Props = {
  open: boolean;
  schoolName?: string;
  reason: string;
  onChangeReason: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeprecateModal({
  open,
  schoolName,
  reason,
  onChangeReason,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-red-600">
          Deprecate School
        </h3>

        <p className="text-sm">
          Are you sure you want to deprecate{' '}
          <b>{schoolName}</b>?
        </p>

        <textarea
          rows={3}
          className="w-full border p-2 text-sm"
          placeholder="Reason for deprecation"
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!reason.trim()}
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-sm text-white ${
              reason.trim()
                ? 'bg-red-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Deprecate
          </button>
        </div>
      </div>
    </div>
  );
}

