import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Code2, Search } from 'lucide-react';
import type { Difficulty, Problem } from '../types.ts';
import { CodeBlock } from './CodeBlock.tsx';

interface SolutionsViewProps {
  problems: Problem[];
  initialProblemId: number;
  solvedIds: Set<number>;
  onOpenInWorkspace: (problemId: number, loadSolutionCode?: boolean) => void;
}

function difficultyColor(d: Difficulty): string {
  if (d === 'Easy') return 'text-emerald-600 dark:text-emerald-400';
  if (d === 'Medium') return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function SolutionsView({
  problems,
  initialProblemId,
  solvedIds,
  onOpenInWorkspace
}: SolutionsViewProps) {
  const [selectedId, setSelectedId] = useState<number>(initialProblemId);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((p) => {
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      if (q && !`${p.id} ${p.title} ${p.topic}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [problems, search, difficulty]);

  const activeProblem = useMemo(
    () => problems.find((p) => p.id === selectedId) || problems[0],
    [problems, selectedId]
  );

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <div className="pb-6 border-b border-slate-200 dark:border-[#1E2634]">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Official Editorials · Python 3 Reference Code · Complexity Analysis
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
          Step-by-Step Solutions
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Index */}
        <aside className="lg:col-span-4 xl:col-span-3 border border-slate-200 dark:border-[#1E2634] rounded-lg bg-white dark:bg-[#111620] overflow-hidden lg:sticky lg:top-20">
          <div className="p-3 border-b border-slate-200 dark:border-[#1E2634] space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter 22 solutions..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0D1118] text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-[#232B3A] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-[#0D1118] rounded-md">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    difficulty === d
                      ? 'bg-white dark:bg-[#222B3B] text-slate-950 dark:text-slate-50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100 dark:divide-[#1B2230]">
            {filtered.map((p) => {
              const isSelected = p.id === activeProblem.id;
              const isSolved = solvedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-[#171E2C]'
                  }`}
                >
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tabular-nums pt-0.5 w-5 shrink-0">
                    {String(p.id).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-medium truncate ${
                        isSelected
                          ? 'text-amber-800 dark:text-amber-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {p.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className={difficultyColor(p.difficulty)}>{p.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{p.topic}</span>
                    </div>
                  </div>
                  {isSolved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Editorial Content */}
        <article className="lg:col-span-8 xl:col-span-9 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E2634]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono tabular-nums">Problem {String(activeProblem.id).padStart(2, '0')}</span>
                <span aria-hidden="true">·</span>
                <span className={`font-medium ${difficultyColor(activeProblem.difficulty)}`}>
                  {activeProblem.pdfDifficultyLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeProblem.topic}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{activeProblem.points} pts</span>
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-slate-950 dark:text-slate-50">
                {activeProblem.title}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenInWorkspace(activeProblem.id, false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#131822] hover:bg-slate-100 dark:hover:bg-[#1B2332] border border-slate-200 dark:border-[#252E3F] rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Solve Yourself</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenInWorkspace(activeProblem.id, true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Run Solution in Editor</span>
              </button>
            </div>
          </div>

          {/* Core Intuition */}
          <section className="space-y-2.5">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Key Intuition
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              {activeProblem.solution.intuition}
            </p>
          </section>

          {/* Step-by-Step Algorithmic Breakdown */}
          <section className="space-y-4">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Step-by-Step Walkthrough
            </h3>
            <ol className="space-y-4 divide-y divide-slate-200/80 dark:divide-[#1E2634]">
              {activeProblem.solution.steps.map((step, idx) => (
                <li key={idx} className={idx > 0 ? 'pt-4' : ''}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {step.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Complexity & Pitfalls */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-y border-slate-200 dark:border-[#1E2634]">
            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Complexity Analysis
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Time Complexity</dt>
                  <dd className="mt-0.5 font-mono text-xs text-slate-900 dark:text-slate-100">
                    {activeProblem.solution.timeComplexity}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Space Complexity</dt>
                  <dd className="mt-0.5 font-mono text-xs text-slate-900 dark:text-slate-100">
                    {activeProblem.solution.spaceComplexity}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Common Pitfalls</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                {activeProblem.solution.pitfalls.map((pitfall, idx) => (
                  <li key={idx}>{pitfall}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Complete Python 3 Code */}
          <section className="space-y-3">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Verified Python 3 Implementation
            </h3>
            <CodeBlock
              code={activeProblem.solution.code}
              title={`problem_${String(activeProblem.id).padStart(2, '0')}_${activeProblem.slug}.py`}
              onLoadInEditor={() => onOpenInWorkspace(activeProblem.id, true)}
            />
          </section>
        </article>
      </div>
    </main>
  );
}
