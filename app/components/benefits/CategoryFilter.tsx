/**
 * 카테고리 필터 컴포넌트
 * - 수평 스크롤 가능한 필터 칩 UI
 * - 다중 선택 지원 (AC2)
 * - 접근성 지원 (AC)
 */
import {
  View,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFilterStore } from '@/stores/filter-store';
import { getCategoryLabel, getCategoryIcon, type CategoryIconName } from '@/utils/category';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import type { BenefitCategory } from '@/types';

/** 모든 카테고리 목록 */
const ALL_CATEGORIES: BenefitCategory[] = [
  'employment',
  'housing',
  'education',
  'welfare',
  'finance',
  'culture',
];

interface CategoryFilterProps {
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

interface FilterChipProps {
  /** 칩 라벨 */
  label: string;
  /** 아이콘 이름 (선택사항) */
  icon?: CategoryIconName;
  /** 선택 여부 */
  isSelected: boolean;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 필터 칩 컴포넌트
 */
function FilterChip({
  label,
  icon,
  isSelected,
  onPress,
  colorScheme,
}: FilterChipProps) {
  const chipBackgroundColor = isSelected
    ? Palette.primary
    : getSemanticColor(colorScheme, 'surface');
  const chipTextColor = isSelected
    ? Palette.textOnPrimary
    : Palette.textPrimary;
  const chipBorderColor = isSelected
    ? Palette.primary
    : getSemanticColor(colorScheme, 'border');

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: chipBackgroundColor,
          borderColor: chipBorderColor,
        },
      ]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${label} 필터${isSelected ? ', 선택됨' : ''}`}
    >
      {icon && (
        <IconSymbol
          name={icon}
          size={14}
          color={chipTextColor}
        />
      )}
      <Text
        style={[
          styles.chipText,
          { color: chipTextColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * 카테고리 필터
 *
 * @example
 * ```tsx
 * <CategoryFilter colorScheme={colorScheme} />
 * ```
 */
export function CategoryFilter({ colorScheme }: CategoryFilterProps) {
  const { filter, toggleCategory, resetFilter } = useFilterStore();
  const selectedCategories = filter.categories;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "전체" 칩 (AC5) */}
        <FilterChip
          label="전체"
          isSelected={selectedCategories.length === 0}
          onPress={resetFilter}
          colorScheme={colorScheme}
        />

        {/* 카테고리 칩들 (AC1) */}
        {ALL_CATEGORIES.map((category) => (
          <FilterChip
            key={category}
            label={getCategoryLabel(category)}
            icon={getCategoryIcon(category)}
            isSelected={selectedCategories.includes(category)}
            onPress={() => toggleCategory(category)}
            colorScheme={colorScheme}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  chipText: {
    ...Typography.labelBold,
  },
});
