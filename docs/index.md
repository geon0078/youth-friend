# 청년친구 프로젝트 문서

> 생성일: 2026-01-15 | Document Project Workflow v1.2.0

## 프로젝트 개요

| 항목 | 값 |
|------|-----|
| **프로젝트명** | 청년친구 (youth-friend) |
| **유형** | Mobile (Expo + React Native) |
| **Repository** | Monolith |
| **주요 언어** | TypeScript |
| **아키텍처** | Component-Based Mobile Architecture |

---

## 빠른 참조

### 기술 스택

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| 프레임워크 | Expo | 54.0.31 |
| 런타임 | React Native | 0.81.5 |
| 언어 | TypeScript | 5.9.2 |
| 라우팅 | Expo Router | 6.0.21 |
| 애니메이션 | React Native Reanimated | 4.1.1 |

### 엔트리 포인트

- **앱 루트:** `app/app/_layout.tsx`
- **홈 화면:** `app/app/(tabs)/index.tsx`
- **설정:** `app/app.json`

### 주요 경로

| 경로 | 화면 | 설명 |
|------|------|------|
| `/` | 홈 | 추천 혜택, 빠른 작업 |
| `/explore` | 탐색 | API 소스, 로드맵 |
| `/onboarding` | 온보딩 | 3단계 질문 |
| `/modal` | 모달 | 범용 모달 |

---

## 생성된 문서

### 핵심 문서

- [프로젝트 개요](./project-overview.md) - 프로젝트 소개 및 요약
- [아키텍처](./architecture.md) - 시스템 아키텍처 및 기술 결정
- [소스 트리 분석](./source-tree-analysis.md) - 디렉토리 구조 및 파일 설명

### 개발 문서

- [개발 가이드](./development-guide.md) - 설치, 실행, 개발 방법
- [컴포넌트 인벤토리](./component-inventory.md) - UI 컴포넌트 목록 및 사용법

---

## 기존 문서

- [README.md](../app/README.md) - 프로젝트 소개 (한국어)

---

## 시작하기

### 1. 의존성 설치

```bash
cd app
npm install
```

### 2. 개발 서버 실행

```bash
npx expo start
```

### 3. 앱 실행

- **iOS:** `i` 키 또는 `npx expo start --ios`
- **Android:** `a` 키 또는 `npx expo start --android`
- **Web:** `w` 키 또는 `npx expo start --web`

---

## AI 개발 가이드

### 코드 수정 시

1. **컴포넌트 추가:** [컴포넌트 인벤토리](./component-inventory.md)에서 기존 컴포넌트 확인
2. **스타일링:** [아키텍처](./architecture.md)의 디자인 시스템 토큰 참조
3. **새 화면:** [소스 트리 분석](./source-tree-analysis.md)의 라우팅 규칙 준수

### 새 기능 개발 시

1. [프로젝트 개요](./project-overview.md)에서 계획된 기능 확인
2. [아키텍처](./architecture.md)의 향후 확장 계획 참조
3. 기존 패턴과 일관성 유지

### 컨벤션

- 컴포넌트: PascalCase (`Card.tsx`)
- 훅: kebab-case with `use-` prefix (`use-color-scheme.ts`)
- 디자인 토큰 사용 필수 (`Spacing`, `Radius`, `Palette`)
- `@/` 경로 별칭 사용

---

## BMad Method 워크플로우

이 문서는 BMad Method의 **document-project** 워크플로우로 생성되었습니다.

**다음 단계:**
- Brownfield PRD 작성 시 이 index.md를 입력으로 제공
- API 연동, LLM 기반 개인화 기능 추가 계획

---

## 문서 업데이트

이 문서는 코드베이스 변경 시 업데이트가 필요할 수 있습니다.

```bash
# 문서 재생성
/bmad:bmm:workflows:document-project
```
