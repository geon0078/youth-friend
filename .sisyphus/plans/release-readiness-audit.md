# Release Readiness Audit - Deploy Blockers & Safe Fixes

## TL;DR

> **Quick Summary**: Audit and fix deployment blockers across frontend, backend, and app projects by externalizing hardcoded values to environment variables and creating .env.example templates for developer onboarding.
> 
> **Deliverables**:
> - Frontend: Environment-configurable API base URL
> - Backend: Environment-configurable CORS origins
> - All projects: .env.example templates
> - Documentation of known limitations (in-memory storage)
> 
> **Estimated Effort**: Short (2-3 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Backend env setup → Frontend env setup → App .env.example

---

## Context

### Original Request
Release readiness audit for whole project (frontend, backend, app). Focus on deploy blockers and safe fixes.

### Interview Summary
**Key Discussions**:
- Frontend API_BASE hardcoded to localhost:8000 → externalize to VITE_API_BASE
- Backend CORS origins hardcoded to localhost:5173 → externalize to CORS_ORIGINS
- Backend in-memory storage → accept as MVP limitation, document it
- App legal URLs (terms/privacy) → keep as example.com placeholders with TODO
- Skip ESLint setup for frontend (out of scope)
- Skip persistence implementation for backend (out of scope)

**Research Findings**:
- Frontend uses Vite → `import.meta.env.VITE_*` pattern required
- Backend uses FastAPI → `python-dotenv` + `os.getenv()` pattern
- App already uses `EXPO_PUBLIC_*` correctly, just needs .env.example
- All .gitignore files already exclude `.env*` files ✅

### Identified Blockers

| Priority | Project | File | Issue | Resolution |
|----------|---------|------|-------|------------|
| P0 | frontend | `src/services/api.ts:1` | Hardcoded `API_BASE = 'http://localhost:8000'` | Externalize to `VITE_API_BASE` |
| P0 | backend | `app/main.py:28` | Hardcoded `allow_origins=["http://localhost:5173"]` | Externalize to `CORS_ORIGINS` |
| P1 | all | (missing) | No `.env.example` files | Create templates |
| INFO | backend | `app/storage.py` | In-memory storage (data loss on restart) | Document as known limitation |
| INFO | app | `step3.tsx:35,41` | Placeholder URLs `example.com/terms`, `example.com/privacy` | Keep as TODO (앱스토어 제출 전 교체 필요) |

---

## Work Objectives

### Core Objective
Eliminate deployment blockers by externalizing environment-specific configuration and creating developer onboarding documentation (.env.example files).

### Concrete Deliverables
1. `frontend/src/services/api.ts` - reads API_BASE from `import.meta.env.VITE_API_BASE`
2. `frontend/.env.example` - template with `VITE_API_BASE`
3. `backend/app/main.py` - reads CORS origins from `os.getenv("CORS_ORIGINS")`
4. `backend/.env.example` - template with `CORS_ORIGINS`
5. `backend/requirements.txt` - includes `python-dotenv`
6. `app/.env.example` - template with all 17 `EXPO_PUBLIC_*` keys
7. `docs/KNOWN_LIMITATIONS.md` - documents in-memory storage and placeholder URLs

### Definition of Done
- [ ] All hardcoded localhost values externalized to env vars
- [ ] All env vars have sensible development defaults (localhost fallbacks)
- [ ] .env.example exists in frontend/, backend/, app/
- [ ] Backend server starts successfully with `uvicorn`
- [ ] Frontend builds and runs with `npm run dev`
- [ ] App lints cleanly with `npm run lint`
- [ ] No secrets committed to git

### Must Have
- Environment variable externalization with localhost fallbacks
- .env.example templates for all projects
- Verification commands that prove each change works

### Must NOT Have (Guardrails)
- ❌ Breaking API changes (endpoints, request/response shapes stay the same)
- ❌ Database/persistence changes (in-memory storage stays as-is)
- ❌ New dependencies beyond `python-dotenv` for backend
- ❌ New test files (use existing test infrastructure only)
- ❌ Secrets in committed files
- ❌ Changes to app legal URLs (keep as example.com with TODO)
- ❌ ESLint/linting setup for frontend
- ❌ Touching files outside the specified targets

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: 
  - app: YES (Jest)
  - frontend: Partial (typecheck only)
  - backend: NO (health check only)
- **User wants tests**: Manual verification (existing infra)
- **QA approach**: Automated verification via commands

### Verification Commands by Project

**Frontend:**
```bash
cd frontend && npm run typecheck   # TypeScript compilation
cd frontend && npm run dev         # Dev server starts (manual check: opens browser)
```

**Backend:**
```bash
cd backend && pip install -r requirements.txt
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
curl -s http://localhost:8000/health | grep '"status":"ok"'
```

**App:**
```bash
cd app && npm run lint             # ESLint passes
cd app && npm test -- --passWithNoTests  # Jest runs (may have no tests yet)
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Independent):
├── Task 1: Backend env externalization (CORS)
├── Task 3: App .env.example creation
└── Task 5: Documentation (KNOWN_LIMITATIONS.md)

Wave 2 (After Wave 1 - Backend dependency):
└── Task 2: Frontend env externalization (API_BASE)
    └── Note: Depends on backend being env-configurable for CORS

Wave 3 (After Wave 2 - Final verification):
└── Task 4: Frontend .env.example creation
└── Task 6: Final integration verification

Critical Path: Task 1 (backend CORS) → Task 2 (frontend API) → Task 6 (verify)
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | 3, 5 |
| 2 | 1 | 4, 6 | - |
| 3 | None | 6 | 1, 5 |
| 4 | 2 | 6 | - |
| 5 | None | 6 | 1, 3 |
| 6 | 1, 2, 3, 4, 5 | None | None (final) |

---

## TODOs

### Task 1: Backend - Externalize CORS Origins

- [ ] 1. Backend CORS Environment Externalization

  **What to do**:
  1. Add `python-dotenv` to `backend/requirements.txt`
  2. In `backend/app/main.py`:
     - Add `import os` and `from dotenv import load_dotenv`
     - Call `load_dotenv()` at module level
     - Replace hardcoded `allow_origins=["http://localhost:5173"]` with:
       ```python
       allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
       ```
  3. Create `backend/.env.example` with:
     ```
     # CORS allowed origins (comma-separated for multiple)
     CORS_ORIGINS=http://localhost:5173
     ```

  **Must NOT do**:
  - Change any API endpoints or response shapes
  - Add authentication
  - Modify storage.py

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, focused file changes with clear patterns
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit after verified change
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser testing needed
    - `frontend-ui-ux`: Backend-only task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 5)
  - **Blocks**: Task 2 (frontend needs backend CORS working)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `backend/app/main.py:26-32` - Current CORS middleware setup (modify this block)
  - `backend/app/benefits.py:1-10` - Example of imports at top of file

  **API/Type References**:
  - `backend/requirements.txt` - Add python-dotenv here

  **External References**:
  - FastAPI CORS docs: https://fastapi.tiangolo.com/tutorial/cors/
  - python-dotenv: https://pypi.org/project/python-dotenv/

  **WHY Each Reference Matters**:
  - `main.py:26-32`: This is the exact code block to modify. Keep the middleware structure identical, only change `allow_origins` source.
  - `benefits.py`: Shows the import style used in this project (use same pattern).
  - `requirements.txt`: Must add python-dotenv dependency here for `load_dotenv()` to work.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # 1. Install dependencies
  cd backend && pip install -r requirements.txt
  # Assert: Exit code 0, "python-dotenv" appears in pip freeze

  # 2. Start server (background)
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
  sleep 2

  # 3. Health check
  curl -s http://localhost:8000/health
  # Assert: Returns {"status":"ok","benefits":...}

  # 4. CORS header check
  curl -s -I -X OPTIONS http://localhost:8000/benefits \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET" \
    | grep -i "access-control-allow-origin"
  # Assert: Contains "http://localhost:5173"

  # 5. Cleanup
  pkill -f "uvicorn app.main:app"
  ```

  **Evidence to Capture:**
  - [ ] pip freeze output showing python-dotenv installed
  - [ ] curl health check response
  - [ ] CORS header in OPTIONS response

  **Commit**: YES
  - Message: `fix(backend): externalize CORS origins to environment variable`
  - Files: `backend/app/main.py`, `backend/requirements.txt`, `backend/.env.example`
  - Pre-commit: `cd backend && uvicorn app.main:app --port 8000 & sleep 2 && curl -s http://localhost:8000/health && pkill -f uvicorn`

  **Rollback Strategy**:
  ```bash
  git checkout HEAD~1 -- backend/app/main.py backend/requirements.txt
  rm backend/.env.example
  ```

---

### Task 2: Frontend - Externalize API Base URL

- [ ] 2. Frontend API Base Environment Externalization

  **What to do**:
  1. In `frontend/src/services/api.ts`:
     - Replace line 1 `const API_BASE = 'http://localhost:8000';` with:
       ```typescript
       const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
       ```
  2. Add TypeScript type declaration for Vite env (if not exists):
     - Create or update `frontend/src/vite-env.d.ts`:
       ```typescript
       /// <reference types="vite/client" />
       
       interface ImportMetaEnv {
         readonly VITE_API_BASE: string;
       }
       
       interface ImportMeta {
         readonly env: ImportMetaEnv;
       }
       ```

  **Must NOT do**:
  - Change any API function signatures
  - Modify request/response handling
  - Add new API methods

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file change, simple pattern
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit after verified change
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI changes
    - `playwright`: No E2E testing needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 4 (frontend .env.example), Task 6 (final verify)
  - **Blocked By**: Task 1 (need backend CORS working first)

  **References**:

  **Pattern References**:
  - `frontend/src/services/api.ts:1` - Current hardcoded API_BASE (replace this line)
  - `frontend/src/services/api.ts:67-76` - `request()` function using API_BASE (don't change)

  **API/Type References**:
  - `frontend/vite.config.ts` - Vite configuration (env vars auto-loaded)

  **External References**:
  - Vite env variables: https://vitejs.dev/guide/env-and-mode.html

  **WHY Each Reference Matters**:
  - `api.ts:1`: Exact line to modify. The fallback `|| 'http://localhost:8000'` ensures dev works without .env.
  - `api.ts:67-76`: Shows how API_BASE is used. Don't change this - just the constant definition.
  - Vite docs: Confirms `VITE_` prefix requirement and `import.meta.env` access pattern.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # 1. TypeScript check
  cd frontend && npm run typecheck
  # Assert: Exit code 0, no errors

  # 2. Build check (ensures env vars resolved)
  cd frontend && npm run build
  # Assert: Exit code 0, dist/ folder created

  # 3. Grep for hardcoded localhost (should not find in api.ts anymore)
  grep -n "localhost:8000" frontend/src/services/api.ts
  # Assert: Exit code 1 (not found) OR only appears in fallback pattern
  ```

  **Evidence to Capture:**
  - [ ] typecheck output (no errors)
  - [ ] build output (success)
  - [ ] Grep showing no raw hardcoded localhost

  **Commit**: YES
  - Message: `fix(frontend): externalize API base URL to environment variable`
  - Files: `frontend/src/services/api.ts`, `frontend/src/vite-env.d.ts`
  - Pre-commit: `cd frontend && npm run typecheck`

  **Rollback Strategy**:
  ```bash
  git checkout HEAD~1 -- frontend/src/services/api.ts frontend/src/vite-env.d.ts
  ```

---

### Task 3: App - Create .env.example Template

- [ ] 3. App Environment Template Creation

  **What to do**:
  1. Create `app/.env.example` with all 17 environment variable keys (no actual values):
     ```
     # Sentry Error Monitoring
     EXPO_PUBLIC_SENTRY_DSN=
     SENTRY_ORG=
     SENTRY_PROJECT=
     SENTRY_AUTH_TOKEN=

     # 온통청년 (Youth Center) API
     EXPO_PUBLIC_YOUTH_POLICY_API_KEY=
     EXPO_PUBLIC_YOUTH_CENTER_API_KEY=

     # 고용24 (Work24/Employment24) APIs
     EXPO_PUBLIC_WORK24_JOB_POSTING_API_KEY=
     EXPO_PUBLIC_WORK24_TRAINING_CARD_API_KEY=
     EXPO_PUBLIC_WORK24_EMPLOYER_TRAINING_API_KEY=
     EXPO_PUBLIC_WORK24_CONSORTIUM_TRAINING_API_KEY=
     EXPO_PUBLIC_WORK24_WORK_STUDY_API_KEY=
     EXPO_PUBLIC_WORK24_EMPLOYMENT_PROGRAM_API_KEY=
     EXPO_PUBLIC_WORK24_SMALL_GIANT_API_KEY=
     EXPO_PUBLIC_WORK24_JOB_INFO_API_KEY=
     EXPO_PUBLIC_WORK24_JOB_DUTY_API_KEY=
     EXPO_PUBLIC_WORK24_COMMON_CODE_API_KEY=

     # 보조금24 (Gov24) API
     EXPO_PUBLIC_GOV24_API_KEY=
     ```

  **Must NOT do**:
  - Include actual API key values
  - Modify any existing .env file
  - Change any service code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file creation, template only
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit
  - **Skills Evaluated but Omitted**:
    - All others: No code logic involved

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 5)
  - **Blocks**: Task 6 (final verification)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `app/.env` (current) - Source of truth for key names (DO NOT READ VALUES, only key names)
  - `app/services/api/youth-policy.ts:20` - Shows `process.env.EXPO_PUBLIC_YOUTH_POLICY_API_KEY` usage

  **WHY Each Reference Matters**:
  - `.env`: Lists all 17 keys that need to be in .env.example. Extract key names only.
  - `youth-policy.ts:20`: Confirms the EXPO_PUBLIC_ prefix pattern is correct.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # 1. File exists
  test -f app/.env.example
  # Assert: Exit code 0

  # 2. Contains all required keys (count of EXPO_PUBLIC_ lines)
  grep -c "EXPO_PUBLIC_" app/.env.example
  # Assert: Returns 14 (14 EXPO_PUBLIC keys)

  # 3. No actual values (all lines end with =)
  grep -E "^EXPO_PUBLIC_.*=.+" app/.env.example | wc -l
  # Assert: Returns 0 (no values after =)

  # 4. Lint still passes
  cd app && npm run lint
  # Assert: Exit code 0
  ```

  **Evidence to Capture:**
  - [ ] .env.example file exists
  - [ ] Correct key count (17 total, 14 EXPO_PUBLIC)
  - [ ] No secrets in file

  **Commit**: YES
  - Message: `docs(app): add .env.example template for developer onboarding`
  - Files: `app/.env.example`
  - Pre-commit: `test -f app/.env.example && grep -c EXPO_PUBLIC_ app/.env.example`

  **Rollback Strategy**:
  ```bash
  rm app/.env.example
  ```

---

### Task 4: Frontend - Create .env.example Template

- [ ] 4. Frontend Environment Template Creation

  **What to do**:
  1. Create `frontend/.env.example` with:
     ```
     # Backend API URL (required for production)
     # For local development, defaults to http://localhost:8000 if not set
     VITE_API_BASE=http://localhost:8000
     ```

  **Must NOT do**:
  - Include production URLs
  - Create actual .env file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file creation
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Task 2)
  - **Blocks**: Task 6 (final verification)
  - **Blocked By**: Task 2 (need API_BASE externalized first)

  **References**:

  **Pattern References**:
  - `frontend/src/services/api.ts:1` - Shows the env var name VITE_API_BASE

  **WHY Each Reference Matters**:
  - `api.ts:1`: After Task 2, this will reference VITE_API_BASE. Template must match.

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # 1. File exists
  test -f frontend/.env.example
  # Assert: Exit code 0

  # 2. Contains VITE_API_BASE
  grep "VITE_API_BASE" frontend/.env.example
  # Assert: Exit code 0, line found
  ```

  **Evidence to Capture:**
  - [ ] .env.example file exists with VITE_API_BASE

  **Commit**: YES (group with Task 2 if same session)
  - Message: `docs(frontend): add .env.example template`
  - Files: `frontend/.env.example`
  - Pre-commit: `test -f frontend/.env.example`

  **Rollback Strategy**:
  ```bash
  rm frontend/.env.example
  ```

---

### Task 5: Documentation - Known Limitations

- [ ] 5. Document Known Limitations

  **What to do**:
  1. Create `docs/KNOWN_LIMITATIONS.md`:
     ```markdown
     # Known Limitations (MVP Release)

     ## Backend: In-Memory Storage

     **Status**: Accepted for MVP
     **Impact**: All user data (profiles, applications, notifications) is stored in memory and will be lost when the server restarts.

     **Affected Data**:
     - User profiles (birth_year, region, income_level, employment_status)
     - Benefit applications and their status
     - User notifications

     **Workaround**: None currently. Users must re-enter data after server restart.

     **Future Fix**: Implement persistent storage (PostgreSQL/SQLite) in a future release.

     ---

     ## App: Placeholder Legal URLs

     **Status**: TODO before App Store submission
     **Impact**: "서비스 이용약관" and "개인정보 처리방침" links in onboarding point to example.com

     **Location**: `app/app/(auth)/onboarding/step3.tsx` lines 35, 41

     **Required Action**: Replace with real URLs before submitting to Apple App Store / Google Play Store:
     - `https://example.com/terms` → Real Terms of Service URL
     - `https://example.com/privacy` → Real Privacy Policy URL

     ---

     ## Environment Variables Required for Production

     Before deploying to production, ensure these environment variables are set:

     ### Frontend
     - `VITE_API_BASE`: Production API URL (e.g., https://api.yoursite.com)

     ### Backend
     - `CORS_ORIGINS`: Comma-separated list of allowed origins (e.g., https://yoursite.com,https://www.yoursite.com)

     ### App
     - All `EXPO_PUBLIC_*` API keys (see `app/.env.example`)
     ```

  **Must NOT do**:
  - Include actual production URLs or secrets
  - Make promises about fix timelines

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation creation
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 6 (final verification)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `backend/app/storage.py` - In-memory storage implementation
  - `app/app/(auth)/onboarding/step3.tsx:35,41` - Placeholder URLs
  - `docs/development-guide.md` - Existing docs format (if any)

  **WHY Each Reference Matters**:
  - `storage.py`: Documents what's stored in memory
  - `step3.tsx`: Exact line numbers for placeholder URLs
  - `development-guide.md`: Match existing documentation style

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # 1. File exists
  test -f docs/KNOWN_LIMITATIONS.md
  # Assert: Exit code 0

  # 2. Contains required sections
  grep -c "##" docs/KNOWN_LIMITATIONS.md
  # Assert: Returns >= 3 (at least 3 sections)

  # 3. No secrets
  grep -i "api_key\|password\|secret" docs/KNOWN_LIMITATIONS.md | grep -v "EXPO_PUBLIC"
  # Assert: Exit code 1 (no matches)
  ```

  **Evidence to Capture:**
  - [ ] File created with all sections
  - [ ] No sensitive data in file

  **Commit**: YES
  - Message: `docs: add known limitations documentation for MVP release`
  - Files: `docs/KNOWN_LIMITATIONS.md`
  - Pre-commit: `test -f docs/KNOWN_LIMITATIONS.md`

  **Rollback Strategy**:
  ```bash
  rm docs/KNOWN_LIMITATIONS.md
  ```

---

### Task 6: Final Integration Verification

- [ ] 6. Final Integration Verification

  **What to do**:
  1. Run all verification commands to ensure everything works together
  2. Verify no secrets in git staging area
  3. Verify all .env.example files exist
  4. Run existing test suites

  **Must NOT do**:
  - Make additional code changes
  - Skip any verification step

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: [`git-master`]
    - `git-master`: Final commit verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final, after all others)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 2, 3, 4, 5

  **References**:

  **Pattern References**:
  - All files modified in Tasks 1-5

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # === BACKEND ===
  echo "=== Backend Verification ==="
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --host 0.0.0.0 --port 8000 &
  BACKEND_PID=$!
  sleep 3
  curl -s http://localhost:8000/health | grep -q '"status":"ok"' && echo "✅ Backend health OK" || echo "❌ Backend health FAILED"
  kill $BACKEND_PID 2>/dev/null
  cd ..

  # === FRONTEND ===
  echo "=== Frontend Verification ==="
  cd frontend
  npm run typecheck && echo "✅ Frontend typecheck OK" || echo "❌ Frontend typecheck FAILED"
  npm run build && echo "✅ Frontend build OK" || echo "❌ Frontend build FAILED"
  cd ..

  # === APP ===
  echo "=== App Verification ==="
  cd app
  npm run lint && echo "✅ App lint OK" || echo "❌ App lint FAILED"
  npm test -- --passWithNoTests && echo "✅ App tests OK" || echo "❌ App tests FAILED"
  cd ..

  # === ENV FILES ===
  echo "=== Environment Files ==="
  test -f backend/.env.example && echo "✅ backend/.env.example exists" || echo "❌ backend/.env.example MISSING"
  test -f frontend/.env.example && echo "✅ frontend/.env.example exists" || echo "❌ frontend/.env.example MISSING"
  test -f app/.env.example && echo "✅ app/.env.example exists" || echo "❌ app/.env.example MISSING"

  # === DOCS ===
  echo "=== Documentation ==="
  test -f docs/KNOWN_LIMITATIONS.md && echo "✅ KNOWN_LIMITATIONS.md exists" || echo "❌ KNOWN_LIMITATIONS.md MISSING"

  # === GIT SECRETS CHECK ===
  echo "=== Git Secrets Check ==="
  git diff --cached --name-only | grep -E "\.env$" && echo "❌ WARNING: .env file staged!" || echo "✅ No .env files staged"
  ```

  **Evidence to Capture:**
  - [ ] All verification commands pass
  - [ ] No .env files in git staging

  **Commit**: NO (verification only)

  **Rollback Strategy**: N/A (no changes made in this task)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(backend): externalize CORS origins to environment variable` | `backend/app/main.py`, `backend/requirements.txt`, `backend/.env.example` | Backend health check |
| 2 | `fix(frontend): externalize API base URL to environment variable` | `frontend/src/services/api.ts`, `frontend/src/vite-env.d.ts` | Frontend typecheck |
| 3 | `docs(app): add .env.example template for developer onboarding` | `app/.env.example` | File exists + lint |
| 4 | `docs(frontend): add .env.example template` | `frontend/.env.example` | File exists |
| 5 | `docs: add known limitations documentation for MVP release` | `docs/KNOWN_LIMITATIONS.md` | File exists |

---

## Success Criteria

### Verification Commands (All Must Pass)
```bash
# Backend starts and responds
cd backend && uvicorn app.main:app --port 8000 & sleep 2 && curl -s http://localhost:8000/health && pkill -f uvicorn
# Expected: {"status":"ok","benefits":N}

# Frontend builds
cd frontend && npm run typecheck && npm run build
# Expected: Exit code 0

# App lints
cd app && npm run lint
# Expected: Exit code 0

# All env examples exist
ls -la backend/.env.example frontend/.env.example app/.env.example docs/KNOWN_LIMITATIONS.md
# Expected: All files listed
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] CORS externalized to CORS_ORIGINS env var
  - [ ] API_BASE externalized to VITE_API_BASE env var
  - [ ] backend/.env.example exists
  - [ ] frontend/.env.example exists
  - [ ] app/.env.example exists
  - [ ] docs/KNOWN_LIMITATIONS.md exists
- [ ] All "Must NOT Have" absent:
  - [ ] No breaking API changes (endpoints unchanged)
  - [ ] No persistence changes (storage.py unchanged)
  - [ ] No secrets in committed files
  - [ ] No changes to step3.tsx legal URLs
- [ ] All tests pass (typecheck, lint, health)
