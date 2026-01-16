/**
 * 미충족 요건 아이템 컴포넌트
 * Story 4.5: Display Unmet Requirements
 * - 개별 미충족 요건을 표시
 * - 현재 값/필요 값 비교
 * - 미래 자격 획득 정보 표시
 */
import {
  View,
  Text,
  Pressable,
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
import type { UnmetRequirement, RuleFieldType } from '@/types/models/eligibility';
import { FIELD_TYPE_LABELS } from '@/types/models/eligibility';

/**
 * 필드별 아이콘 매핑
 */
const FIELD_ICONS: Record<RuleFieldType, string> = {
  age: 'calendar',
  income: 'wonsign.circle',
  region: 'location',
  employment: 'briefcase',
  education: 'graduationcap',
  major: 'book',
  residence: 'house',
  custom: 'questionmark.circle',
};

interface UnmetRequirementItemProps {
  /** 미충족 요건 데이터 */
  requirement: UnmetRequirement;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 프로필 수정 핸들러 */
  onEditProfile?: () => void;
}

/**
 * 미충족 요건 아이템
 * 개별 미충족 요건을 카드 형태로 표시
 *
 * @example
 * ```tsx
 * <UnmetRequirementItem
 *   requirement={unmetRequirement}
 *   colorScheme={colorScheme}
 *   onEditProfile={handleEditProfile}
 * />
 * ```
 */
export function UnmetRequirementItem({
  requirement,
  colorScheme,
  onEditProfile,
}: UnmetRequirementItemProps) {
  const surfaceColor = getSemanticColor(colorScheme, 'surface');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  const icon = FIELD_ICONS[requirement.field] || 'questionmark.circle';
  const fieldLabel = FIELD_TYPE_LABELS[requirement.field];
  const isRequired = requirement.severity === 'required';
  const severityColor = isRequired ? Palette.error : Palette.warning;

  const hasFutureEligibility = !!requirement.futureEligibility;
  const canEdit = requirement.canResolveByProfile && onEditProfile;

  return (
    <View
      style={[styles.container, { backgroundColor: surfaceColor }]}
      accessibilityRole="text"
      accessibilityLabel={`${fieldLabel} 조건 미충족. ${requirement.description}`}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${severityColor}15` }]}>
          <IconSymbol
            name={icon as any}
            size={18}
            color={severityColor}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.fieldLabel, { color: textColor }]}>
            {fieldLabel} 조건
          </Text>
          <Text style={[styles.severityBadge, { color: severityColor }]}>
            {isRequired ? '필수' : '권장'}
          </Text>
        </View>
      </View>

      {/* 설명 */}
      <Text style={[styles.description, { color: textColor }]}>
        {requirement.description}
      </Text>

      {/* 현재 값 / 필요 값 비교 */}
      <View style={styles.comparison}>
        {requirement.currentValue && (
          <View style={styles.valueRow}>
            <Text style={[styles.valueLabel, { color: mutedTextColor }]}>
              현재
            </Text>
            <Text style={[styles.valueText, { color: textColor }]}>
              {requirement.currentValue}
            </Text>
          </View>
        )}
        <View style={styles.valueRow}>
          <Text style={[styles.valueLabel, { color: mutedTextColor }]}>
            필요
          </Text>
          <Text style={[styles.valueText, { color: severityColor }]}>
            {requirement.requiredValue}
          </Text>
        </View>
      </View>

      {/* 미래 자격 획득 정보 */}
      {hasFutureEligibility && (
        <View style={[styles.futureEligibility, { backgroundColor: `${Palette.secondary}15` }]}>
          <IconSymbol
            name="clock"
            size={14}
            color={Palette.secondary}
          />
          <Text style={[styles.futureText, { color: Palette.secondary }]}>
            {requirement.futureEligibility!.message}
          </Text>
        </View>
      )}

      {/* 프로필 수정 버튼 */}
      {canEdit && (
        <Pressable
          onPress={onEditProfile}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.editButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="프로필 수정하기"
          accessibilityHint="프로필을 수정하여 이 조건을 충족할 수 있습니다"
        >
          <IconSymbol
            name="pencil"
            size={14}
            color={Palette.primary}
          />
          <Text style={styles.editButtonText}>프로필 수정</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    ...Typography.labelBold,
  },
  severityBadge: {
    ...Typography.caption,
    fontWeight: '600',
  },
  description: {
    ...Typography.body,
    marginLeft: 32 + Spacing.sm,
  },
  comparison: {
    marginLeft: 32 + Spacing.sm,
    gap: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valueLabel: {
    ...Typography.caption,
    width: 32,
  },
  valueText: {
    ...Typography.label,
    flex: 1,
  },
  futureEligibility: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    marginLeft: 32 + Spacing.sm,
    alignSelf: 'flex-start',
  },
  futureText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 32 + Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Palette.primary,
    borderRadius: Radius.sm,
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  editButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Palette.primary,
  },
});
