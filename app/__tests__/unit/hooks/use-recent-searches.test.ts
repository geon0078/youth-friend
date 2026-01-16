/**
 * useRecentSearches 훅 테스트
 * Story 3.6: 최근 검색어 저장
 */
import { renderHook, act } from '@testing-library/react-native';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { cacheStorage, CacheKeys } from '@/services/storage';

// 스토리지 모킹
jest.mock('@/services/storage', () => ({
  cacheStorage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
  CacheKeys: {
    RECENT_SEARCHES: 'cache_recent_searches',
  },
}));

const mockCacheStorage = cacheStorage as jest.Mocked<typeof cacheStorage>;

describe('useRecentSearches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheStorage.get.mockReturnValue(null);
  });

  describe('초기화', () => {
    it('저장된 검색어가 없으면 빈 배열을 반환한다', () => {
      mockCacheStorage.get.mockReturnValue(null);

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual([]);
    });

    it('저장된 검색어가 있으면 로드한다', () => {
      mockCacheStorage.get.mockReturnValue(['취업', '주거', '청년']);

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.searches).toEqual(['취업', '주거', '청년']);
    });
  });

  describe('addSearch', () => {
    it('새 검색어를 맨 앞에 추가한다', () => {
      mockCacheStorage.get.mockReturnValue(['기존1', '기존2']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('새검색어');
      });

      expect(result.current.searches).toEqual(['새검색어', '기존1', '기존2']);
      expect(mockCacheStorage.set).toHaveBeenCalledWith(
        CacheKeys.RECENT_SEARCHES,
        ['새검색어', '기존1', '기존2']
      );
    });

    it('빈 검색어는 추가하지 않는다', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('');
      });

      expect(result.current.searches).toEqual([]);
      expect(mockCacheStorage.set).not.toHaveBeenCalled();
    });

    it('공백만 있는 검색어는 추가하지 않는다', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('   ');
      });

      expect(result.current.searches).toEqual([]);
      expect(mockCacheStorage.set).not.toHaveBeenCalled();
    });

    it('중복 검색어는 맨 앞으로 이동한다', () => {
      mockCacheStorage.get.mockReturnValue(['취업', '주거', '청년']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('주거');
      });

      expect(result.current.searches).toEqual(['주거', '취업', '청년']);
    });

    it('대소문자가 다르면 중복으로 처리한다', () => {
      mockCacheStorage.get.mockReturnValue(['Hello', '청년']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('hello');
      });

      expect(result.current.searches).toEqual(['hello', '청년']);
    });

    it('최대 5개까지만 저장한다', () => {
      mockCacheStorage.get.mockReturnValue(['1', '2', '3', '4', '5']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('6');
      });

      expect(result.current.searches).toHaveLength(5);
      expect(result.current.searches).toEqual(['6', '1', '2', '3', '4']);
    });

    it('앞뒤 공백을 제거하고 저장한다', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('  검색어  ');
      });

      expect(result.current.searches).toEqual(['검색어']);
    });
  });

  describe('removeSearch', () => {
    it('특정 검색어를 삭제한다', () => {
      mockCacheStorage.get.mockReturnValue(['취업', '주거', '청년']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.removeSearch('주거');
      });

      expect(result.current.searches).toEqual(['취업', '청년']);
      expect(mockCacheStorage.set).toHaveBeenCalledWith(
        CacheKeys.RECENT_SEARCHES,
        ['취업', '청년']
      );
    });

    it('존재하지 않는 검색어를 삭제해도 에러가 발생하지 않는다', () => {
      mockCacheStorage.get.mockReturnValue(['취업', '청년']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.removeSearch('존재하지않음');
      });

      expect(result.current.searches).toEqual(['취업', '청년']);
    });
  });

  describe('clearAll', () => {
    it('모든 검색어를 삭제한다', () => {
      mockCacheStorage.get.mockReturnValue(['취업', '주거', '청년']);

      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.searches).toEqual([]);
      expect(mockCacheStorage.remove).toHaveBeenCalledWith(
        CacheKeys.RECENT_SEARCHES
      );
    });
  });
});
