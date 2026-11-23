import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Lightbulb,
  Loader2,
  Lock,
  Moon,
  Play,
  RotateCcw,
  Send,
  Sun,
  Terminal,
  XCircle
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  recordVerifiedSubmission,
  subscribeProblemSubmissions
} from '../firebase.ts';
import type {
  Difficulty,
  JudgeResponse,
  Problem,
  SubmissionRecord,
  Verdict
} from '../types.ts';
import { CodeBlock } from './CodeBlock.tsx';
import { PythonEditor } from './PythonEditor.tsx';

interface WorkspaceViewProps {
  problems: Problem[];
  problem: Problem;
  code: string;
  onChangeCode: (nextCode: string) => void;
  onSelectProblem: (problemId: number) => void;
  solvedIds: Set<number>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  authUser: FirebaseUser | null;
  userHandle: string;
  userDisplayName: string;
  onSignIn: () => void;
}

type LeftTab = 'description' | 'solution' | 'submissions';
type ConsoleTab = 'cases' | 'results' | 'custom';

function difficultyColor(d: Difficulty): string {
  if (d === 'Easy') return 'text-emerald-600 dark:text-emerald-400';
  if (d === 'Medium') return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function verdictStyle(v: Verdict): { text: string; bg: string; border: string } {
  if (v === 'Accepted') {
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/30'
    };
  }
  if (v === 'Time Limit Exceeded') {
    return {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-200 dark:border-amber-500/30'
    };
  }
  return {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/30'
  };
}

function formatTimeAgo(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function WorkspaceView({
  problems,
  problem,
  code,
  onChangeCode,
  onSelectProblem,
  solvedIds,
  theme,
  onToggleTheme,
  authUser,
  userHandle,
  userDisplayName,
  onSignIn
}: WorkspaceViewProps) {
  const [leftTab, setLeftTab] = useState<LeftTab>('description');
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('cases');
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [customInput, setCustomInput] = useState(problem.samples[0]?.input ?? '');
  const [isRunning, setIsRunning] = useState(false);
  const [runningMode, setRunningMode] = useState<'run' | 'submit' | 'custom' | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResponse | null>(null);
  const [customResult, setCustomResult] = useState<JudgeResponse['customOutput'] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Split pane percentages
  const [leftWidthPct, setLeftWidthPct] = useState(44);
  const [consoleHeightPct, setConsoleHeightPct] = useState(38);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);

  // Reset per-problem UI state when switching problems
  useEffect(() => {
    setSelectedSampleIdx(0);
    setRevealedHints(0);
    setJudgeResult(null);
    setCustomResult(null);
    setApiError(null);
    setConsoleTab('cases');
    setCustomInput(problem.samples[0]?.input ?? '');
  }, [problem.id]);

  useEffect(() => {
    if (!authUser) {
      setSubmissions([]);
      setLoadingSubs(false);
      return;
    }
    setLoadingSubs(true);
    const unsubscribe = subscribeProblemSubmissions(authUser.uid, problem.id, (records) => {
      setSubmissions(records);
      setLoadingSubs(false);
    });
    return () => unsubscribe();
  }, [authUser, problem.id]);

  const executeCode = useCallback(
    async (mode: 'run' | 'submit' | 'custom') => {
      if (isRunning) return;
      setIsRunning(true);
      setRunningMode(mode);
      setApiError(null);

      try {
        const res = await fetch('/api/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: problem.id,
            code,
            mode,
            customInput: mode === 'custom' ? customInput : undefined,
            handle: userHandle,
            displayName: userDisplayName
          })
        });

        const data = (await res.json()) as JudgeResponse & { error?: string };
        if (!res.ok) {
          setApiError(data.error || 'Execution failed on server.');
          return;
        }

        if (mode === 'custom') {
          setCustomResult(data.customOutput ?? null);
          setConsoleTab('custom');
        } else if (mode === 'submit' && authUser) {
          const synced = await recordVerifiedSubmission(authUser, problem, data, code);
          setJudgeResult({
            ...data,
            pointsAwarded: synced.pointsAwarded,
            firstSolve: synced.firstSolve
          });
          setConsoleTab('results');
        } else {
          setJudgeResult({
            ...data,
            pointsAwarded: 0,
            firstSolve: false
          });
          setConsoleTab('results');
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('"operationType"')) {
          setApiError(
            'Could not save submission to the shared leaderboard. Please sign out and sign in again with your verified Google account.'
          );
        } else {
          setApiError('Unable to reach the Python execution server. Please try again.');
        }
      } finally {
        setIsRunning(false);
        setRunningMode(null);
      }
    },
    [
      isRunning,
      problem,
      code,
      customInput,
      userHandle,
      userDisplayName,
      authUser
    ]
  );

  // Horizontal splitter (Left pane vs Right pane)
  const startHorizontalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = workspaceRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onMove = (moveEvent: MouseEvent) => {
      const pct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.max(28, Math.min(64, pct)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Vertical splitter (Editor vs Console)
  const startVerticalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = rightPaneRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onMove = (moveEvent: MouseEvent) => {
      const bottomPct = ((rect.bottom - moveEvent.clientY) / rect.height) * 100;
      setConsoleHeightPct(Math.max(20, Math.min(70, bottomPct)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore
    }
  };

  const currentIdx = problems.findIndex((p) => p.id === problem.id);
  const prevProblem = currentIdx > 0 ? problems[currentIdx - 1] : null;
  const nextProblem = currentIdx < problems.length - 1 ? problems[currentIdx + 1] : null;
  const isSolved = solvedIds.has(problem.id);

  const sampleResults = judgeResult?.results.filter((r) => !r.isHidden) ?? [];
  const hiddenResults = judgeResult?.results.filter((r) => r.isHidden) ?? [];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0E14]">
      {/* Workspace Action Toolbar (below TopNav) */}
      <div className="h-12 shrink-0 px-3 sm:px-4 border-b border-slate-200 dark:border-[#1E2634] bg-white dark:bg-[#111620] flex items-center justify-between gap-3 overflow-x-auto">
        {/* Left: Problem Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={!prevProblem}
            onClick={() => prevProblem && onSelectProblem(prevProblem.id)}
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2434] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Previous Problem"
            aria-label="Previous Problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            aria-label="Select Problem"
            value={problem.id}
            onChange={(e) => onSelectProblem(Number(e.target.value))}
            className="max-w-[230px] sm:max-w-[300px] px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-[#161D2A] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#263144] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 truncate"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {String(p.id).padStart(2, '0')}. {p.title} {solvedIds.has(p.id) ? '(Solved)' : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!nextProblem}
            onClick={() => nextProblem && onSelectProblem(nextProblem.id)}
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C2434] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Next Problem"
            aria-label="Next Problem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center/Right: Editor Settings + Run & Submit */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="hidden xl:inline text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Python 3.11
          </span>

          <select
            aria-label="Editor font size"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="hidden sm:block px-2 py-1.5 text-xs font-mono bg-slate-50 dark:bg-[#161D2A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#263144] rounded-md"
          >
            <option value={13}>13px</option>
            <option value={14}>14px</option>
            <option value={15}>15px</option>
            <option value={16}>16px</option>
          </select>

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1C2434] rounded-md transition-colors cursor-pointer"
            title="Toggle Dark/Light Theme"
            aria-label="Toggle Dark/Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onChangeCode(problem.starterCode)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2434] rounded-md transition-colors whitespace-nowrap cursor-pointer"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => void executeCode('run')}
            title="Run sample test cases (Ctrl+Enter)"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-[#1C2536] hover:bg-slate-200 dark:hover:bg-[#253147] border border-slate-200 dark:border-[#2D3B55] rounded-md transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            {isRunning && runningMode === 'run' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Run Tests</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => void executeCode('submit')}
            title="Submit against sample + hidden tests (Ctrl+Shift+Enter)"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            {isRunning && runningMode === 'submit' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div
        ref={workspaceRef}
        className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden"
      >
        {/* LEFT PANE: Problem Statement / Solution / Submissions */}
        <section
          className="flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#1E2634] bg-white dark:bg-[#111620] lg:w-[var(--left-w)] h-[45%] lg:h-full shrink-0"
          style={{ ['--left-w' as string]: `${leftWidthPct}%` }}
        >
          {/* Left Pane Tabs */}
          <div className="h-10 shrink-0 px-4 border-b border-slate-200 dark:border-[#1E2634] bg-slate-50/70 dark:bg-[#131924] flex items-center gap-5">
            {(
              [
                { id: 'description', label: 'Description' },
                { id: 'solution', label: 'Solution' },
                { id: 'submissions', label: 'Submissions' }
              ] as const
            ).map((tab) => {
              const active = leftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeftTab(tab.id)}
                  className={`relative h-full inline-flex items-center text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'text-slate-950 dark:text-slate-50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Pane Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {leftTab === 'description' && (
              <>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">
                      Problem {String(problem.id).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-medium ${difficultyColor(problem.difficulty)}`}>
                      {problem.pdfDifficultyLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{problem.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{problem.points} pts</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Lock className="w-3 h-3" />
                      {problem.hiddenTestCount} hidden
                    </span>
                    {isSolved && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Solved
                        </span>
                      </>
                    )}
                  </div>
                  <h1 className="font-display text-xl font-bold text-slate-950 dark:text-slate-50">
                    {problem.title}
                  </h1>
                </div>

                {/* Problem Statement */}
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {problem.description.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Worked Example */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#161D2A] border border-slate-200 dark:border-[#232C3D] space-y-1.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Worked Example
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {problem.workedExample}
                  </p>
                </div>

                {/* Formats & Constraints */}
                <div className="space-y-3.5 text-sm border-y border-slate-200 dark:border-[#1E2634] py-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Input Format
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {problem.inputFormat}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Output Format
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {problem.outputFormat}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Constraints
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {problem.constraints}
                    </p>
                  </div>
                  {problem.note && (
                    <div className="text-xs text-amber-700 dark:text-amber-400">
                      Note: {problem.note}
                    </div>
                  )}
                </div>

                {/* Sample Test Cases */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Sample Test Cases
                  </div>
                  {problem.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="rounded-lg border border-slate-200 dark:border-[#232C3D] bg-slate-50/80 dark:bg-[#0D1118] overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200 dark:border-[#1E2634] bg-white dark:bg-[#151B27]">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {sample.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomInput(sample.input);
                              setConsoleTab('custom');
                            }}
                            className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Use in Custom Input
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCopyText(sample.id, sample.input)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                          >
                            {copiedId === sample.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === sample.id ? 'Copied' : 'Copy Input'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-[#1E2634]">
                        <div className="p-3">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                            Input
                          </div>
                          <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre overflow-x-auto">
                            {sample.input}
                          </pre>
                        </div>
                        <div className="p-3">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                            Expected Output
                          </div>
                          <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre overflow-x-auto">
                            {sample.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progressive Hints */}
                {problem.hints.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hints ({revealedHints}/{problem.hints.length})</span>
                      </span>
                      {revealedHints < problem.hints.length && (
                        <button
                          type="button"
                          onClick={() => setRevealedHints((h) => h + 1)}
                          className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Reveal Hint {revealedHints + 1}
                        </button>
                      )}
                    </div>
                    {revealedHints > 0 && (
                      <div className="space-y-2">
                        {problem.hints.slice(0, revealedHints).map((hint, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-md bg-amber-50/70 dark:bg-amber-500/8 border border-amber-200/80 dark:border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                          >
                            <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 mr-1.5">
                              Hint {idx + 1}:
                            </span>
                            {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {leftTab === 'solution' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-950 dark:text-slate-50">
                    Step-by-Step Solution
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {problem.solution.intuition}
                  </p>
                </div>

                <ol className="space-y-4 divide-y divide-slate-200 dark:divide-[#1E2634]">
                  {problem.solution.steps.map((step, idx) => (
                    <li key={idx} className={idx > 0 ? 'pt-4' : ''}>
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {step.title}
                          </div>
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-200 dark:border-[#1E2634] text-xs">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Time Complexity</div>
                    <div className="mt-1 font-mono text-slate-900 dark:text-slate-100">
                      {problem.solution.timeComplexity}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Space Complexity</div>
                    <div className="mt-1 font-mono text-slate-900 dark:text-slate-100">
                      {problem.solution.spaceComplexity}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Common Pitfalls</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {problem.solution.pitfalls.map((pitfall, idx) => (
                      <li key={idx}>{pitfall}</li>
                    ))}
                  </ul>
                </div>

                <CodeBlock
                  code={problem.solution.code}
                  title={`solution_${String(problem.id).padStart(2, '0')}.py`}
                  onLoadInEditor={() => onChangeCode(problem.solution.code)}
                />
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-slate-950 dark:text-slate-50">
                    Your Submissions
                  </h2>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    @{userHandle}
                  </span>
                </div>

                {!authUser ? (
                  <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#232C3D] rounded-lg px-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Sign in with Google to save submission history
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your code attempts, verdicts, and scores sync across devices on the shared leaderboard.
                    </p>
                    <button
                      type="button"
                      onClick={onSignIn}
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
                    >
                      Sign in with Google
                    </button>
                  </div>
                ) : loadingSubs ? (
                  <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading submission history...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#232C3D] rounded-lg px-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No submissions yet for this problem
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Click Submit to run your Python 3 code against all sample and hidden test cases.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-[#1E2634] rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#151B27] border-b border-slate-200 dark:border-[#1E2634] text-slate-500 dark:text-slate-400">
                          <th className="py-2.5 px-3">Verdict</th>
                          <th className="py-2.5 px-2 text-right">Tests</th>
                          <th className="py-2.5 px-2 text-right">Runtime</th>
                          <th className="py-2.5 px-2 text-right">When</th>
                          <th className="py-2.5 px-3 text-right">Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1B2230]">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-[#171E2C]">
                            <td className="py-2.5 px-3 font-medium">
                              <span
                                className={
                                  sub.verdict === 'Accepted'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : sub.verdict === 'Time Limit Exceeded'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                }
                              >
                                {sub.verdict}
                              </span>
                              {sub.pointsAwarded > 0 && (
                                <span className="ml-1.5 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                                  +{sub.pointsAwarded}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                              {sub.passedCount}/{sub.totalCount}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                              {sub.runtimeMs} ms
                            </td>
                            <td className="py-2.5 px-2 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatTimeAgo(sub.createdAt)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => onChangeCode(sub.code)}
                                className="text-amber-700 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                              >
                                Restore
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Horizontal Drag Handle (Desktop) */}
        <div
          onMouseDown={startHorizontalResize}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize problem and editor panels"
          className="hidden lg:block w-1.5 cursor-col-resize bg-transparent hover:bg-amber-500/40 active:bg-amber-500/60 transition-colors shrink-0"
        />

        {/* RIGHT PANE: Python 3 Editor + Test Case Console */}
        <div
          ref={rightPaneRef}
          className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden"
        >
          {/* Editor Area */}
          <div className="flex-1 min-h-[180px] overflow-hidden">
            <PythonEditor
              value={code}
              onChange={onChangeCode}
              theme={theme}
              fontSize={fontSize}
              onRunShortcut={() => void executeCode('run')}
              onSubmitShortcut={() => void executeCode('submit')}
            />
          </div>

          {/* Vertical Drag Handle */}
          <div
            onMouseDown={startVerticalResize}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize editor and test console"
            className="h-1.5 cursor-row-resize border-t border-slate-200 dark:border-[#1E2634] bg-slate-100/80 dark:bg-[#131924] hover:bg-amber-500/40 active:bg-amber-500/60 transition-colors shrink-0"
          />

          {/* Bottom Console Area */}
          <section
            className="shrink-0 flex flex-col bg-white dark:bg-[#111620] overflow-hidden"
            style={{ height: `${consoleHeightPct}%` }}
          >
            {/* Console Tabs */}
            <div className="h-10 shrink-0 px-4 border-b border-slate-200 dark:border-[#1E2634] bg-slate-50/70 dark:bg-[#131924] flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 h-full">
                {(
                  [
                    { id: 'cases', label: `Sample Cases (${problem.samples.length})` },
                    {
                      id: 'results',
                      label: judgeResult
                        ? `Judge Results (${judgeResult.passedCount}/${judgeResult.totalCount})`
                        : 'Judge Results'
                    },
                    { id: 'custom', label: 'Custom Input' }
                  ] as const
                ).map((tab) => {
                  const active = consoleTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setConsoleTab(tab.id)}
                      className={`relative h-full inline-flex items-center text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'text-slate-950 dark:text-slate-50'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isRunning && (
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {runningMode === 'submit'
                      ? 'Evaluating sample + hidden tests...'
                      : 'Running Python 3...'}
                  </span>
                </div>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {apiError && (
                <div className="mb-3 p-3 rounded-md border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Tab 1: Visible Sample Cases */}
              {consoleTab === 'cases' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {problem.samples.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSampleIdx(idx)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          selectedSampleIdx === idx
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-[#192130] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#232D42]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Lock className="w-3 h-3" />
                      <span>+ {problem.hiddenTestCount} hidden tests evaluated on Submit</span>
                    </span>
                  </div>

                  {problem.samples[selectedSampleIdx] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-md border border-slate-200 dark:border-[#232C3D] bg-slate-50 dark:bg-[#0D1118]">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                          Standard Input (stdin)
                        </div>
                        <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre overflow-x-auto">
                          {problem.samples[selectedSampleIdx].input}
                        </pre>
                      </div>
                      <div className="p-3 rounded-md border border-slate-200 dark:border-[#232C3D] bg-slate-50 dark:bg-[#0D1118]">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                          Expected Output (stdout)
                        </div>
                        <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre overflow-x-auto">
                          {problem.samples[selectedSampleIdx].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Live Judge Results */}
              {consoleTab === 'results' && (
                <>
                  {!judgeResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6">
                      <Terminal className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-2" />
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Run your code to inspect instant test results
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Use Run Tests for visible samples or Submit to evaluate all {problem.samples.length + problem.hiddenTestCount} tests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Verdict Summary Banner */}
                      {(() => {
                        const style = verdictStyle(judgeResult.verdict);
                        return (
                          <div
                            className={`p-3.5 rounded-lg border ${style.border} ${style.bg} flex flex-wrap items-center justify-between gap-3`}
                          >
                            <div className="flex items-center gap-2.5">
                              {judgeResult.verdict === 'Accepted' ? (
                                <CheckCircle2 className={`w-5 h-5 ${style.text} shrink-0`} />
                              ) : judgeResult.verdict === 'Time Limit Exceeded' ? (
                                <Clock className={`w-5 h-5 ${style.text} shrink-0`} />
                              ) : (
                                <XCircle className={`w-5 h-5 ${style.text} shrink-0`} />
                              )}
                              <div>
                                <div className={`text-sm font-bold ${style.text}`}>
                                  {judgeResult.verdict}
                                  {judgeResult.mode === 'run' && judgeResult.verdict === 'Accepted'
                                    ? ' (Sample Tests Passed)'
                                    : ''}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                                  {judgeResult.passedCount} / {judgeResult.totalCount} test cases passed · Avg {judgeResult.avgRuntimeMs} ms
                                  {judgeResult.mode === 'submit'
                                    ? ` · Hidden ${judgeResult.hiddenPassedCount}/${judgeResult.hiddenTotalCount}`
                                    : ''}
                                </div>
                              </div>
                            </div>

                            {judgeResult.firstSolve && judgeResult.pointsAwarded > 0 && (
                              <div className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-300 tabular-nums">
                                +{judgeResult.pointsAwarded} pts synced to Live Leaderboard
                              </div>
                            )}
                            {judgeResult.mode === 'submit' && !authUser && (
                              <button
                                type="button"
                                onClick={onSignIn}
                                className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                              >
                                Sign in with Google to save score to Leaderboard
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* Sample Test Case Results */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Sample Test Cases ({judgeResult.samplePassedCount}/{judgeResult.sampleTotalCount})
                        </div>
                        <div className="space-y-2.5">
                          {sampleResults.map((tc) => (
                            <div
                              key={tc.index}
                              className="rounded-md border border-slate-200 dark:border-[#232C3D] bg-slate-50/70 dark:bg-[#0D1118] overflow-hidden"
                            >
                              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200 dark:border-[#1E2634] bg-white dark:bg-[#151B27]">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                  {tc.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  )}
                                  <span className="text-slate-800 dark:text-slate-200">{tc.name}</span>
                                  <span
                                    className={
                                      tc.passed
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }
                                  >
                                    {tc.status}
                                  </span>
                                </div>
                                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                  {tc.runtimeMs} ms
                                </span>
                              </div>

                              <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                                    Input
                                  </div>
                                  <pre className="font-mono text-slate-700 dark:text-slate-300 whitespace-pre overflow-x-auto">
                                    {tc.input}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                                    Expected Output
                                  </div>
                                  <pre className="font-mono text-slate-700 dark:text-slate-300 whitespace-pre overflow-x-auto">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                                    Your Output
                                  </div>
                                  <pre
                                    className={`font-mono whitespace-pre overflow-x-auto ${
                                      tc.passed
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : 'text-rose-700 dark:text-rose-400'
                                    }`}
                                  >
                                    {tc.actualOutput || '(empty output)'}
                                  </pre>
                                </div>
                              </div>

                              {tc.stderr && (
                                <div className="px-3 pb-3">
                                  <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 font-mono text-[11px] text-rose-700 dark:text-rose-300 whitespace-pre-wrap overflow-x-auto">
                                    {tc.stderr}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hidden Test Case Results (shown on Submit) */}
                      {hiddenResults.length > 0 && (
                        <div className="space-y-2.5 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              Hidden Test Suite ({judgeResult.hiddenPassedCount}/{judgeResult.hiddenTotalCount})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {hiddenResults.map((ht) => (
                              <div
                                key={ht.index}
                                className={`p-2.5 rounded-md border text-xs flex flex-col gap-1.5 ${
                                  ht.passed
                                    ? 'border-emerald-200/80 dark:border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-500/5'
                                    : 'border-rose-200/80 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                    {ht.passed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    )}
                                    <span>{ht.name}</span>
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                    {ht.runtimeMs} ms
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span
                                    className={
                                      ht.passed
                                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                        : 'text-rose-700 dark:text-rose-400 font-medium'
                                    }
                                  >
                                    {ht.status}
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500">
                                    Input/Output hidden
                                  </span>
                                </div>
                                {ht.stderr && (
                                  <pre className="mt-1 p-2 rounded bg-rose-100/70 dark:bg-rose-950/50 font-mono text-[10px] text-rose-700 dark:text-rose-300 whitespace-pre-wrap overflow-x-auto">
                                    {ht.stderr}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Tab 3: Custom Input Runner */}
              {consoleTab === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="custom-stdin"
                        className="text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Custom Standard Input (stdin)
                      </label>
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={() => void executeCode('custom')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {isRunning && runningMode === 'custom' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>Run Custom Input</span>
                      </button>
                    </div>
                    <textarea
                      id="custom-stdin"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      rows={5}
                      spellCheck={false}
                      placeholder="Enter custom stdin lines here..."
                      className="flex-1 w-full p-3 font-mono text-xs bg-slate-50 dark:bg-[#0D1118] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#232C3D] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Execution Output
                      </span>
                      {customResult && (
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {customResult.timedOut
                            ? 'Time Limit Exceeded'
                            : `${customResult.runtimeMs} ms`}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-3 font-mono text-xs bg-slate-50 dark:bg-[#0D1118] border border-slate-200 dark:border-[#232C3D] rounded-md overflow-auto min-h-[112px]">
                      {!customResult ? (
                        <span className="text-slate-400 dark:text-slate-500">
                          Click &quot;Run Custom Input&quot; to see live Python 3 stdout/stderr.
                        </span>
                      ) : (
                        <div className="space-y-2">
                          {customResult.stdout && (
                            <pre className="text-slate-800 dark:text-slate-200 whitespace-pre">
                              {customResult.stdout}
                            </pre>
                          )}
                          {customResult.stderr && (
                            <pre className="text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                              {customResult.stderr}
                            </pre>
                          )}
                          {!customResult.stdout && !customResult.stderr && (
                            <span className="text-slate-400 dark:text-slate-500">
                              (program finished with no output)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
