/**
 * 신청 기간 컴포넌트
 * - 시작일-종료일 표시
 * - D-day 계산 및 배지 표시
 * - 마감 임박 시각적 강조
 */
import { View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DeadlineBadge } from './DeadlineBadge';
import {
  getDaysUntilDeadline,
  formatDeadlineDate,
  getDeadlineDescription,
} from '@/utils/deadline';

interface ApplicationPeriodProps {
  /** 시작일 (ISO 8601) */
  startDate?: string;
  /** 종료일/마감일 (ISO 8601) */
  deadline?: string;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 신청 기간
 * 혜택 신청 가능 기간과 마감일 정보를 표시
 *
 * @example
 * ```tsx
 * <ApplicationPeriod
 *   startDate="2026-01-01"
 *   deadline="2026-03-31"
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function ApplicationPeriod({
  startDate,
  deadline,
  colorScheme,
}: ApplicationPeriodProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const daysRemaining = getDaysUntilDeadline(deadline);
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;

  // 기간 텍스트 생성
  const getPeriodText = (): string => {
    const start = startDate ? formatDeadlineDate(startDate) : '상시';
    const end = deadline ? formatDeadlineDate(deadline) : '상시';
    return `${start} ~ ${end}`;
  };

  const accessibilityLabel = deadline
    ? `신청 기간: ${getPeriodText()}. ${getDeadlineDescription(deadline)}`
    : `신청 기간: ${getPeriodText()}`;

  // 긴급도에 따른 접근성 힌트
  const getAccessibilityHint = (): string | undefined => {
    if (isExpired) {
      return '이 혜택은 신청 기간이 종료되었습니다';
    }
    if (isUrgent) {
      return '마감이 임박했습니다. 빠른 신청을 권장합니다';
    }
    return undefined;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: surfaceColor }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={getAccessibilityHint()}
    >
      <View style={styles.headerRow}>
        <IconSymbol
          name="calendar"
          size={18}
          color={Palette.primary}
        />
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          신청 기간
        </Text>
      </View>

      <View style={styles.periodContent}>
        <View style={styles.periodRow}>
          <Text
            style={[
              styles.periodText,
              { color: isExpired ? mutedTextColor : textColor },
            ]}
          >
            {getPeriodText()}
          </Text>
          {!isExpired && daysRemaining !== null && (
            <DeadlineBadge deadline={deadline} />
          )}
        </View>

        {isExpired && (
          <View style={styles.expiredContainer}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={14}
              color={Palette.error}
            />
            <Text style={styles.expiredText}>
              신청이 마감되었습니다
            </Text>
          </View>
        )}

        {isUrgent && !isExpired && (
          <Text style={styles.urgentHint}>
            마감이 임박했습니다. 서둘러 신청하세요!
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.heading,
  },
  periodContent: {
    gap: Spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    ...Typography.body,
    flex: 1,
  },
  expiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  expiredText: {
    ...Typography.labelBold,
    color: Palette.error,
  },
  urgentHint: {
    ...Typography.caption,
    color: Palette.accent,
    fontStyle: 'italic',
  },
});
