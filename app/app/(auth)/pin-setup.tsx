import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { authService } from '@/services/auth';

type Step = 'enter' | 'confirm';

/**
 * PIN 입력 컴포넌트
 */
function PinInput({
  value,
  onChangeText,
  autoFocus,
}: {
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableOpacity
      style={styles.pinInputContainer}
      onPress={() => inputRef.current?.focus()}
      activeOpacity={1}
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
              index < 4 && styles.pinDotRequired,
            ]}
          />
        ))}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => {
          // 숫자만 허용, 최대 6자리
          const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
          onChangeText(numericText);
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus={autoFocus}
        secureTextEntry
        accessibilityLabel="PIN 입력 필드"
      />
    </TouchableOpacity>
  );
}

/**
 * PIN 설정 화면
 * - 4-6자리 숫자 PIN 설정
 * - 확인을 위한 재입력
 */
export default function PinSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // 생체인증 사용 가능 여부 확인
  useState(() => {
    authService.isBiometricAvailable().then(setBiometricAvailable);
  });

  const isValidPin = pin.length >= 4 && pin.length <= 6;
  const isPinMatch = pin === confirmPin;

  const handleNext = () => {
    if (!isValidPin) {
      Alert.alert('알림', 'PIN은 4-6자리 숫자로 입력해주세요.');
      return;
    }
    setStep('confirm');
    setConfirmPin('');
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setConfirmPin('');
    } else {
      router.back();
    }
  };

  const handleComplete = async () => {
    if (!isPinMatch) {
      Alert.alert('알림', 'PIN이 일치하지 않습니다.');
      setConfirmPin('');
      return;
    }

    setIsLoading(true);

    try {
      // PIN 저장
      const pinSaved = await authService.setPin(pin);
      if (!pinSaved) {
        Alert.alert('오류', 'PIN 저장에 실패했습니다.');
        return;
      }

      // 생체인증 설정
      if (enableBiometric && biometricAvailable) {
        await authService.setBiometricEnabled(true);
      }

      // 홈 화면으로 이동
      router.replace('/(tabs)');
    } catch {
      Alert.alert('오류', 'PIN 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'PIN 설정 건너뛰기',
      'PIN을 설정하지 않으면 앱 보안이 약해집니다. 건너뛰시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '건너뛰기',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {step === 'enter' && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="건너뛰기"
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          {step === 'enter' ? 'PIN 설정' : 'PIN 확인'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'enter'
            ? '앱 보안을 위해 4-6자리 PIN을 설정해주세요'
            : 'PIN을 다시 입력해주세요'}
        </Text>

        <PinInput
          value={step === 'enter' ? pin : confirmPin}
          onChangeText={step === 'enter' ? setPin : setConfirmPin}
          autoFocus
        />

        <Text style={styles.pinHint}>
          {step === 'enter' ? `${pin.length}/6자리` : ''}
        </Text>

        {/* 생체인증 옵션 (첫 단계에서만) */}
        {step === 'enter' && biometricAvailable && (
          <TouchableOpacity
            style={styles.biometricOption}
            onPress={() => setEnableBiometric(!enableBiometric)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: enableBiometric }}
            accessibilityLabel="생체인증 사용"
          >
            <View
              style={[
                styles.checkbox,
                enableBiometric && styles.checkboxChecked,
              ]}
            >
              {enableBiometric && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.biometricLabel}>
              Face ID/지문 인식 사용
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (step === 'enter' ? !isValidPin : !isPinMatch || confirmPin.length < 4) &&
              styles.nextButtonDisabled,
          ]}
          onPress={step === 'enter' ? handleNext : handleComplete}
          disabled={
            step === 'enter'
              ? !isValidPin
              : !isPinMatch || confirmPin.length < 4 || isLoading
          }
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={step === 'enter' ? '다음' : '완료'}
        >
          {isLoading ? (
            <ActivityIndicator color={Palette.white} />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 'enter' ? '다음' : '완료'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Palette.gray700,
  },
  skipButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray500,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
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
  pinDotRequired: {
    // 처음 4개는 필수
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  pinHint: {
    fontSize: Typography.fontSize.caption,
    color: Palette.gray500,
    marginTop: Spacing.sm,
  },
  biometricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    minHeight: Accessibility.minTouchTarget,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Palette.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.white,
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkmark: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold,
  },
  biometricLabel: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray700,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.gray100,
    backgroundColor: Palette.background,
  },
  nextButton: {
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
  },
  nextButtonDisabled: {
    backgroundColor: Palette.gray200,
  },
  nextButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
