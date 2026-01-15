import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * MMKV 인스턴스 (일반 캐시용)
 * 민감하지 않은 데이터 저장: 앱 설정, 필터 상태, 캐시 등
 *
 * Note: react-native-mmkv는 네이티브 모듈이므로
 * Expo Go가 아닌 Development Build에서만 작동합니다.
 */
const mmkv = createMMKV({
  id: 'youth-friend-storage',
});

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
