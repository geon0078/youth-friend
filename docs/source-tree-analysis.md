# 청년친구 소스 트리 분석

> 생성일: 2026-01-15 | 스캔 레벨: Exhaustive

## 프로젝트 루트 구조

```
youth-friend/
├── .claude/                    # Claude Code 설정
├── .git/                       # Git 저장소
├── .gitignore                  # Git 무시 파일
├── _bmad/                      # BMad Method 설정
├── _bmad-output/               # BMad 출력물
│   └── planning-artifacts/     # 계획 산출물
│       └── bmm-workflow-status.yaml
├── app/                        # ⭐ 메인 앱 디렉토리
└── docs/                       # 프로젝트 문서 (이 문서)
```

---

## 앱 디렉토리 상세 구조

```
app/                            # Expo React Native 앱 루트
├── .gitignore                  # 앱 전용 Git 무시 파일
├── .vscode/                    # VS Code 설정
│   ├── extensions.json         # 추천 확장
│   └── settings.json           # 에디터 설정
│
├── 📋 설정 파일
├── app.json                    # ⭐ Expo 앱 설정 (이름, 아이콘, 플러그인)
├── package.json                # 의존성 및 스크립트
├── package-lock.json           # 의존성 잠금
├── tsconfig.json               # TypeScript 설정
├── eslint.config.js            # ESLint 설정
├── README.md                   # 프로젝트 소개
│
├── 📱 앱 라우트 (Expo Router)
├── app/                        # ⭐ 파일 기반 라우팅
│   ├── _layout.tsx             # 🚀 루트 레이아웃 (ThemeProvider, Stack)
│   ├── modal.tsx               # 모달 화면
│   ├── onboarding.tsx          # 온보딩 화면 (3단계 질문)
│   └── (tabs)/                 # 탭 네비게이션 그룹
│       ├── _layout.tsx         # 탭 레이아웃 (Home, Explore)
│       ├── index.tsx           # 🏠 홈 탭 (추천 혜택, 빠른 작업)
│       └── explore.tsx         # 🔍 탐색 탭 (API 소스, 로드맵)
│
├── 🧩 컴포넌트
├── components/                 # 재사용 컴포넌트
│   ├── design-system/          # ⭐ 디자인 시스템 컴포넌트
│   │   ├── index.ts            # 배럴 익스포트
│   │   ├── Badge.tsx           # 상태 뱃지
│   │   ├── Card.tsx            # 카드 레이아웃
│   │   ├── Chip.tsx            # 선택 칩
│   │   ├── PrimaryButton.tsx   # 주요 버튼
│   │   └── SectionHeader.tsx   # 섹션 헤더
│   │
│   ├── ui/                     # UI 유틸리티
│   │   ├── collapsible.tsx     # 접기/펼치기
│   │   ├── icon-symbol.tsx     # 아이콘 (Android/Web)
│   │   └── icon-symbol.ios.tsx # 아이콘 (iOS - SF Symbols)
│   │
│   ├── external-link.tsx       # 외부 링크 (인앱 브라우저)
│   ├── haptic-tab.tsx          # 햅틱 탭 버튼
│   ├── hello-wave.tsx          # 인사 애니메이션
│   ├── parallax-scroll-view.tsx# 패럴랙스 스크롤
│   ├── themed-text.tsx         # 테마 반응형 텍스트
│   └── themed-view.tsx         # 테마 반응형 뷰
│
├── 🎨 디자인 시스템
├── design-system/              # ⭐ 디자인 토큰
│   ├── index.ts                # 배럴 익스포트
│   ├── colors.ts               # 색상 팔레트 + 시맨틱 컬러
│   ├── typography.ts           # 타이포그래피 스케일
│   └── layout.ts               # Spacing, Radius, Shadows
│
├── 📦 상수 및 설정
├── constants/                  # 앱 상수
│   └── theme.ts                # 테마 색상 (Colors, Fonts)
│
├── 🪝 커스텀 훅
├── hooks/                      # React 훅
│   ├── use-color-scheme.ts     # 색상 스킴 감지 (재익스포트)
│   ├── use-color-scheme.web.ts # 웹 전용 색상 스킴
│   └── use-theme-color.ts      # 테마 색상 유틸
│
├── 🖼️ 에셋
├── assets/                     # 정적 자산
│   └── images/                 # 이미지 파일
│       ├── icon.png            # 앱 아이콘
│       ├── splash-icon.png     # 스플래시 아이콘
│       ├── favicon.png         # 웹 파비콘
│       ├── android-icon-*.png  # 안드로이드 아이콘 세트
│       └── react-logo*.png     # React 로고 (예제)
│
└── 🔧 스크립트
└── scripts/                    # 유틸리티 스크립트
    └── reset-project.js        # 프로젝트 초기화
```

---

## 중요 디렉토리 설명

### `app/app/` - 라우팅 (Expo Router)

Expo Router의 파일 기반 라우팅 디렉토리입니다.

| 파일 | 경로 | 설명 |
|------|------|------|
| `_layout.tsx` | - | 루트 레이아웃, ThemeProvider 설정 |
| `(tabs)/_layout.tsx` | - | 탭 네비게이션 설정 |
| `(tabs)/index.tsx` | `/` | 홈 화면 |
| `(tabs)/explore.tsx` | `/explore` | 탐색 화면 |
| `onboarding.tsx` | `/onboarding` | 온보딩 화면 |
| `modal.tsx` | `/modal` | 모달 화면 |

### `components/design-system/` - 디자인 시스템

재사용 가능한 UI 컴포넌트를 정의합니다.

- **Card** - 콘텐츠 그룹화
- **Badge** - 상태/카테고리 표시
- **Chip** - 선택 옵션
- **PrimaryButton** - 주요 액션
- **SectionHeader** - 섹션 제목

### `design-system/` - 디자인 토큰

앱 전체에서 사용되는 디자인 토큰을 정의합니다.

- **colors.ts** - Palette, SemanticColors (light/dark)
- **typography.ts** - 폰트 크기, 무게, 행간
- **layout.ts** - Spacing, Radius, Shadows

### `hooks/` - 커스텀 훅

React 로직을 재사용 가능하게 캡슐화합니다.

- **useColorScheme** - 시스템 테마 감지
- **useThemeColor** - 테마별 색상 반환

---

## 엔트리 포인트

| 파일 | 역할 |
|------|------|
| `app/app/_layout.tsx` | 앱 루트 레이아웃 |
| `app/app.json` | Expo 앱 설정 |
| `app/package.json` | npm 엔트리 (expo-router/entry) |

---

## 파일 통계

| 카테고리 | 파일 수 | 설명 |
|---------|--------|------|
| TypeScript/TSX | 20+ | 소스 코드 |
| JSON | 5 | 설정 파일 |
| PNG | 10 | 이미지 에셋 |
| Markdown | 1 | 문서 (README) |

---

## 코드 패턴

### 임포트 경로 별칭

```typescript
// tsconfig.json의 paths 설정으로 @ 별칭 사용
import { Palette } from '@/design-system';
import { Card } from '@/components/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

### 플랫폼별 파일

```
icon-symbol.tsx       # 기본 (Android/Web)
icon-symbol.ios.tsx   # iOS 전용
```

### 배럴 익스포트

```typescript
// design-system/index.ts
export * from './colors';
export * from './typography';
export * from './layout';

// components/design-system/index.ts
export * from './Card';
export * from './Badge';
// ...
```
