import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '@/providers';
import { ErrorBoundary } from '@/components/error';
import { initSentry } from '@/services/monitoring';
import { authService, sessionManager } from '@/services/auth';

// Sentry 초기화 (앱 시작 시 한 번만)
initSentry();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // 세션 매니저 초기화 및 타임아웃 처리
  useEffect(() => {
    sessionManager.initialize();

    // 세션 잠금 리스너
    const unsubscribe = sessionManager.addListener(async (isLocked) => {
      if (isLocked) {
        const isPinSet = await authService.isPinSet();
        if (isPinSet) {
          router.replace('/(auth)/lock' as any);
        }
      }
    });

    // 앱 시작 시 세션 타임아웃 체크
    const checkInitialTimeout = async () => {
      const isPinSet = await authService.isPinSet();
      if (isPinSet && sessionManager.checkSessionTimeout()) {
        router.replace('/(auth)/lock' as any);
      }
    };

    checkInitialTimeout();

    return () => {
      unsubscribe();
      sessionManager.cleanup();
    };
  }, [router]);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{
                headerShown: true,
                presentation: 'modal',
                title: 'Modal',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
