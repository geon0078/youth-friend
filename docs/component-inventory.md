# 청년친구 컴포넌트 인벤토리

> 생성일: 2026-01-15 | 스캔 레벨: Exhaustive

## 개요

청년친구 앱은 커스텀 디자인 시스템을 기반으로 한 재사용 가능한 컴포넌트 라이브러리를 구축하고 있습니다.

- **총 컴포넌트 수:** 10개
- **디자인 시스템 컴포넌트:** 5개
- **유틸리티 컴포넌트:** 5개

---

## 디자인 시스템 컴포넌트

### Card

**파일:** `components/design-system/Card.tsx`

카드 레이아웃 컴포넌트로 콘텐츠를 그룹화합니다.

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| variant | 'surface' \| 'outlined' | 'surface' | 카드 스타일 |
| padding | keyof Spacing \| number | 'lg' | 내부 여백 |
| style | ViewStyle | - | 추가 스타일 |
| children | ReactNode | - | 자식 요소 |

```tsx
<Card variant="surface" padding="lg">
  <Text>카드 내용</Text>
</Card>
```

---

### Badge

**파일:** `components/design-system/Badge.tsx`

상태나 카테고리를 표시하는 작은 레이블 컴포넌트입니다.

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| label | string | (필수) | 표시할 텍스트 |
| tone | 'default' \| 'alert' \| 'positive' | 'default' | 색상 톤 |

**톤별 색상:**
- default: 파란색 (#E8EDFF / primary)
- alert: 주황색 (#FFE6D5 / accent)
- positive: 청록색 (#DBF7F2 / secondary)

```tsx
<Badge label="주거" />
<Badge label="D-7" tone="alert" />
```

---

### Chip

**파일:** `components/design-system/Chip.tsx`

선택 가능한 칩 컴포넌트로 온보딩 옵션 선택에 사용됩니다.

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| label | string | (필수) | 표시할 텍스트 |
| selected | boolean | false | 선택 상태 |
| onPress | () => void | - | 클릭 핸들러 |
| style | ViewStyle | - | 추가 스타일 |

```tsx
<Chip
  label="주거"
  selected={isSelected}
  onPress={() => handleSelect('주거')}
/>
```

---

### PrimaryButton

**파일:** `components/design-system/PrimaryButton.tsx`

주요 액션을 위한 버튼 컴포넌트입니다.

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| label | string | (필수) | 버튼 텍스트 |
| onPress | () => void | (필수) | 클릭 핸들러 |
| disabled | boolean | false | 비활성화 상태 |
| tone | 'primary' \| 'inverse' | 'primary' | 색상 톤 |
| style | ViewStyle | - | 추가 스타일 |

**톤별 스타일:**
- primary: 파란 배경 + 흰색 텍스트
- inverse: 흰색 배경 + 파란색 텍스트

```tsx
<PrimaryButton
  label="나에게 맞는 혜택 찾기"
  onPress={handlePress}
/>
<PrimaryButton
  label="완료"
  tone="inverse"
  onPress={handleComplete}
/>
```

---

### SectionHeader

**파일:** `components/design-system/SectionHeader.tsx`

섹션 제목과 부제목을 표시하는 헤더 컴포넌트입니다.

| Props | 타입 | 기본값 | 설명 |
|-------|------|--------|------|
| title | string | (필수) | 섹션 제목 |
| subtitle | string | - | 부제목 |
| action | ReactNode | - | 우측 액션 요소 |
| style | ViewStyle | - | 추가 스타일 |

```tsx
<SectionHeader
  title="추천 혜택"
  subtitle="프로필 기반 큐레이션"
/>
```

---

## 유틸리티 컴포넌트

### ThemedText

**파일:** `components/themed-text.tsx`

테마에 반응하는 텍스트 컴포넌트입니다.

| Props | 타입 | 설명 |
|-------|------|------|
| type | 'default' \| 'title' \| 'defaultSemiBold' \| 'subtitle' \| 'link' | 텍스트 스타일 |
| lightColor | string | 라이트 모드 색상 |
| darkColor | string | 다크 모드 색상 |

---

### ThemedView

**파일:** `components/themed-view.tsx`

테마에 반응하는 뷰 컴포넌트입니다.

| Props | 타입 | 설명 |
|-------|------|------|
| lightColor | string | 라이트 모드 배경색 |
| darkColor | string | 다크 모드 배경색 |

---

### IconSymbol

**파일:** `components/ui/icon-symbol.tsx` (Android/Web), `icon-symbol.ios.tsx` (iOS)

플랫폼별 아이콘 컴포넌트입니다.

- **iOS:** SF Symbols (expo-symbols)
- **Android/Web:** Material Icons (@expo/vector-icons)

| Props | 타입 | 설명 |
|-------|------|------|
| name | IconSymbolName | 아이콘 이름 |
| size | number | 아이콘 크기 |
| color | string | 아이콘 색상 |
| weight | SymbolWeight | 아이콘 굵기 (iOS만) |

**아이콘 매핑:**
| SF Symbol | Material Icon |
|-----------|---------------|
| house.fill | home |
| paperplane.fill | send |
| chevron.right | chevron-right |

---

### Collapsible

**파일:** `components/ui/collapsible.tsx`

접기/펼치기 가능한 컴포넌트입니다.

| Props | 타입 | 설명 |
|-------|------|------|
| title | string | 헤더 제목 |
| children | ReactNode | 접히는 내용 |

---

### ParallaxScrollView

**파일:** `components/parallax-scroll-view.tsx`

패럴랙스 효과가 있는 스크롤 뷰 컴포넌트입니다.

| Props | 타입 | 설명 |
|-------|------|------|
| headerImage | ReactElement | 헤더 이미지 요소 |
| headerBackgroundColor | { dark: string; light: string } | 헤더 배경색 |
| children | ReactNode | 스크롤 내용 |

---

## 컴포넌트 의존성 그래프

```
App Routes
├── _layout.tsx
│   └── ThemeProvider, Stack (expo-router)
├── (tabs)/_layout.tsx
│   ├── Tabs (expo-router)
│   ├── HapticTab
│   ├── IconSymbol
│   └── Colors (constants)
├── (tabs)/index.tsx (HomeScreen)
│   ├── design-system tokens
│   ├── SectionHeader
│   ├── Card
│   ├── Badge
│   └── PrimaryButton
├── (tabs)/explore.tsx
│   ├── design-system tokens
│   ├── Card
│   └── SectionHeader
├── onboarding.tsx
│   ├── design-system tokens
│   ├── Card
│   ├── Chip
│   └── PrimaryButton
└── modal.tsx
    ├── ThemedText
    └── ThemedView
```

---

## 확장 권장사항

1. **폼 컴포넌트 추가:** TextInput, Select, Checkbox 등
2. **피드백 컴포넌트:** Toast, Modal, Alert
3. **데이터 표시:** List, Table, Avatar
4. **네비게이션:** Header, BottomSheet, TabBar 커스텀
