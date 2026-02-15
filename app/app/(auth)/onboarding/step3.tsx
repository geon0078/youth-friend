import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { ProgressIndicator } from '@/components/onboarding';
import { useUserStore } from '@/stores';
import { useProfile } from '@/hooks';
import type { ConsentItems } from '@/types';

/**
 * 동의 항목 정의
 */
interface ConsentItemConfig {
  key: keyof ConsentItems;
  label: string;
  required: boolean;
  detailUrl?: string;
}

const CONSENT_ITEMS: ConsentItemConfig[] = [
  {
    key: 'termsOfService',
    label: '서비스 이용약관',
    required: true,
    detailUrl: 'https://example.com/terms', // TODO: 실제 URL로 교체
  },
  {
    key: 'privacyPolicy',
    label: '개인정보 처리방침',
    required: true,
    detailUrl: 'https://example.com/privacy', // TODO: 실제 URL로 교체
  },
  {
    key: 'marketingNotifications',
    label: '마케팅 알림 수신',
    required: false,
  },
];

/**
 * 체크박스 컴포넌트
 */
function Checkbox({
  checked,
  onPress,
  label,
  required,
  onDetailPress,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  required: boolean;
  onDetailPress?: () => void;
}) {
  return (
    <View style={styles.checkboxRow}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={onPress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`${label} ${required ? '(필수)' : '(선택)'}`}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.checkboxLabel}>
            {required && <Text style={styles.requiredMark}>[필수] </Text>}
            {!required && <Text style={styles.optionalMark}>[선택] </Text>}
            {label}
          </Text>
        </View>
      </TouchableOpacity>
      {onDetailPress && (
        <TouchableOpacity
          onPress={onDetailPress}
          style={styles.detailButton}
          accessibilityRole="button"
          accessibilityLabel={`${label} 상세 보기`}
        >
          <Text style={styles.detailButtonText}>보기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Onboarding Step 3 - 개인정보 동의
 * - 필수 동의: 서비스 이용약관, 개인정보 처리방침
 * - 선택 동의: 마케팅 알림 수신
 */
export default function OnboardingStep3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    consentItems,
    hasConsented,
    updateConsentItem,
    setAllConsent,
    completeOnboarding,
  } = useUserStore();
  const { saveProfile, isLoading } = useProfile();

  // 전체 동의 상태 계산
  const allChecked = Object.values(consentItems).every(Boolean);

  const handleToggleAll = () => {
    setAllConsent(!allChecked);
  };

  const handleToggleItem = (key: keyof ConsentItems) => {
    updateConsentItem(key, !consentItems[key]);
  };

  const handleDetailPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    if (!hasConsented || isLoading) return;

    // 프로필을 secure storage에 저장 (FR24)
    const result = await saveProfile();

    if (!result.success) {
      // 저장 실패 시 사용자에게 알림
      Alert.alert(
        '저장 오류',
        result.error ?? '프로필 저장에 실패했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    // 온보딩 완료 처리
    completeOnboarding();

    // PIN 설정 화면으로 이동
    router.replace('../pin-setup' as any);
  };

  const handleBack = () => {
    router.back();
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
        <ProgressIndicator currentStep={3} totalSteps={3} />
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>서비스 이용 동의</Text>
        <Text style={styles.subtitle}>
          서비스 이용을 위해 아래 약관에 동의해주세요
        </Text>

        {/* 전체 동의 */}
        <TouchableOpacity
          style={styles.allAgreeContainer}
          onPress={handleToggleAll}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allChecked }}
          accessibilityLabel="전체 동의"
        >
          <View style={[styles.checkbox, styles.checkboxLarge, allChecked && styles.checkboxChecked]}>
            {allChecked && <Text style={styles.checkmarkLarge}>✓</Text>}
          </View>
          <Text style={styles.allAgreeText}>전체 동의</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 개별 동의 항목 */}
        <View style={styles.consentList}>
          {CONSENT_ITEMS.map((item) => (
            <Checkbox
              key={item.key}
              checked={consentItems[item.key]}
              onPress={() => handleToggleItem(item.key)}
              label={item.label}
              required={item.required}
              onDetailPress={item.detailUrl ? () => handleDetailPress(item.detailUrl!) : undefined}
            />
          ))}
        </View>

        {/* 안내 문구 */}
        <Text style={styles.infoText}>
          필수 항목에 동의하지 않으면 서비스 이용이 제한됩니다.
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!hasConsented || isLoading) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!hasConsented || isLoading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isLoading ? '저장 중' : '동의하고 시작하기'}
          accessibilityState={{ disabled: !hasConsented || isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator color={Palette.gray400} />
          ) : (
            <Text
              style={[
                styles.completeButtonText,
                !hasConsented && styles.completeButtonTextDisabled,
              ]}
            >
              동의하고 시작하기
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
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    color: Palette.gray900,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray500,
    marginBottom: Spacing.xl,
  },
  allAgreeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    minHeight: Accessibility.minTouchTarget,
  },
  allAgreeText: {
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
    color: Palette.gray900,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.gray200,
    marginVertical: Spacing.md,
  },
  consentList: {
    gap: Spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Accessibility.minTouchTarget,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  },
  checkboxLarge: {
    width: 28,
    height: 28,
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
  checkmarkLarge: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
  },
  labelContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  checkboxLabel: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray700,
  },
  requiredMark: {
    color: Palette.danger,
    fontWeight: Typography.fontWeight.semiBold,
  },
  optionalMark: {
    color: Palette.gray500,
  },
  detailButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  detailButtonText: {
    fontSize: Typography.fontSize.caption,
    color: Palette.primary,
    textDecorationLine: 'underline',
  },
  infoText: {
    fontSize: Typography.fontSize.caption,
    color: Palette.gray500,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.gray100,
    backgroundColor: Palette.background,
  },
  completeButton: {
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
  },
  completeButtonDisabled: {
    backgroundColor: Palette.gray200,
  },
  completeButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
  completeButtonTextDisabled: {
    color: Palette.gray400,
  },
});
