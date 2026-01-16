/**
 * 자격 요건 목록 컴포넌트
 * - 요건 항목별 체크 아이콘 + 텍스트
 * - 접근성 지원
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

interface RequirementsListProps {
  /** 자격 요건 배열 */
  requirements: string[];
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 자격 요건 목록
 * 혜택 신청에 필요한 자격 요건을 체크리스트 형태로 표시
 *
 * @example
 * ```tsx
 * <RequirementsList
 *   requirements={['만 19~34세 청년', '서울시 거주자', '소득 기준 충족']}
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function RequirementsList({
  requirements,
  colorScheme,
}: RequirementsListProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  if (!requirements || requirements.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: surfaceColor }]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel="자격 요건 정보가 없습니다"
      >
        <View style={styles.headerRow}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={18}
            color={Palette.primary}
          />
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            자격 요건
          </Text>
        </View>
        <Text style={[styles.emptyText, { color: mutedTextColor }]}>
          자격 요건 정보가 없습니다. 상세 페이지에서 확인해주세요.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: surfaceColor }]}
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={`자격 요건 ${requirements.length}개`}
    >
      <View style={styles.headerRow}>
        <IconSymbol
          name="checkmark.circle.fill"
          size={18}
          color={Palette.primary}
        />
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          자격 요건
        </Text>
      </View>

      <View style={styles.requirementsList}>
        {requirements.map((requirement, index) => (
          <View
            key={index}
            style={styles.requirementItem}
            accessible={true}
            accessibilityLabel={`요건 ${index + 1}: ${requirement}`}
          >
            <View style={styles.bulletPoint} />
            <Text style={[styles.requirementText, { color: textColor }]}>
              {requirement}
            </Text>
          </View>
        ))}
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
  requirementsList: {
    gap: Spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    marginTop: 7,
  },
  requirementText: {
    ...Typography.body,
    flex: 1,
  },
  emptyText: {
    ...Typography.body,
    paddingLeft: Spacing.xs,
  },
});
