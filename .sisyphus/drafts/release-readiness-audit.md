# Draft: Release Readiness Audit

## Requirements (confirmed)
- Focus on deploy blockers and safe fixes
- Must not introduce breaking API changes
- Must avoid secrets in git
- Must keep changes minimal and safe
- Include verification commands per project
- Atomic steps with file-level targets
- Each step independently verifiable
- Order by dependency
- Include rollback strategy

## Research Findings

### Frontend (`frontend/`)
- **CRITICAL**: `src/services/api.ts:1` - hardcoded `API_BASE = 'http://localhost:8000'`
- No `.env` or `.env.example` files
- No test scripts (only `typecheck`)
- No lint script
- Vite-based build (Vue 3)

### Backend (`backend/`)
- **CRITICAL**: `app/main.py:28` - hardcoded CORS `allow_origins=["http://localhost:5173"]`
- **CRITICAL**: `app/storage.py` - in-memory store (data loss on restart)
- No `.env` file or python-dotenv
- No tests configured
- No lint configured
- FastAPI/uvicorn stack

### App (`app/`)
- **MODERATE**: `app/(auth)/onboarding/step3.tsx:35,41` - placeholder URLs `https://example.com/terms` and `https://example.com/privacy`
- `.env` exists with 17 API keys (correctly using `EXPO_PUBLIC_*` prefix)
- NO `.env.example` template exists
- API keys loaded via `process.env.EXPO_PUBLIC_*` - correct pattern
- Jest tests configured (`npm test`)
- Lint configured (`npm run lint`)

### Security Status
- `.gitignore` properly excludes `.env*` files
- `app/.gitignore` properly excludes `.env` and `.env*.local`
- **RISK**: No `.env.example` files anywhere - developers won't know what env vars are needed

## Deploy Blockers Identified

| Priority | Project | Issue | Fix |
|----------|---------|-------|-----|
| P0-BLOCKER | frontend | Hardcoded localhost API_BASE | Externalize to VITE_API_BASE env var |
| P0-BLOCKER | backend | Hardcoded CORS localhost origin | Externalize to CORS_ORIGINS env var |
| P1-HIGH | app | Placeholder legal URLs | Replace with real URLs (user-provided) |
| P1-HIGH | all | No .env.example files | Create templates for each project |
| P2-MEDIUM | backend | In-memory storage | Document as known limitation (defer persistence) |

## Scope Boundaries

### INCLUDE
- Environment variable externalization (frontend, backend)
- .env.example creation (all projects)
- Placeholder URL replacement (app)
- Lint/typecheck verification commands

### EXCLUDE (per "minimal and safe" constraint)
- Backend persistence (SQLite/PostgreSQL) - too risky for "safe fixes"
- Authentication implementation
- Rate limiting
- New test coverage
- Breaking API changes

## Technical Decisions

### Frontend env var pattern
- Use Vite's `import.meta.env.VITE_*` pattern
- Fallback to localhost for development

### Backend env var pattern
- Use `python-dotenv` + `os.getenv()` with defaults
- Split CORS_ORIGINS by comma for multiple origins

### App env pattern
- Already correct (EXPO_PUBLIC_*)
- Just need .env.example template

## Decisions Made (from interview)

1. **Legal URLs (Terms/Privacy)**: 나중에 처리 - Keep example.com placeholders, document as TODO for app store submission
2. **Production API URL**: TBD - externalize to VITE_API_BASE env var, document as required before deploy
3. **Production CORS origins**: TBD - externalize to CORS_ORIGINS env var, document as required before deploy
4. **Backend in-memory storage**: Accept as-is for MVP - document as known limitation
5. **Frontend ESLint**: Skip - minimize scope, typecheck is sufficient

## Test Strategy
- app: Has Jest (`npm test`) - include test run in verification
- frontend: Has typecheck only (`npm run typecheck`) - include in verification
- backend: No tests - use uvicorn health check verification
