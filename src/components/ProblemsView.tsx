import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  FileText,
  Lock,
  Moon,
  Search,
  Sun
} from 'lucide-react';
import type { Difficulty, Problem, Topic } from '../types.ts';
import { PdfViewerModal } from './PdfViewerModal.tsx';

interface ProblemsViewProps {
  problems: Problem[];
  solvedIds: Set<number>;
  userScore: number;
  userRank: number | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectProblem: (problemId: number) => void;
  onOpenSolution: (problemId: number) => void;
}

const DIFFICULTIES: ('All' | Difficulty)[] = ['All', 'Easy', 'Medium', 'Hard'];
const STATUS_FILTERS: ('All' | 'Solved' | 'Unsolved')[] = ['All', 'Solved', 'Unsolved'];

function difficultyTextClass(difficulty: Difficulty): string {
  if (difficulty === 'Easy') return 'text-emerald-600 dark:text-emerald-400';
  if (difficulty === 'Medium') return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function ProblemsView({
  problems,
  solvedIds,
  userScore,
  userRank,
  theme,
  onToggleTheme,
  onSelectProblem,
  onOpenSolution
}: ProblemsViewProps) {
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [topicFilter, setTopicFilter] = useState<'All' | Topic>('All');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const topics = useMemo(() => {
    const set = new Set<Topic>();
    problems.forEach((p) => set.add(p.topic));
    return ['All' as const, ...Array.from(set)];
  }, [problems]);

  const stats = useMemo(() => {
    let easyTotal = 0;
    let easySolved = 0;
    let medTotal = 0;
    let medSolved = 0;
    let hardTotal = 0;
    let hardSolved = 0;
    let totalHidden = 0;

    for (const p of problems) {
      totalHidden += p.hiddenTestCount;
      const isSolved = solvedIds.has(p.id);
      if (p.difficulty === 'Easy') {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (p.difficulty === 'Medium') {
        medTotal++;
        if (isSolved) medSolved++;
      } else {
        hardTotal++;
        if (isSolved) hardSolved++;
      }
    }
    return { easyTotal, easySolved, medTotal, medSolved, hardTotal, hardSolved, totalHidden };
  }, [problems, solvedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((p) => {
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
      if (topicFilter !== 'All' && p.topic !== topicFilter) return false;
      const isSolved = solvedIds.has(p.id);
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Unsolved' && isSolved) return false;
      if (q) {
        const hay = `${p.id} ${p.title} ${p.topic} ${p.difficulty}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [problems, search, difficultyFilter, topicFilter, statusFilter, solvedIds]);

  const solvedPct = Math.round((solvedIds.size / problems.length) * 100);

  return (
    <main className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8">
      {/* Header & Overview Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-[#1E2634]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>COL1000: Introduction to Programming</span>
            <span aria-hidden="true">·</span>
            <span>IIT Delhi</span>
            <span aria-hidden="true">·</span>
            <span>Python 3.11 Judge</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 text-balance">
            Practice Problem Set
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Solve all 22 curated programming challenges with instant sample execution, server-verified hidden test suites, and step-by-step Python 3 solutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#131822] hover:bg-slate-100 dark:hover:bg-[#1B2230] border border-slate-200 dark:border-[#252E3F] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>View Problem Sheet PDF</span>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#131822] hover:bg-slate-100 dark:hover:bg-[#1B2230] border border-slate-200 dark:border-[#252E3F] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Compact Single-Elevation Progress Bar Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-6 border-b border-slate-200 dark:border-[#1E2634]">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Progress</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-slate-950 dark:text-slate-50 tabular-nums">
              {solvedIds.size}/{problems.length}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {solvedPct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-[#1B2332] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${solvedPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Easy</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.easySolved} <span className="text-sm font-normal text-slate-400">/ {stats.easyTotal}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">100 pts each</div>
        </div>

        <div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Medium</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.medSolved} <span className="text-sm font-normal text-slate-400">/ {stats.medTotal}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">200 pts each</div>
        </div>

        <div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Hard</div>
          <div className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.hardSolved} <span className="text-sm font-normal text-slate-400">/ {stats.hardTotal}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">350 pts each</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Standing &amp; Score</div>
          <div className="mt-1 flex items-baseline gap-2.5 font-mono">
            <span className="text-xl font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              {userScore.toLocaleString()} pts
            </span>
            {userRank !== null && (
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Rank #{userRank}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.totalHidden} hidden test cases active
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems or topics..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#131822] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-[#232B3A] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Difficulty Segmented Filter */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#131822] border border-slate-200 dark:border-[#232B3A] rounded-md">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-white dark:bg-[#222B3B] text-slate-950 dark:text-slate-50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Segmented Filter */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#131822] border border-slate-200 dark:border-[#232B3A] rounded-md">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#222B3B] text-slate-950 dark:text-slate-50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="topic-select" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Topic
          </label>
          <select
            id="topic-select"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as 'All' | Topic)}
            className="px-3 py-2 text-xs font-medium bg-white dark:bg-[#131822] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#232B3A] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Topics' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Density Problem Table */}
      <div className="border border-slate-200 dark:border-[#1E2634] rounded-lg overflow-hidden bg-white dark:bg-[#111620]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1E2634] bg-slate-50 dark:bg-[#151B27] text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 pl-4 pr-2 w-24">Status</th>
                <th className="py-3 px-2 w-14 text-right font-mono">#</th>
                <th className="py-3 px-3">Problem</th>
                <th className="py-3 px-3 hidden md:table-cell">Topic</th>
                <th className="py-3 px-3 w-24">Difficulty</th>
                <th className="py-3 px-3 hidden sm:table-cell text-right">Test Suite</th>
                <th className="py-3 px-3 w-20 text-right">Points</th>
                <th className="py-3 pl-3 pr-4 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1B2230] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No problems match your current filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setDifficultyFilter('All');
                        setStatusFilter('All');
                        setTopicFilter('All');
                      }}
                      className="mt-3 px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((problem) => {
                  const isSolved = solvedIds.has(problem.id);
                  return (
                    <tr
                      key={problem.id}
                      onClick={() => onSelectProblem(problem.id)}
                      className="group hover:bg-slate-50 dark:hover:bg-[#171E2C] transition-colors cursor-pointer"
                    >
                      <td className="py-3 pl-4 pr-2 whitespace-nowrap">
                        {isSolved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Solved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                            <Circle className="w-4 h-4 shrink-0" />
                            <span>Todo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {String(problem.id).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {problem.title}
                        </div>
                        <div className="md:hidden text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {problem.topic}
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {problem.topic}
                      </td>
                      <td className={`py-3 px-3 text-xs font-medium whitespace-nowrap ${difficultyTextClass(problem.difficulty)}`}>
                        {problem.difficulty}
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell text-right font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        <span>{problem.samples.length} sample</span>
                        <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {problem.hiddenTestCount} hidden
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {problem.points}
                      </td>
                      <td
                        className="py-3 pl-3 pr-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onOpenSolution(problem.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Solution</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectProblem(problem.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Solve</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Original PDF Reference Modal (Canvas-rendered via pdfjs-dist for full iframe compatibility) */}
      {showPdfModal && (
        <PdfViewerModal
          url="/assets/aistudio/COL1000_Practice_Problems_Major_0c3a6186.pdf"
          title="COL1000 Practice Problems v2 (IIT Delhi)"
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </main>
  );
}
