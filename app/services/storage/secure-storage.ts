import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * 웹 플랫폼용 localStorage 폴백
 */
const webStorage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async getItemAsync(key: string): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// 플랫폼에 따른 스토리지 선택
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

/**
 * 스토리지 에러 타입
 */
export type StorageErrorType = 'save' | 'load' | 'delete' | 'unavailable';

/**
 * 스토리지 에러 클래스
 */
export class StorageError extends Error {
  readonly type: StorageErrorType;
  readonly key: string;

  constructor(message: string, type: StorageErrorType, key: string) {
    super(message);
    this.name = 'StorageError';
    this.type = type;
    this.key = key;
  }

  /** 저장 에러 생성 */
  static save(key: string, originalError?: Error): StorageError {
    return new StorageError(
      `데이터 저장에 실패했습니다: ${originalError?.message ?? key}`,
      'save',
      key
    );
  }

  /** 로드 에러 생성 */
  static load(key: string, originalError?: Error): StorageError {
    return new StorageError(
      `데이터 조회에 실패했습니다: ${originalError?.message ?? key}`,
      'load',
      key
    );
  }

  /** 삭제 에러 생성 */
  static delete(key: string, originalError?: Error): StorageError {
    return new StorageError(
      `데이터 삭제에 실패했습니다: ${originalError?.message ?? key}`,
      'delete',
      key
    );
  }

  /** 사용 불가 에러 생성 */
  static unavailable(): StorageError {
    return new StorageError(
      '보안 저장소를 사용할 수 없습니다',
      'unavailable',
      ''
    );
  }
}

/**
 * Secure Storage 키
 */
export const SecureStorageKeys = {
  /** 사용자 프로필 */
  USER_PROFILE: 'user_profile',
  /** 인증 토큰 */
  AUTH_TOKEN: 'auth_token',
  /** PIN 코드 (해시됨) */
  PIN_CODE: 'pin_code',
  /** 생체인증 활성화 여부 */
  BIOMETRIC_ENABLED: 'biometric_enabled',
  /** PIN 시도 횟수 */
  PIN_ATTEMPTS: 'pin_attempts',
  /** 잠금 시간 */
  LOCKOUT_TIME: 'lockout_time',
} as const;

export type SecureStorageKey = (typeof SecureStorageKeys)[keyof typeof SecureStorageKeys];

/**
 * Secure Storage 서비스
 * 민감한 데이터를 안전하게 저장 (expo-secure-store)
 * - iOS: Keychain
 * - Android: Keystore + SharedPreferences (암호화)
 */
export const secureStorage = {
  /**
   * 문자열 저장
   * @throws {StorageError} 저장 실패 시
   */
  async setItem(key: SecureStorageKey, value: string): Promise<void> {
    try {
      await storage.setItemAsync(key, value);
    } catch (error) {
      throw StorageError.save(key, error instanceof Error ? error : undefined);
    }
  },

  /**
   * 문자열 조회
   * @returns 저장된 값 또는 null
   * @throws {StorageError} 조회 실패 시
   */
  async getItem(key: SecureStorageKey): Promise<string | null> {
    try {
      return await storage.getItemAsync(key);
    } catch (error) {
      throw StorageError.load(key, error instanceof Error ? error : undefined);
    }
  },

  /**
   * 항목 삭제
   * @throws {StorageError} 삭제 실패 시
   */
  async removeItem(key: SecureStorageKey): Promise<void> {
    try {
      await storage.deleteItemAsync(key);
    } catch (error) {
      throw StorageError.delete(key, error instanceof Error ? error : undefined);
    }
  },

  /**
   * JSON 객체 저장
   * @throws {StorageError} 저장 실패 시
   */
  async setObject<T>(key: SecureStorageKey, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await storage.setItemAsync(key, jsonString);
    } catch (error) {
      throw StorageError.save(key, error instanceof Error ? error : undefined);
    }
  },

  /**
   * JSON 객체 조회
   * @returns 저장된 객체 또는 null
   * @throws {StorageError} 조회 또는 파싱 실패 시
   */
  async getObject<T>(key: SecureStorageKey): Promise<T | null> {
    try {
      const jsonString = await storage.getItemAsync(key);
      if (jsonString === null) {
        return null;
      }
      return JSON.parse(jsonString) as T;
    } catch (error) {
      throw StorageError.load(key, error instanceof Error ? error : undefined);
    }
  },

  /**
   * Secure Storage 사용 가능 여부 확인
   */
  async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__test__';
      await storage.setItemAsync(testKey, 'test');
      await storage.deleteItemAsync(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
