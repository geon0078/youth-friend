import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Radius, Typography, Accessibility } from '@/constants';
import { useUserStore } from '@/stores';
import { dataManager } from '@/services/storage';
import { sessionManager } from '@/services/auth';
import {
  REGION_LABELS,
  INCOME_LEVEL_LABELS,
  EMPLOYMENT_STATUS_LABELS,
} from '@/types';

/**
 * 프로필 정보 항목 컴포넌트
 */
function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

/**
 * 프로필 화면
 * - 현재 저장된 프로필 정보 표시
 * - 수정 버튼으로 수정 화면 이동
 * - 데이터 삭제 기능
 */
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, clearProfile } = useUserStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push('./edit');
  };

  const handleDeleteData = () => {
    Alert.alert(
      '데이터 삭제',
      '모든 개인정보와 앱 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n\n정말 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: confirmDeleteData,
        },
      ],
    );
  };

  const confirmDeleteData = async () => {
    setIsDeleting(true);

    try {
      // 모든 데이터 삭제
      const result = await dataManager.clearAllData();

      if (result.success) {
        // Zustand 스토어 초기화
        clearProfile();

        // 세션 데이터 클리어
        sessionManager.clearSessionData();

        // 성공 알림 후 온보딩으로 이동
        Alert.alert(
          '삭제 완료',
          '모든 데이터가 삭제되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                router.replace('/(auth)/welcome' as any);
              },
            },
          ],
        );
      } else {
        Alert.alert('오류', result.error ?? '데이터 삭제 중 오류가 발생했습니다.');
      }
    } catch {
      Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 프로필이 없는 경우
  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>프로필 정보가 없습니다.</Text>
        <Text style={styles.emptySubtext}>온보딩을 완료해주세요.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 프로필 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <View style={styles.card}>
          <ProfileItem
            label="출생년도"
            value={`${profile.birthYear}년 (${new Date().getFullYear() - profile.birthYear}세)`}
          />
          <View style={styles.divider} />
          <ProfileItem
            label="지역"
            value={REGION_LABELS[profile.region]}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>경제 정보</Text>
        <View style={styles.card}>
          <ProfileItem
            label="소득수준"
            value={
              profile.incomeLevel
                ? INCOME_LEVEL_LABELS[profile.incomeLevel]
                : '미입력'
            }
          />
          <View style={styles.divider} />
          <ProfileItem
            label="취업상태"
            value={
              profile.employmentStatus
                ? EMPLOYMENT_STATUS_LABELS[profile.employmentStatus]
                : '미입력'
            }
          />
        </View>
      </View>

      {/* 수정 버튼 */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEdit}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="프로필 수정"
      >
        <Text style={styles.editButtonText}>프로필 수정</Text>
      </TouchableOpacity>

      {/* 설정 섹션 */}
      <View style={[styles.section, styles.settingsSection]}>
        <Text style={styles.sectionTitle}>설정</Text>
        <View style={styles.card}>
          {/* 알림 설정 */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('./settings/notifications')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="알림 설정"
            accessibilityHint="알림 설정 화면으로 이동합니다"
          >
            <Text style={styles.settingItemText}>알림 설정</Text>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* 접근성 설정 */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('./settings/accessibility')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="접근성 설정"
            accessibilityHint="접근성 설정 화면으로 이동합니다"
          >
            <Text style={styles.settingItemText}>접근성 설정</Text>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* 데이터 삭제 */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteData}
            disabled={isDeleting}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="모든 데이터 삭제"
            accessibilityHint="모든 개인정보와 앱 데이터를 삭제합니다"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Palette.danger} />
            ) : (
              <>
                <Text style={styles.deleteButtonText}>데이터 삭제</Text>
                <Text style={styles.deleteButtonSubtext}>
                  모든 개인정보와 앱 데이터 삭제
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundSecondary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
    color: Palette.gray700,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray500,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semiBold,
    color: Palette.gray500,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  profileLabel: {
    fontSize: Typography.fontSize.body,
    color: Palette.gray500,
  },
  profileValue: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    color: Palette.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.gray100,
    marginVertical: Spacing.xs,
  },
  editButton: {
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Accessibility.minTouchTarget,
    marginTop: Spacing.md,
  },
  editButtonText: {
    color: Palette.white,
    fontSize: Typography.fontSize.subtitle,
    fontWeight: Typography.fontWeight.semiBold,
  },
  settingsSection: {
    marginTop: Spacing.xl,
  },
  deleteButton: {
    paddingVertical: Spacing.md,
    minHeight: Accessibility.minTouchTarget,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    color: Palette.danger,
  },
  deleteButtonSubtext: {
    fontSize: Typography.fontSize.caption,
    color: Palette.gray500,
    marginTop: Spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    minHeight: Accessibility.minTouchTarget,
  },
  settingItemText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    color: Palette.gray900,
  },
  settingItemArrow: {
    fontSize: 20,
    color: Palette.gray400,
  },
});
