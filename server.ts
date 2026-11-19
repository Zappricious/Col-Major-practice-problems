import express from 'express';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { PROBLEMS, getProblemById } from './src/data/problems.ts';
import { HIDDEN_TESTS } from './src/data/hiddenTests.ts';
import type {
  JudgeResponse,
  LeaderboardEntry,
  Problem,
  SubmissionRecord,
  TestCaseResult,
  Verdict
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_FILE = path.join(__dirname, '.codebench-store.json');

interface StoredUser {
  handle: string;
  displayName: string;
  department: string;
  solvedIds: number[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  totalAcceptedRuntimeMs: number;
  score: number;
  lastActive: string;
}

interface StoreData {
  users: Record<string, StoredUser>;
  submissions: SubmissionRecord[];
}

function createSeedStore(): StoreData {
  const now = Date.now();
  const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

  const seededUsers: StoredUser[] = [
    {
      handle: 'aarav_cs26',
      displayName: 'Aarav Mehta',
      department: 'CSE · IIT Delhi',
      solvedIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22],
      totalSubmissions: 25,
      acceptedSubmissions: 21,
      totalAcceptedRuntimeMs: 651,
      score: 4320,
      lastActive: minsAgo(14)
    },
    {
      handle: 'meera_mnc',
      displayName: 'Meera Iyer',
      department: 'MnC · IIT Delhi',
      solvedIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21],
      totalSubmissions: 24,
      acceptedSubmissions: 19,
      totalAcceptedRuntimeMs: 627,
      score: 3860,
      lastActive: minsAgo(38)
    },
    {
      handle: 'rohan_ee1',
      displayName: 'Rohan Kulkarni',
      department: 'EE · IIT Delhi',
      solvedIds: [1, 2, 3, 4, 5, 6, 7, 9, 11, 12, 13, 14, 16, 17, 21, 22],
      totalSubmissions: 22,
      acceptedSubmissions: 16,
      totalAcceptedRuntimeMs: 560,
      score: 2940,
      lastActive: minsAgo(75)
    },
    {
      handle: 'ananya_py',
      displayName: 'Ananya Verma',
      department: 'CSE · IIT Delhi',
      solvedIds: [1, 2, 3, 4, 6, 7, 11, 12, 13, 14, 16, 17, 21],
      totalSubmissions: 17,
      acceptedSubmissions: 13,
      totalAcceptedRuntimeMs: 416,
      score: 2180,
      lastActive: minsAgo(110)
    },
    {
      handle: 'kabir_algo',
      displayName: 'Kabir Sharma',
      department: 'ME · IIT Delhi',
      solvedIds: [1, 2, 3, 4, 5, 7, 12, 13, 16, 17],
      totalSubmissions: 15,
      acceptedSubmissions: 10,
      totalAcceptedRuntimeMs: 360,
      score: 1560,
      lastActive: minsAgo(195)
    },
    {
      handle: 'diya_col1000',
      displayName: 'Diya Nair',
      department: 'CE · IIT Delhi',
      solvedIds: [1, 2, 3, 4, 13, 14, 16],
      totalSubmissions: 11,
      acceptedSubmissions: 7,
      totalAcceptedRuntimeMs: 259,
      score: 1040,
      lastActive: minsAgo(260)
    },
    {
      handle: 'vikram_dev',
      displayName: 'Vikram Singh',
      department: 'CH · IIT Delhi',
      solvedIds: [1, 2, 3, 16, 17],
      totalSubmissions: 9,
      acceptedSubmissions: 5,
      totalAcceptedRuntimeMs: 185,
      score: 525,
      lastActive: minsAgo(420)
    },
    {
      handle: 'sneha_code',
      displayName: 'Sneha Gupta',
      department: 'EP · IIT Delhi',
      solvedIds: [1, 2, 3],
      totalSubmissions: 5,
      acceptedSubmissions: 3,
      totalAcceptedRuntimeMs: 99,
      score: 315,
      lastActive: minsAgo(600)
    }
  ];

  const users: Record<string, StoredUser> = {};
  for (const u of seededUsers) {
    users[u.handle] = u;
  }
  return { users, submissions: [] };
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as StoreData;
      if (parsed && parsed.users && Array.isArray(parsed.submissions)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to clean seed store if file is unreadable
  }
  const seed = createSeedStore();
  saveStore(seed);
  return seed;
}

function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Non-fatal in read-only containers
  }
}

const store: StoreData = loadStore();

function sanitizeHandle(raw: string | undefined): string {
  const cleaned = (raw || 'guest_coder')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 24);
  return cleaned || 'guest_coder';
}

function ensureUser(handle: string, displayName?: string, department?: string): StoredUser {
  const cleanHandle = sanitizeHandle(handle);
  if (!store.users[cleanHandle]) {
    store.users[cleanHandle] = {
      handle: cleanHandle,
      displayName: (displayName || cleanHandle).trim().slice(0, 32),
      department: (department || 'COL1000 · IIT Delhi').trim().slice(0, 32),
      solvedIds: [],
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      totalAcceptedRuntimeMs: 0,
      score: 0,
      lastActive: new Date().toISOString()
    };
    saveStore(store);
  } else {
    if (displayName && displayName.trim()) {
      store.users[cleanHandle].displayName = displayName.trim().slice(0, 32);
    }
    if (department && department.trim()) {
      store.users[cleanHandle].department = department.trim().slice(0, 32);
    }
  }
  return store.users[cleanHandle];
}

function buildLeaderboard(currentHandle?: string): LeaderboardEntry[] {
  const cleanCurrent = currentHandle ? sanitizeHandle(currentHandle) : undefined;
  if (cleanCurrent) {
    ensureUser(cleanCurrent);
  }
  const problemDifficultyMap = new Map<number, Problem['difficulty']>();
  for (const p of PROBLEMS) {
    problemDifficultyMap.set(p.id, p.difficulty);
  }

  const entries: LeaderboardEntry[] = Object.values(store.users).map((u) => {
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    for (const id of u.solvedIds) {
      const diff = problemDifficultyMap.get(id);
      if (diff === 'Easy') easySolved++;
      else if (diff === 'Medium') mediumSolved++;
      else if (diff === 'Hard') hardSolved++;
    }
    const acceptanceRate =
      u.totalSubmissions > 0 ? Math.round((u.acceptedSubmissions / u.totalSubmissions) * 100) : 0;
    const avgRuntimeMs =
      u.acceptedSubmissions > 0 ? Math.round(u.totalAcceptedRuntimeMs / u.acceptedSubmissions) : 0;

    return {
      rank: 0,
      handle: u.handle,
      displayName: u.displayName,
      department: u.department,
      solvedIds: u.solvedIds,
      solvedCount: u.solvedIds.length,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions: u.totalSubmissions,
      acceptedSubmissions: u.acceptedSubmissions,
      acceptanceRate,
      avgRuntimeMs,
      score: u.score,
      lastActive: u.lastActive,
      isCurrentUser: cleanCurrent === u.handle
    };
  });

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
    const aRt = a.avgRuntimeMs || 9999;
    const bRt = b.avgRuntimeMs || 9999;
    if (aRt !== bRt) return aRt - bRt;
    return a.handle.localeCompare(b.handle);
  });

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  runtimeMs: number;
}

const TIMEOUT_MS = 2500;
const MAX_OUTPUT_BYTES = 512 * 1024;

function runPythonFile(scriptPath: string, stdinData: string): Promise<ExecResult> {
  return new Promise((resolve) => {
    const start = performance.now();
    const child = spawn('python3', ['-I', '-u', scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        PATH: process.env.PATH || '/usr/bin:/bin',
        PYTHONIOENCODING: 'utf-8'
      }
    });

    let stdout = '';
    let stderr = '';
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let timedOut = false;
    let settled = false;

    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const runtimeMs = Math.max(1, Math.round(performance.now() - start));
      const cleanStderr = stderr.replaceAll(scriptPath, 'solution.py');
      resolve({
        stdout,
        stderr: cleanStderr,
        exitCode,
        timedOut,
        runtimeMs
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIMEOUT_MS);

    child.stdout.on('data', (chunk: Buffer) => {
      if (stdoutBytes < MAX_OUTPUT_BYTES) {
        const remaining = MAX_OUTPUT_BYTES - stdoutBytes;
        stdout += chunk.subarray(0, remaining).toString('utf-8');
        stdoutBytes += chunk.length;
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      if (stderrBytes < MAX_OUTPUT_BYTES) {
        const remaining = MAX_OUTPUT_BYTES - stderrBytes;
        stderr += chunk.subarray(0, remaining).toString('utf-8');
        stderrBytes += chunk.length;
      }
    });

    child.on('error', (err) => {
      stderr += err.message;
      finish(1);
    });

    child.on('close', (code) => {
      finish(code);
    });

    try {
      // Always append newline so an empty trailing line (e.g. k=0 or empty list) reads as "" instead of EOFError
      child.stdin.write(`${stdinData}\n`);
      child.stdin.end();
    } catch {
      // Child exited early
    }
  });
}

function compareOutputs(
  actual: string,
  expected: string,
  problem: Problem
): { passed: boolean; normalizedActual: string } {
  const normActualRaw = actual.replace(/\r\n/g, '\n');
  const normExpectedRaw = expected.replace(/\r\n/g, '\n');

  if (problem.preserveLeadingSpaces) {
    const cleanActual = normActualRaw
      .replace(/\n+$/, '')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
    const cleanExpected = normExpectedRaw
      .replace(/\n+$/, '')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
    return {
      passed: cleanActual === cleanExpected,
      normalizedActual: cleanActual
    };
  }

  const trimmedActual = normActualRaw
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
  const trimmedExpected = normExpectedRaw
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  if (problem.compareMode === 'unordered-lines') {
    const actualLines = trimmedActual ? trimmedActual.split('\n').map((l) => l.trim()) : [];
    const expectedLines = trimmedExpected ? trimmedExpected.split('\n').map((l) => l.trim()) : [];
    if (actualLines.length !== expectedLines.length) {
      return { passed: false, normalizedActual: trimmedActual };
    }
    const sortedActual = [...actualLines].sort();
    const sortedExpected = [...expectedLines].sort();
    const match = sortedActual.every((line, i) => line === sortedExpected[i]);
    return { passed: match, normalizedActual: trimmedActual };
  }

  return {
    passed: trimmedActual === trimmedExpected,
    normalizedActual: trimmedActual
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // Serve public assets (including the COL1000 PDF) explicitly
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, python: '3.11', problems: PROBLEMS.length });
  });

  app.get('/api/leaderboard', (req, res) => {
    const handle = typeof req.query.handle === 'string' ? req.query.handle : undefined;
    res.json({ entries: buildLeaderboard(handle) });
  });

  app.post('/api/profile', (req, res) => {
    const { handle, displayName, department } = req.body as {
      handle?: string;
      displayName?: string;
      department?: string;
    };
    if (!handle || typeof handle !== 'string') {
      res.status(400).json({ error: 'Handle is required' });
      return;
    }
    const user = ensureUser(handle, displayName, department);
    user.lastActive = new Date().toISOString();
    saveStore(store);
    res.json({ user, entries: buildLeaderboard(user.handle) });
  });

  app.get('/api/submissions', (req, res) => {
    const handle = typeof req.query.handle === 'string' ? sanitizeHandle(req.query.handle) : undefined;
    const problemId = req.query.problemId ? Number(req.query.problemId) : undefined;
    const filtered = store.submissions.filter((s) => {
      if (handle && s.handle !== handle) return false;
      if (problemId && s.problemId !== problemId) return false;
      return true;
    });
    res.json({ submissions: filtered.slice(0, 50) });
  });

  app.post('/api/judge', async (req, res) => {
    const { problemId, code, mode, customInput, handle, displayName } = req.body as {
      problemId: number;
      code: string;
      mode: 'run' | 'submit' | 'custom';
      customInput?: string;
      handle?: string;
      displayName?: string;
    };

    const problem = getProblemById(Number(problemId));
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    if (typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Python code cannot be empty' });
      return;
    }

    if (code.length > 64_000) {
      res.status(400).json({ error: 'Code exceeds maximum size limit (64KB)' });
      return;
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codebench-'));
    const scriptPath = path.join(tmpDir, 'solution.py');
    fs.writeFileSync(scriptPath, code, 'utf-8');

    try {
      if (mode === 'custom') {
        const execRes = await runPythonFile(scriptPath, customInput ?? '');
        const verdict: Verdict = execRes.timedOut
          ? 'Time Limit Exceeded'
          : execRes.exitCode !== 0
            ? 'Runtime Error'
            : 'Accepted';

        const response: JudgeResponse = {
          mode: 'custom',
          problemId: problem.id,
          verdict,
          passedCount: verdict === 'Accepted' ? 1 : 0,
          totalCount: 1,
          samplePassedCount: 0,
          sampleTotalCount: 0,
          hiddenPassedCount: 0,
          hiddenTotalCount: 0,
          totalRuntimeMs: execRes.runtimeMs,
          avgRuntimeMs: execRes.runtimeMs,
          pointsAwarded: 0,
          firstSolve: false,
          results: [],
          customOutput: {
            stdout: execRes.stdout,
            stderr: execRes.stderr,
            runtimeMs: execRes.runtimeMs,
            timedOut: execRes.timedOut
          }
        };
        res.json(response);
        return;
      }

      const hiddenList = mode === 'submit' ? HIDDEN_TESTS[problem.id] || [] : [];
      const allTests = [
        ...problem.samples.map((s, idx) => ({
          index: idx + 1,
          name: s.label,
          isHidden: false,
          input: s.input,
          expectedOutput: s.expectedOutput
        })),
        ...hiddenList.map((h, idx) => ({
          index: problem.samples.length + idx + 1,
          name: `Hidden Test #${idx + 1}`,
          isHidden: true,
          input: h.input,
          expectedOutput: h.expectedOutput
        }))
      ];

      const results: TestCaseResult[] = [];
      let overallVerdict: Verdict = 'Accepted';
      let totalRuntimeMs = 0;

      for (const tc of allTests) {
        const execRes = await runPythonFile(scriptPath, tc.input);
        totalRuntimeMs += execRes.runtimeMs;

        let status: TestCaseResult['status'] = 'Passed';
        let passed = false;
        let normalizedActual = execRes.stdout;

        if (execRes.timedOut) {
          status = 'Time Limit Exceeded';
          if (overallVerdict === 'Accepted') overallVerdict = 'Time Limit Exceeded';
        } else if (execRes.exitCode !== 0) {
          status = 'Runtime Error';
          if (overallVerdict === 'Accepted') overallVerdict = 'Runtime Error';
        } else {
          const cmp = compareOutputs(execRes.stdout, tc.expectedOutput, problem);
          passed = cmp.passed;
          normalizedActual = cmp.normalizedActual;
          if (!passed) {
            status = 'Wrong Answer';
            if (overallVerdict === 'Accepted') overallVerdict = 'Wrong Answer';
          }
        }

        if (tc.isHidden) {
          // Never expose secret inputs or expected outputs for hidden tests
          results.push({
            index: tc.index,
            name: tc.name,
            isHidden: true,
            passed,
            status,
            runtimeMs: execRes.runtimeMs,
            stderr: status === 'Runtime Error' ? execRes.stderr : undefined
          });
        } else {
          results.push({
            index: tc.index,
            name: tc.name,
            isHidden: false,
            passed,
            status,
            runtimeMs: execRes.runtimeMs,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: normalizedActual,
            stderr: execRes.stderr || undefined
          });
        }
      }

      const sampleResults = results.filter((r) => !r.isHidden);
      const hiddenResults = results.filter((r) => r.isHidden);
      const passedCount = results.filter((r) => r.passed).length;
      const avgRuntimeMs = Math.max(1, Math.round(totalRuntimeMs / Math.max(1, results.length)));

      let pointsAwarded = 0;
      let firstSolve = false;

      if (mode === 'submit') {
        const user = ensureUser(handle || 'guest_coder', displayName);
        user.totalSubmissions += 1;
        user.lastActive = new Date().toISOString();

        if (overallVerdict === 'Accepted') {
          user.acceptedSubmissions += 1;
          user.totalAcceptedRuntimeMs += avgRuntimeMs;
          if (!user.solvedIds.includes(problem.id)) {
            user.solvedIds.push(problem.id);
            const speedBonus = Math.max(0, Math.min(25, Math.round((80 - avgRuntimeMs) / 3)));
            pointsAwarded = problem.points + speedBonus;
            user.score += pointsAwarded;
            firstSolve = true;
          }
        }

        const record: SubmissionRecord = {
          id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          problemId: problem.id,
          problemTitle: problem.title,
          handle: user.handle,
          verdict: overallVerdict,
          passedCount,
          totalCount: results.length,
          runtimeMs: avgRuntimeMs,
          pointsAwarded,
          code,
          createdAt: new Date().toISOString()
        };
        store.submissions.unshift(record);
        if (store.submissions.length > 300) {
          store.submissions.length = 300;
        }
        saveStore(store);
      }

      const response: JudgeResponse = {
        mode,
        problemId: problem.id,
        verdict: overallVerdict,
        passedCount,
        totalCount: results.length,
        samplePassedCount: sampleResults.filter((r) => r.passed).length,
        sampleTotalCount: sampleResults.length,
        hiddenPassedCount: hiddenResults.filter((r) => r.passed).length,
        hiddenTotalCount: hiddenResults.length,
        totalRuntimeMs,
        avgRuntimeMs,
        pointsAwarded,
        firstSolve,
        results
      };

      res.json(response);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup failures
      }
    }
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeBench server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
