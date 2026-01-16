/**
 * 혜택 상세 컴포넌트
 * - 혜택 제목, 설명 표시 (AC1)
 * - 지원 금액/내용 상세 표시 (AC2)
 * - 자격 요건 목록 표시 (AC3)
 * - 신청 기간 표시 (AC4)
 * - 신청 방법 안내 표시 (AC5)
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
import { RequirementsList } from './RequirementsList';
import { ApplicationPeriod } from './ApplicationPeriod';
import { ApplicationMethod } from './ApplicationMethod';
import { formatCurrency } from '@/utils/format-currency';
import { getCategoryLabel, getCategoryIcon } from '@/utils/category';
import type { BenefitDetail as BenefitDetailType } from '@/types';

interface BenefitDetailProps {
  /** 혜택 상세 데이터 */
  benefit: BenefitDetailType;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 혜택 상세
 * 혜택의 전체 정보를 섹션별로 표시
 *
 * @example
 * ```tsx
 * <BenefitDetail
 *   benefit={benefitData}
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function BenefitDetail({
  benefit,
  colorScheme,
}: BenefitDetailProps) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 지원 내용 텍스트 생성
  const getSupportContent = (): string => {
    if (benefit.amount && typeof benefit.amount === 'number') {
      return formatCurrency(benefit.amount);
    }
    if (benefit.supportContent && typeof benefit.supportContent === 'string') {
      return benefit.supportContent;
    }
    return '상세 내용 확인';
  };

  return (
    <View style={styles.container}>
      {/* 헤더 섹션: 카테고리, 제목, 기관명 */}
      <View
        style={[styles.headerSection, { backgroundColor: surfaceColor }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`${benefit.title}, ${getCategoryLabel(benefit.category)} 카테고리, ${benefit.organization || '기관 정보 없음'}`}
      >
        {/* 카테고리 배지 */}
        <View style={styles.categoryBadge}>
          <IconSymbol
            name={getCategoryIcon(benefit.category)}
            size={14}
            color={Palette.primary}
          />
          <Text style={styles.categoryText}>
            {getCategoryLabel(benefit.category)}
          </Text>
        </View>

        {/* 제목 */}
        <Text style={[styles.title, { color: textColor }]}>
          {String(benefit.title || '')}
        </Text>

        {/* 기관명 */}
        {benefit.organization && typeof benefit.organization === 'string' && (
          <Text style={[styles.organization, { color: mutedTextColor }]}>
            {benefit.organization}
          </Text>
        )}
      </View>

      {/* 지원 금액/내용 섹션 */}
      <View
        style={[styles.amountSection, { backgroundColor: surfaceColor }]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`지원 내용: ${getSupportContent()}`}
      >
        <View style={styles.headerRow}>
          <IconSymbol
            name="banknote.fill"
            size={18}
            color={Palette.primary}
          />
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            지원 내용
          </Text>
        </View>
        <Text style={styles.amountText}>
          {getSupportContent()}
        </Text>
        {benefit.supportContent && typeof benefit.supportContent === 'string' && benefit.amount && (
          <Text style={[styles.supportDetail, { color: mutedTextColor }]}>
            {benefit.supportContent}
          </Text>
        )}
      </View>

      {/* 신청 기간 섹션 */}
      <ApplicationPeriod
        startDate={benefit.startDate}
        deadline={benefit.deadline}
        colorScheme={colorScheme}
      />

      {/* 자격 요건 섹션 */}
      <RequirementsList
        requirements={benefit.requirements}
        colorScheme={colorScheme}
      />

      {/* 신청 방법 섹션 */}
      <ApplicationMethod
        applicationMethod={benefit.applicationMethod}
        organization={benefit.organization}
        contactInfo={benefit.contactInfo}
        colorScheme={colorScheme}
      />

      {/* 상세 설명 섹션 */}
      {benefit.description && typeof benefit.description === 'string' && (
        <View
          style={[styles.descriptionSection, { backgroundColor: surfaceColor }]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`상세 설명: ${benefit.description}`}
        >
          <View style={styles.headerRow}>
            <IconSymbol
              name="info.circle.fill"
              size={18}
              color={Palette.primary}
            />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              상세 설명
            </Text>
          </View>
          <Text style={[styles.descriptionText, { color: textColor }]}>
            {benefit.description}
          </Text>
        </View>
      )}

      {/* 추가 정보 섹션 */}
      {benefit.additionalInfo && (
        <View
          style={[styles.additionalSection, { backgroundColor: surfaceColor }]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`추가 정보: ${benefit.additionalInfo}`}
        >
          <Text style={[styles.additionalTitle, { color: textColor }]}>
            기타 사항
          </Text>
          <Text style={[styles.additionalText, { color: mutedTextColor }]}>
            {benefit.additionalInfo}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  headerSection: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  categoryText: {
    ...Typography.captionBold,
    color: Palette.primary,
  },
  title: {
    ...Typography.heroTitle,
    marginTop: Spacing.xs,
  },
  organization: {
    ...Typography.label,
    marginTop: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.heading,
  },
  amountSection: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  amountText: {
    ...Typography.sectionTitle,
    color: Palette.secondary,
  },
  supportDetail: {
    ...Typography.body,
    marginTop: Spacing.xs,
  },
  descriptionSection: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  descriptionText: {
    ...Typography.body,
    lineHeight: 24,
  },
  additionalSection: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  additionalTitle: {
    ...Typography.labelBold,
  },
  additionalText: {
    ...Typography.body,
  },
});
