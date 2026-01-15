import { useCallback, useState } from 'react';

import { secureStorage, SecureStorageKeys, StorageError } from '@/services/storage/secure-storage';
import { useUserStore } from '@/stores';
import type { UserProfile } from '@/types';

/**
 * 프로필 저장 결과 타입
 */
export interface ProfileSaveResult {
  success: boolean;
  error?: string;
}

/**
 * 프로필 로드 결과 타입
 */
export interface ProfileLoadResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * useProfile 훅 반환 타입
 */
export interface UseProfileReturn {
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 프로필을 secure storage에 저장 */
  saveProfile: () => Promise<ProfileSaveResult>;
  /** Secure storage에서 프로필 로드 */
  loadProfile: () => Promise<ProfileLoadResult>;
  /** Secure storage에서 프로필 삭제 */
  clearProfile: () => Promise<ProfileSaveResult>;
  /** 에러 초기화 */
  clearError: () => void;
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof StorageError) {
    switch (error.type) {
      case 'save':
        return '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
      case 'load':
        return '프로필 정보를 불러오는데 실패했습니다.';
      case 'delete':
        return '프로필 삭제에 실패했습니다.';
      case 'unavailable':
        return '보안 저장소를 사용할 수 없습니다. 기기 설정을 확인해주세요.';
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 프로필 관리 훅
 * - expo-secure-store를 사용한 암호화 저장 (FR24)
 * - 사용자 친화적 에러 메시지 제공
 *
 * @example
 * ```tsx
 * const { saveProfile, loadProfile, isLoading, error } = useProfile();
 *
 * const handleSave = async () => {
 *   const result = await saveProfile();
 *   if (result.success) {
 *     // 저장 성공
 *   }
 * };
 * ```
 */
export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile, setProfile } = useUserStore();

  /**
   * 프로필을 secure storage에 저장
   * Zustand store의 현재 프로필을 암호화하여 저장
   */
  const saveProfile = useCallback(async (): Promise<ProfileSaveResult> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!profile) {
        const errorMessage = '저장할 프로필이 없습니다.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      await secureStorage.setObject<UserProfile>(
        SecureStorageKeys.USER_PROFILE,
        profile
      );

      return { success: true };
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);

      // 개발 환경에서 상세 에러 로깅
      if (__DEV__) {
        console.error('[useProfile] saveProfile error:', err);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  /**
   * Secure storage에서 프로필 로드
   * 암호화된 프로필을 복호화하여 Zustand store에 설정
   */
  const loadProfile = useCallback(async (): Promise<ProfileLoadResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const storedProfile = await secureStorage.getObject<UserProfile>(
        SecureStorageKeys.USER_PROFILE
      );

      if (storedProfile) {
        setProfile(storedProfile);
        return { success: true, profile: storedProfile };
      }

      return { success: true, profile: undefined };
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);

      if (__DEV__) {
        console.error('[useProfile] loadProfile error:', err);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setProfile]);

  /**
   * Secure storage에서 프로필 삭제
   */
  const clearProfile = useCallback(async (): Promise<ProfileSaveResult> => {
    setIsLoading(true);
    setError(null);

    try {
      await secureStorage.removeItem(SecureStorageKeys.USER_PROFILE);
      return { success: true };
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);

      if (__DEV__) {
        console.error('[useProfile] clearProfile error:', err);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    saveProfile,
    loadProfile,
    clearProfile,
    clearError,
  };
}
