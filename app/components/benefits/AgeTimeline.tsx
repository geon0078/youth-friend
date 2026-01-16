/**
 * 나이 타임라인 컴포넌트
 * - 수평 스크롤 타임라인
 * - 현재 나이 자동 스크롤
 * - Story 3.9: Implement Age Timeline View
 */
import { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  type ColorSchemeName,
} from 'react-native';
import {
  Palette,
  Spacing,
  getSemanticColor,
} from '@/design-system';
import { AgeTimelineItem } from './AgeTimelineItem';
import { YOUTH_AGE_RANGE, type AgeBenefitCountMap } from '@/utils/age-filter';

/**
 * 타임라인 아이템 크기 상수
 * AgeTimelineItem의 minWidth(56) + paddingHorizontal(Spacing.sm * 2)와 일치해야 함
 */
const TIMELINE_ITEM_WIDTH = 56 + Spacing.sm * 2;

interface AgeTimelineProps {
  /** 현재 나이 */
  currentAge: number;
  /** 선택된 나이 */
  selectedAge: number;
  /** 나이 선택 핸들러 */
  onAgeSelect: (age: number) => void;
  /** 나이별 혜택 개수 */
  benefitCounts: AgeBenefitCountMap;
  /** 컬러 스킴 */
  colorScheme?: ColorSchemeName;
}

/**
 * 나이 타임라인
 * 19세부터 34세까지 수평 스크롤 타임라인
 *
 * @example
 * ```tsx
 * <AgeTimeline
 *   currentAge={25}
 *   selectedAge={25}
 *   onAgeSelect={handleAgeSelect}
 *   benefitCounts={counts}
 * />
 * ```
 */
export function AgeTimeline({
  currentAge,
  selectedAge,
  onAgeSelect,
  benefitCounts,
  colorScheme,
}: AgeTimelineProps) {
  const flatListRef = useRef<FlatList>(null);
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  // 나이 목록 생성 (19~34세)
  const ages = Array.from(
    { length: YOUTH_AGE_RANGE.MAX - YOUTH_AGE_RANGE.MIN + 1 },
    (_, i) => YOUTH_AGE_RANGE.MIN + i
  );

  // 초기 로드 시 현재 나이로 스크롤
  useEffect(() => {
    const index = Math.max(0, currentAge - YOUTH_AGE_RANGE.MIN);
    if (index >= 0 && index < ages.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // 중앙에 위치
        });
      }, 100);
    }
  }, [currentAge, ages.length]);

  const renderItem = ({ item: age }: { item: number }) => (
    <AgeTimelineItem
      age={age}
      benefitCount={benefitCounts[age] || 0}
      isCurrent={age === currentAge}
      isPast={age < currentAge}
      isSelected={age === selectedAge}
      onSelect={onAgeSelect}
      colorScheme={colorScheme}
    />
  );

  const keyExtractor = (item: number) => item.toString();

  const getItemLayout = (_: unknown, index: number) => ({
    length: TIMELINE_ITEM_WIDTH,
    offset: TIMELINE_ITEM_WIDTH * index,
    index,
  });

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    // 실패 시 가장 가까운 인덱스로 스크롤
    flatListRef.current?.scrollToIndex({
      index: info.highestMeasuredFrameIndex,
      animated: true,
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: surfaceColor }]}
      accessible={true}
      accessibilityLabel="나이별 혜택 타임라인"
      accessibilityHint="좌우로 스크롤하여 각 나이의 혜택을 확인하세요"
    >
      {/* 타임라인 라인 */}
      <View style={styles.timelineLine} />

      <FlatList
        ref={flatListRef}
        data={ages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: '50%',
    left: Spacing.lg,
    right: Spacing.lg,
    height: 2,
    backgroundColor: Palette.border,
    marginTop: -1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
});
