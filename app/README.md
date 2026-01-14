# 청년친구 React Native 앱

청년친구는 정부·지자체 청년 혜택을 한 번에 묶어 보여주는 맞춤형 모바일 앱입니다. Expo + React Native 조합으로 iOS/Android를 동시에 지원하며, 온보딩 · 홈 · 데이터 탐색 화면을 우선 구현했습니다.

## 개발 도구 체계

- **프레임워크**: Expo SDK + React Native + TypeScript
- **라우팅**: Expo Router (file-based)
- **디자인 협업**: Figma 컴포넌트를 RN StyleSheet로 매핑
- **Design System 코드 정의**: `app/design-system/`에서 컬러/타이포/spacing 토큰과 컴포넌트 스타일 가이드 제공
- **데이터 전략**: 정부24 / 지자체 / 청년센터 Open API 정규화 후 홈 피드와 알림에 공급
- **빌드/배포**: `npx expo start --ios/--android`, 필요 시 EAS Build 활용

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 주요 화면 (현재 버전)

- **온보딩(`/onboarding`)**: 3단계 질문으로 페르소나를 분류하고 CTA로 홈으로 이동
- **홈 탭**: 추천 혜택, 빠른 작업, 페르소나 하이라이트 섹션
- **Explore 탭**: 활용 예정 Open API 목록과 4주 개발 로드맵

## Design System 컴포넌트
- 위치: `app/design-system` (토큰) + `app/components/design-system` (SectionHeader, Card, Badge, Chip, PrimaryButton)
- 새로운 화면을 만들 때는 토큰(`Palette`, `Spacing`, `Radius`, `Typography`)과 컴포넌트를 조합해 일관된 UI를 유지하세요.

## 다음 단계 제안

1. Figma 하이파이 시안을 확정하고 컬러/타이포 시스템을 컴포넌트화
2. Open API 수집 파이프라인을 Node.js 서비스로 구축하여 앱과 연동
3. 신청 체크리스트/즐겨찾기를 AsyncStorage → 백엔드로 확장
4. Expo Dev Client/EAS Build로 디바이스 테스트 및 스토어 제출 준비

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## Join the community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
