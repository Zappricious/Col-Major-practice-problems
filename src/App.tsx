import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { PROBLEMS, getProblemById } from './data/problems.ts';
import type { LeaderboardEntry } from './types.ts';
import {
  auth,
  ensureUserDocuments,
  signInWithGoogle,
  signOutUser,
  subscribeLeaderboard,
  updateLeaderboardProfile
} from './firebase.ts';
import { TopNav, type ActiveRoute } from './components/TopNav.tsx';
import { ProblemsView } from './components/ProblemsView.tsx';
import { WorkspaceView } from './components/WorkspaceView.tsx';
import { SolutionsView } from './components/SolutionsView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';

const STORAGE_THEME = 'codebench_theme_v1';
const STORAGE_CODE_PREFIX = 'codebench_code_v1_';

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
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authActionBusy, setAuthActionBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        ensureUserDocuments(user).catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          setAuthError(`Profile setup could not complete: ${msg}`);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time shared Firestore leaderboard ONLY when authenticated
  useEffect(() => {
    if (!authReady || !authUser) {
      setLeaderboard([]);
      setLoadingLeaderboard(false);
      return;
    }

    setLoadingLeaderboard(true);
    const unsubscribe = subscribeLeaderboard(authUser.uid, (entries) => {
      setLeaderboard(entries);
      setLoadingLeaderboard(false);
    });
    return () => unsubscribe();
  }, [authReady, authUser]);

  const currentUserEntry = useMemo(
    () => leaderboard.find((e) => e.isCurrentUser) || null,
    [leaderboard]
  );

  const currentHandle =
    currentUserEntry?.handle ||
    (authUser?.email ? authUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '_') : 'guest');
  const currentDisplayName =
    currentUserEntry?.displayName || authUser?.displayName || currentHandle;
  const currentDepartment = currentUserEntry?.department || 'COL1000 · IIT Delhi';

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

  const handleSignIn = useCallback(async () => {
    if (authActionBusy) return;
    setAuthActionBusy(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      const msg = err instanceof Error ? err.message : String(err);

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User intentionally dismissed the popup
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Your browser blocked the Google sign-in popup inside the preview frame. Allow popups for this site or open the app directly in a new tab.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          `Domain "${window.location.hostname}" is not yet authorized in Firebase Auth. Add it under Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else {
        setAuthError(`Google sign-in failed (${code || 'unknown'}): ${msg}`);
      }
    } finally {
      setAuthActionBusy(false);
    }
  }, [authActionBusy]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const handleSaveProfile = async (next: {
    handle: string;
    displayName: string;
    department: string;
  }) => {
    if (!authUser) return;
    await updateLeaderboardProfile(authUser.uid, next);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100">
      <TopNav
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        isSignedIn={Boolean(authUser)}
        authLoading={!authReady || authActionBusy}
        userHandle={currentHandle}
        onSignIn={() => void handleSignIn()}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      {authError && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-500/30 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300 flex flex-wrap items-center justify-center gap-3">
          <span>{authError}</span>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline text-rose-900 dark:text-rose-100 whitespace-nowrap"
          >
            Open in New Tab
          </a>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

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
          authUser={authUser}
          userHandle={currentHandle}
          userDisplayName={currentDisplayName}
          onSignIn={() => void handleSignIn()}
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
          isSignedIn={Boolean(authUser)}
          totalProblems={PROBLEMS.length}
          onSignIn={() => void handleSignIn()}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onStartSolving={() => setActiveRoute('problems')}
        />
      )}

      {showProfileModal && authUser && (
        <ProfileModal
          email={authUser.email}
          handle={currentHandle}
          displayName={currentDisplayName}
          department={currentDepartment}
          onSave={handleSaveProfile}
          onSignOut={handleSignOut}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
