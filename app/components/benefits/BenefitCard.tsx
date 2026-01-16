/**
 * 혜택 카드 컴포넌트
 * - 제목, 카테고리, 지원금액, 마감일 표시
 * - 마감 임박 배지
 * - 검색어 하이라이팅 (Story 3.6)
 * - 탭 시 상세 화면 이동
 */
import { Pressable, View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import {
  Palette,
  Spacing,
  Radius,
  Shadows,
  Typography,
  getSemanticColor,
} from '@/design-system';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DeadlineBadge } from './DeadlineBadge';
import { HighlightedText } from '@/components/search';
import { formatCurrency } from '@/utils/format-currency';
import { getCategoryLabel, getCategoryIcon } from '@/utils/category';
import { isDeadlineSoon, getDeadlineDescription } from '@/utils/deadline';
import type { Benefit } from '@/types';

interface BenefitCardProps {
  /** 혜택 데이터 */
  benefit: Benefit;
  /** 탭 시 콜백 */
  onPress?: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 검색어 (하이라이팅용) */
  searchQuery?: string;
}

/**
 * 혜택 카드
 *
 * @example
 * ```tsx
 * <BenefitCard
 *   benefit={benefit}
 *   onPress={() => router.push(`/benefit/${benefit.id}`)}
 *   colorScheme={colorScheme}
 * />
 * ```
 */
export function BenefitCard({
  benefit,
  onPress,
  colorScheme,
  searchQuery = '',
}: BenefitCardProps) {
  const isUrgent = isDeadlineSoon(benefit.deadline, 7);
  const amountText = benefit.amount
    ? formatCurrency(benefit.amount)
    : benefit.supportContent || '상세 내용 확인';
  const deadlineDesc = getDeadlineDescription(benefit.deadline);

  const accessibilityLabel = `${benefit.title}. ${getCategoryLabel(benefit.category)}. ${amountText}. ${deadlineDesc}. 탭하여 상세 보기`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: getSemanticColor(colorScheme, 'surface') },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="탭하면 혜택 상세 화면으로 이동합니다"
    >
      {/* Header: Category + Deadline Badge */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <IconSymbol
            name={getCategoryIcon(benefit.category)}
            size={14}
            color={Palette.primary}
          />
          <Text style={styles.categoryText}>
            {getCategoryLabel(benefit.category)}
          </Text>
        </View>
        {isUrgent && <DeadlineBadge deadline={benefit.deadline} />}
      </View>

      {/* Title */}
      {searchQuery ? (
        <HighlightedText
          text={benefit.title}
          query={searchQuery}
          style={styles.title}
          numberOfLines={2}
        />
      ) : (
        <Text style={styles.title} numberOfLines={2}>
          {benefit.title}
        </Text>
      )}

      {/* Footer: Amount + Organization */}
      <View style={styles.footer}>
        <Text style={styles.amount} numberOfLines={1}>
          {amountText}
        </Text>
        {benefit.organization && (
          <Text style={styles.organization} numberOfLines={1}>
            {benefit.organization}
          </Text>
        )}
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <IconSymbol name="chevron.right" size={16} color={Palette.textMuted} />
      </View>
    </Pressable>
  );
}

const CARD_MIN_HEIGHT = 120;

const styles = StyleSheet.create({
  container: {
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.soft,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryText: {
    ...Typography.captionBold,
    color: Palette.primary,
  },
  title: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  amount: {
    ...Typography.bodyMedium,
    color: Palette.secondary,
    flex: 1,
  },
  organization: {
    ...Typography.caption,
    color: Palette.textMuted,
    marginLeft: Spacing.sm,
    maxWidth: '40%',
  },
  arrowContainer: {
    position: 'absolute',
    right: Spacing.lg,
    top: '50%',
    marginTop: -8,
  },
});
