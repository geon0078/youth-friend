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

**Location**: `app/app/(auth)/onboarding/step3.tsx`

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
