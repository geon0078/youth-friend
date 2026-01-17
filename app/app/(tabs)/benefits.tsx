/**
 * 혜택 목록 화면
 * - 스마트 정렬 (추천순, 마감순, 금액순)
 * - 스마트 그룹핑 (긴급 마감, 고액 혜택)
 * - 검색 기능 (Story 3.6)
 * - 카테고리 필터 (다중 선택)
 * - Pull-to-refresh
 * - 스켈레톤 로딩
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBenefits } from '@/hooks/use-benefits';
import { useTotalBenefits } from '@/hooks/use-total-benefits';
import { useDebounce, useRecentSearches } from '@/hooks';
import { useFilterStore } from '@/stores/filter-store';
import { useUserStore } from '@/stores/user-store';
import {
  BenefitCard,
  BenefitCardSkeleton,
  TotalBenefitCard,
  TotalBenefitCardSkeleton,
  EmptyBenefitsList,
  CategoryFilter,
  SortTabs,
  BenefitSection,
} from '@/components/benefits';
import {
  SearchBar,
  RecentSearchesList,
  EmptySearchResults,
} from '@/components/search';
import {
  sortBenefits,
  getUrgentBenefits,
  getHighValueBenefits,
  type ScoredBenefit,
} from '@/utils/benefit-scoring';
import { Palette, Spacing, Typography, getSemanticColor } from '@/design-system';
import type { Benefit, SortOption } from '@/types';

/** 디바운스 지연 시간 (ms) */
const DEBOUNCE_DELAY = 300;
const SKELETON_COUNT = 5;

/**
 * 혜택 목록 화면
 */
export default function BenefitsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const profile = useUserStore((state) => state.profile);
  const userRegion = profile?.region;

  // 사용자 지역을 필터에 포함하여 혜택 조회
  const { data, isLoading, isRefetching, refresh } = useBenefits({ region: userRegion });
  const {
    data: totalData,
    isLoading: isTotalLoading,
  } = useTotalBenefits();
  const { filter, setSearchQuery, setSortBy } = useFilterStore();
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();

  // 검색 상태 관리
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(localSearchQuery, DEBOUNCE_DELAY);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 디바운스된 검색어를 store에 반영
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  // 블러 타임아웃 cleanup
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // 클라이언트 사이드 필터링
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let items = data.items;

    // 카테고리 필터링 (다중 선택)
    if (filter.categories.length > 0) {
      items = items.filter((item) =>
        filter.categories.includes(item.category)
      );
    }

    // 검색어 필터링
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.organization?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [data?.items, filter.categories, filter.searchQuery]);

  // 스코어링 및 정렬 적용
  const sortedBenefits = useMemo(() => {
    return sortBenefits(filteredItems, filter.sortBy);
  }, [filteredItems, filter.sortBy]);

  // 스마트 그룹핑: 긴급 마감 (이번 주 내)
  const urgentBenefits = useMemo(() => {
    if (filter.sortBy !== 'recommended') return [];
    return getUrgentBenefits(sortedBenefits);
  }, [sortedBenefits, filter.sortBy]);

  // 스마트 그룹핑: 고액 혜택 (100만원 이상, 상위 5개)
  const highValueBenefits = useMemo(() => {
    if (filter.sortBy !== 'recommended') return [];
    // 긴급 섹션에 이미 있는 것은 제외
    const urgentIds = new Set(urgentBenefits.map((b) => b.id));
    return getHighValueBenefits(sortedBenefits).filter((b) => !urgentIds.has(b.id));
  }, [sortedBenefits, urgentBenefits, filter.sortBy]);

  // 전체 목록 (그룹핑된 것 제외)
  const remainingBenefits = useMemo(() => {
    if (filter.sortBy !== 'recommended') return sortedBenefits;
    const groupedIds = new Set([
      ...urgentBenefits.map((b) => b.id),
      ...highValueBenefits.map((b) => b.id),
    ]);
    return sortedBenefits.filter((b) => !groupedIds.has(b.id));
  }, [sortedBenefits, urgentBenefits, highValueBenefits, filter.sortBy]);

  // 검색 활성 여부
  const isSearchActive = filter.searchQuery.trim().length > 0;

  const handleBenefitPress = useCallback(
    (benefitId: string) => {
      router.push(`/benefit/${benefitId}` as Href);
    },
    [router]
  );

  const handleTotalBenefitPress = useCallback(() => {
    // 스크롤 상단으로 이동하거나 필터 초기화
  }, []);

  const handleSortChange = useCallback(
    (sortBy: SortOption) => {
      setSortBy(sortBy);
    },
    [setSortBy]
  );

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => setIsSearchFocused(false), 200);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (localSearchQuery.trim()) {
      addSearch(localSearchQuery.trim());
    }
    setIsSearchFocused(false);
  }, [localSearchQuery, addSearch]);

  const handleRecentSearchSelect = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      setSearchQuery(query);
      addSearch(query);
      setIsSearchFocused(false);
    },
    [setSearchQuery, addSearch]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    setSearchQuery('');
  }, [setSearchQuery]);

  const renderSkeleton = useCallback(
    (_: unknown, index: number) => (
      <BenefitCardSkeleton key={index} colorScheme={colorScheme} />
    ),
    [colorScheme]
  );

  // 로딩 상태: 스켈레톤 표시
  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: getSemanticColor(colorScheme, 'background') },
        ]}
        edges={['top']}
      >
        <View style={styles.listContent}>
          <View style={styles.headerContainer}>
            <SearchBar
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onSubmit={handleSearchSubmit}
              colorScheme={colorScheme}
            />
            <TotalBenefitCardSkeleton colorScheme={colorScheme} />
            <SortTabs
              selectedSort={filter.sortBy}
              onSortChange={handleSortChange}
              colorScheme={colorScheme}
            />
            <CategoryFilter colorScheme={colorScheme} />
          </View>
          <View style={styles.skeletonList}>
            {Array.from({ length: SKELETON_COUNT }).map(renderSkeleton)}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 빈 상태
  if (sortedBenefits.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: getSemanticColor(colorScheme, 'background') },
        ]}
        edges={['top']}
      >
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <SearchBar
                value={localSearchQuery}
                onChangeText={setLocalSearchQuery}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmit={handleSearchSubmit}
                colorScheme={colorScheme}
              />
              {isSearchFocused && !localSearchQuery.trim() && (
                <RecentSearchesList
                  searches={searches}
                  onSelect={handleRecentSearchSelect}
                  onRemove={removeSearch}
                  onClearAll={clearAll}
                  colorScheme={colorScheme}
                />
              )}
              {totalData && (
                <TotalBenefitCard
                  data={totalData}
                  onPress={handleTotalBenefitPress}
                  colorScheme={colorScheme}
                />
              )}
              <SortTabs
                selectedSort={filter.sortBy}
                onSortChange={handleSortChange}
                colorScheme={colorScheme}
              />
              <CategoryFilter colorScheme={colorScheme} />
            </View>
          }
          ListEmptyComponent={
            isSearchActive ? (
              <EmptySearchResults
                searchQuery={filter.searchQuery}
                onClear={handleClearSearch}
                colorScheme={colorScheme}
              />
            ) : (
              <EmptyBenefitsList colorScheme={colorScheme} />
            )
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refresh}
              tintColor={Palette.primary}
              colors={[Palette.primary]}
            />
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </SafeAreaView>
    );
  }

  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: getSemanticColor(colorScheme, 'background') },
      ]}
      edges={['top']}
    >
      <FlatList
        data={['header', 'content'] as const}
        renderItem={({ item }) => {
          if (item === 'header') {
            return (
              <View style={styles.headerContainer}>
                <SearchBar
                  value={localSearchQuery}
                  onChangeText={setLocalSearchQuery}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onSubmit={handleSearchSubmit}
                  colorScheme={colorScheme}
                />
                {isSearchFocused && !localSearchQuery.trim() && (
                  <RecentSearchesList
                    searches={searches}
                    onSelect={handleRecentSearchSelect}
                    onRemove={removeSearch}
                    onClearAll={clearAll}
                    colorScheme={colorScheme}
                  />
                )}
                {isTotalLoading ? (
                  <TotalBenefitCardSkeleton colorScheme={colorScheme} />
                ) : totalData ? (
                  <TotalBenefitCard
                    data={totalData}
                    onPress={handleTotalBenefitPress}
                    colorScheme={colorScheme}
                  />
                ) : null}
                <SortTabs
                  selectedSort={filter.sortBy}
                  onSortChange={handleSortChange}
                  colorScheme={colorScheme}
                />
                <CategoryFilter colorScheme={colorScheme} />
              </View>
            );
          }

          // content section - 스마트 그룹핑 + 전체 목록
          return (
            <View style={styles.contentContainer}>
              {/* 추천순일 때만 스마트 그룹핑 표시 */}
              {filter.sortBy === 'recommended' && (
                <>
                  <BenefitSection
                    title="이번 주 마감"
                    icon="🔥"
                    benefits={urgentBenefits}
                    onBenefitPress={handleBenefitPress}
                    colorScheme={colorScheme}
                    searchQuery={filter.searchQuery}
                  />
                  <BenefitSection
                    title="놓치면 아쉬운 혜택"
                    icon="💰"
                    benefits={highValueBenefits}
                    onBenefitPress={handleBenefitPress}
                    colorScheme={colorScheme}
                    searchQuery={filter.searchQuery}
                  />
                </>
              )}

              {/* 전체 목록 헤더 */}
              <View style={styles.allBenefitsHeader}>
                <Text style={[styles.allBenefitsTitle, { color: textColor }]}>
                  {filter.sortBy === 'recommended' ? '전체 혜택' :
                   filter.sortBy === 'deadline' ? '마감일순' : '금액순'}
                </Text>
                <Text style={[styles.allBenefitsCount, { color: mutedColor }]}>
                  ({filter.sortBy === 'recommended' ? remainingBenefits.length : sortedBenefits.length}개)
                </Text>
              </View>

              {/* 전체 목록 */}
              <View style={styles.allBenefitsList}>
                {(filter.sortBy === 'recommended' ? remainingBenefits : sortedBenefits).map(
                  (benefit) => (
                    <View key={benefit.id} style={styles.cardWrapper}>
                      <BenefitCard
                        benefit={benefit}
                        onPress={() => handleBenefitPress(benefit.id)}
                        colorScheme={colorScheme}
                        searchQuery={filter.searchQuery}
                      />
                    </View>
                  )
                )}
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refresh}
            tintColor={Palette.primary}
            colors={[Palette.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  headerContainer: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  contentContainer: {
    gap: Spacing.md,
  },
  skeletonList: {
    gap: Spacing.md,
  },
  allBenefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  allBenefitsTitle: {
    ...Typography.heading,
    fontSize: 16,
  },
  allBenefitsCount: {
    fontSize: 14,
  },
  allBenefitsList: {
    gap: Spacing.md,
  },
  cardWrapper: {
    // Individual card wrapper for spacing
  },
});
