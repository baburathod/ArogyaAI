# Phase 6 Testing & CI Guide

This guide covers automated testing, end-to-end validation, and continuous integration for Phase 6 emergency workflows.

## Quick Start

### Local Testing (Backend)

```bash
cd backend
npm ci
npm run test:run     # Run all tests once
npm run test         # Run tests in watch mode
```

### End-to-End Test (Manual)

```bash
cd backend
npm run dev           # Terminal 1: start backend
# Terminal 2:
npm run e2e-test     # Test socket + HTTP flows
```

### Manual QA Checklist

See [MANUAL_QA_CHECKLIST.md](MANUAL_QA_CHECKLIST.md) for step-by-step real-time testing across devices.

---

## Test Suite Overview

### Unit & Integration Tests (`backend/src/tests/emergency.test.ts`)

**Coverage:**
- `POST /api/emergencies/sos` — create emergency with auth validation
- `GET /api/emergencies/active` — fetch active emergencies
- `POST /api/emergencies/:id/respond` — responder signals response
- `POST /api/emergencies/:id/assign` — assign responder (with role check)
- `GET /api/hospitals/nearby` — hospital lookup with distance filtering
- **Socket.IO integration** — room registration, event broadcasting, targeted emissions
- **Error handling** — DB failures, validation errors, missing auth

**Run tests:**

```bash
cd backend
npm run test:run                    # Run once, exit
npm run test                        # Watch mode (re-run on file change)
npm run test src/tests/emergency.test.ts  # Run specific test
npm run test -- --reporter=verbose # Verbose output
```

### E2E Test Harness (`backend/src/scripts/e2e-test.ts`)

**Tests:**
1. Socket connection and responder registration
2. Multi-client event flow (caller + responder)
3. HTTP SOS endpoint (with mock auth)
4. Hospital lookup endpoint
5. Rate limiting enforcement

**Run:**

```bash
# Start backend first
cd backend && npm run dev

# In another terminal
cd backend
npm run e2e-test
```

**Expected output:**

```
✓ Socket connection (245ms)
✓ Multi-client event flow (1230ms)
✓ HTTP SOS endpoint (150ms)
✓ Hospital lookup endpoint (210ms)
✓ Rate limiting enforcement (180ms)

📊 Results: 5/5 passed (2015ms total)
✨ All tests passed!
```

### Manual QA Tests

Run through the [MANUAL_QA_CHECKLIST.md](MANUAL_QA_CHECKLIST.md) for:
- SOS user flow across devices
- Responder assignment workflow
- Real-time socket events
- Hospital lookup UI
- Authentication & token display
- Rate limiting behavior
- Cross-device communication
- UI/UX expectations

---

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

Runs on every push to `main`/`master` or on pull requests.

**Backend job:**
1. Checkout code
2. Install Node 18
3. `npm ci` (clean install)
4. `npm run type-check` (TypeScript)
5. `npm run lint` (ESLint)
6. `npm run test:run` (vitest)
7. `npm run build` (compile to `dist/`)

**Frontend job:**
1. Checkout code
2. Install Node 18
3. `npm ci`
4. `npm run type-check` (if available)
5. `npm run lint` (if available)
6. `npm run build` (Next.js build)

**View results:**
- GitHub web: Actions tab → click workflow run → view logs
- Local: `git push` and check GitHub Actions UI

### Running CI Locally

Simulate the CI pipeline on your machine:

```bash
# Backend
cd backend
npm ci
npm run type-check
npm run lint
npm run test:run
npm run build

# Frontend
cd frontend
npm ci
npm run build
```

---

## Environment Setup for Testing

### Backend Tests

Tests use mocked database and Socket.IO. No real MongoDB needed.

**Required env vars (test defaults):**

```bash
# backend/.env (for dev server only; tests use defaults)
MONGODB_URI=mongodb://localhost:27017/arogyaai-test
JWT_SECRET=test-secret
NODE_ENV=test
```

### E2E Tests

Requires a running backend server:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd backend
BACKEND_URL=http://localhost:3000 npm run e2e-test
```

### Manual QA Tests

Requires both backend and frontend running:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Open browser
# http://localhost:3000/emergency/sos
# http://localhost:3000/dashboard/emergency
```

---

## Troubleshooting

### Tests fail with "Cannot find module"

**Cause:** Missing dependencies.

**Fix:**

```bash
cd backend
npm ci --legacy-peer-deps
```

### Tests timeout

**Cause:** Slow DB or network.

**Fix:**

```bash
npm run test -- --testTimeout=10000  # Increase timeout to 10s
```

### E2E test fails "Socket connection timeout"

**Cause:** Backend not running or wrong `BACKEND_URL`.

**Fix:**

```bash
# Ensure backend is running
cd backend && npm run dev

# Check BACKEND_URL (default: http://localhost:3000)
BACKEND_URL=http://localhost:3000 npm run e2e-test
```

### CI job fails on "npm ERR! code ERESOLVE"

**Cause:** Peer dependency conflicts.

**Fix:** Update `.github/workflows/ci.yml` to use `--legacy-peer-deps`:

```yaml
- name: Install deps
  run: npm ci --legacy-peer-deps
```

### Rate limiting test inconclusive

**Cause:** Rate limiter not yet triggered (threshold = 120 requests/min by default).

**Fix:** This is expected in quick local tests. The test just confirms the endpoint is accessible.

---

## Adding New Tests

### 1. Create test file

```typescript
// backend/src/tests/my-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### 2. Run tests

```bash
npm run test -- src/tests/my-feature.test.ts
```

### 3. Integrate into CI

Tests matching `src/**/*.test.ts` run automatically in CI (see `vitest.config.ts`).

---

## Test Coverage

Generate HTML coverage report:

```bash
cd backend
npm run test:run -- --coverage
```

View report:

```bash
open coverage/index.html   # macOS
start coverage/index.html  # Windows
xdg-open coverage/index.html # Linux
```

---

## Production Validation Checklist

Before deploying Phase 6 to production:

- [ ] All tests pass locally: `npm run test:run`
- [ ] CI pipeline passes (GitHub Actions: green check)
- [ ] Manual QA checklist completed on staging
- [ ] External hospital API configured (if applicable)
- [ ] JWT_SECRET and MONGODB_URI set in production
- [ ] Rate limiting tuned for expected traffic
- [ ] Monitoring/logging enabled
- [ ] CORS origins whitelisted in production

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run test:run` | Run all tests once (CI mode) |
| `npm run test` | Run tests in watch mode (dev) |
| `npm run e2e-test` | Run E2E test harness against running backend |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run type-check` | Run TypeScript compiler without emit |
| `npm run lint` | Check code style with ESLint |

---

**Questions?** See [MANUAL_QA_CHECKLIST.md](MANUAL_QA_CHECKLIST.md) for detailed test scenarios or the AGENTS.md for architecture context.
