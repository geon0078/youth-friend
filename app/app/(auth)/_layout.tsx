import { Stack } from 'expo-router';
import { Palette } from '@/constants';

/**
 * Auth 레이아웃
 * - Welcome 화면
 * - Onboarding 플로우
 * - PIN 설정
 * - 잠금 화면
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen
        name="lock"
        options={{
          gestureEnabled: false, // 뒤로가기 제스처 비활성화
        }}
      />
    </Stack>
  );
}
