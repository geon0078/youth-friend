import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { Palette } from '@/constants';
import { useUserStore } from '@/stores';
import { authService } from '@/services/auth';

/**
 * 앱 진입점
 * - 온보딩 상태 확인
 * - PIN 설정 상태 확인
 * - 적절한 화면으로 리다이렉트
 */
export default function Index() {
  const { isOnboarded } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isPinSet, setIsPinSet] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const pinSet = await authService.isPinSet();
        setIsPinSet(pinSet);
      } catch {
        // 에러 시 PIN 미설정으로 처리
        setIsPinSet(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // 로딩 중
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  // 온보딩 미완료 -> Welcome 화면
  if (!isOnboarded) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // 온보딩 완료 + PIN 설정됨 -> Lock 화면
  if (isPinSet) {
    return <Redirect href={'/(auth)/lock' as any} />;
  }

  // 온보딩 완료 + PIN 미설정 -> 홈 화면
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
});
