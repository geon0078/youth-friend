/**
 * 자격 상태 배지 컴포넌트
 * Story 4.7: Implement Eligibility Badge on Benefit Cards
 *
 * 혜택 카드에서 자격 충족 여부를 한눈에 확인할 수 있는 배지
 */
import { Pressable, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import { Palette, Spacing, Radius, Typography, getSemanticColor } from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { EligibilityStatus } from '@/types/models/eligibility';

/**
 * 배지 표시 모드
 * - 'all': 모든 상태 표시
 * - 'positive': eligible, partial만 표시
 * - 'eligible-only': eligible만 표시
 */
export type BadgeDisplayMode = 'all' | 'positive' | 'eligible-only';

/**
 * 상태별 배지 설정
 */
interface BadgeConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
  visible: boolean;
}

const BADGE_CONFIGS: Record<EligibilityStatus, BadgeConfig> = {
  eligible: {
    label: '자격 충족',
    backgroundColor: Palette.successBackground,
    textColor: Palette.success,
    icon: 'checkmark.circle.fill',
    visible: true,
  },
  partial: {
    label: '확인 필요',
    backgroundColor: Palette.warningBackground,
    textColor: Palette.warning,
    icon: 'exclamationmark.triangle.fill',
    visible: true,
  },
  unknown: {
    label: '확인 필요',
    backgroundColor: Palette.warningBackground,
    textColor: Palette.warning,
    icon: 'questionmark.circle.fill',
    visible: true,
  },
  ineligible: {
    label: '자격 미충족',
    backgroundColor: Palette.border,
    textColor: Palette.textMuted,
    icon: 'xmark.circle.fill',
    visible: true,
  },
};

interface EligibilityBadgeProps {
  /** 자격 상태 */
  status: EligibilityStatus;
  /** 탭 핸들러 (상세 정보 표시용) */
  onPress?: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 배지 표시 모드 */
  displayMode?: BadgeDisplayMode;
  /** 작은 사이즈 여부 */
  compact?: boolean;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 자격 상태 배지
 *
 * 혜택 카드에 표시되어 자격 충족 여부를 시각적으로 표현
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <EligibilityBadge status="eligible" />
 *
 * // 탭 가능한 배지
 * <EligibilityBadge
 *   status="partial"
 *   onPress={() => showEligibilityModal()}
 * />
 *
 * // eligible만 표시
 * <EligibilityBadge
 *   status={status}
 *   displayMode="eligible-only"
 * />
 * ```
 */
export function EligibilityBadge({
  status,
  onPress,
  colorScheme,
  displayMode = 'positive',
  compact = false,
  testID = 'eligibility-badge',
}: EligibilityBadgeProps) {
  const config = BADGE_CONFIGS[status];

  // 표시 여부 결정
  const shouldDisplay = (() => {
    switch (displayMode) {
      case 'all':
        return true;
      case 'positive':
        return status === 'eligible' || status === 'partial' || status === 'unknown';
      case 'eligible-only':
        return status === 'eligible';
      default:
        return true;
    }
  })();

  if (!shouldDisplay) {
    return null;
  }

  const Container = onPress ? Pressable : Pressable;
  const isInteractive = !!onPress;

  return (
    <Container
      onPress={onPress}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: config.backgroundColor },
        isInteractive && pressed && styles.pressed,
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole={isInteractive ? 'button' : 'text'}
      accessibilityLabel={`자격 상태: ${config.label}${isInteractive ? ', 탭하여 상세 확인' : ''}`}
      accessibilityState={{ expanded: false }}
    >
      <IconSymbol
        name={config.icon as any}
        size={compact ? 12 : 14}
        color={config.textColor}
      />
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          { color: config.textColor },
        ]}
      >
        {config.label}
      </Text>
    </Container>
  );
}

/**
 * 자격 상태에 따른 배지 색상 반환 (외부에서 사용 가능)
 */
export function getEligibilityBadgeColor(status: EligibilityStatus): string {
  return BADGE_CONFIGS[status].textColor;
}

/**
 * 자격 상태에 따른 배지 레이블 반환 (외부에서 사용 가능)
 */
export function getEligibilityBadgeLabel(status: EligibilityStatus): string {
  return BADGE_CONFIGS[status].label;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  containerCompact: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...Typography.captionBold,
    fontSize: 12,
  },
  labelCompact: {
    fontSize: 10,
  },
});
