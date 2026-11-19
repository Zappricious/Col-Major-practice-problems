import { useState } from 'react';
import { X } from 'lucide-react';

interface ProfileModalProps {
  handle: string;
  displayName: string;
  department: string;
  onSave: (next: { handle: string; displayName: string; department: string }) => Promise<void>;
  onClose: () => void;
}

export function ProfileModal({
  handle,
  displayName,
  department,
  onSave,
  onClose
}: ProfileModalProps) {
  const [nextHandle, setNextHandle] = useState(handle);
  const [nextDisplayName, setNextDisplayName] = useState(displayName);
  const [nextDepartment, setNextDepartment] = useState(department);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nextHandle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 24);
    if (!cleaned) return;
    setSaving(true);
    try {
      await onSave({
        handle: cleaned,
        displayName: nextDisplayName.trim() || cleaned,
        department: nextDepartment.trim() || 'COL1000 · IIT Delhi'
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Coder Profile"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-[#232C3D] bg-white dark:bg-[#111620] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1E2634]">
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-slate-50">
            Coder Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Set your handle and name to track your accepted submissions and live rank on the COL1000 leaderboard.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="coder-handle" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Handle
            </label>
            <input
              id="coder-handle"
              type="text"
              required
              maxLength={24}
              value={nextHandle}
              onChange={(e) => setNextHandle(e.target.value)}
              placeholder="e.g. shaurya_cs"
              className="w-full px-3 py-2 font-mono text-sm bg-slate-50 dark:bg-[#0D1118] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#252E3F] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="coder-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Display Name
            </label>
            <input
              id="coder-name"
              type="text"
              maxLength={32}
              value={nextDisplayName}
              onChange={(e) => setNextDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#0D1118] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#252E3F] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="coder-dept" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Department / Batch
            </label>
            <input
              id="coder-dept"
              type="text"
              maxLength={32}
              value={nextDepartment}
              onChange={(e) => setNextDepartment(e.target.value)}
              placeholder="COL1000 · IIT Delhi"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#0D1118] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#252E3F] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C2434] rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
