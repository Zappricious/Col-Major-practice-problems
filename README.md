# CodeBench — COL1000 Python 3 Judge

A LeetCode-style real-time Python 3 coding platform built for the **22 COL1000 (IIT Delhi) Practice Problems**, featuring:

- **Integrated Python 3.11 CodeMirror Editor** with syntax highlighting, auto-indent, dark/light themes, and keyboard shortcuts (`Ctrl/Cmd + Enter` to Run, `Ctrl/Cmd + Shift + Enter` to Submit).
- **Real-Time Python 3 Judge & Hidden Test Suites**: Instant evaluation against visible sample cases plus 127 server-side hidden test cases (edge cases, boundary values, and performance stress tests).
- **Shared Real-Time Leaderboard (Firebase Auth + Cloud Firestore)**: Sign in with Google, customize your handle, and compete live with friends across devices.
- **Step-by-Step Solutions Library**: Complete intuition, walkthrough steps, complexity analysis, common pitfalls, and verified Python 3 reference code for all 22 problems.

## Local Development

Requires **Node.js 22+** and **Python 3**.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploying with Docker (Cloud Run / Render / Railway / Fly.io)

Because the backend executes Python 3 submissions in real time, deploy using the included `Dockerfile` (which bundles Node 22 + Python 3):

```bash
docker build -t codebench-col1000 .
docker run -p 3000:3000 codebench-col1000
```

> **Note for Firebase Auth on custom domains**: If you host on a custom domain (e.g., Render/Railway/Cloud Run), add that domain to **Firebase Console → Authentication → Settings → Authorized domains** so Google Sign-In works seamlessly.
