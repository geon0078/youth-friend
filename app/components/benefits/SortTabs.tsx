/**
 * 정렬 탭 컴포넌트
 * - 추천순, 마감순, 금액순 선택
 */
import { View, Text, Pressable, StyleSheet, type ColorSchemeName } from 'react-native';
import { Palette, Spacing, Radius, getSemanticColor } from '@/design-system';
import type { SortOption } from '@/types';

interface SortTabsProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  colorScheme: ColorSchemeName;
}

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: 'recommended', label: '추천순', icon: '⭐' },
  { key: 'deadline', label: '마감순', icon: '🔥' },
  { key: 'amount', label: '금액순', icon: '💰' },
];

export function SortTabs({ selectedSort, onSortChange, colorScheme }: SortTabsProps) {
  const backgroundColor = getSemanticColor(colorScheme, 'surface');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {SORT_OPTIONS.map((option) => {
        const isSelected = selectedSort === option.key;
        return (
          <Pressable
            key={option.key}
            style={[
              styles.tab,
              isSelected && styles.tabSelected,
              isSelected && { backgroundColor: Palette.primary },
            ]}
            onPress={() => onSortChange(option.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${option.label}로 정렬`}
          >
            <Text style={styles.tabIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                { color: isSelected ? '#FFFFFF' : mutedColor },
                isSelected && styles.tabLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  tabSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelSelected: {
    fontWeight: '700',
  },
});
