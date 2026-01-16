/**
 * AccessibilitySettings Component
 * Story 7.6: Implement Accessibility Settings Screen
 *
 * 접근성 설정 관리 UI
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores';
import { useAccessibility } from '@/hooks/use-accessibility';
import { getSemanticColor, Typography, Spacing, Radius } from '@/design-system';
import { TouchTargets } from '@/design-system/layout';
import type { TextSizePreference } from '@/design-system/typography';

/**
 * 섹션 헤더 컴포넌트
 */
function SectionHeader({ title, colorScheme }: { title: string; colorScheme: 'light' | 'dark' }) {
  const textColor = getSemanticColor(colorScheme, 'text');

  return (
    <View style={styles.sectionHeader}>
      <Text
        style={[styles.sectionTitle, { color: textColor }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
    </View>
  );
}

/**
 * 토글 설정 항목
 */
function SettingToggle({
  label,
  description,
  value,
  onValueChange,
  colorScheme,
  disabled = false,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colorScheme: 'light' | 'dark';
  disabled?: boolean;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');
  const borderColor = getSemanticColor(colorScheme, 'border');

  const handleChange = useCallback(
    (newValue: boolean) => {
      onValueChange(newValue);
      // 스크린 리더 사용자에게 변경 사항 알림
      AccessibilityInfo.announceForAccessibility(
        `${label} ${newValue ? '활성화' : '비활성화'}됨`
      );
    },
    [label, onValueChange]
  );

  return (
    <View
      style={[styles.settingRow, { borderBottomColor: borderColor }]}
      accessible={true}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: textColor }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: mutedColor }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ false: '#767577', true: '#0B4DFF' }}
        thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
      />
    </View>
  );
}

/**
 * 텍스트 크기 선택기
 */
function TextSizeSelector({
  currentSize,
  onSizeChange,
  colorScheme,
}: {
  currentSize: TextSizePreference;
  onSizeChange: (size: TextSizePreference) => void;
  colorScheme: 'light' | 'dark';
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');
  const borderColor = getSemanticColor(colorScheme, 'border');
  const primaryColor = '#0B4DFF';

  const sizes: { key: TextSizePreference; label: string; preview: number }[] = [
    { key: 'small', label: '작게', preview: 14 },
    { key: 'medium', label: '보통', preview: 16 },
    { key: 'large', label: '크게', preview: 20 },
  ];

  const handleSizeChange = useCallback(
    (size: TextSizePreference) => {
      onSizeChange(size);
      const sizeLabel = sizes.find((s) => s.key === size)?.label || size;
      AccessibilityInfo.announceForAccessibility(`텍스트 크기가 ${sizeLabel}로 변경되었습니다`);
    },
    [onSizeChange]
  );

  return (
    <View style={[styles.settingRow, { borderBottomColor: borderColor }]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: textColor }]}>텍스트 크기</Text>
        <Text style={[styles.settingDescription, { color: mutedColor }]}>
          앱 전체의 텍스트 크기를 조절합니다
        </Text>
      </View>
      <View
        style={styles.sizeOptions}
        accessibilityRole="radiogroup"
        accessibilityLabel="텍스트 크기 선택"
      >
        {sizes.map((size) => {
          const isSelected = currentSize === size.key;
          return (
            <Pressable
              key={size.key}
              style={[
                styles.sizeOption,
                { borderColor: isSelected ? primaryColor : borderColor },
                isSelected && { backgroundColor: primaryColor + '10' },
              ]}
              onPress={() => handleSizeChange(size.key)}
              accessibilityRole="radio"
              accessibilityLabel={`${size.label} 크기`}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={`탭하여 텍스트 크기를 ${size.label}로 변경`}
            >
              <Text
                style={[
                  styles.sizeLabel,
                  { fontSize: size.preview, color: isSelected ? primaryColor : textColor },
                ]}
              >
                가
              </Text>
              <Text
                style={[
                  styles.sizeName,
                  { color: isSelected ? primaryColor : mutedColor },
                ]}
              >
                {size.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * 시스템 접근성 정보 표시
 */
function SystemAccessibilityInfo({
  colorScheme,
}: {
  colorScheme: 'light' | 'dark';
}) {
  const { isScreenReaderEnabled, fontScale, isReduceMotionEnabled } =
    useAccessibility();
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'elevatedSurface');
  const borderColor = getSemanticColor(colorScheme, 'border');

  return (
    <View
      style={[
        styles.systemInfo,
        { backgroundColor: surfaceColor, borderColor },
      ]}
      accessible={true}
      accessibilityLabel="시스템 접근성 설정 정보"
    >
      <Text style={[styles.systemInfoTitle, { color: textColor }]}>
        시스템 접근성 설정
      </Text>
      <View style={styles.systemInfoRow}>
        <Text style={[styles.systemInfoLabel, { color: mutedColor }]}>
          스크린 리더:
        </Text>
        <Text style={[styles.systemInfoValue, { color: textColor }]}>
          {isScreenReaderEnabled ? '활성화' : '비활성화'}
        </Text>
      </View>
      <View style={styles.systemInfoRow}>
        <Text style={[styles.systemInfoLabel, { color: mutedColor }]}>
          시스템 글꼴 배율:
        </Text>
        <Text style={[styles.systemInfoValue, { color: textColor }]}>
          {(fontScale * 100).toFixed(0)}%
        </Text>
      </View>
      <View style={styles.systemInfoRow}>
        <Text style={[styles.systemInfoLabel, { color: mutedColor }]}>
          모션 감소:
        </Text>
        <Text style={[styles.systemInfoValue, { color: textColor }]}>
          {isReduceMotionEnabled ? '활성화' : '비활성화'}
        </Text>
      </View>
    </View>
  );
}

/**
 * 접근성 설정 컴포넌트
 */
export function AccessibilitySettings() {
  const systemScheme = useColorScheme();
  const colorScheme: 'light' | 'dark' = systemScheme === 'dark' ? 'dark' : 'light';
  const settings = useAppStore((s) => s.settings);
  const toggleHighContrast = useAppStore((s) => s.toggleHighContrast);
  const setTextSize = useAppStore((s) => s.setTextSize);
  const toggleReduceMotion = useAppStore((s) => s.toggleReduceMotion);

  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 시각 설정 */}
      <SectionHeader title="시각 설정" colorScheme={colorScheme} />
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <SettingToggle
          label="고대비 모드"
          description="텍스트와 배경의 대비를 높여 가독성을 향상시킵니다"
          value={settings.highContrastMode}
          onValueChange={toggleHighContrast}
          colorScheme={colorScheme}
        />
        <TextSizeSelector
          currentSize={settings.textSize}
          onSizeChange={setTextSize}
          colorScheme={colorScheme}
        />
      </View>

      {/* 모션 설정 */}
      <SectionHeader title="모션 설정" colorScheme={colorScheme} />
      <View style={[styles.section, { backgroundColor: surfaceColor }]}>
        <SettingToggle
          label="모션 감소"
          description="애니메이션과 전환 효과를 최소화합니다"
          value={settings.reduceMotion}
          onValueChange={toggleReduceMotion}
          colorScheme={colorScheme}
        />
      </View>

      {/* 시스템 정보 */}
      <SectionHeader title="시스템 정보" colorScheme={colorScheme} />
      <SystemAccessibilityInfo colorScheme={colorScheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.labelBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: TouchTargets.minimum,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
    fontWeight: '500',
  },
  settingDescription: {
    ...Typography.caption,
    marginTop: 2,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sizeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 2,
    minWidth: TouchTargets.minimum,
    minHeight: TouchTargets.minimum,
  },
  sizeLabel: {
    fontWeight: '600',
  },
  sizeName: {
    ...Typography.caption,
    marginTop: 2,
  },
  systemInfo: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  systemInfoTitle: {
    ...Typography.labelBold,
    marginBottom: Spacing.md,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  systemInfoLabel: {
    ...Typography.body,
  },
  systemInfoValue: {
    ...Typography.body,
    fontWeight: '600',
  },
});

export default AccessibilitySettings;
