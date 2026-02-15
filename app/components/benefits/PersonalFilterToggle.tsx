/**
 * 맞춤 필터 토글 컴포넌트
 * - "나에게 맞는 혜택만" 토글 ON/OFF
 * - 현재 필터 상태 표시
 */
import { View, Text, Pressable, StyleSheet, type ColorSchemeName } from 'react-native';
import { Spacing, Typography, Palette, getSemanticColor } from '@/design-system';
import { useFilterStore, selectIsPersonalFilterActive } from '@/stores/filter-store';

interface PersonalFilterToggleProps {
  colorScheme: ColorSchemeName;
  /** 총 혜택 개수 (필터 적용 후) */
  filteredCount?: number;
  /** 전체 혜택 개수 (필터 적용 전, 추정치) */
  totalCount?: number;
}

/**
 * 맞춤 필터 토글 버튼
 */
export function PersonalFilterToggle({
  colorScheme,
  filteredCount,
  totalCount = 1604,
}: PersonalFilterToggleProps) {
  const isPersonalActive = useFilterStore(selectIsPersonalFilterActive);
  const { showAllBenefits, applyPersonalFilters } = useFilterStore();

  const handleToggle = () => {
    if (isPersonalActive) {
      showAllBenefits();
    } else {
      applyPersonalFilters();
    }
  };

  const backgroundColor = getSemanticColor(colorScheme, 'surface');
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.toggleButton,
          {
            backgroundColor: isPersonalActive ? Palette.primary : backgroundColor,
            borderColor: isPersonalActive ? Palette.primary : Palette.gray200,
          },
        ]}
        onPress={handleToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: isPersonalActive }}
        accessibilityLabel={
          isPersonalActive
            ? '나에게 맞는 혜택만 보기 켜짐. 탭하여 전체 보기'
            : '전체 혜택 보기. 탭하여 맞춤 필터 적용'
        }
      >
        <Text
          style={[
            styles.toggleText,
            { color: isPersonalActive ? Palette.white : textColor },
          ]}
        >
          {isPersonalActive ? '나에게 맞는 혜택만' : '전체 혜택 보기'}
        </Text>
      </Pressable>

      {filteredCount !== undefined && (
        <Text style={[styles.countText, { color: mutedColor }]}>
          {isPersonalActive
            ? `${filteredCount.toLocaleString()}개 (전체 ${totalCount.toLocaleString()}개 중)`
            : `${filteredCount.toLocaleString()}개`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleText: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
  },
});
