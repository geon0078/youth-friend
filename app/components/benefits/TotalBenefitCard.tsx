/**
 * 총 혜택 금액 카드 컴포넌트
 * - 예상 총 혜택 금액 표시
 * - 혜택 개수 표시
 * - 손실 회피 프레이밍 문구
 * - 탭 시 혜택 목록으로 이동
 */
import { Pressable, View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Shadows,
  getSemanticColor,
} from '@/design-system';
import type { TotalBenefitsData } from '@/hooks';

interface TotalBenefitCardProps {
  /** 총 혜택 데이터 */
  data: TotalBenefitsData;
  /** 탭 시 콜백 */
  onPress?: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 총 혜택 금액 카드
 *
 * @example
 * ```tsx
 * <TotalBenefitCard
 *   data={{
 *     totalAmount: 12000000,
 *     formattedAmount: '약 1,200만원',
 *     benefitCount: 12,
 *     formattedCount: '12개 혜택',
 *   }}
 *   onPress={() => router.push('/benefits')}
 * />
 * ```
 */
export function TotalBenefitCard({
  data,
  onPress,
  colorScheme,
}: TotalBenefitCardProps) {
  const accessibilityLabel = `총 ${data.formattedAmount} 혜택 받기 가능. ${data.formattedCount}. 탭하여 목록 보기`;

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
      accessibilityHint="탭하면 혜택 목록으로 이동합니다"
    >
      <View style={styles.content}>
        <Text style={styles.lossAversionText}>
          놓치면 아까운 혜택
        </Text>
        <Text style={styles.amount}>
          {data.formattedAmount}
        </Text>
        <Text style={styles.count}>
          {data.formattedCount}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <IconSymbol name="chevron.right" size={20} color={Palette.textOnPrimary} />
      </View>
    </Pressable>
  );
}

const ICON_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.soft,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  lossAversionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.accent,
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: Palette.primary,
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 16,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
