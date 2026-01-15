/**
 * Data Manager Service
 *
 * 사용자 데이터 삭제 관리:
 * - 모든 로컬 데이터 삭제 (프로필, 캐시, 설정)
 * - expo-secure-store, MMKV 모두 클리어
 */

import { secureStorage } from './secure-storage';
import { mmkv as storage, mmkvUtils } from './mmkv-storage';

// Secure Store Keys (auth-service, secure-storage에서 사용)
const SECURE_STORE_KEYS = [
  'user_pin_hash',
  'biometric_enabled',
  'auth_failed_attempts',
  'auth_lockout_until',
  'user_profile',
] as const;

// MMKV Keys (session-manager, user-store에서 사용)
const MMKV_KEYS = [
  'session_last_active_time',
  'session_is_locked',
  'user-storage',
] as const;

export interface DataDeletionResult {
  success: boolean;
  error?: string;
  deletedItems: {
    secureStore: number;
    mmkv: number;
  };
}

/**
 * 모든 사용자 데이터 삭제
 */
async function clearAllData(): Promise<DataDeletionResult> {
  const result: DataDeletionResult = {
    success: true,
    deletedItems: {
      secureStore: 0,
      mmkv: 0,
    },
  };

  try {
    // 1. Secure Store 데이터 삭제
    for (const key of SECURE_STORE_KEYS) {
      try {
        await secureStorage.removeItem(key as any);
        result.deletedItems.secureStore++;
      } catch {
        // 키가 없을 수 있으므로 에러 무시
      }
    }

    // 2. MMKV 데이터 삭제
    for (const key of MMKV_KEYS) {
      try {
        storage.remove(key);
        result.deletedItems.mmkv++;
      } catch {
        // 키가 없을 수 있으므로 에러 무시
      }
    }

    // 3. MMKV 전체 클리어 (Zustand persist 포함)
    try {
      mmkvUtils.clearAll();
    } catch {
      // 에러 무시
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '데이터 삭제 중 오류가 발생했습니다.',
      deletedItems: result.deletedItems,
    };
  }
}

/**
 * 앱 캐시만 삭제 (프로필 유지)
 */
async function clearCache(): Promise<boolean> {
  try {
    // 세션 관련 데이터만 삭제
    storage.remove('session_last_active_time');
    storage.remove('session_is_locked');
    return true;
  } catch {
    return false;
  }
}

export const dataManager = {
  clearAllData,
  clearCache,
};
