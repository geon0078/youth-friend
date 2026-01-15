import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { useUserStore } from '@/stores';

/**
 * Welcome Screen
 * - 앱 로고와 "청년친구" 타이틀
 * - 핵심 가치 메시지 (손실 회피 프레이밍)
 * - "시작하기" CTA 버튼
 * - "이미 계정이 있어요" 링크
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isOnboarded } = useUserStore();

  // 이미 온보딩을 완료한 사용자는 홈으로 이동
  const handleExistingUser = () => {
    if (isOnboarded) {
      router.replace('/(tabs)' as const);
    } else {
      // 온보딩 미완료 시 온보딩으로 이동
      router.push('./onboarding/step1');
    }
  };

  const handleStart = () => {
    router.push('./onboarding/step1');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View
          style={styles.logoPlaceholder}
          accessibilityLabel="청년친구 앱 로고"
          accessibilityRole="image"
        >
          <Text style={styles.logoEmoji}>🎁</Text>
        </View>
        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          청년친구
        </Text>
      </View>

      {/* Message Section */}
      <View style={styles.messageSection}>
        <Text
          style={styles.headline}
          accessibilityLabel="받을 수 있는 혜택, 놓치지 마세요"
        >
          받을 수 있는 혜택,{'\n'}놓치지 마세요
        </Text>
        <Text style={styles.subheadline}>
          청년 정책을 한눈에 확인하고{'\n'}
          나에게 맞는 혜택을 찾아보세요
        </Text>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStart}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="시작하기, 온보딩 시작"
          accessibilityHint="프로필 설정을 시작합니다"
        >
          <Text style={styles.primaryButtonText}>시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleExistingUser}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="이미 계정이 있어요"
          accessibilityHint="기존 프로필로 계속합니다"
        >
          <Text style={styles.secondaryButtonText}>이미 계정이 있어요</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.bold,
    color: Palette.gray900,
    textAlign: 'center',
  },
  messageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: Palette.gray900,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: Spacing.md,
  },
  subheadline: {
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.regular,
    color: Palette.gray500,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.subtitle,
  },
  ctaSection: {
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
    marginBottom: Spacing.sm,
  },
  primaryButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
  },
  secondaryButtonText: {
    color: Palette.gray500,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
  },
});
