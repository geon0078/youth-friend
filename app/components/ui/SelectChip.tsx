import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Palette, Spacing, Typography, Radius, Accessibility } from '@/constants';

interface SelectChipProps {
  /** 표시 레이블 */
  label: string;
  /** 선택 여부 */
  selected: boolean;
  /** 선택 시 콜백 */
  onPress: () => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 스타일 */
  style?: ViewStyle;
  /** 접근성 레이블 */
  accessibilityLabel?: string;
}

/**
 * 선택 칩 컴포넌트
 * 선택 가능한 옵션을 칩 형태로 표시
 *
 * Note: 웹 플랫폼에서 onPress 이벤트가 작동하지 않는 알려진 이슈가 있습니다.
 * 네이티브(iOS/Android)에서는 정상 작동합니다.
 * @see https://github.com/necolas/react-native-web/issues/XXX
 */
export function SelectChip({
  label,
  selected,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: SelectChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        pressed && styles.chipPressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.gray300,
    backgroundColor: Palette.white,
    minHeight: Accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  chipDisabled: {
    borderColor: Palette.gray200,
    backgroundColor: Palette.gray100,
  },
  chipPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    color: Palette.gray700,
  },
  labelSelected: {
    color: Palette.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  labelDisabled: {
    color: Palette.gray400,
  },
});
