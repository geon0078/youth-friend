import { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { Palette, Radius, Spacing } from '@/design-system';

type CardVariant = 'surface' | 'outlined';

type CardProps = PropsWithChildren<{
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: keyof typeof Spacing | number;
}>;

export function Card({ variant = 'surface', padding = 'lg', style, children }: CardProps) {
  const paddingValue = typeof padding === 'string' ? Spacing[padding] : padding;
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: variant === 'surface' ? Palette.surface : 'transparent',
          borderWidth: variant === 'outlined' ? 1 : 0,
          padding: paddingValue,
        },
        variant === 'outlined' && { borderColor: Palette.border },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
});
