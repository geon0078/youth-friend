/**
 * 접근성 설정 화면
 * Story 7.6: Implement Accessibility Settings Screen
 */
import { StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccessibilitySettings } from '@/components/accessibility';
import { getSemanticColor } from '@/design-system';

export default function AccessibilitySettingsScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = getSemanticColor(colorScheme, 'background');

  return (
    <>
      <Stack.Screen
        options={{
          title: '접근성 설정',
          headerBackTitle: '뒤로',
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['bottom']}
      >
        <ScrollView style={styles.scrollView}>
          <AccessibilitySettings />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
