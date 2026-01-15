import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { ProgressIndicator } from '@/components/onboarding';
import { SelectChip } from '@/components/ui';
import { useUserStore } from '@/stores';
import { REGIONS, REGION_LABELS, type Region } from '@/types';

// 출생년도 범위 (2026년 기준 19-34세)
const CURRENT_YEAR = 2026;
const MIN_BIRTH_YEAR = 1991;
const MAX_BIRTH_YEAR = 2007;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i
);

/**
 * Onboarding Step 1 - 기본 정보
 * - 출생년도 선택
 * - 지역 선택
 */
export default function OnboardingStep1() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useUserStore();

  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const isValid = birthYear !== null && region !== null;

  const handleNext = () => {
    if (!isValid) return;

    // Zustand에 임시 저장
    updateProfile({
      birthYear,
      region,
    });

    // 다음 단계로 이동
    router.push('./step2');
  };

  const handleBack = () => {
    router.back();
  };

  const getAge = (year: number) => CURRENT_YEAR - year;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
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
          <ProgressIndicator currentStep={1} totalSteps={3} />
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>기본 정보를 알려주세요</Text>
          <Text style={styles.subtitle}>
            맞춤 혜택을 추천해 드릴게요
          </Text>

          {/* Birth Year Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>출생년도</Text>
            <Text style={styles.sectionHint}>
              {birthYear
                ? `만 ${getAge(birthYear)}세`
                : '태어난 연도를 선택해주세요'}
            </Text>
            <View style={styles.chipGrid}>
              {BIRTH_YEARS.map((year) => (
                <SelectChip
                  key={year}
                  label={`${year}년`}
                  selected={birthYear === year}
                  onPress={() => setBirthYear(year)}
                  accessibilityLabel={`${year}년, 만 ${getAge(year)}세`}
                  style={styles.chip}
                />
              ))}
            </View>
          </View>

          {/* Region Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>거주 지역</Text>
            <Text style={styles.sectionHint}>
              {region
                ? REGION_LABELS[region]
                : '거주하는 지역을 선택해주세요'}
            </Text>
            <View style={styles.chipGrid}>
              {REGIONS.map((r) => (
                <SelectChip
                  key={r}
                  label={REGION_LABELS[r]}
                  selected={region === r}
                  onPress={() => setRegion(r)}
                  style={styles.chip}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity
            style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="다음 단계로 이동"
            accessibilityState={{ disabled: !isValid }}
          >
            <Text
              style={[
                styles.nextButtonText,
                !isValid && styles.nextButtonTextDisabled,
              ]}
            >
              다음
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    flex: 1,
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
  nextButtonDisabled: {
    backgroundColor: Palette.gray200,
  },
  nextButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
  nextButtonTextDisabled: {
    color: Palette.gray400,
  },
});
