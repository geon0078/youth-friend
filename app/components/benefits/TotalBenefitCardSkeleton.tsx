/**
 * 총 혜택 금액 카드 스켈레톤 UI
 * - 로딩 중 placeholder 표시
 * - 애니메이션 효과
 */
import { View, StyleSheet, Animated, type ColorSchemeName } from 'react-native';
import { useEffect, useRef } from 'react';
import { Palette, Spacing, Radius, Shadows, getSemanticColor } from '@/design-system';

interface TotalBenefitCardSkeletonProps {
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 총 혜택 카드 스켈레톤
 * 로딩 중 placeholder로 사용
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useTotalBenefits();
 *
 * if (isLoading) {
 *   return <TotalBenefitCardSkeleton />;
 * }
 * ```
 */
export function TotalBenefitCardSkeleton({
  colorScheme,
}: TotalBenefitCardSkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getSemanticColor(colorScheme, 'surface') },
      ]}
      accessibilityLabel="혜택 정보 로딩 중"
      accessibilityRole="progressbar"
    >
      <View style={styles.content}>
        <Animated.View
          style={[styles.skeletonLine, styles.tagLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.amountLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.countLine, { opacity }]}
        />
      </View>
      <Animated.View style={[styles.iconSkeleton, { opacity }]} />
    </View>
  );
}

const ICON_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.soft,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  skeletonLine: {
    backgroundColor: Palette.border,
    borderRadius: Radius.sm,
  },
  tagLine: {
    width: 120,
    height: 16,
  },
  amountLine: {
    width: 180,
    height: 36,
  },
  countLine: {
    width: 80,
    height: 18,
  },
  iconSkeleton: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: Palette.border,
  },
});
