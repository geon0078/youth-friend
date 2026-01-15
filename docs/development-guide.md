# 청년친구 개발 가이드

> 생성일: 2026-01-15 | 스캔 레벨: Exhaustive

## 사전 요구사항

| 항목 | 버전 | 비고 |
|------|------|------|
| Node.js | 18.x 이상 | LTS 권장 |
| npm | 9.x 이상 | Node.js와 함께 설치 |
| Expo CLI | 최신 | `npx expo` 사용 |
| iOS Simulator | Xcode 15+ | macOS만 해당 |
| Android Emulator | Android Studio | 선택사항 |
| Expo Go 앱 | 최신 | 실제 디바이스 테스트 |

---

## 설치 및 실행

### 1. 의존성 설치

```bash
cd app
npm install
```

### 2. 개발 서버 시작

```bash
# 기본 (QR 코드로 Expo Go 연결)
npx expo start

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android

# 웹 브라우저
npx expo start --web
```

### 3. 실행 옵션

개발 서버 실행 후 터미널에서:

| 키 | 동작 |
|----|------|
| `i` | iOS 시뮬레이터 열기 |
| `a` | Android 에뮬레이터 열기 |
| `w` | 웹 브라우저 열기 |
| `r` | 앱 리로드 |
| `m` | 개발 메뉴 토글 |
| `j` | 디버거 열기 |

---

## 프로젝트 구조

```
app/
├── app/              # 라우트 (Expo Router)
├── components/       # 재사용 컴포넌트
├── design-system/    # 디자인 토큰
├── constants/        # 상수
├── hooks/            # 커스텀 훅
└── assets/           # 에셋
```

자세한 내용은 [source-tree-analysis.md](./source-tree-analysis.md) 참조.

---

## 코드 컨벤션

### 파일 명명

- **컴포넌트:** PascalCase (`Card.tsx`, `PrimaryButton.tsx`)
- **훅:** kebab-case with `use-` prefix (`use-color-scheme.ts`)
- **상수:** kebab-case (`theme.ts`, `colors.ts`)
- **라우트:** kebab-case (`onboarding.tsx`, `modal.tsx`)

### 임포트 순서

```typescript
// 1. React/React Native
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. 외부 라이브러리
import { useRouter } from 'expo-router';

// 3. 내부 모듈 (@ 별칭)
import { Palette, Spacing } from '@/design-system';
import { Card } from '@/components/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

### 스타일 정의

```typescript
// StyleSheet는 컴포넌트 하단에 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
});
```

---

## 디자인 시스템 사용

### 색상

```typescript
import { Palette, getSemanticColor } from '@/design-system';

// 직접 색상
<View style={{ backgroundColor: Palette.primary }} />

// 테마 반응형 색상
const scheme = useColorScheme();
const backgroundColor = getSemanticColor(scheme, 'background');
```

### 타이포그래피

```typescript
import { Typography } from '@/design-system';

<Text style={Typography.heroTitle}>제목</Text>
<Text style={Typography.body}>본문</Text>
```

### 레이아웃

```typescript
import { Spacing, Radius, Shadows } from '@/design-system';

<View style={{
  padding: Spacing.lg,      // 16
  borderRadius: Radius.md,  // 12
  ...Shadows.soft,          // 그림자
}} />
```

---

## 컴포넌트 개발

### 새 컴포넌트 추가

1. `components/design-system/` 또는 `components/ui/`에 파일 생성
2. Props 타입 정의
3. 컴포넌트 구현
4. `index.ts`에 익스포트 추가

```typescript
// components/design-system/NewComponent.tsx
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Spacing, Radius } from '@/design-system';

type Props = {
  // props 정의
  style?: ViewStyle;
};

export function NewComponent({ style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {/* 내용 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
});
```

### 새 화면 추가

1. `app/app/` 디렉토리에 파일 생성
2. 파일명이 라우트 경로가 됨

```typescript
// app/app/new-screen.tsx → /new-screen 경로
export default function NewScreen() {
  return (
    <SafeAreaView>
      {/* 화면 내용 */}
    </SafeAreaView>
  );
}
```

---

## 린팅

```bash
# ESLint 실행
npx expo lint

# 자동 수정
npx expo lint --fix
```

---

## 빌드

### 개발 빌드

```bash
# EAS CLI 설치 (최초 1회)
npm install -g eas-cli

# EAS 로그인
eas login

# 개발 빌드 생성
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 프로덕션 빌드

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

---

## 프로젝트 초기화

새로운 프로젝트로 시작하려면:

```bash
npm run reset-project
```

이 명령어는 현재 `app` 디렉토리를 `app-example`로 이동하고 빈 `app` 디렉토리를 생성합니다.

---

## 문제 해결

### 캐시 클리어

```bash
# Expo 캐시 클리어
npx expo start --clear

# npm 캐시 클리어
npm cache clean --force
rm -rf node_modules
npm install
```

### Metro 번들러 리셋

```bash
npx expo start --clear
```

### iOS 시뮬레이터 문제

```bash
# Xcode 커맨드라인 도구 재설치
xcode-select --install
```

---

## 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [React Native 문서](https://reactnative.dev/)
- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
