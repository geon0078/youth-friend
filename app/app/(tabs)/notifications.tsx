/**
 * 알림 내역 화면
 * Story 6.7: Implement Notification History Screen
 */
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks';
import { NotificationList } from '@/components/notifications';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Spacing, Typography, getSemanticColor } from '@/design-system';
import { clearAllNotifications } from '@/services/notifications';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const {
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    refresh,
  } = useNotifications();

  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');
  const textColor = getSemanticColor(colorScheme, 'text');

  // 전체 읽음 처리
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;

    Alert.alert(
      '모두 읽음으로 표시',
      `${unreadCount}개의 알림을 읽음으로 표시할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => markAllNotificationsAsRead(),
        },
      ]
    );
  }, [unreadCount, markAllNotificationsAsRead]);

  // 전체 삭제
  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;

    Alert.alert(
      '알림 전체 삭제',
      '모든 알림을 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            clearAllNotifications();
            refresh();
          },
        },
      ]
    );
  }, [notifications.length, refresh]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: surfaceColor }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: textColor }]}>알림</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllAsRead}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="모두 읽음으로 표시"
            >
              <IconSymbol
                name="checkmark.circle"
                size={22}
                color={Palette.primary}
              />
            </Pressable>
          )}

          {notifications.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="모든 알림 삭제"
            >
              <IconSymbol name="trash" size={22} color={Palette.error} />
            </Pressable>
          )}
        </View>
      </View>

      {/* 알림 목록 */}
      <NotificationList onRefresh={refresh} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.sectionTitle,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    color: Palette.textOnPrimary,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
});
