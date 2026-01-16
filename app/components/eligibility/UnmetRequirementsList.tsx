/**
 * 미충족 요건 목록 컴포넌트
 * Story 4.5: Display Unmet Requirements
 * - 미충족 요건 목록 렌더링
 * - 빈 목록일 때 적절한 메시지 표시
 * - 프로필 수정 네비게이션 연동
 */
import {
  View,
  Text,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import {
  Palette,
  Spacing,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UnmetRequirementItem } from './UnmetRequirementItem';
import type { UnmetRequirement } from '@/types/models/eligibility';

interface UnmetRequirementsListProps {
  /** 미충족 요건 목록 */
  requirements: UnmetRequirement[];
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 프로필 수정 핸들러 */
  onEditProfile?: () => void;
}

/**
 * 미충족 요건 목록
 * 미충족 요건들을 목록 형태로 표시하고,
 * 빈 목록일 경우 적절한 메시지를 표시합니다.
 *
 * @example
 * ```tsx
 * <UnmetRequirementsList
 *   requirements={eligibilityResult.unmetRequirements}
 *   colorScheme={colorScheme}
 *   onEditProfile={handleEditProfile}
 * />
 * ```
 */
export function UnmetRequirementsList({
  requirements,
  colorScheme,
  onEditProfile,
}: UnmetRequirementsListProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  // 빈 목록일 경우
  if (requirements.length === 0) {
    return (
      <View
        style={styles.emptyContainer}
        accessibilityRole="text"
        accessibilityLabel="모든 조건을 충족합니다"
      >
        <View style={[styles.emptyIconContainer, { backgroundColor: `${Palette.success}15` }]}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={24}
            color={Palette.success}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: textColor }]}>
          모든 조건 충족
        </Text>
        <Text style={[styles.emptyDescription, { color: mutedTextColor }]}>
          이 혜택의 모든 자격 요건을 충족하였습니다.
        </Text>
      </View>
    );
  }

  // 필수 요건과 권장 요건 분리
  const requiredRequirements = requirements.filter(r => r.severity === 'required');
  const recommendedRequirements = requirements.filter(r => r.severity === 'recommended');

  return (
    <View
      style={styles.container}
      accessibilityRole="list"
      accessibilityLabel={`미충족 요건 ${requirements.length}개`}
    >
      {/* 섹션 헤더 */}
      <View style={styles.header}>
        <IconSymbol
          name="exclamationmark.triangle.fill"
          size={18}
          color={Palette.warning}
        />
        <Text style={[styles.headerTitle, { color: textColor }]}>
          미충족 요건
        </Text>
        <Text style={[styles.headerCount, { color: mutedTextColor }]}>
          {requirements.length}개
        </Text>
      </View>

      {/* 필수 요건 */}
      {requiredRequirements.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Palette.error }]}>
            필수 조건 미충족
          </Text>
          <View style={styles.itemsContainer}>
            {requiredRequirements.map((requirement) => (
              <UnmetRequirementItem
                key={requirement.ruleId}
                requirement={requirement}
                colorScheme={colorScheme}
                onEditProfile={onEditProfile}
              />
            ))}
          </View>
        </View>
      )}

      {/* 권장 요건 */}
      {recommendedRequirements.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Palette.warning }]}>
            권장 조건 미충족
          </Text>
          <View style={styles.itemsContainer}>
            {recommendedRequirements.map((requirement) => (
              <UnmetRequirementItem
                key={requirement.ruleId}
                requirement={requirement}
                colorScheme={colorScheme}
                onEditProfile={onEditProfile}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    ...Typography.labelBold,
    flex: 1,
  },
  headerCount: {
    ...Typography.caption,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  itemsContainer: {
    gap: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.labelBold,
  },
  emptyDescription: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
