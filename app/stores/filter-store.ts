import { create } from 'zustand';

import type { BenefitFilter, BenefitCategory, BenefitSource, SortOption } from '@/types';

/**
 * 사용자 맞춤 필터 옵션
 */
interface PersonalFilterOptions {
  /** 마감된 정책 숨기기 (기본: true) */
  hideEnded: boolean;
  /** 나이 필터 적용 (기본: true) */
  filterByAge: boolean;
  /** 지역 필터 적용 (기본: true) */
  filterByRegion: boolean;
}

/**
 * 필터 스토어 상태 타입
 */
interface FilterState {
  /** 현재 필터 */
  filter: BenefitFilter;
  /** 사용자 맞춤 필터 옵션 */
  personalFilters: PersonalFilterOptions;
}

/**
 * 필터 스토어 액션 타입
 */
interface FilterActions {
  /** 카테고리 토글 (다중 선택용) */
  toggleCategory: (category: BenefitCategory) => void;
  /** 카테고리 목록 설정 */
  setCategories: (categories: BenefitCategory[]) => void;
  /** 출처 필터 설정 (null = 전체) */
  setSource: (source: BenefitSource | null) => void;
  /** 검색어 설정 */
  setSearchQuery: (query: string) => void;
  /** 정렬 옵션 설정 */
  setSortBy: (sortBy: SortOption) => void;
  /** 필터 초기화 */
  resetFilter: () => void;
  // === 사용자 맞춤 필터 액션 ===
  /** 마감 정책 숨기기 토글 */
  setHideEnded: (value: boolean) => void;
  /** 나이 필터 토글 */
  setFilterByAge: (value: boolean) => void;
  /** 지역 필터 토글 */
  setFilterByRegion: (value: boolean) => void;
  /** 모든 필터 해제 (전체 보기) */
  showAllBenefits: () => void;
  /** 기본 필터 적용 (맞춤 보기) */
  applyPersonalFilters: () => void;
}

type FilterStore = FilterState & FilterActions;

/**
 * 기본 필터
 */
const defaultFilter: BenefitFilter = {
  categories: [],
  source: null, // null = 전체 출처
  searchQuery: '',
  sortBy: 'recommended', // 기본값: 추천순
};

/**
 * 기본 맞춤 필터 (모든 맞춤 필터 ON)
 */
const defaultPersonalFilters: PersonalFilterOptions = {
  hideEnded: true, // 마감된 정책 숨기기
  filterByAge: true, // 나이 필터 적용
  filterByRegion: true, // 지역 필터 적용
};

/**
 * 활성화된 필터가 있는지 확인하는 셀렉터
 */
export const selectHasActiveFilters = (state: FilterStore): boolean =>
  state.filter.categories.length > 0 ||
  state.filter.source !== null ||
  state.filter.searchQuery !== '';

/**
 * 맞춤 필터가 모두 켜져 있는지 확인하는 셀렉터
 */
export const selectIsPersonalFilterActive = (state: FilterStore): boolean =>
  state.personalFilters.hideEnded ||
  state.personalFilters.filterByAge ||
  state.personalFilters.filterByRegion;

/**
 * 필터 스토어
 * - 혜택 필터 상태 관리 (FR7)
 * - 메모리 only (persist 없음 - 앱 재시작시 초기화)
 */
export const useFilterStore = create<FilterStore>()((set) => ({
  // State
  filter: defaultFilter,
  personalFilters: defaultPersonalFilters,

  // Actions
  toggleCategory: (category) =>
    set((state) => {
      const currentCategories = state.filter.categories;
      const isSelected = currentCategories.includes(category);
      const newCategories = isSelected
        ? currentCategories.filter((c) => c !== category)
        : [...currentCategories, category];
      return {
        filter: { ...state.filter, categories: newCategories },
      };
    }),

  setCategories: (categories) =>
    set((state) => ({
      filter: { ...state.filter, categories },
    })),

  setSource: (source) =>
    set((state) => ({
      filter: { ...state.filter, source },
    })),

  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filter: { ...state.filter, searchQuery },
    })),

  setSortBy: (sortBy) =>
    set((state) => ({
      filter: { ...state.filter, sortBy },
    })),

  resetFilter: () =>
    set({ filter: defaultFilter }),

  // === 사용자 맞춤 필터 액션 ===
  setHideEnded: (value) =>
    set((state) => ({
      personalFilters: { ...state.personalFilters, hideEnded: value },
    })),

  setFilterByAge: (value) =>
    set((state) => ({
      personalFilters: { ...state.personalFilters, filterByAge: value },
    })),

  setFilterByRegion: (value) =>
    set((state) => ({
      personalFilters: { ...state.personalFilters, filterByRegion: value },
    })),

  /** 모든 필터 해제 (전체 보기) - 1604개 모두 표시 */
  showAllBenefits: () =>
    set({
      personalFilters: {
        hideEnded: false,
        filterByAge: false,
        filterByRegion: false,
      },
    }),

  /** 기본 필터 적용 (맞춤 보기) - 기본 필터 ON */
  applyPersonalFilters: () =>
    set({ personalFilters: defaultPersonalFilters }),
}));
