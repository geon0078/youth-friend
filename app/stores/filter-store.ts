import { create } from 'zustand';

import type { BenefitFilter, BenefitCategory, SortOption } from '@/types';

/**
 * 필터 스토어 상태 타입
 */
interface FilterState {
  /** 현재 필터 */
  filter: BenefitFilter;
}

/**
 * 필터 스토어 액션 타입
 */
interface FilterActions {
  /** 카테고리 토글 (다중 선택용) */
  toggleCategory: (category: BenefitCategory) => void;
  /** 카테고리 목록 설정 */
  setCategories: (categories: BenefitCategory[]) => void;
  /** 검색어 설정 */
  setSearchQuery: (query: string) => void;
  /** 정렬 옵션 설정 */
  setSortBy: (sortBy: SortOption) => void;
  /** 필터 초기화 */
  resetFilter: () => void;
}

type FilterStore = FilterState & FilterActions;

/**
 * 기본 필터
 */
const defaultFilter: BenefitFilter = {
  categories: [],
  searchQuery: '',
  sortBy: 'deadline',
};

/**
 * 활성화된 필터가 있는지 확인하는 셀렉터
 */
export const selectHasActiveFilters = (state: FilterStore): boolean =>
  state.filter.categories.length > 0 || state.filter.searchQuery !== '';

/**
 * 필터 스토어
 * - 혜택 필터 상태 관리 (FR7)
 * - 메모리 only (persist 없음 - 앱 재시작시 초기화)
 */
export const useFilterStore = create<FilterStore>()((set) => ({
  // State
  filter: defaultFilter,

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
}));
