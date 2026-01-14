import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Palette, Radius, Spacing } from '@/design-system';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ label, selected, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, selected && styles.active, style]}
      accessibilityState={{ selected }}>
      <Text style={[styles.label, selected && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: '#EFF2FB',
  },
  active: {
    backgroundColor: Palette.primary,
  },
  label: {
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  activeLabel: {
    color: Palette.textOnPrimary,
  },
});
