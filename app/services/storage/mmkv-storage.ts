import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

/**
 * 웹 플랫폼용 localStorage 기반 MMKV 폴백
 */
const webMMKV = {
  getString: (key: string): string | undefined => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined;
    }
    return undefined;
  },
  getNumber: (key: string): number | undefined => {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key);
      if (value === null) return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  },
  getBoolean: (key: string): boolean | undefined => {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key);
      if (value === null) return undefined;
      return value === 'true';
    }
    return undefined;
  },
  set: (key: string, value: string | number | boolean): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, String(value));
    }
  },
  remove: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  getAllKeys: (): string[] => {
    if (typeof localStorage !== 'undefined') {
      return Object.keys(localStorage);
    }
    return [];
  },
  contains: (key: string): boolean => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) !== null;
    }
    return false;
  },
  clearAll: (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  },
  get size(): number {
    if (typeof localStorage !== 'undefined') {
      let total = 0;
      for (const key of Object.keys(localStorage)) {
        total += (localStorage.getItem(key) || '').length;
      }
      return total;
    }
    return 0;
  },
};

/**
 * MMKV 인스턴스 (일반 캐시용)
 * 민감하지 않은 데이터 저장: 앱 설정, 필터 상태, 캐시 등
 *
 * Note: react-native-mmkv는 네이티브 모듈이므로
 * 웹에서는 localStorage 폴백 사용
 */
let mmkv: typeof webMMKV;

if (Platform.OS === 'web') {
  mmkv = webMMKV;
} else {
  // 네이티브에서만 MMKV 사용
  const { createMMKV } = require('react-native-mmkv');
  mmkv = createMMKV({
    id: 'youth-friend-storage',
  });
}

/**
 * Zustand persist 미들웨어용 MMKV 스토리지 어댑터
 * createJSONStorage와 함께 사용
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    mmkv.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkv.remove(name);
  },
};

/**
 * MMKV 유틸리티 함수
 */
export const mmkvUtils = {
  /** 모든 키 조회 */
  getAllKeys: (): string[] => mmkv.getAllKeys(),

  /** 특정 키 존재 여부 확인 */
  contains: (key: string): boolean => mmkv.contains(key),

  /** 모든 데이터 삭제 */
  clearAll: (): void => mmkv.clearAll(),

  /** 스토리지 크기 (bytes) */
  getSize: (): number => mmkv.size,
};

export { mmkv };
