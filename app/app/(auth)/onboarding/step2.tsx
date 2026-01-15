import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { ProgressIndicator } from '@/components/onboarding';
import { SelectChip } from '@/components/ui';
import { useUserStore } from '@/stores';
import {
  INCOME_LEVELS,
  INCOME_LEVEL_LABELS,
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_STATUS_LABELS,
  type IncomeLevel,
  type EmploymentStatus,
} from '@/types';

/**
 * Onboarding Step 2 - 경제 정보
 * - 소득수준 선택 (선택사항)
 * - 취업상태 선택 (선택사항)
 */
export default function OnboardingStep2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useUserStore();

  const [incomeLevel, setIncomeLevel] = useState<IncomeLevel | null>(null);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | null>(null);

  // 선택 사항이므로 항상 다음으로 이동 가능
  const handleNext = () => {
    // Zustand에 저장 (선택한 경우에만)
    if (incomeLevel !== null) {
      updateProfile({ incomeLevel });
    }
    if (employmentStatus !== null) {
      updateProfile({ employmentStatus });
    }

    // 다음 단계로 이동 (개인정보 동의)
    router.push('./step3');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    // 건너뛰기 - 아무것도 저장하지 않고 다음 단계로
    router.push('./step3');
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
        <ProgressIndicator currentStep={2} totalSteps={3} />
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="건너뛰기"
        >
          <Text style={styles.skipButtonText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>경제 정보를 알려주세요</Text>
        <Text style={styles.subtitle}>
          더 정확한 혜택 매칭을 위해 활용됩니다
        </Text>
        <Text style={styles.optionalText}>
          * 선택 사항입니다. 건너뛰어도 됩니다.
        </Text>

        {/* Income Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소득수준</Text>
          <Text style={styles.sectionHint}>
            {incomeLevel
              ? INCOME_LEVEL_LABELS[incomeLevel]
              : '가구 소득 기준으로 선택해주세요'}
          </Text>
          <View style={styles.chipList}>
            {INCOME_LEVELS.map((level) => (
              <SelectChip
                key={level}
                label={INCOME_LEVEL_LABELS[level]}
                selected={incomeLevel === level}
                onPress={() => setIncomeLevel(incomeLevel === level ? null : level)}
                style={styles.fullWidthChip}
              />
            ))}
          </View>
        </View>

        {/* Employment Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>취업상태</Text>
          <Text style={styles.sectionHint}>
            {employmentStatus
              ? EMPLOYMENT_STATUS_LABELS[employmentStatus]
              : '현재 취업 상태를 선택해주세요'}
          </Text>
          <View style={styles.chipGrid}>
            {EMPLOYMENT_STATUSES.map((status) => (
              <SelectChip
                key={status}
                label={EMPLOYMENT_STATUS_LABELS[status]}
                selected={employmentStatus === status}
                onPress={() => setEmploymentStatus(employmentStatus === status ? null : status)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="다음 단계로 이동"
        >
          <Text style={styles.nextButtonText}>다음</Text>
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
    marginBottom: Spacing.xs,
  },
  optionalText: {
    fontSize: Typography.fontSize.caption,
    color: Palette.warning,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
    color: Palette.gray900,
    marginBottom: Spacing.xs,
  },
  sectionHint: {
    fontSize: Typography.fontSize.body,
    color: Palette.primary,
    marginBottom: Spacing.md,
  },
  chipList: {
    gap: Spacing.sm,
  },
  fullWidthChip: {
    width: '100%',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    marginBottom: Spacing.xs,
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
  nextButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
