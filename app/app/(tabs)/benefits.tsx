/**
 * 혜택 목록 화면
 * - 혜택 카드 목록 (FlatList)
 * - 검색 기능 (Story 3.6)
 * - 카테고리 필터 (다중 선택)
 * - Pull-to-refresh
 * - 스켈레톤 로딩
 * - 빈 상태 처리
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBenefits } from '@/hooks/use-benefits';
import { useTotalBenefits } from '@/hooks/use-total-benefits';
import { useDebounce, useRecentSearches } from '@/hooks';
import { useFilterStore } from '@/stores/filter-store';
import {
  BenefitCard,
  BenefitCardSkeleton,
  TotalBenefitCard,
  TotalBenefitCardSkeleton,
  EmptyBenefitsList,
  CategoryFilter,
} from '@/components/benefits';
import {
  SearchBar,
  RecentSearchesList,
  EmptySearchResults,
} from '@/components/search';
import { Palette, Spacing, getSemanticColor } from '@/design-system';
import type { Benefit } from '@/types';

/** 디바운스 지연 시간 (ms) */
const DEBOUNCE_DELAY = 300;
const SKELETON_COUNT = 5;
const CARD_HEIGHT = 140;

/**
 * 혜택 목록 화면
 */
export default function BenefitsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { data, isLoading, isRefetching, refresh } = useBenefits();
  const {
    data: totalData,
    isLoading: isTotalLoading,
  } = useTotalBenefits();
  const { filter, setSearchQuery } = useFilterStore();
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

  // 클라이언트 사이드 필터링 (NFR3: 1초 이내 응답)
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

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    // 약간의 딜레이 후 포커스 해제 (최근 검색어 클릭 가능하도록)
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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Benefit>) => (
      <BenefitCard
        benefit={item}
        onPress={() => handleBenefitPress(item.id)}
        colorScheme={colorScheme}
        searchQuery={filter.searchQuery}
      />
    ),
    [colorScheme, handleBenefitPress, filter.searchQuery]
  );

  const renderSkeleton = useCallback(
    (_: unknown, index: number) => (
      <BenefitCardSkeleton key={index} colorScheme={colorScheme} />
    ),
    [colorScheme]
  );

  const renderHeader = useCallback(() => {
    const searchBar = (
      <SearchBar
        value={localSearchQuery}
        onChangeText={setLocalSearchQuery}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        onSubmit={handleSearchSubmit}
        colorScheme={colorScheme}
      />
    );

    const recentSearches = isSearchFocused && !localSearchQuery.trim() && (
      <RecentSearchesList
        searches={searches}
        onSelect={handleRecentSearchSelect}
        onRemove={removeSearch}
        onClearAll={clearAll}
        colorScheme={colorScheme}
      />
    );

    if (isTotalLoading) {
      return (
        <View style={styles.headerContainer}>
          {searchBar}
          {recentSearches}
          <TotalBenefitCardSkeleton colorScheme={colorScheme} />
          <CategoryFilter colorScheme={colorScheme} />
        </View>
      );
    }

    return (
      <View style={styles.headerContainer}>
        {searchBar}
        {recentSearches}
        {totalData && (
          <TotalBenefitCard
            data={totalData}
            onPress={handleTotalBenefitPress}
            colorScheme={colorScheme}
          />
        )}
        <CategoryFilter colorScheme={colorScheme} />
      </View>
    );
  }, [
    colorScheme,
    isTotalLoading,
    totalData,
    handleTotalBenefitPress,
    localSearchQuery,
    handleSearchFocus,
    handleSearchBlur,
    handleSearchSubmit,
    isSearchFocused,
    searches,
    handleRecentSearchSelect,
    removeSearch,
    clearAll,
  ]);

  const renderEmpty = useCallback(() => {
    // 검색 중일 때는 검색 결과 없음 표시
    if (isSearchActive) {
      return (
        <EmptySearchResults
          searchQuery={filter.searchQuery}
          onClear={handleClearSearch}
          colorScheme={colorScheme}
        />
      );
    }
    return <EmptyBenefitsList colorScheme={colorScheme} />;
  }, [colorScheme, isSearchActive, filter.searchQuery, handleClearSearch]);

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  const keyExtractor = useCallback((item: Benefit) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    []
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
          {renderHeader()}
          {Array.from({ length: SKELETON_COUNT }).map(renderSkeleton)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: getSemanticColor(colorScheme, 'background') },
      ]}
      edges={['top']}
    >
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refresh}
            tintColor={Palette.primary}
            colors={[Palette.primary]}
          />
        }
        // 키보드 설정
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // 성능 최적화
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        getItemLayout={getItemLayout}
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
  separator: {
    height: Spacing.md,
  },
});
