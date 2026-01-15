import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

import { secureStorage, SecureStorageKeys } from '@/services/storage/secure-storage';

/**
 * 생체인증 결과 타입
 */
export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: LocalAuthentication.AuthenticationType;
}

/**
 * PIN 인증 결과 타입
 */
export interface PinAuthResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}

/**
 * 잠금 상태 타입
 */
export interface LockState {
  /** 잠금 여부 */
  isLocked: boolean;
  /** 잠금 해제 시간 (timestamp) */
  unlockTime?: number;
  /** 남은 잠금 시간 (초) */
  remainingSeconds?: number;
}

// 상수
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5분

/**
 * PIN을 SHA-256으로 해시
 */
async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

/**
 * 인증 서비스
 * - 생체인증 (Face ID/Touch ID)
 * - PIN 인증
 * - 인증 실패 횟수 관리
 */
export const authService = {
  /**
   * 생체인증 사용 가능 여부 확인
   */
  async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  },

  /**
   * 지원되는 생체인증 타입 조회
   */
  async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  /**
   * 생체인증 실행
   */
  async authenticateWithBiometric(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: '생체인증을 사용할 수 없습니다.',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '청년친구 잠금 해제',
        fallbackLabel: 'PIN 입력',
        cancelLabel: '취소',
        disableDeviceFallback: true,
      });

      if (result.success) {
        // 인증 성공 시 실패 횟수 초기화
        await this.resetPinAttempts();
        return { success: true };
      }

      return {
        success: false,
        error: result.error === 'user_cancel' ? '취소됨' : '인증 실패',
      };
    } catch (error) {
      return {
        success: false,
        error: '생체인증 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * PIN 설정 여부 확인
   */
  async isPinSet(): Promise<boolean> {
    const hashedPin = await secureStorage.getItem(SecureStorageKeys.PIN_CODE);
    return hashedPin !== null;
  },

  /**
   * PIN 설정
   */
  async setPin(pin: string): Promise<boolean> {
    try {
      const hashedPin = await hashPin(pin);
      await secureStorage.setItem(SecureStorageKeys.PIN_CODE, hashedPin);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * PIN 삭제
   */
  async clearPin(): Promise<boolean> {
    try {
      await secureStorage.removeItem(SecureStorageKeys.PIN_CODE);
      await this.resetPinAttempts();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * PIN 인증
   */
  async authenticateWithPin(pin: string): Promise<PinAuthResult> {
    try {
      // 잠금 상태 확인
      const lockState = await this.getLockState();
      if (lockState.isLocked) {
        return {
          success: false,
          error: `${Math.ceil(lockState.remainingSeconds ?? 0)}초 후에 다시 시도해주세요.`,
          remainingAttempts: 0,
        };
      }

      // 저장된 PIN 해시 조회
      const storedHash = await secureStorage.getItem(SecureStorageKeys.PIN_CODE);
      if (!storedHash) {
        return {
          success: false,
          error: 'PIN이 설정되지 않았습니다.',
        };
      }

      // 입력된 PIN 해시
      const inputHash = await hashPin(pin);

      if (inputHash === storedHash) {
        // 인증 성공 - 실패 횟수 초기화
        await this.resetPinAttempts();
        return { success: true };
      }

      // 인증 실패 - 실패 횟수 증가
      const attempts = await this.incrementPinAttempts();
      const remainingAttempts = MAX_PIN_ATTEMPTS - attempts;

      if (remainingAttempts <= 0) {
        // 5회 실패 - 잠금 설정
        await this.setLockout();
        return {
          success: false,
          error: '5회 실패로 5분간 잠금됩니다.',
          remainingAttempts: 0,
        };
      }

      return {
        success: false,
        error: `PIN이 일치하지 않습니다. (${remainingAttempts}회 남음)`,
        remainingAttempts,
      };
    } catch {
      return {
        success: false,
        error: '인증 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * 생체인증 활성화 여부 조회
   */
  async isBiometricEnabled(): Promise<boolean> {
    const value = await secureStorage.getItem(SecureStorageKeys.BIOMETRIC_ENABLED);
    return value === 'true';
  },

  /**
   * 생체인증 활성화/비활성화
   */
  async setBiometricEnabled(enabled: boolean): Promise<boolean> {
    try {
      await secureStorage.setItem(
        SecureStorageKeys.BIOMETRIC_ENABLED,
        enabled ? 'true' : 'false'
      );
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 잠금 상태 조회
   */
  async getLockState(): Promise<LockState> {
    try {
      const lockoutTime = await secureStorage.getItem(SecureStorageKeys.LOCKOUT_TIME);
      if (!lockoutTime) {
        return { isLocked: false };
      }

      const lockoutTimestamp = parseInt(lockoutTime, 10);
      const now = Date.now();
      const remainingMs = lockoutTimestamp + LOCKOUT_DURATION_MS - now;

      if (remainingMs <= 0) {
        // 잠금 시간 경과 - 잠금 해제
        await this.clearLockout();
        return { isLocked: false };
      }

      return {
        isLocked: true,
        unlockTime: lockoutTimestamp + LOCKOUT_DURATION_MS,
        remainingSeconds: Math.ceil(remainingMs / 1000),
      };
    } catch {
      return { isLocked: false };
    }
  },

  /**
   * PIN 시도 횟수 조회
   */
  async getPinAttempts(): Promise<number> {
    try {
      const attempts = await secureStorage.getItem(SecureStorageKeys.PIN_ATTEMPTS);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch {
      return 0;
    }
  },

  /**
   * PIN 시도 횟수 증가
   */
  async incrementPinAttempts(): Promise<number> {
    const current = await this.getPinAttempts();
    const newCount = current + 1;
    await secureStorage.setItem(SecureStorageKeys.PIN_ATTEMPTS, newCount.toString());
    return newCount;
  },

  /**
   * PIN 시도 횟수 초기화
   */
  async resetPinAttempts(): Promise<void> {
    try {
      await secureStorage.removeItem(SecureStorageKeys.PIN_ATTEMPTS);
    } catch {
      // 무시
    }
  },

  /**
   * 잠금 설정
   */
  async setLockout(): Promise<void> {
    await secureStorage.setItem(SecureStorageKeys.LOCKOUT_TIME, Date.now().toString());
    await this.resetPinAttempts();
  },

  /**
   * 잠금 해제
   */
  async clearLockout(): Promise<void> {
    try {
      await secureStorage.removeItem(SecureStorageKeys.LOCKOUT_TIME);
      await this.resetPinAttempts();
    } catch {
      // 무시
    }
  },
};
