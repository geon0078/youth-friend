import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { authService, sessionManager, type LockState } from '@/services/auth';

/**
 * PIN 입력 컴포넌트
 */
function PinInput({
  value,
  onChangeText,
  autoFocus,
  editable,
}: {
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableOpacity
      style={styles.pinInputContainer}
      onPress={() => inputRef.current?.focus()}
      activeOpacity={1}
      disabled={!editable}
      accessibilityRole="button"
      accessibilityLabel="PIN 입력"
    >
      <View style={styles.pinDots}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < value.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
          onChangeText(numericText);
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus={autoFocus}
        editable={editable}
        secureTextEntry
        accessibilityLabel="PIN 입력 필드"
      />
    </TouchableOpacity>
  );
}

/**
 * 잠금 화면
 * - 생체인증 또는 PIN 입력
 * - 5회 실패 시 5분 잠금
 */
export default function LockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockState, setLockState] = useState<LockState>({ isLocked: false });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 잠금 상태 갱신 타이머
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 초기 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      const [lockSt, bioEnabled, bioAvailable] = await Promise.all([
        authService.getLockState(),
        authService.isBiometricEnabled(),
        authService.isBiometricAvailable(),
      ]);

      setLockState(lockSt);
      setBiometricEnabled(bioEnabled);
      setBiometricAvailable(bioAvailable);

      // 잠금 상태가 아니고 생체인증이 활성화되어 있으면 자동 시도
      if (!lockSt.isLocked && bioEnabled && bioAvailable) {
        attemptBiometric();
      }
    };

    loadSettings();

    return () => {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
      }
    };
  }, []);

  // 잠금 타이머 시작
  useEffect(() => {
    if (lockState.isLocked) {
      lockTimerRef.current = setInterval(async () => {
        const newState = await authService.getLockState();
        setLockState(newState);

        if (!newState.isLocked && lockTimerRef.current) {
          clearInterval(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
      }
    };
  }, [lockState.isLocked]);

  // 앱 상태 변경 감지 (포그라운드 복귀 시 생체인증 시도)
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && biometricEnabled && biometricAvailable && !lockState.isLocked) {
        attemptBiometric();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [biometricEnabled, biometricAvailable, lockState.isLocked]);

  // 생체인증 시도
  const attemptBiometric = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const result = await authService.authenticateWithBiometric();

    if (result.success) {
      sessionManager.unlockSession();
      router.replace('/(tabs)');
    } else if (result.error !== '취소됨') {
      setError(result.error ?? null);
    }

    setIsLoading(false);
  }, [isLoading, router]);

  // PIN 인증
  const handlePinSubmit = async () => {
    if (pin.length < 4 || isLoading || lockState.isLocked) return;

    setIsLoading(true);
    setError(null);

    const result = await authService.authenticateWithPin(pin);

    if (result.success) {
      sessionManager.unlockSession();
      router.replace('/(tabs)');
    } else {
      setError(result.error ?? 'PIN이 일치하지 않습니다.');
      setPin('');

      // 잠금 상태 갱신
      const newLockState = await authService.getLockState();
      setLockState(newLockState);
    }

    setIsLoading(false);
  };

  // PIN 입력 시 자동 제출
  useEffect(() => {
    if (pin.length >= 4 && !lockState.isLocked) {
      handlePinSubmit();
    }
  }, [pin]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        <Text style={styles.title}>청년친구</Text>
        <Text style={styles.subtitle}>
          {lockState.isLocked
            ? `${formatTime(lockState.remainingSeconds ?? 0)} 후에 다시 시도해주세요`
            : 'PIN을 입력해주세요'}
        </Text>

        {lockState.isLocked ? (
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedText}>
              5회 실패로 잠금되었습니다
            </Text>
          </View>
        ) : (
          <>
            <PinInput
              value={pin}
              onChangeText={setPin}
              autoFocus={!biometricEnabled || !biometricAvailable}
              editable={!isLoading}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </>
        )}

        {/* 생체인증 버튼 */}
        {biometricEnabled && biometricAvailable && !lockState.isLocked && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={attemptBiometric}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="생체인증으로 잠금 해제"
          >
            <Text style={styles.biometricButtonText}>
              Face ID / 지문으로 잠금 해제
            </Text>
          </TouchableOpacity>
        )}

        {isLoading && !lockState.isLocked && (
          <ActivityIndicator
            size="small"
            color={Palette.primary}
            style={styles.loader}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  lockIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    color: Palette.gray900,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray500,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  pinInputContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  pinDots: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Palette.gray300,
    backgroundColor: Palette.white,
  },
  pinDotFilled: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    fontSize: Typography.fontSize.body,
    color: Palette.danger,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  lockedContainer: {
    backgroundColor: Palette.danger,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
  },
  lockedText: {
    fontSize: Typography.fontSize.body,
    color: Palette.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
  biometricButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.primary,
    minHeight: Accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricButtonText: {
    fontSize: Typography.fontSize.body,
    color: Palette.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  loader: {
    marginTop: Spacing.lg,
  },
});
