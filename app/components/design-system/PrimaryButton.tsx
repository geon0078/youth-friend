import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Palette, Radius, Spacing } from '@/design-system';

type Tone = 'primary' | 'inverse';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: Tone;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, disabled, tone = 'primary', style }: Props) {
  const backgroundColor = tone === 'primary' ? Palette.primary : Palette.surface;
  const textColor = tone === 'primary' ? Palette.textOnPrimary : Palette.primary;
  const disabledColor = tone === 'primary' ? '#9DB2FF' : '#DDE3FD';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor,
        },
        disabled && { backgroundColor: disabledColor },
        style,
      ]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
  },
});
