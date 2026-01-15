import { Stack } from 'expo-router';
import { Palette } from '@/constants';

/**
 * Onboarding 레이아웃
 * - Step 1: 기본 정보 (나이, 지역)
 * - Step 2: 경제 정보 (소득, 취업상태)
 * - Step 3: 개인정보 동의
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
    </Stack>
  );
}
