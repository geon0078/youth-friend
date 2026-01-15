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
  /** 카테고리 필터 설정 (FR7) */
  setCategory: (category: BenefitCategory | null) => void;
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
  category: null,
  searchQuery: '',
  sortBy: 'deadline',
};

/**
 * 필터 스토어
 * - 혜택 필터 상태 관리 (FR7)
 * - 메모리 only (persist 없음 - 앱 재시작시 초기화)
 */
export const useFilterStore = create<FilterStore>()((set) => ({
  // State
  filter: defaultFilter,

  // Actions
  setCategory: (category) =>
    set((state) => ({
      filter: { ...state.filter, category },
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
