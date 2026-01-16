/**
 * 혜택 상세 스켈레톤 UI
 * - 로딩 중 placeholder 표시
 * - 애니메이션 효과
 */
import { View, StyleSheet, Animated, type ColorSchemeName } from 'react-native';
import { useEffect, useRef } from 'react';
import { Palette, Spacing, Radius, getSemanticColor } from '@/design-system';

interface BenefitDetailSkeletonProps {
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 혜택 상세 스켈레톤
 * 상세 화면 로딩 중 placeholder로 사용
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBenefitDetail(id);
 *
 * if (isLoading) {
 *   return <BenefitDetailSkeleton />;
 * }
 * ```
 */
export function BenefitDetailSkeleton({
  colorScheme,
}: BenefitDetailSkeletonProps) {
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

  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  return (
    <View
      style={styles.container}
      accessibilityLabel="혜택 상세 정보 로딩 중"
      accessibilityRole="progressbar"
    >
      {/* Header Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Animated.View
          style={[styles.skeletonLine, styles.categoryLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.titleLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.organizationLine, { opacity }]}
        />
      </View>

      {/* Amount Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Animated.View
          style={[styles.skeletonLine, styles.sectionTitleLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.amountLine, { opacity }]}
        />
      </View>

      {/* Period Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Animated.View
          style={[styles.skeletonLine, styles.sectionTitleLine, { opacity }]}
        />
        <View style={styles.periodRow}>
          <Animated.View
            style={[styles.skeletonLine, styles.periodLine, { opacity }]}
          />
          <Animated.View
            style={[styles.skeletonLine, styles.badgeLine, { opacity }]}
          />
        </View>
      </View>

      {/* Requirements Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Animated.View
          style={[styles.skeletonLine, styles.sectionTitleLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.requirementLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.requirementLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.requirementLineShort, { opacity }]}
        />
      </View>

      {/* Method Section */}
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <Animated.View
          style={[styles.skeletonLine, styles.sectionTitleLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.methodLine, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.methodLineShort, { opacity }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  skeletonLine: {
    backgroundColor: Palette.border,
    borderRadius: Radius.sm,
  },
  categoryLine: {
    width: 60,
    height: 20,
  },
  titleLine: {
    width: '90%',
    height: 24,
  },
  organizationLine: {
    width: 120,
    height: 16,
  },
  sectionTitleLine: {
    width: 80,
    height: 18,
    marginBottom: Spacing.xs,
  },
  amountLine: {
    width: 160,
    height: 28,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodLine: {
    width: 180,
    height: 18,
  },
  badgeLine: {
    width: 50,
    height: 24,
  },
  requirementLine: {
    width: '100%',
    height: 18,
  },
  requirementLineShort: {
    width: '70%',
    height: 18,
  },
  methodLine: {
    width: '100%',
    height: 18,
  },
  methodLineShort: {
    width: '50%',
    height: 18,
  },
});
