/**
 * 혜택 카드 스켈레톤 UI
 * - 로딩 중 placeholder 표시
 * - 애니메이션 효과
 */
import { View, StyleSheet, Animated, type ColorSchemeName } from 'react-native';
import { useEffect, useRef } from 'react';
import { Palette, Spacing, Radius, Shadows, getSemanticColor } from '@/design-system';

interface BenefitCardSkeletonProps {
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 혜택 카드 스켈레톤
 * 로딩 중 placeholder로 사용
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBenefits();
 *
 * if (isLoading) {
 *   return <BenefitCardSkeleton />;
 * }
 * ```
 */
export function BenefitCardSkeleton({
  colorScheme,
}: BenefitCardSkeletonProps) {
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
      {/* Header skeleton */}
      <View style={styles.header}>
        <Animated.View
          style={[styles.skeletonLine, styles.categoryLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.badgeLine, { opacity }]}
        />
      </View>

      {/* Title skeleton */}
      <Animated.View
        style={[styles.skeletonLine, styles.titleLine1, { opacity }]}
      />
      <Animated.View
        style={[styles.skeletonLine, styles.titleLine2, { opacity }]}
      />

      {/* Footer skeleton */}
      <View style={styles.footer}>
        <Animated.View
          style={[styles.skeletonLine, styles.amountLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.orgLine, { opacity }]}
        />
      </View>
    </View>
  );
}

// Skeleton dimensions
const CARD_MIN_HEIGHT = 120;
const SKELETON_HEIGHTS = {
  category: 16,
  badge: 20,
  title: 18,
  amount: 16,
  organization: 14,
} as const;

const SKELETON_WIDTHS = {
  category: 60,
  badge: 40,
  titlePrimary: '90%' as const,
  titleSecondary: '60%' as const,
  amount: 100,
  organization: 80,
} as const;

const styles = StyleSheet.create({
  container: {
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  skeletonLine: {
    backgroundColor: Palette.border,
    borderRadius: Radius.sm,
  },
  categoryLine: {
    width: SKELETON_WIDTHS.category,
    height: SKELETON_HEIGHTS.category,
  },
  badgeLine: {
    width: SKELETON_WIDTHS.badge,
    height: SKELETON_HEIGHTS.badge,
  },
  titleLine1: {
    width: SKELETON_WIDTHS.titlePrimary,
    height: SKELETON_HEIGHTS.title,
    marginBottom: Spacing.xs,
  },
  titleLine2: {
    width: SKELETON_WIDTHS.titleSecondary,
    height: SKELETON_HEIGHTS.title,
    marginBottom: Spacing.sm,
  },
  amountLine: {
    width: SKELETON_WIDTHS.amount,
    height: SKELETON_HEIGHTS.amount,
  },
  orgLine: {
    width: SKELETON_WIDTHS.organization,
    height: SKELETON_HEIGHTS.organization,
  },
});
