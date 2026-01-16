/**
 * 검색 결과 없음 컴포넌트
 * - 검색어에 대한 결과가 없을 때 표시 (AC5)
 */
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';

interface EmptySearchResultsProps {
  /** 검색어 */
  searchQuery: string;
  /** 검색어 초기화 핸들러 */
  onClear: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 검색 결과 없음 상태
 *
 * @example
 * ```tsx
 * <EmptySearchResults
 *   searchQuery="없는혜택"
 *   onClear={handleClear}
 * />
 * ```
 */
export function EmptySearchResults({
  searchQuery,
  onClear,
  colorScheme,
}: EmptySearchResultsProps) {
  const backgroundColor = getSemanticColor(colorScheme, 'surface');

  return (
    <View style={styles.container}>
      <IconSymbol
        name="magnifyingglass"
        size={48}
        color={Palette.textMuted}
      />
      <Text style={styles.title}>검색 결과 없음</Text>
      <Text style={styles.message}>
        &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다
      </Text>
      <Text style={styles.hint}>
        다른 검색어를 입력하거나{'\n'}카테고리 필터를 조정해 보세요
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor }]}
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel="검색어 지우기"
      >
        <Text style={styles.buttonText}>검색어 지우기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.sectionTitle,
    color: Palette.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Palette.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  hint: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  buttonText: {
    ...Typography.labelBold,
    color: Palette.primary,
  },
});
