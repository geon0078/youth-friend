import { Stack } from 'expo-router';

import { Palette } from '@/constants';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Palette.background,
        },
        headerTintColor: Palette.gray900,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '프로필',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: '프로필 수정',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
