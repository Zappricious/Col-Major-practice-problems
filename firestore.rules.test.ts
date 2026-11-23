/**
 * Dirty Dozen Security Specification Matrix for CodeBench Firestore Rules.
 * Verifies every adversarial payload class against the Eight Pillars in firestore.rules.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  enforcedBy: string;
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Leaderboard Create',
    operation: 'create',
    path: '/leaderboard/attacker',
    auth: null,
    payload: { uid: 'attacker', handle: 'attacker', score: 0 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isVerifiedUser()'
  },
  {
    id: 2,
    name: 'Unverified Email Write Spoof',
    operation: 'create',
    path: '/leaderboard/alice',
    auth: { uid: 'alice', email_verified: false },
    payload: { uid: 'alice', handle: 'alice', score: 0 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'request.auth.token.email_verified == true'
  },
  {
    id: 3,
    name: 'Cross-User Identity Spoofing',
    operation: 'create',
    path: '/leaderboard/bob',
    auth: { uid: 'alice', email_verified: true },
    payload: { uid: 'bob', handle: 'bob_fake', score: 0 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'userId == request.auth.uid && data.uid == request.auth.uid'
  },
  {
    id: 4,
    name: 'Shadow Ghost Field Injection',
    operation: 'create',
    path: '/leaderboard/alice',
    auth: { uid: 'alice', email_verified: true },
    payload: { uid: 'alice', handle: 'alice', isAdmin: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'data.keys().hasOnly([...])'
  },
  {
    id: 5,
    name: 'Initial Score Inflation on Create',
    operation: 'create',
    path: '/leaderboard/alice',
    auth: { uid: 'alice', email_verified: true },
    payload: { uid: 'alice', handle: 'alice', score: 9999, solvedCount: 22 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidLeaderboardProfileCreate(incoming())'
  },
  {
    id: 6,
    name: 'Single-Write Score Jump on Update',
    operation: 'update',
    path: '/leaderboard/alice',
    auth: { uid: 'alice', email_verified: true },
    payload: { score: 5000, totalSubmissions: 1 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'incoming().score <= existing().score + 375'
  },
  {
    id: 7,
    name: 'Client Timestamp Forgery',
    operation: 'create',
    path: '/leaderboard/alice',
    auth: { uid: 'alice', email_verified: true },
    payload: { uid: 'alice', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'incoming().createdAt == request.time'
  },
  {
    id: 8,
    name: 'Immutable createdAt Mutation',
    operation: 'update',
    path: '/leaderboard/alice',
    auth: { uid: 'alice', email_verified: true },
    payload: { createdAt: '2026-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'affectedKeys().hasOnly(...) && incoming().createdAt == existing().createdAt'
  },
  {
    id: 9,
    name: 'Path ID Poisoning',
    operation: 'create',
    path: '/users/alice/submissions/' + 'x'.repeat(200),
    auth: { uid: 'alice', email_verified: true },
    payload: { uid: 'alice', problemId: 1 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'isValidId(submissionId)'
  },
  {
    id: 10,
    name: 'PII Cross-Read on Private User Doc',
    operation: 'get',
    path: '/users/alice',
    auth: { uid: 'bob', email_verified: true },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'userId == request.auth.uid'
  },
  {
    id: 11,
    name: 'Orphaned Submission Without Parent User Doc',
    operation: 'create',
    path: '/users/alice/submissions/sub_001',
    auth: { uid: 'alice', email_verified: true },
    payload: { uid: 'alice', problemId: 1, verdict: 'Accepted' },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'parentUserExists(userId) Master Gate'
  },
  {
    id: 12,
    name: 'Submission Tampering After Creation',
    operation: 'update',
    path: '/users/alice/submissions/sub_001',
    auth: { uid: 'alice', email_verified: true },
    payload: { verdict: 'Accepted', pointsAwarded: 350 },
    expected: 'PERMISSION_DENIED',
    enforcedBy: 'allow update, delete: if false'
  }
];
