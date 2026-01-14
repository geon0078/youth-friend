import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing } from '@/design-system';

type Props = {
  label: string;
  tone?: 'default' | 'alert' | 'positive' | 'info';
};

export function Badge({ label, tone = 'default' }: Props) {
  const background = {
    default: '#E8EDFF',
    alert: '#FFE6D5',
    positive: '#DBF7F2',
    info: '#E5F3FF',
  }[tone];

  const textColor = {
    default: Palette.primary,
    alert: Palette.accent,
    positive: Palette.secondary,
    info: '#0066CC',
  }[tone];

  return (
    <View style={[styles.base, { backgroundColor: background }]}> 
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
