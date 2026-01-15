import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { SelectChip } from '@/components/ui';
import { useUserStore } from '@/stores';
import { useProfile } from '@/hooks';
import {
  REGIONS,
  REGION_LABELS,
  INCOME_LEVELS,
  INCOME_LEVEL_LABELS,
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_STATUS_LABELS,
  type Region,
  type IncomeLevel,
  type EmploymentStatus,
} from '@/types';

// 출생년도 범위 (1991-2007, 19-34세)
const BIRTH_YEARS = Array.from({ length: 17 }, (_, i) => 2007 - i);

/**
 * 프로필 수정 화면
 * - 기존 프로필 정보 수정
 * - 변경사항 확인 후 저장
 */
export default function ProfileEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useUserStore();
  const { saveProfile, isLoading } = useProfile();

  // 폼 상태
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [incomeLevel, setIncomeLevel] = useState<IncomeLevel | null>(null);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | null>(null);

  // 초기 값 설정
  useEffect(() => {
    if (profile) {
      setBirthYear(profile.birthYear);
      setRegion(profile.region);
      setIncomeLevel(profile.incomeLevel ?? null);
      setEmploymentStatus(profile.employmentStatus ?? null);
    }
  }, [profile]);

  // 변경사항 확인
  const hasChanges =
    profile &&
    (birthYear !== profile.birthYear ||
      region !== profile.region ||
      incomeLevel !== profile.incomeLevel ||
      employmentStatus !== profile.employmentStatus);

  // 필수 항목 확인
  const isValid = birthYear !== null && region !== null;

  const handleSave = () => {
    if (!isValid || !hasChanges) return;

    // 변경사항 확인 다이얼로그
    Alert.alert(
      '프로필 수정',
      '변경사항을 저장하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '저장',
          onPress: async () => {
            // Zustand 업데이트
            updateProfile({
              birthYear: birthYear!,
              region: region!,
              incomeLevel: incomeLevel ?? undefined,
              employmentStatus: employmentStatus ?? undefined,
            });

            // Secure storage 저장
            const result = await saveProfile();

            if (result.success) {
              // 저장 성공 알림
              Alert.alert(
                '저장 완료',
                '프로필이 저장되었습니다.',
                [{ text: '확인', onPress: () => router.back() }]
              );
            } else {
              Alert.alert('저장 오류', result.error ?? '저장에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        '변경사항 취소',
        '변경사항이 저장되지 않습니다. 취소하시겠습니까?',
        [
          { text: '계속 수정', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 출생년도 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>출생년도</Text>
          <View style={styles.chipGrid}>
            {BIRTH_YEARS.map((year) => (
              <SelectChip
                key={year}
                label={`${year}년`}
                selected={birthYear === year}
                onPress={() => setBirthYear(birthYear === year ? null : year)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        {/* 지역 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지역</Text>
          <View style={styles.chipGrid}>
            {REGIONS.map((r) => (
              <SelectChip
                key={r}
                label={REGION_LABELS[r]}
                selected={region === r}
                onPress={() => setRegion(region === r ? null : r)}
                style={styles.chip}
              />
            ))}
          </View>
        </View>

        {/* 소득수준 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소득수준 (선택)</Text>
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

        {/* 취업상태 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>취업상태 (선택)</Text>
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
          style={styles.cancelButton}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="취소"
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isValid || !hasChanges || isLoading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!isValid || !hasChanges || isLoading}
          accessibilityRole="button"
          accessibilityLabel="저장"
          accessibilityState={{ disabled: !isValid || !hasChanges || isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator color={Palette.white} />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                (!isValid || !hasChanges) && styles.saveButtonTextDisabled,
              ]}
            >
              저장
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
    color: Palette.gray900,
    marginBottom: Spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chipList: {
    gap: Spacing.sm,
  },
  chip: {
    marginBottom: Spacing.xs,
  },
  fullWidthChip: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.gray100,
    backgroundColor: Palette.background,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Palette.gray100,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
  },
  cancelButtonText: {
    color: Palette.gray700,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
  },
  saveButtonDisabled: {
    backgroundColor: Palette.gray200,
  },
  saveButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
  saveButtonTextDisabled: {
    color: Palette.gray400,
  },
});
