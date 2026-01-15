import { mmkv, mmkvUtils } from './mmkv-storage';

/**
 * 캐시 항목 메타데이터
 */
interface CacheItem<T> {
  /** 저장된 데이터 */
  data: T;
  /** 저장 시간 (Unix timestamp) */
  timestamp: number;
  /** 만료 시간 (Unix timestamp), undefined면 영구 */
  expiresAt?: number;
}

/**
 * 캐시 저장 옵션
 */
interface CacheOptions {
  /** TTL(Time-To-Live) 밀리초, 기본값은 영구 */
  ttl?: number;
}

/**
 * 캐시 키 프리픽스
 */
export const CacheKeys = {
  /** 혜택 목록 캐시 */
  BENEFITS_LIST: 'cache_benefits_list',
  /** 혜택 상세 캐시 (ID 접미사 필요) */
  BENEFIT_DETAIL: 'cache_benefit_detail_',
  /** 필터 결과 캐시 */
  FILTER_RESULTS: 'cache_filter_results_',
  /** API 응답 캐시 */
  API_RESPONSE: 'cache_api_',
} as const;

/**
 * 기본 TTL 값 (밀리초)
 */
export const CacheTTL = {
  /** 1분 */
  MINUTE: 60 * 1000,
  /** 5분 */
  FIVE_MINUTES: 5 * 60 * 1000,
  /** 1시간 (NFR20: 혜택 데이터 기본 캐시) */
  HOUR: 60 * 60 * 1000,
  /** 1일 */
  DAY: 24 * 60 * 60 * 1000,
  /** 1주일 */
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache Storage 서비스
 * 일반 캐시 데이터를 고성능으로 저장 (MMKV)
 * - JSON 자동 직렬화/역직렬화
 * - TTL(Time-To-Live) 지원
 */
export const cacheStorage = {
  /**
   * 데이터 저장
   * @param key - 캐시 키
   * @param data - 저장할 데이터
   * @param options - 캐시 옵션 (ttl)
   */
  set<T>(key: string, data: T, options?: CacheOptions): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: options?.ttl ? now + options.ttl : undefined,
    };
    mmkv.set(key, JSON.stringify(item));
  },

  /**
   * 데이터 조회
   * @param key - 캐시 키
   * @returns 저장된 데이터 또는 null (만료 시 null)
   */
  get<T>(key: string): T | null {
    const jsonString = mmkv.getString(key);
    if (!jsonString) {
      return null;
    }

    try {
      const item = JSON.parse(jsonString) as CacheItem<T>;

      // TTL 체크
      if (item.expiresAt && Date.now() > item.expiresAt) {
        // 만료된 항목 삭제
        mmkv.remove(key);
        return null;
      }

      return item.data;
    } catch {
      // 파싱 실패 시 삭제
      mmkv.remove(key);
      return null;
    }
  },

  /**
   * 데이터 조회 (메타데이터 포함)
   * @param key - 캐시 키
   * @returns 캐시 항목 또는 null
   */
  getWithMeta<T>(key: string): { data: T; age: number; isExpired: boolean } | null {
    const jsonString = mmkv.getString(key);
    if (!jsonString) {
      return null;
    }

    try {
      const item = JSON.parse(jsonString) as CacheItem<T>;
      const now = Date.now();
      const age = now - item.timestamp;
      const isExpired = item.expiresAt ? now > item.expiresAt : false;

      if (isExpired) {
        mmkv.remove(key);
        return null;
      }

      return { data: item.data, age, isExpired };
    } catch {
      mmkv.remove(key);
      return null;
    }
  },

  /**
   * 항목 삭제
   * @param key - 캐시 키
   */
  remove(key: string): void {
    mmkv.remove(key);
  },

  /**
   * 프리픽스로 시작하는 모든 항목 삭제
   * @param prefix - 키 프리픽스
   */
  removeByPrefix(prefix: string): void {
    const allKeys = mmkvUtils.getAllKeys();
    const keysToRemove = allKeys.filter((key) => key.startsWith(prefix));
    keysToRemove.forEach((key) => mmkv.remove(key));
  },

  /**
   * 만료된 모든 캐시 정리
   * @returns 삭제된 항목 수
   */
  cleanExpired(): number {
    const allKeys = mmkvUtils.getAllKeys();
    let removedCount = 0;
    const now = Date.now();

    for (const key of allKeys) {
      const jsonString = mmkv.getString(key);
      if (!jsonString) continue;

      try {
        const item = JSON.parse(jsonString) as CacheItem<unknown>;
        if (item.expiresAt && now > item.expiresAt) {
          mmkv.remove(key);
          removedCount++;
        }
      } catch {
        // 파싱 실패 항목도 삭제
        mmkv.remove(key);
        removedCount++;
      }
    }

    return removedCount;
  },

  /**
   * 모든 캐시 삭제
   */
  clearAll(): void {
    mmkvUtils.clearAll();
  },

  /**
   * 캐시 키 존재 여부 확인
   * @param key - 캐시 키
   * @returns 존재 여부 (만료된 경우 false)
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  },

  /**
   * 캐시 통계 조회
   */
  getStats(): { totalKeys: number; totalSize: number } {
    return {
      totalKeys: mmkvUtils.getAllKeys().length,
      totalSize: mmkvUtils.getSize(),
    };
  },
};
