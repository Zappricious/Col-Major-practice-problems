import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PROBLEMS } from './data/problems.ts';
import type {
  JudgeResponse,
  LeaderboardEntry,
  Problem,
  SubmissionRecord
} from './types.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

// Blueprint-synchronized validators & sanitizers
export function sanitizeHandle(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '')
    .slice(0, 24);
  if (cleaned.length >= 2) return cleaned;
  return `coder_${Math.random().toString(36).slice(2, 6)}`;
}

export function sanitizeDisplayName(raw: string, fallback: string): string {
  const cleaned = raw.trim().slice(0, 32);
  return cleaned.length >= 1 ? cleaned : fallback.slice(0, 32);
}

export function sanitizeDepartment(raw: string): string {
  const cleaned = raw.trim().slice(0, 32);
  return cleaned.length >= 1 ? cleaned : 'COL1000 · IIT Delhi';
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

const ensurePromises = new Map<string, Promise<void>>();

export function ensureUserDocuments(user: User): Promise<void> {
  const existing = ensurePromises.get(user.uid);
  if (existing) return existing;

  const task = ensureUserDocumentsInternal(user).finally(() => {
    ensurePromises.delete(user.uid);
  });
  ensurePromises.set(user.uid, task);
  return task;
}

async function ensureUserDocumentsInternal(user: User): Promise<void> {
  const uid = user.uid;
  const email = (user.email || '').trim().slice(0, 254);
  if (!email) return;

  const userDocPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userDocPath);
  }

  const lbPath = `leaderboard/${uid}`;
  const lbRef = doc(db, 'leaderboard', uid);

  try {
    const lbSnap = await getDoc(lbRef);
    if (!lbSnap.exists()) {
      const emailPrefix = email.split('@')[0] || 'coder';
      const defaultHandle = sanitizeHandle(emailPrefix);
      const defaultName = sanitizeDisplayName(user.displayName || defaultHandle, defaultHandle);
      await setDoc(lbRef, {
        uid,
        handle: defaultHandle,
        displayName: defaultName,
        department: 'COL1000 · IIT Delhi',
        isPublic: true,
        solvedIds: [],
        solvedCount: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        totalAcceptedRuntimeMs: 0,
        score: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }
}

export async function updateLeaderboardProfile(
  uid: string,
  next: { handle: string; displayName: string; department: string }
): Promise<void> {
  const lbPath = `leaderboard/${uid}`;
  const lbRef = doc(db, 'leaderboard', uid);
  const handle = sanitizeHandle(next.handle);
  const displayName = sanitizeDisplayName(next.displayName, handle);
  const department = sanitizeDepartment(next.department);

  try {
    await updateDoc(lbRef, {
      handle,
      displayName,
      department,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, lbPath);
  }
}

export async function recordVerifiedSubmission(
  user: User,
  problem: Problem,
  judgeRes: JudgeResponse,
  code: string
): Promise<{ pointsAwarded: number; firstSolve: boolean }> {
  await ensureUserDocuments(user);

  const uid = user.uid;
  const lbPath = `leaderboard/${uid}`;
  const lbRef = doc(db, 'leaderboard', uid);
  const safeRuntimeMs = Math.max(0, Math.min(60000, Math.round(judgeRes.avgRuntimeMs)));
  const safePassed = Math.max(0, Math.min(20, judgeRes.passedCount));
  const safeTotal = Math.max(1, Math.min(20, judgeRes.totalCount));

  let computedPoints = 0;
  let computedFirstSolve = false;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(lbRef);
      if (!snap.exists()) {
        throw new Error('Leaderboard profile missing');
      }
      const data = snap.data();
      const prevSolved: number[] = Array.isArray(data.solvedIds)
        ? data.solvedIds.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 22)
        : [];
      const prevTotalSubs = typeof data.totalSubmissions === 'number' ? data.totalSubmissions : 0;
      const prevAccepted = typeof data.acceptedSubmissions === 'number' ? data.acceptedSubmissions : 0;
      const prevRuntimeSum =
        typeof data.totalAcceptedRuntimeMs === 'number' ? data.totalAcceptedRuntimeMs : 0;
      const prevScore = typeof data.score === 'number' ? data.score : 0;

      const isAccepted = judgeRes.verdict === 'Accepted';
      let nextSolved = prevSolved;
      let pointsAwarded = 0;
      let firstSolve = false;

      if (isAccepted && !prevSolved.includes(problem.id) && prevSolved.length < 22) {
        nextSolved = [...prevSolved, problem.id];
        const speedBonus = Math.max(0, Math.min(25, Math.round((80 - safeRuntimeMs) / 3)));
        pointsAwarded = Math.min(375, problem.points + speedBonus);
        firstSolve = true;
      }

      computedPoints = pointsAwarded;
      computedFirstSolve = firstSolve;

      tx.update(lbRef, {
        solvedIds: nextSolved,
        solvedCount: nextSolved.length,
        totalSubmissions: Math.min(10000, prevTotalSubs + 1),
        acceptedSubmissions: Math.min(10000, prevAccepted + (isAccepted ? 1 : 0)),
        totalAcceptedRuntimeMs: Math.min(100000000, prevRuntimeSum + (isAccepted ? safeRuntimeMs : 0)),
        score: Math.min(10000, prevScore + pointsAwarded),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, lbPath);
  }

  const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const subPath = `users/${uid}/submissions/${subId}`;
  const subRef = doc(db, 'users', uid, 'submissions', subId);

  try {
    await setDoc(subRef, {
      uid,
      problemId: problem.id,
      problemTitle: problem.title.slice(0, 120),
      verdict: judgeRes.verdict,
      passedCount: safePassed,
      totalCount: safeTotal,
      runtimeMs: safeRuntimeMs,
      pointsAwarded: computedPoints,
      code: code.slice(0, 64000) || '# empty',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, subPath);
  }

  return { pointsAwarded: computedPoints, firstSolve: computedFirstSolve };
}

function timestampToIso(ts: unknown): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString();
  }
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

export function subscribeLeaderboard(
  currentUid: string,
  onEntries: (entries: LeaderboardEntry[]) => void
): Unsubscribe {
  const difficultyMap = new Map<number, Problem['difficulty']>();
  for (const p of PROBLEMS) {
    difficultyMap.set(p.id, p.difficulty);
  }

  const q = query(collection(db, 'leaderboard'), where('isPublic', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: LeaderboardEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const solvedIds: number[] = Array.isArray(d.solvedIds) ? d.solvedIds : [];
        let easySolved = 0;
        let mediumSolved = 0;
        let hardSolved = 0;
        for (const id of solvedIds) {
          const diff = difficultyMap.get(id);
          if (diff === 'Easy') easySolved++;
          else if (diff === 'Medium') mediumSolved++;
          else if (diff === 'Hard') hardSolved++;
        }

        const totalSubmissions = Number(d.totalSubmissions) || 0;
        const acceptedSubmissions = Number(d.acceptedSubmissions) || 0;
        const totalAcceptedRuntimeMs = Number(d.totalAcceptedRuntimeMs) || 0;
        const acceptanceRate =
          totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;
        const avgRuntimeMs =
          acceptedSubmissions > 0 ? Math.round(totalAcceptedRuntimeMs / acceptedSubmissions) : 0;

        return {
          rank: 0,
          handle: String(d.handle || docSnap.id),
          displayName: String(d.displayName || d.handle || 'Coder'),
          department: String(d.department || 'COL1000 · IIT Delhi'),
          solvedIds,
          solvedCount: solvedIds.length,
          easySolved,
          mediumSolved,
          hardSolved,
          totalSubmissions,
          acceptedSubmissions,
          acceptanceRate,
          avgRuntimeMs,
          score: Number(d.score) || 0,
          lastActive: timestampToIso(d.updatedAt),
          isCurrentUser: docSnap.id === currentUid
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

      onEntries(entries);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    }
  );
}

export function subscribeProblemSubmissions(
  uid: string,
  problemId: number,
  onRecords: (records: SubmissionRecord[]) => void
): Unsubscribe {
  const path = `users/${uid}/submissions`;
  const q = query(collection(db, 'users', uid, 'submissions'), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SubmissionRecord[] = snapshot.docs
        .map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            problemId: Number(d.problemId),
            problemTitle: String(d.problemTitle || ''),
            handle: uid,
            verdict: d.verdict as SubmissionRecord['verdict'],
            passedCount: Number(d.passedCount) || 0,
            totalCount: Number(d.totalCount) || 0,
            runtimeMs: Number(d.runtimeMs) || 0,
            pointsAwarded: Number(d.pointsAwarded) || 0,
            code: String(d.code || ''),
            createdAt: timestampToIso(d.createdAt)
          };
        })
        .filter((r) => r.problemId === problemId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      onRecords(records.slice(0, 30));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
