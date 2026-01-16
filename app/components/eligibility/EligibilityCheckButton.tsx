/**
 * 자격 확인 버튼 컴포넌트
 * Story 4.4: Implement Eligibility Check UI
 * - 혜택 상세 화면에서 자격 검증 트리거
 * - 결과 상태에 따른 미리보기 배지 표시
 */
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { EligibilityStatus } from '@/types/models/eligibility';
import { ELIGIBILITY_STATUS_LABELS } from '@/types/models/eligibility';

/**
 * 상태별 배지 설정
 */
const STATUS_BADGE_CONFIG: Record<EligibilityStatus, {
  color: string;
  bgColor: string;
  icon: string;
}> = {
  eligible: {
    color: Palette.success,
    bgColor: 'rgba(34, 197, 94, 0.1)', // success with opacity
    icon: 'checkmark.circle.fill',
  },
  ineligible: {
    color: Palette.error,
    bgColor: 'rgba(239, 68, 68, 0.1)', // error with opacity
    icon: 'xmark.circle.fill',
  },
  partial: {
    color: Palette.warning,
    bgColor: 'rgba(245, 158, 11, 0.1)', // warning with opacity
    icon: 'exclamationmark.triangle.fill',
  },
  unknown: {
    color: Palette.textMuted,
    bgColor: 'rgba(156, 163, 175, 0.1)', // gray with opacity
    icon: 'questionmark.circle.fill',
  },
};

interface EligibilityCheckButtonProps {
  /** 자격 검증 상태 */
  status?: EligibilityStatus | null;
  /** 로딩 중 여부 */
  isLoading?: boolean;
  /** 프로필 설정 여부 */
  hasProfile: boolean;
  /** 매칭 점수 (0-100) */
  score?: number;
  /** 버튼 클릭 핸들러 */
  onPress: () => void;
  /** 프로필 설정 버튼 클릭 핸들러 */
  onSetupProfile?: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 자격 확인 버튼
 * 혜택 상세 화면에서 자격 검증을 실행하는 버튼
 *
 * @example
 * ```tsx
 * <EligibilityCheckButton
 *   status={result?.status}
 *   isLoading={isLoading}
 *   hasProfile={hasProfile}
 *   score={result?.score.total}
 *   onPress={() => setModalVisible(true)}
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function EligibilityCheckButton({
  status,
  isLoading = false,
  hasProfile,
  score,
  onPress,
  onSetupProfile,
  colorScheme,
}: EligibilityCheckButtonProps) {
  const surfaceColor = getSemanticColor(colorScheme, 'surface');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  // 프로필 미설정 상태
  if (!hasProfile) {
    return (
      <View style={[styles.container, { backgroundColor: surfaceColor }]}>
        <Pressable
          onPress={onSetupProfile}
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="프로필 설정 필요"
          accessibilityHint="자격 확인을 위해 프로필을 먼저 설정해주세요"
        >
          <IconSymbol
            name="person.crop.circle.badge.exclamationmark"
            size={20}
            color={Palette.primary}
          />
          <Text style={[styles.buttonText, { color: Palette.primary }]}>
            프로필 설정 후 자격 확인
          </Text>
        </Pressable>
        <Text style={[styles.helpText, { color: mutedTextColor }]}>
          자격 확인을 위해 프로필 정보가 필요합니다
        </Text>
      </View>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: surfaceColor }]}>
        <View style={[styles.button, styles.buttonLoading]}>
          <ActivityIndicator size="small" color={Palette.textOnPrimary} />
          <Text style={styles.buttonTextPrimary}>자격 확인 중...</Text>
        </View>
      </View>
    );
  }

  // 결과가 있는 경우 - 배지와 함께 표시
  const hasResult = status !== undefined && status !== null;
  const badgeConfig = hasResult ? STATUS_BADGE_CONFIG[status] : null;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          hasResult
            ? `자격 확인 결과: ${ELIGIBILITY_STATUS_LABELS[status]}`
            : '자격 확인하기'
        }
        accessibilityHint="자격 검증 결과를 확인합니다"
      >
        <IconSymbol
          name="checkmark.shield"
          size={20}
          color={Palette.textOnPrimary}
        />
        <Text style={styles.buttonTextPrimary}>
          {hasResult ? '자격 확인 결과 보기' : '자격 확인하기'}
        </Text>
      </Pressable>

      {/* 결과 배지 */}
      {hasResult && badgeConfig && (
        <View
          style={[styles.badge, { backgroundColor: badgeConfig.bgColor }]}
          accessibilityLabel={`${ELIGIBILITY_STATUS_LABELS[status]} ${score !== undefined ? `(${score}점)` : ''}`}
        >
          <IconSymbol
            name={badgeConfig.icon as any}
            size={16}
            color={badgeConfig.color}
          />
          <Text style={[styles.badgeText, { color: badgeConfig.color }]}>
            {ELIGIBILITY_STATUS_LABELS[status]}
          </Text>
          {score !== undefined && (
            <Text style={[styles.badgeScore, { color: badgeConfig.color }]}>
              {score}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    minHeight: 48,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    ...Typography.labelBold,
  },
  buttonTextPrimary: {
    ...Typography.labelBold,
    color: Palette.textOnPrimary,
  },
  helpText: {
    ...Typography.caption,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    alignSelf: 'center',
  },
  badgeText: {
    ...Typography.labelBold,
    fontSize: 13,
  },
  badgeScore: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
