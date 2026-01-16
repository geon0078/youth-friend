import { useState, useEffect, useCallback } from 'react';

import { cacheStorage, CacheKeys } from '@/services/storage';

/** 최대 저장 검색어 수 */
const MAX_RECENT_SEARCHES = 5;

/**
 * 최근 검색어 관리 훅
 *
 * @returns 최근 검색어 목록과 관리 함수
 *
 * @example
 * ```tsx
 * const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();
 *
 * // 검색 실행 시
 * addSearch(searchQuery);
 *
 * // 최근 검색어 목록 표시
 * searches.map((search) => <Text>{search}</Text>);
 * ```
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  // 초기 로드
  useEffect(() => {
    const saved = cacheStorage.get<string[]>(CacheKeys.RECENT_SEARCHES);
    if (saved) {
      setSearches(saved);
    }
  }, []);

  /**
   * 검색어 추가
   * - 중복 제거 후 맨 앞에 추가
   * - 최대 5개 유지
   */
  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearches((prev) => {
      // 이미 있는 검색어는 제거 후 맨 앞에 추가
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      cacheStorage.set(CacheKeys.RECENT_SEARCHES, updated);
      return updated;
    });
  }, []);

  /**
   * 특정 검색어 삭제
   */
  const removeSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      cacheStorage.set(CacheKeys.RECENT_SEARCHES, updated);
      return updated;
    });
  }, []);

  /**
   * 모든 검색어 삭제
   */
  const clearAll = useCallback(() => {
    setSearches([]);
    cacheStorage.remove(CacheKeys.RECENT_SEARCHES);
  }, []);

  return {
    /** 최근 검색어 목록 */
    searches,
    /** 검색어 추가 */
    addSearch,
    /** 검색어 삭제 */
    removeSearch,
    /** 전체 삭제 */
    clearAll,
  };
}
