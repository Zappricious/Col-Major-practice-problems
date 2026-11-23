import { useMemo, useState } from 'react';
import { Award, Check, Edit3, Link2, LogIn, Search, Trophy, Users } from 'lucide-react';
import type { LeaderboardEntry } from '../types.ts';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  isSignedIn: boolean;
  totalProblems: number;
  onSignIn: () => void;
  onOpenProfileModal: () => void;
  onStartSolving: () => void;
}

function formatRelativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function LeaderboardView({
  entries,
  loading,
  isSignedIn,
  totalProblems,
  onSignIn,
  onOpenProfileModal,
  onStartSolving
}: LeaderboardViewProps) {
  const [search, setSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const currentUser = useMemo(() => entries.find((e) => e.isCurrentUser) || null, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      `${e.handle} ${e.displayName} ${e.department}`.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <main className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E2634]">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            COL1000 Live Standings · Synced in Real Time via Cloud Firestore
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            Performance Leaderboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void handleCopyInviteLink()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#131822] hover:bg-slate-100 dark:hover:bg-[#1C2434] border border-slate-200 dark:border-[#252E3F] rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>{copiedLink ? 'Invite Link Copied' : 'Copy Invite Link'}</span>
          </button>

          {isSignedIn ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>

      {!isSignedIn ? (
        <section className="max-w-xl mx-auto py-14 px-6 text-center rounded-lg border border-slate-200 dark:border-[#232C3D] bg-white dark:bg-[#111620] space-y-4">
          <div className="w-11 h-11 mx-auto rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-lg font-bold text-slate-950 dark:text-slate-50">
              Sign in to join the live competition
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in with Google to view live friend standings, record accepted submissions across devices, and compete on the COL1000 leaderboard.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Personal Standing Summary Strip */}
          {currentUser && (
            <section className="grid grid-cols-2 sm:grid-cols-5 gap-6 py-5 px-5 rounded-lg border border-slate-200 dark:border-[#232C3D] bg-white dark:bg-[#111620]">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Your Rank</div>
                <div className="mt-1 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  #{currentUser.rank}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                  @{currentUser.handle}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Score</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-950 dark:text-slate-50 tabular-nums">
                  {currentUser.score.toLocaleString()}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  points earned
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Problems Solved</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-950 dark:text-slate-50 tabular-nums">
                  {currentUser.solvedCount}
                  <span className="text-sm font-normal text-slate-400">/{totalProblems}</span>
                </div>
                <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="text-emerald-600 dark:text-emerald-400">{currentUser.easySolved}E</span>
                  {' · '}
                  <span className="text-amber-600 dark:text-amber-400">{currentUser.mediumSolved}M</span>
                  {' · '}
                  <span className="text-rose-600 dark:text-rose-400">{currentUser.hardSolved}H</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Acceptance Rate</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-950 dark:text-slate-50 tabular-nums">
                  {currentUser.acceptanceRate}%
                </div>
                <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {currentUser.acceptedSubmissions}/{currentUser.totalSubmissions} accepted
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Avg Runtime</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-950 dark:text-slate-50 tabular-nums">
                  {currentUser.avgRuntimeMs > 0 ? `${currentUser.avgRuntimeMs} ms` : '—'}
                </div>
                <button
                  type="button"
                  onClick={onStartSolving}
                  className="mt-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Climb the ranks
                </button>
              </div>
            </section>
          )}

          {/* Search + Rankings Table */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search handle, name, or dept..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#131822] text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-[#232B3A] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {loading ? 'Syncing live standings...' : `${entries.length} ranked ${entries.length === 1 ? 'coder' : 'coders'}`}
              </div>
            </div>

            <div className="border border-slate-200 dark:border-[#1E2634] rounded-lg overflow-hidden bg-white dark:bg-[#111620]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-[#1E2634] bg-slate-50 dark:bg-[#151B27] text-xs font-medium text-slate-500 dark:text-slate-400">
                      <th className="py-3 pl-4 pr-2 w-16">Rank</th>
                      <th className="py-3 px-3">Coder</th>
                      <th className="py-3 px-3 hidden md:table-cell">Department</th>
                      <th className="py-3 px-3 text-right">Solved</th>
                      <th className="py-3 px-3 hidden sm:table-cell text-right">E / M / H</th>
                      <th className="py-3 px-3 text-right">Acceptance</th>
                      <th className="py-3 px-3 hidden sm:table-cell text-right">Avg Runtime</th>
                      <th className="py-3 px-3 text-right">Score</th>
                      <th className="py-3 pl-3 pr-4 hidden lg:table-cell text-right">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1B2230] text-sm">
                    {loading && entries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                          Loading live leaderboard...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                          No coders match your search.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((entry) => (
                        <tr
                          key={entry.handle + entry.rank}
                          className={
                            entry.isCurrentUser
                              ? 'bg-amber-50/70 dark:bg-amber-500/10'
                              : 'hover:bg-slate-50 dark:hover:bg-[#171E2C]'
                          }
                        >
                          <td className="py-3.5 pl-4 pr-2 font-mono text-xs font-semibold tabular-nums whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              {entry.rank === 1 ? (
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              ) : entry.rank <= 3 ? (
                                <Award className="w-3.5 h-3.5 text-slate-400" />
                              ) : null}
                              <span
                                className={
                                  entry.rank === 1
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-700 dark:text-slate-300'
                                }
                              >
                                #{entry.rank}
                              </span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {entry.displayName}
                              </span>
                              {entry.isCurrentUser && (
                                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                              @{entry.handle}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 hidden md:table-cell text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {entry.department}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs font-medium text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                            {entry.solvedCount} / {totalProblems}
                          </td>
                          <td className="py-3.5 px-3 hidden sm:table-cell text-right font-mono text-xs tabular-nums whitespace-nowrap">
                            <span className="text-emerald-600 dark:text-emerald-400">{entry.easySolved}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-amber-600 dark:text-amber-400">{entry.mediumSolved}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-rose-600 dark:text-rose-400">{entry.hardSolved}</span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                            {entry.acceptanceRate}%
                          </td>
                          <td className="py-3.5 px-3 hidden sm:table-cell text-right font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                            {entry.avgRuntimeMs > 0 ? `${entry.avgRuntimeMs} ms` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-sm font-semibold text-amber-700 dark:text-amber-400 tabular-nums whitespace-nowrap">
                            {entry.score.toLocaleString()}
                          </td>
                          <td className="py-3.5 pl-3 pr-4 hidden lg:table-cell text-right text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(entry.lastActive)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Scoring Formula */}
      <section className="pt-4 border-t border-slate-200 dark:border-[#1E2634] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Scoring Rules:</span>{' '}
          Easy = 100 pts · Medium = 200 pts · Hard = 350 pts · Fast runtime bonus up to +25 pts per first-time Accepted submission (all sample + hidden tests passed).
        </div>
        <div className="font-mono tabular-nums whitespace-nowrap">
          Tie-breaker: Higher Solved Count, then Lower Avg Runtime
        </div>
      </section>
    </main>
  );
}
