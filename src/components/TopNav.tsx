import { User } from 'lucide-react';

export type ActiveRoute = 'problems' | 'workspace' | 'solutions' | 'leaderboard';

interface TopNavProps {
  activeRoute: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  userHandle: string;
  onOpenProfileModal: () => void;
}

const NAV_ITEMS: { id: ActiveRoute; label: string }[] = [
  { id: 'problems', label: 'Problems' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'leaderboard', label: 'Leaderboard' }
];

export function TopNav({
  activeRoute,
  onNavigate,
  userHandle,
  onOpenProfileModal
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-slate-200 dark:border-[#1E2634] bg-white/95 dark:bg-[#0E131B]/95 backdrop-blur-sm">
      <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('problems')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
        >
          CodeBench
        </button>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav aria-label="Primary Navigation" className="flex items-center gap-5 sm:gap-7 h-full overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative h-full inline-flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive
                    ? 'text-slate-950 dark:text-slate-50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (Profile / Handle) */}
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-[#192130] hover:bg-slate-200 dark:hover:bg-[#222C40] border border-slate-200 dark:border-[#2A3548] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-mono max-w-[120px] truncate">{userHandle}</span>
        </button>
      </div>
    </header>
  );
}
