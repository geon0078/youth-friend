/**
 * filter-store 테스트
 * Story 3.5: 다중 카테고리 필터링
 */
import { act, renderHook } from '@testing-library/react-native';
import { useFilterStore, selectHasActiveFilters } from '@/stores/filter-store';

describe('filter-store', () => {
  // 각 테스트 전 스토어 초기화
  beforeEach(() => {
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.resetFilter();
    });
  });

  describe('초기 상태', () => {
    it('categories가 빈 배열로 초기화된다', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.filter.categories).toEqual([]);
    });

    it('searchQuery가 빈 문자열로 초기화된다', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.filter.searchQuery).toBe('');
    });

    it('sortBy가 recommended로 초기화된다', () => {
      const { result } = renderHook(() => useFilterStore());
      expect(result.current.filter.sortBy).toBe('recommended');
    });
  });

  describe('toggleCategory', () => {
    it('선택되지 않은 카테고리를 추가한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
      });

      expect(result.current.filter.categories).toContain('employment');
      expect(result.current.filter.categories).toHaveLength(1);
    });

    it('이미 선택된 카테고리를 제거한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
      });
      expect(result.current.filter.categories).toContain('employment');

      act(() => {
        result.current.toggleCategory('employment');
      });
      expect(result.current.filter.categories).not.toContain('employment');
      expect(result.current.filter.categories).toHaveLength(0);
    });

    it('여러 카테고리를 동시에 선택할 수 있다 (AC2)', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
        result.current.toggleCategory('housing');
        result.current.toggleCategory('education');
      });

      expect(result.current.filter.categories).toEqual([
        'employment',
        'housing',
        'education',
      ]);
    });

    it('일부 카테고리만 해제할 수 있다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
        result.current.toggleCategory('housing');
        result.current.toggleCategory('education');
      });

      act(() => {
        result.current.toggleCategory('housing');
      });

      expect(result.current.filter.categories).toEqual(['employment', 'education']);
    });
  });

  describe('setCategories', () => {
    it('카테고리 배열 전체를 설정한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setCategories(['welfare', 'finance', 'culture']);
      });

      expect(result.current.filter.categories).toEqual([
        'welfare',
        'finance',
        'culture',
      ]);
    });

    it('빈 배열로 모든 카테고리를 해제한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setCategories(['employment', 'housing']);
      });
      expect(result.current.filter.categories).toHaveLength(2);

      act(() => {
        result.current.setCategories([]);
      });
      expect(result.current.filter.categories).toHaveLength(0);
    });
  });

  describe('setSearchQuery', () => {
    it('검색어를 설정한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchQuery('청년');
      });

      expect(result.current.filter.searchQuery).toBe('청년');
    });
  });

  describe('setSortBy', () => {
    it('정렬 옵션을 변경한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSortBy('amount');
      });

      expect(result.current.filter.sortBy).toBe('amount');
    });
  });

  describe('resetFilter (AC5)', () => {
    it('모든 필터를 초기 상태로 되돌린다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
        result.current.toggleCategory('housing');
        result.current.setSearchQuery('청년');
        result.current.setSortBy('amount');
      });

      act(() => {
        result.current.resetFilter();
      });

      expect(result.current.filter.categories).toEqual([]);
      expect(result.current.filter.searchQuery).toBe('');
      expect(result.current.filter.sortBy).toBe('recommended');
    });
  });

  describe('selectHasActiveFilters', () => {
    it('카테고리가 선택되면 true를 반환한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
      });

      expect(selectHasActiveFilters(result.current)).toBe(true);
    });

    it('검색어가 있으면 true를 반환한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchQuery('청년');
      });

      expect(selectHasActiveFilters(result.current)).toBe(true);
    });

    it('필터가 없으면 false를 반환한다', () => {
      const { result } = renderHook(() => useFilterStore());

      expect(selectHasActiveFilters(result.current)).toBe(false);
    });

    it('필터 초기화 후 false를 반환한다', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.toggleCategory('employment');
        result.current.setSearchQuery('청년');
      });
      expect(selectHasActiveFilters(result.current)).toBe(true);

      act(() => {
        result.current.resetFilter();
      });
      expect(selectHasActiveFilters(result.current)).toBe(false);
    });
  });
});
