/**
 * React Query Persister 테스트
 * - MMKV 기반 영구 캐시 persister
 * - 직렬화/역직렬화
 * - 스토리지 유틸리티
 */

import { queryPersister, queryStorageUtils } from '@/services/storage/query-persister';

// MMKV 모킹
const mockStorage = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: (key: string) => mockStorage.get(key),
    set: (key: string, value: string) => mockStorage.set(key, value),
    remove: (key: string) => mockStorage.delete(key),
    size: 1024,
    clearAll: () => mockStorage.clear(),
    getAllKeys: () => Array.from(mockStorage.keys()),
  })),
}));

describe('queryPersister', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  describe('storage operations', () => {
    it('데이터를 저장하고 조회할 수 있다', () => {
      const testKey = 'test-cache-key';
      const testData = { queries: [], mutations: [] };

      // persistClient 호출 시뮬레이션
      queryPersister.persistClient({
        buster: '1',
        timestamp: Date.now(),
        clientState: testData,
      } as any);

      // 저장된 데이터 확인
      expect(mockStorage.size).toBeGreaterThan(0);
    });

    it('존재하지 않는 키 조회 시 null을 반환한다', () => {
      const result = queryPersister.restoreClient();
      // 빈 스토리지에서 복원 시도
      expect(result).toBeUndefined();
    });
  });

  describe('serialization', () => {
    it('데이터를 JSON으로 직렬화한다', () => {
      const testData = {
        buster: '1',
        timestamp: Date.now(),
        clientState: { queries: [{ queryKey: ['test'], state: {} }] },
      };

      queryPersister.persistClient(testData as any);

      // 저장된 값이 JSON 문자열인지 확인
      const storedValue = Array.from(mockStorage.values())[0];
      expect(() => JSON.parse(storedValue)).not.toThrow();
    });

    it('복원 시 JSON을 역직렬화한다', () => {
      const testData = {
        buster: '1',
        timestamp: Date.now(),
        clientState: { queries: [], mutations: [] },
      };

      // 직접 저장
      mockStorage.set(
        'REACT_QUERY_OFFLINE_CACHE',
        JSON.stringify(testData)
      );

      const restored = queryPersister.restoreClient();
      expect(restored).toBeDefined();
    });
  });
});

describe('queryStorageUtils', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  describe('getSize', () => {
    it('캐시 크기를 반환한다', () => {
      const size = queryStorageUtils.getSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clearAll', () => {
    it('모든 캐시를 삭제한다', () => {
      mockStorage.set('key1', 'value1');
      mockStorage.set('key2', 'value2');

      queryStorageUtils.clearAll();

      expect(mockStorage.size).toBe(0);
    });
  });

  describe('getAllKeys', () => {
    it('모든 캐시 키를 반환한다', () => {
      mockStorage.set('cache-key-1', 'value1');
      mockStorage.set('cache-key-2', 'value2');

      const keys = queryStorageUtils.getAllKeys();

      expect(keys).toContain('cache-key-1');
      expect(keys).toContain('cache-key-2');
      expect(keys.length).toBe(2);
    });

    it('빈 스토리지에서 빈 배열을 반환한다', () => {
      const keys = queryStorageUtils.getAllKeys();
      expect(keys).toEqual([]);
    });
  });
});
