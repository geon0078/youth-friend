/**
 * 나이 타임라인 아이템 컴포넌트
 * - 개별 나이 표시
 * - 혜택 개수 배지
 * - Story 3.9: Implement Age Timeline View
 */
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import { Palette, Spacing, Typography, getSemanticColor } from '@/design-system';

interface AgeTimelineItemProps {
  /** 나이 */
  age: number;
  /** 혜택 개수 */
  benefitCount: number;
  /** 현재 나이 여부 */
  isCurrent: boolean;
  /** 과거 나이 여부 */
  isPast: boolean;
  /** 선택된 나이 여부 */
  isSelected: boolean;
  /** 선택 핸들러 */
  onSelect: (age: number) => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 나이 타임라인 아이템
 * 타임라인의 개별 나이 노드
 *
 * @example
 * ```tsx
 * <AgeTimelineItem
 *   age={25}
 *   benefitCount={5}
 *   isCurrent={true}
 *   isPast={false}
 *   isSelected={false}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export function AgeTimelineItem({
  age,
  benefitCount,
  isCurrent,
  isPast,
  isSelected,
  onSelect,
  colorScheme,
}: AgeTimelineItemProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  const handlePress = () => {
    onSelect(age);
  };

  const getAccessibilityLabel = () => {
    let label = `${age}세`;
    if (benefitCount > 0) {
      label += `, 혜택 ${benefitCount}개`;
    } else {
      label += ', 혜택 없음';
    }
    if (isCurrent) {
      label += ', 현재 나이';
    }
    return label;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isPast && styles.containerPast,
        pressed && styles.containerPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={isCurrent ? '현재 회원님의 나이입니다' : undefined}
      accessibilityState={{ selected: isSelected }}
    >
      {/* 나이 원형 */}
      <View
        style={[
          styles.ageCircle,
          isCurrent && styles.ageCircleCurrent,
          isSelected && styles.ageCircleSelected,
          isPast && styles.ageCirclePast,
        ]}
      >
        <Text
          style={[
            styles.ageText,
            { color: isCurrent || isSelected ? Palette.textOnPrimary : textColor },
            isPast && { color: mutedTextColor },
          ]}
        >
          {age}
        </Text>
      </View>

      {/* 혜택 개수 배지 */}
      {benefitCount > 0 && (
        <View style={[styles.badge, isPast && styles.badgePast]}>
          <Text style={styles.badgeText}>{benefitCount}</Text>
        </View>
      )}

      {/* 현재 나이 인디케이터 */}
      {isCurrent && <View style={styles.currentIndicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    minWidth: 56,
  },
  containerPast: {
    opacity: 0.4,
  },
  containerPressed: {
    opacity: 0.7,
  },
  ageCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 2,
    borderColor: Palette.border,
  },
  ageCircleCurrent: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  ageCircleSelected: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  ageCirclePast: {
    backgroundColor: Palette.border,
    borderColor: Palette.border,
  },
  ageText: {
    ...Typography.labelBold,
  },
  badge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgePast: {
    backgroundColor: Palette.textMuted,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Palette.textOnPrimary,
  },
  currentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
    marginTop: Spacing.xs,
  },
});
