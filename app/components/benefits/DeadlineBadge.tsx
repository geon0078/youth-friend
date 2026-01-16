/**
 * 마감일 배지 컴포넌트
 * - D-Day 표시
 * - 긴급도에 따른 색상 변화
 */
import { View, Text, StyleSheet } from 'react-native';
import { Palette, Spacing, Radius, Typography } from '@/design-system';
import { getDaysUntilDeadline, getDeadlineText } from '@/utils/deadline';

interface DeadlineBadgeProps {
  /** ISO 8601 형식 마감일 */
  deadline?: string;
}

/**
 * 마감일 배지
 * - D-3 이하: 빨간색 (긴급)
 * - D-7 이하: 주황색 (임박)
 *
 * @example
 * <DeadlineBadge deadline="2026-01-23" />
 */
export function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const days = getDaysUntilDeadline(deadline);

  // 마감일 정보가 없거나 이미 지난 경우 표시 안 함
  if (days === null || days < 0) {
    return null;
  }

  const isVeryUrgent = days <= 3;
  const isUrgent = days <= 7;
  const text = getDeadlineText(deadline);

  // 긴급도에 따른 접근성 힌트
  const getAccessibilityHint = (): string => {
    if (isVeryUrgent) {
      return '마감이 매우 임박했습니다. 즉시 신청을 권장합니다';
    }
    if (isUrgent) {
      return '마감이 임박했습니다. 빠른 신청을 권장합니다';
    }
    return '신청 마감일까지 여유가 있습니다';
  };

  return (
    <View
      style={[styles.badge, isVeryUrgent ? styles.urgentBadge : styles.soonBadge]}
      accessibilityLabel={`마감 ${text}`}
      accessibilityHint={getAccessibilityHint()}
    >
      <Text
        style={[
          styles.badgeText,
          isVeryUrgent ? styles.urgentBadgeText : styles.soonBadgeText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  soonBadge: {
    backgroundColor: Palette.warningBackground,
  },
  urgentBadge: {
    backgroundColor: Palette.errorBackground,
  },
  badgeText: {
    ...Typography.captionBold,
    fontWeight: '700',
  },
  soonBadgeText: {
    color: Palette.accent,
  },
  urgentBadgeText: {
    color: Palette.error,
  },
});
