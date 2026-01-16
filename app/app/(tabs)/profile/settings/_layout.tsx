/**
 * Settings Layout
 */
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSemanticColor } from '@/design-system';

export default function SettingsLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const textColor = getSemanticColor(colorScheme, 'text');

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor },
        headerTintColor: textColor,
        headerTitleStyle: { color: textColor },
      }}
    />
  );
}
