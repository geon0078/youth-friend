/**
 * 알림 설정 화면
 * Story 6.6: Implement Notification Settings Screen
 */
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotificationSettings } from '@/components/notifications';
import { getSemanticColor } from '@/design-system';

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = getSemanticColor(colorScheme, 'background');

  return (
    <>
      <Stack.Screen
        options={{
          title: '알림 설정',
          headerBackTitle: '뒤로',
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor }]}
        edges={['bottom']}
      >
        <ScrollView style={styles.scrollView}>
          <NotificationSettings />
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
