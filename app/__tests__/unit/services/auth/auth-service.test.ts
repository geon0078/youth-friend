/**
 * Auth Service Tests
 * - 생체인증
 * - PIN 인증
 * - 잠금 로직
 */

import { authService } from '@/services/auth/auth-service';
import { secureStorage, SecureStorageKeys } from '@/services/storage/secure-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
  },
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
}));

// Mock secure-storage
jest.mock('@/services/storage/secure-storage', () => ({
  secureStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  SecureStorageKeys: {
    PIN_CODE: 'pin_code',
    BIOMETRIC_ENABLED: 'biometric_enabled',
    PIN_ATTEMPTS: 'pin_attempts',
    LOCKOUT_TIME: 'lockout_time',
  },
}));

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;
const mockCrypto = Crypto as jest.Mocked<typeof Crypto>;
const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for hash
    mockCrypto.digestStringAsync.mockResolvedValue('hashed_pin_value');
  });

  describe('isBiometricAvailable', () => {
    it('하드웨어와 등록이 모두 있으면 true 반환', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await authService.isBiometricAvailable();

      expect(result).toBe(true);
      expect(mockLocalAuth.hasHardwareAsync).toHaveBeenCalled();
      expect(mockLocalAuth.isEnrolledAsync).toHaveBeenCalled();
    });

    it('하드웨어가 없으면 false 반환', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);

      const result = await authService.isBiometricAvailable();

      expect(result).toBe(false);
      expect(mockLocalAuth.isEnrolledAsync).not.toHaveBeenCalled();
    });

    it('등록된 생체정보가 없으면 false 반환', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await authService.isBiometricAvailable();

      expect(result).toBe(false);
    });
  });

  describe('authenticateWithBiometric', () => {
    it('생체인증 성공 시 success:true 반환', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });
      mockSecureStorage.removeItem.mockResolvedValue();

      const result = await authService.authenticateWithBiometric();

      expect(result.success).toBe(true);
      // PIN 시도 횟수 초기화 확인
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(SecureStorageKeys.PIN_ATTEMPTS);
    });

    it('생체인증 사용 불가 시 에러 반환', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);

      const result = await authService.authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('생체인증을 사용할 수 없습니다.');
    });

    it('사용자 취소 시 취소됨 에러 반환', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await authService.authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('취소됨');
    });
  });

  describe('PIN 관련 기능', () => {
    describe('isPinSet', () => {
      it('PIN이 설정되어 있으면 true 반환', async () => {
        mockSecureStorage.getItem.mockResolvedValue('hashed_pin');

        const result = await authService.isPinSet();

        expect(result).toBe(true);
        expect(mockSecureStorage.getItem).toHaveBeenCalledWith(SecureStorageKeys.PIN_CODE);
      });

      it('PIN이 없으면 false 반환', async () => {
        mockSecureStorage.getItem.mockResolvedValue(null);

        const result = await authService.isPinSet();

        expect(result).toBe(false);
      });
    });

    describe('setPin', () => {
      it('PIN을 해시하여 저장', async () => {
        mockCrypto.digestStringAsync.mockResolvedValue('hashed_1234');
        mockSecureStorage.setItem.mockResolvedValue();

        const result = await authService.setPin('1234');

        expect(result).toBe(true);
        expect(mockCrypto.digestStringAsync).toHaveBeenCalledWith(
          Crypto.CryptoDigestAlgorithm.SHA256,
          '1234'
        );
        expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
          SecureStorageKeys.PIN_CODE,
          'hashed_1234'
        );
      });

      it('저장 실패 시 false 반환', async () => {
        mockSecureStorage.setItem.mockRejectedValue(new Error('Save failed'));

        const result = await authService.setPin('1234');

        expect(result).toBe(false);
      });
    });

    describe('authenticateWithPin', () => {
      beforeEach(() => {
        // 기본: 잠금 상태 아님
        mockSecureStorage.getItem.mockImplementation((key) => {
          if (key === SecureStorageKeys.LOCKOUT_TIME) return Promise.resolve(null);
          if (key === SecureStorageKeys.PIN_ATTEMPTS) return Promise.resolve('0');
          if (key === SecureStorageKeys.PIN_CODE) return Promise.resolve('correct_hash');
          return Promise.resolve(null);
        });
      });

      it('올바른 PIN 입력 시 인증 성공', async () => {
        mockCrypto.digestStringAsync.mockResolvedValue('correct_hash');
        mockSecureStorage.removeItem.mockResolvedValue();

        const result = await authService.authenticateWithPin('1234');

        expect(result.success).toBe(true);
        // PIN 시도 횟수 초기화 확인
        expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(SecureStorageKeys.PIN_ATTEMPTS);
      });

      it('잘못된 PIN 입력 시 실패 및 남은 횟수 반환', async () => {
        mockCrypto.digestStringAsync.mockResolvedValue('wrong_hash');
        mockSecureStorage.getItem.mockImplementation((key) => {
          if (key === SecureStorageKeys.LOCKOUT_TIME) return Promise.resolve(null);
          if (key === SecureStorageKeys.PIN_ATTEMPTS) return Promise.resolve('0');
          if (key === SecureStorageKeys.PIN_CODE) return Promise.resolve('correct_hash');
          return Promise.resolve(null);
        });
        mockSecureStorage.setItem.mockResolvedValue();

        const result = await authService.authenticateWithPin('0000');

        expect(result.success).toBe(false);
        expect(result.remainingAttempts).toBe(4); // 5 - 1 = 4
        expect(result.error).toContain('4회 남음');
      });

      it('PIN 미설정 시 에러 반환', async () => {
        mockSecureStorage.getItem.mockImplementation((key) => {
          if (key === SecureStorageKeys.PIN_CODE) return Promise.resolve(null);
          return Promise.resolve(null);
        });

        const result = await authService.authenticateWithPin('1234');

        expect(result.success).toBe(false);
        expect(result.error).toBe('PIN이 설정되지 않았습니다.');
      });

      it('5회 실패 시 잠금 설정', async () => {
        mockCrypto.digestStringAsync.mockResolvedValue('wrong_hash');
        mockSecureStorage.getItem.mockImplementation((key) => {
          if (key === SecureStorageKeys.LOCKOUT_TIME) return Promise.resolve(null);
          if (key === SecureStorageKeys.PIN_ATTEMPTS) return Promise.resolve('4'); // 이미 4회 실패
          if (key === SecureStorageKeys.PIN_CODE) return Promise.resolve('correct_hash');
          return Promise.resolve(null);
        });
        mockSecureStorage.setItem.mockResolvedValue();
        mockSecureStorage.removeItem.mockResolvedValue();

        const result = await authService.authenticateWithPin('0000');

        expect(result.success).toBe(false);
        expect(result.remainingAttempts).toBe(0);
        expect(result.error).toContain('5분간 잠금');
        // 잠금 시간 저장 확인
        expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
          SecureStorageKeys.LOCKOUT_TIME,
          expect.any(String)
        );
      });

      it('잠금 상태에서 시도 시 에러 반환', async () => {
        const lockoutTime = Date.now() - 1000; // 1초 전에 잠금
        mockSecureStorage.getItem.mockImplementation((key) => {
          if (key === SecureStorageKeys.LOCKOUT_TIME) return Promise.resolve(lockoutTime.toString());
          return Promise.resolve(null);
        });

        const result = await authService.authenticateWithPin('1234');

        expect(result.success).toBe(false);
        expect(result.remainingAttempts).toBe(0);
        expect(result.error).toContain('후에 다시 시도');
      });
    });
  });

  describe('getLockState', () => {
    it('잠금 시간 없으면 잠금 아님 반환', async () => {
      mockSecureStorage.getItem.mockResolvedValue(null);

      const result = await authService.getLockState();

      expect(result.isLocked).toBe(false);
    });

    it('잠금 시간 경과 전이면 잠금 상태 반환', async () => {
      const lockoutTime = Date.now() - 1000; // 1초 전에 잠금
      mockSecureStorage.getItem.mockResolvedValue(lockoutTime.toString());

      const result = await authService.getLockState();

      expect(result.isLocked).toBe(true);
      expect(result.remainingSeconds).toBeGreaterThan(0);
    });

    it('잠금 시간 경과 후에는 잠금 해제', async () => {
      const lockoutTime = Date.now() - (6 * 60 * 1000); // 6분 전 (5분 지남)
      mockSecureStorage.getItem.mockResolvedValue(lockoutTime.toString());
      mockSecureStorage.removeItem.mockResolvedValue();

      const result = await authService.getLockState();

      expect(result.isLocked).toBe(false);
      // 잠금 해제 확인
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(SecureStorageKeys.LOCKOUT_TIME);
    });
  });

  describe('biometric 설정', () => {
    it('생체인증 활성화 상태 조회', async () => {
      mockSecureStorage.getItem.mockResolvedValue('true');

      const result = await authService.isBiometricEnabled();

      expect(result).toBe(true);
      expect(mockSecureStorage.getItem).toHaveBeenCalledWith(SecureStorageKeys.BIOMETRIC_ENABLED);
    });

    it('생체인증 비활성화 상태 조회', async () => {
      mockSecureStorage.getItem.mockResolvedValue('false');

      const result = await authService.isBiometricEnabled();

      expect(result).toBe(false);
    });

    it('생체인증 활성화 설정', async () => {
      mockSecureStorage.setItem.mockResolvedValue();

      const result = await authService.setBiometricEnabled(true);

      expect(result).toBe(true);
      expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
        SecureStorageKeys.BIOMETRIC_ENABLED,
        'true'
      );
    });
  });
});
