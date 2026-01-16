/**
 * 알림 설정 컴포넌트
 * Story 6.6: Implement Notification Settings Screen
 *
 * 카테고리별 알림 설정 및 방해 금지 시간 설정
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores';
import { useNotificationPermission } from '@/hooks';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';

interface NotificationSettingsProps {
  /** 컴포넌트 스타일 */
  style?: object;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 설정 토글 아이템
 */
function SettingToggle({
  icon,
  label,
  description,
  value,
  onChange,
  disabled,
  colorScheme,
}: {
  icon: string;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  return (
    <View
      style={[
        styles.settingItem,
        { backgroundColor: surfaceColor },
        disabled && styles.settingItemDisabled,
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: Palette.primaryBackground }]}>
        <IconSymbol
          name={icon as any}
          size={20}
          color={disabled ? Palette.textMuted : Palette.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingLabel,
            { color: disabled ? mutedTextColor : textColor },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, { color: mutedTextColor }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: Palette.border, true: Palette.primary }}
        thumbColor={Platform.OS === 'android' ? Palette.surface : undefined}
        ios_backgroundColor={Palette.border}
      />
    </View>
  );
}

/**
 * 알림 설정 컴포넌트
 */
export function NotificationSettings({
  style,
  testID = 'notification-settings',
}: NotificationSettingsProps) {
  const colorScheme = useColorScheme();
  const { status: permissionStatus, request: requestPermission } = useNotificationPermission();

  const settings = useAppStore((state) => state.settings);
  const toggleNotifications = useAppStore((state) => state.toggleNotifications);
  const toggleDeadlineAlert = useAppStore((state) => state.toggleDeadlineAlert);
  const toggleNewBenefitAlert = useAppStore((state) => state.toggleNewBenefitAlert);
  const toggleResultAlert = useAppStore((state) => state.toggleResultAlert);

  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const backgroundColor = getSemanticColor(colorScheme, 'background');

  // 권한이 없는 경우 전체 알림 비활성화
  const permissionDenied = permissionStatus === 'denied';
  const isDisabled = !settings.notificationsEnabled || permissionDenied;

  // 전체 알림 토글 핸들러
  const handleMasterToggle = async (value: boolean) => {
    if (value && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }
    toggleNotifications(value);
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]} testID={testID}>
      {/* 권한 경고 */}
      {permissionDenied && (
        <View style={styles.warningBanner}>
          <IconSymbol name="exclamationmark.triangle.fill" size={18} color={Palette.warning} />
          <Text style={styles.warningText}>
            알림이 시스템 설정에서 꺼져 있습니다. 설정에서 알림을 허용해주세요.
          </Text>
        </View>
      )}

      {/* 전체 알림 설정 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: mutedTextColor }]}>
          전체 설정
        </Text>
        <SettingToggle
          icon="bell.fill"
          label="알림 받기"
          description="모든 알림을 끄거나 켭니다"
          value={settings.notificationsEnabled && !permissionDenied}
          onChange={handleMasterToggle}
          colorScheme={colorScheme}
        />
      </View>

      {/* 카테고리별 알림 설정 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: mutedTextColor }]}>
          알림 종류
        </Text>

        <SettingToggle
          icon="clock.badge.exclamationmark"
          label="마감 임박 알림"
          description="혜택 신청 마감 7일, 3일, 1일 전 알림"
          value={settings.deadlineAlertEnabled}
          onChange={toggleDeadlineAlert}
          disabled={isDisabled}
          colorScheme={colorScheme}
        />

        <SettingToggle
          icon="star.fill"
          label="신규 혜택 알림"
          description="새로운 혜택이 추가되면 알림"
          value={settings.newBenefitAlertEnabled}
          onChange={toggleNewBenefitAlert}
          disabled={isDisabled}
          colorScheme={colorScheme}
        />

        <SettingToggle
          icon="checkmark.circle.fill"
          label="신청 결과 알림"
          description="신청 상태가 변경되면 알림"
          value={settings.resultAlertEnabled}
          onChange={toggleResultAlert}
          disabled={isDisabled}
          colorScheme={colorScheme}
        />
      </View>

      {/* 알림 정보 */}
      <View style={styles.infoSection}>
        <IconSymbol name="info.circle" size={16} color={mutedTextColor} />
        <Text style={[styles.infoText, { color: mutedTextColor }]}>
          알림 설정은 즉시 적용됩니다.{'\n'}
          하루에 최대 5개의 알림이 발송됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.warningBackground,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
  },
  warningText: {
    flex: 1,
    ...Typography.caption,
    color: Palette.warning,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    ...Typography.labelBold,
  },
  settingDescription: {
    ...Typography.caption,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  infoText: {
    flex: 1,
    ...Typography.caption,
    lineHeight: 18,
  },
});
