import { useCallback, useEffect, useMemo, useState } from 'react';
import { PROBLEMS, getProblemById } from './data/problems.ts';
import type { JudgeResponse, LeaderboardEntry } from './types.ts';
import { TopNav, type ActiveRoute } from './components/TopNav.tsx';
import { ProblemsView } from './components/ProblemsView.tsx';
import { WorkspaceView } from './components/WorkspaceView.tsx';
import { SolutionsView } from './components/SolutionsView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';

const STORAGE_THEME = 'codebench_theme_v1';
const STORAGE_PROFILE = 'codebench_profile_v1';
const STORAGE_CODE_PREFIX = 'codebench_code_v1_';

interface UserProfile {
  handle: string;
  displayName: string;
  department: string;
}

function loadInitialProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      if (parsed.handle) {
        return {
          handle: parsed.handle,
          displayName: parsed.displayName || parsed.handle,
          department: parsed.department || 'COL1000 · IIT Delhi'
        };
      }
    }
  } catch {
    // Ignore storage errors
  }
  return {
    handle: 'iitd_coder',
    displayName: 'You',
    department: 'COL1000 · IIT Delhi'
  };
}

function loadInitialTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(STORAGE_THEME);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Ignore
  }
  return 'dark';
}

function loadSavedCode(problemId: number): string {
  const problem = getProblemById(problemId) || PROBLEMS[0];
  try {
    const saved = localStorage.getItem(`${STORAGE_CODE_PREFIX}${problem.id}`);
    if (saved !== null) return saved;
  } catch {
    // Ignore
  }
  return problem.starterCode;
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>('problems');
  const [selectedProblemId, setSelectedProblemId] = useState<number>(1);
  const [solutionProblemId, setSolutionProblemId] = useState<number>(1);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadInitialTheme);
  const [profile, setProfile] = useState<UserProfile>(loadInitialProfile);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [codeMap, setCodeMap] = useState<Record<number, string>>(() => ({
    1: loadSavedCode(1)
  }));

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Sync Tailwind dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const fetchLeaderboard = useCallback(async (handle: string) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/leaderboard?handle=${encodeURIComponent(handle)}`);
      if (res.ok) {
        const data = (await res.json()) as { entries: LeaderboardEntry[] };
        setLeaderboard(data.entries);
      }
    } catch {
      // Ignore network hiccup
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeaderboard(profile.handle);
  }, [profile.handle, fetchLeaderboard]);

  const currentUserEntry = useMemo(
    () => leaderboard.find((e) => e.isCurrentUser) || null,
    [leaderboard]
  );

  const solvedIds = useMemo(
    () => new Set<number>(currentUserEntry?.solvedIds ?? []),
    [currentUserEntry]
  );

  const activeProblem = useMemo(
    () => getProblemById(selectedProblemId) || PROBLEMS[0],
    [selectedProblemId]
  );

  const currentCode = codeMap[activeProblem.id] ?? loadSavedCode(activeProblem.id);

  const handleChangeCode = useCallback(
    (nextCode: string) => {
      setCodeMap((prev) => ({ ...prev, [activeProblem.id]: nextCode }));
      try {
        localStorage.setItem(`${STORAGE_CODE_PREFIX}${activeProblem.id}`, nextCode);
      } catch {
        // Ignore quota errors
      }
    },
    [activeProblem.id]
  );

  const handleOpenWorkspaceProblem = useCallback((problemId: number, loadSolution = false) => {
    const p = getProblemById(problemId) || PROBLEMS[0];
    setSelectedProblemId(p.id);
    if (loadSolution) {
      setCodeMap((prev) => ({ ...prev, [p.id]: p.solution.code }));
      try {
        localStorage.setItem(`${STORAGE_CODE_PREFIX}${p.id}`, p.solution.code);
      } catch {
        // Ignore
      }
    } else {
      setCodeMap((prev) => {
        if (prev[p.id] !== undefined) return prev;
        return { ...prev, [p.id]: loadSavedCode(p.id) };
      });
    }
    setActiveRoute('workspace');
  }, []);

  const handleOpenSolution = useCallback((problemId: number) => {
    setSolutionProblemId(problemId);
    setActiveRoute('solutions');
  }, []);

  const handleSaveProfile = async (next: UserProfile) => {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_PROFILE, JSON.stringify(next));
    } catch {
      // Ignore
    }
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next)
      });
      if (res.ok) {
        const data = (await res.json()) as { entries: LeaderboardEntry[] };
        setLeaderboard(data.entries);
      }
    } catch {
      // Ignore
    }
  };

  const handleSubmissionComplete = useCallback(
    (_res: JudgeResponse) => {
      void fetchLeaderboard(profile.handle);
    },
    [fetchLeaderboard, profile.handle]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100">
      <TopNav
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        userHandle={profile.handle}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      {activeRoute === 'problems' && (
        <ProblemsView
          problems={PROBLEMS}
          solvedIds={solvedIds}
          userScore={currentUserEntry?.score ?? 0}
          userRank={currentUserEntry?.rank ?? null}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onSelectProblem={(id) => handleOpenWorkspaceProblem(id, false)}
          onOpenSolution={handleOpenSolution}
        />
      )}

      {activeRoute === 'workspace' && (
        <WorkspaceView
          problems={PROBLEMS}
          problem={activeProblem}
          code={currentCode}
          onChangeCode={handleChangeCode}
          onSelectProblem={(id) => handleOpenWorkspaceProblem(id, false)}
          solvedIds={solvedIds}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          userHandle={profile.handle}
          userDisplayName={profile.displayName}
          onSubmissionComplete={handleSubmissionComplete}
        />
      )}

      {activeRoute === 'solutions' && (
        <SolutionsView
          problems={PROBLEMS}
          initialProblemId={solutionProblemId}
          solvedIds={solvedIds}
          onOpenInWorkspace={handleOpenWorkspaceProblem}
        />
      )}

      {activeRoute === 'leaderboard' && (
        <LeaderboardView
          entries={leaderboard}
          loading={loadingLeaderboard}
          totalProblems={PROBLEMS.length}
          onRefresh={() => void fetchLeaderboard(profile.handle)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onStartSolving={() => setActiveRoute('problems')}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          handle={profile.handle}
          displayName={profile.displayName}
          department={profile.department}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
