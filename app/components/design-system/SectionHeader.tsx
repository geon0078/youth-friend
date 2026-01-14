import { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { Palette, Spacing, Typography } from '@/design-system';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
};

export function SectionHeader({ title, subtitle, action, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copyWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  copyWrapper: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.sectionTitle,
    color: Palette.textPrimary,
  },
  subtitle: {
    color: Palette.textMuted,
    fontSize: 14,
  },
});
