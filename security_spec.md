# CodeBench Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: Private user emails live strictly in `/users/{userId}` and are readable/writable ONLY by `request.auth.uid == userId`. `/leaderboard/{userId}` contains zero PII.
2. **Master Gate**: Every submission in `/users/{userId}/submissions/{submissionId}` requires the parent `/users/{userId}` document to exist and belong to `request.auth.uid`.
3. **Identity Integrity**: Every document's `uid` field must strictly match `request.auth.uid` and its owner path segment.
4. **Verified Auth**: All write operations require `request.auth != null && request.auth.token.email_verified == true`.
5. **Strict Schema & No Ghost Fields**: Every create checks `hasAll` + `hasOnly`, and every update uses action-specific `affectedKeys().hasOnly(...)` wrapped by `isValid[Entity](incoming())`.
6. **Temporal Integrity**: `createdAt` is immutable after creation and must equal `request.time`; `updatedAt` must equal `request.time`.
7. **Monotonic Leaderboard Bounds**: Initial leaderboard profiles start at `0` solved and `0` score. Each submission update increments `totalSubmissions` by at most `1`, `solvedCount` by at most `1`, `score` by at most `375`, and bounds `solvedIds.size() <= 22`.
8. **Immutability of Submissions**: Once recorded, submissions in `/users/{userId}/submissions/{submissionId}` cannot be updated or deleted.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Leaderboard Write**: `auth = null` attempting `create` on `/leaderboard/attacker`.
2. **Unverified Email Spoof**: `auth.token.email_verified = false` attempting `create` on `/leaderboard/uid1`.
3. **Cross-User Identity Spoofing**: `uid = alice` creating `/leaderboard/bob` with `uid: "bob"`.
4. **Shadow Ghost Field Injection**: Creating `/leaderboard/alice` with extra field `isAdmin: true`.
5. **Initial Score Inflation**: Creating `/leaderboard/alice` with `score: 9999` or `solvedIds: [1,2,3]`.
6. **Single-Write Score Jump**: Updating `/leaderboard/alice` from `score: 100` to `score: 5000` (exceeds max +375 delta).
7. **Timestamp Forgery**: Creating `/leaderboard/alice` with client-supplied past timestamp `createdAt != request.time`.
8. **Immutable Field Mutation**: Updating `/leaderboard/alice` to change `createdAt` or `uid`.
9. **Path ID Poisoning**: Creating `/users/alice/submissions/<200-char-junk-$#%>` violating `isValidId`.
10. **PII Cross-Read**: `uid = bob` attempting `get` on `/users/alice` (contains email).
11. **Orphaned Submission Write**: Creating `/users/alice/submissions/sub1` when parent `/users/alice` does not exist.
12. **Submission Tampering / Deletion**: `uid = alice` attempting `update` or `delete` on `/users/alice/submissions/sub1` to alter `verdict` to `Accepted`.
