/**
 * 신청 상태 배지 컴포넌트
 * Story 5.7: Implement Application Status Tracking
 *
 * 신청 상태를 시각적으로 표시
 */
import { View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Radius, Typography } from '@/design-system';
import type { ApplicationStatus } from '@/types/models/application';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/types/models/application';

interface ApplicationStatusBadgeProps {
  /** 신청 상태 */
  status: ApplicationStatus;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 상태별 아이콘 매핑
 */
const STATUS_ICONS: Record<ApplicationStatus, string> = {
  preparing: 'doc.text',
  applied: 'paperplane.fill',
  approved: 'checkmark.circle.fill',
  rejected: 'xmark.circle.fill',
  withdrawn: 'arrow.uturn.left.circle',
};

/**
 * 신청 상태 배지
 *
 * @example
 * ```tsx
 * <ApplicationStatusBadge status="preparing" />
 * <ApplicationStatusBadge status="approved" showIcon />
 * ```
 */
export function ApplicationStatusBadge({
  status,
  compact = false,
  showIcon = true,
  colorScheme,
  testID = 'application-status-badge',
}: ApplicationStatusBadgeProps) {
  const color = APPLICATION_STATUS_COLORS[status];
  const label = APPLICATION_STATUS_LABELS[status];
  const icon = STATUS_ICONS[status];

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: `${color}20` },
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`신청 상태: ${label}`}
    >
      {showIcon && (
        <IconSymbol
          name={icon as any}
          size={compact ? 12 : 14}
          color={color}
        />
      )}
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  containerCompact: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 10,
  },
});
