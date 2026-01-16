/**
 * 최근 검색어 목록 컴포넌트
 * - 최근 검색어 표시 (AC6)
 * - 검색어 선택/삭제 기능
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
  Typography,
  getSemanticColor,
} from '@/design-system';

interface RecentSearchesListProps {
  /** 최근 검색어 목록 */
  searches: string[];
  /** 검색어 선택 핸들러 */
  onSelect: (query: string) => void;
  /** 검색어 삭제 핸들러 */
  onRemove: (query: string) => void;
  /** 전체 삭제 핸들러 */
  onClearAll: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 최근 검색어 목록
 *
 * @example
 * ```tsx
 * <RecentSearchesList
 *   searches={['취업', '주거', '청년']}
 *   onSelect={handleSelect}
 *   onRemove={handleRemove}
 *   onClearAll={handleClearAll}
 * />
 * ```
 */
export function RecentSearchesList({
  searches,
  onSelect,
  onRemove,
  onClearAll,
  colorScheme,
}: RecentSearchesListProps) {
  const backgroundColor = getSemanticColor(colorScheme, 'surface');

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>최근 검색어</Text>
        <Pressable
          onPress={onClearAll}
          hitSlop={8}
          accessibilityLabel="최근 검색어 전체 삭제"
          accessibilityRole="button"
        >
          <Text style={styles.clearAllText}>전체 삭제</Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {searches.map((search) => (
          <View key={search} style={styles.item}>
            <Pressable
              style={styles.searchButton}
              onPress={() => onSelect(search)}
              accessibilityLabel={`${search} 검색`}
              accessibilityRole="button"
            >
              <IconSymbol
                name="clock"
                size={14}
                color={Palette.textMuted}
              />
              <Text style={styles.searchText} numberOfLines={1}>
                {search}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onRemove(search)}
              hitSlop={8}
              accessibilityLabel={`${search} 삭제`}
              accessibilityRole="button"
            >
              <IconSymbol
                name="xmark"
                size={14}
                color={Palette.textMuted}
              />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.captionBold,
    color: Palette.textMuted,
  },
  clearAllText: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  list: {
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchText: {
    ...Typography.body,
    color: Palette.textPrimary,
    flex: 1,
  },
});
