export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Topic =
  | 'Control Flow'
  | 'Exceptions'
  | 'Recursion'
  | 'Lists & Memory'
  | 'Binary Search'
  | 'Dynamic Programming'
  | 'Arrays & Greedy'
  | 'Backtracking'
  | 'Two Pointers'
  | 'Matrices';

export interface SampleTestCase {
  id: string;
  label: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface SolutionStep {
  title: string;
  detail: string;
}

export interface ProblemSolution {
  intuition: string;
  steps: SolutionStep[];
  timeComplexity: string;
  spaceComplexity: string;
  pitfalls: string[];
  code: string;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  pdfDifficultyLabel: string;
  topic: Topic;
  points: number;
  hiddenTestCount: number;
  acceptanceRate: number;
  description: string[];
  workedExample: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  note?: string;
  hints: string[];
  starterCode: string;
  samples: SampleTestCase[];
  solution: ProblemSolution;
  preserveLeadingSpaces?: boolean;
  compareMode?: 'exact' | 'unordered-lines';
}

export interface TestCaseResult {
  index: number;
  name: string;
  isHidden: boolean;
  passed: boolean;
  status: 'Passed' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
  runtimeMs: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
}

export type Verdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Time Limit Exceeded';

export interface JudgeResponse {
  mode: 'run' | 'submit' | 'custom';
  problemId: number;
  verdict: Verdict;
  passedCount: number;
  totalCount: number;
  samplePassedCount: number;
  sampleTotalCount: number;
  hiddenPassedCount: number;
  hiddenTotalCount: number;
  totalRuntimeMs: number;
  avgRuntimeMs: number;
  pointsAwarded: number;
  firstSolve: boolean;
  results: TestCaseResult[];
  customOutput?: {
    stdout: string;
    stderr: string;
    runtimeMs: number;
    timedOut: boolean;
  };
}

export interface SubmissionRecord {
  id: string;
  problemId: number;
  problemTitle: string;
  handle: string;
  verdict: Verdict;
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  pointsAwarded: number;
  code: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  handle: string;
  displayName: string;
  department: string;
  solvedIds: number[];
  solvedCount: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  avgRuntimeMs: number;
  score: number;
  lastActive: string;
  isCurrentUser?: boolean;
}
