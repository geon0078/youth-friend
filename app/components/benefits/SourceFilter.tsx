/**
 * 출처 필터 컴포넌트
 * - 혜택 데이터 출처별 필터링 (온통청년, 고용24, 보조금24)
 * - 단일 선택 지원
 * - 접근성 지원
 */
import {
  View,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import { useFilterStore } from '@/stores/filter-store';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import type { BenefitSource } from '@/types';

/** 출처 정보 */
interface SourceInfo {
  key: BenefitSource;
  label: string;
  icon: string;
}

/** 모든 출처 목록 */
const ALL_SOURCES: SourceInfo[] = [
  { key: 'youth-policy', label: '온통청년', icon: '🏛️' },
  { key: 'employment24', label: '고용24', icon: '💼' },
  { key: 'gov24', label: '보조금24', icon: '🏢' },
];

interface SourceFilterProps {
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

interface SourceChipProps {
  /** 출처 정보 */
  source: SourceInfo | null;
  /** 라벨 (전체일 경우) */
  label?: string;
  /** 선택 여부 */
  isSelected: boolean;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 출처 칩 컴포넌트
 */
function SourceChip({
  source,
  label,
  isSelected,
  onPress,
  colorScheme,
}: SourceChipProps) {
  const chipBackgroundColor = isSelected
    ? Palette.primary
    : getSemanticColor(colorScheme, 'surface');
  const chipTextColor = isSelected
    ? Palette.textOnPrimary
    : Palette.textPrimary;
  const chipBorderColor = isSelected
    ? Palette.primary
    : getSemanticColor(colorScheme, 'border');

  const displayLabel = label ?? source?.label ?? '전체';
  const displayIcon = source?.icon;

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
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${displayLabel} 출처 필터${isSelected ? ', 선택됨' : ''}`}
    >
      {displayIcon && (
        <Text style={styles.chipIcon}>{displayIcon}</Text>
      )}
      <Text
        style={[
          styles.chipText,
          { color: chipTextColor },
        ]}
      >
        {displayLabel}
      </Text>
    </Pressable>
  );
}

/**
 * 출처 필터
 *
 * @example
 * ```tsx
 * <SourceFilter colorScheme={colorScheme} />
 * ```
 */
export function SourceFilter({ colorScheme }: SourceFilterProps) {
  const { filter, setSource } = useFilterStore();
  const selectedSource = filter.source;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: getSemanticColor(colorScheme, 'mutedText') }]}>
        출처
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "전체" 칩 */}
        <SourceChip
          source={null}
          label="전체"
          isSelected={selectedSource === null}
          onPress={() => setSource(null)}
          colorScheme={colorScheme}
        />

        {/* 출처 칩들 */}
        {ALL_SOURCES.map((source) => (
          <SourceChip
            key={source.key}
            source={source}
            isSelected={selectedSource === source.key}
            onPress={() => setSource(source.key)}
            colorScheme={colorScheme}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
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
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    ...Typography.labelBold,
  },
});
