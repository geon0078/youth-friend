/**
 * React Query 영구 캐시를 위한 MMKV Persister
 * 앱 재시작 시 캐시 데이터 복원 지원
 */
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { createMMKV } from 'react-native-mmkv';

/**
 * React Query 캐시 전용 MMKV 인스턴스
 * 일반 앱 스토리지와 분리하여 관리
 */
const queryStorage = createMMKV({
  id: 'youth-friend-query-cache',
});

/**
 * React Query Sync Storage Persister
 * - MMKV 기반 동기 스토리지
 * - 앱 재시작 시 캐시 자동 복원
 * - NFR20: 혜택 데이터 1시간 캐시 지원
 */
export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key: string): string | null => {
      const value = queryStorage.getString(key);
      return value ?? null;
    },
    setItem: (key: string, value: string): void => {
      queryStorage.set(key, value);
    },
    removeItem: (key: string): void => {
      queryStorage.remove(key);
    },
  },
  // 직렬화/역직렬화는 기본 JSON 사용
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
});

/**
 * Query 캐시 스토리지 유틸리티
 */
export const queryStorageUtils = {
  /** 캐시 크기 조회 (bytes) */
  getSize: (): number => queryStorage.size,

  /** 캐시 전체 삭제 */
  clearAll: (): void => queryStorage.clearAll(),

  /** 모든 캐시 키 조회 */
  getAllKeys: (): string[] => queryStorage.getAllKeys(),
};
