/**
 * 혜택 목록 빈 상태 컴포넌트
 * - 혜택이 없을 때 안내 메시지 표시
 */
import { View, Text, StyleSheet, type ColorSchemeName } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Spacing, Typography, getSemanticColor } from '@/design-system';

interface EmptyBenefitsListProps {
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
  /** 커스텀 메시지 */
  message?: string;
}

/**
 * 혜택 목록 빈 상태
 *
 * @example
 * ```tsx
 * <FlatList
 *   data={benefits}
 *   ListEmptyComponent={<EmptyBenefitsList />}
 * />
 * ```
 */
export function EmptyBenefitsList({
  colorScheme,
  message = '조건에 맞는 혜택이 없습니다',
}: EmptyBenefitsListProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getSemanticColor(colorScheme, 'background') },
      ]}
      accessibilityLabel={message}
    >
      <View style={styles.iconContainer}>
        <IconSymbol
          name="tray"
          size={48}
          color={Palette.textMuted}
        />
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>
        프로필을 업데이트하거나{'\n'}다른 필터를 선택해보세요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 3,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  message: {
    ...Typography.heading,
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subMessage: {
    ...Typography.label,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
