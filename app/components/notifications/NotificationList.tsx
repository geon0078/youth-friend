/**
 * 알림 내역 목록 컴포넌트
 * Story 6.7: Implement Notification History Screen
 *
 * 받은 알림 내역을 표시
 */
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks';
import {
  Palette,
  Spacing,
  Radius,
  Typography,
  getSemanticColor,
} from '@/design-system';
import type { StoredNotification } from '@/types/models/notification';
import {
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
} from '@/types/models/notification';

interface NotificationListProps {
  /** 새로고침 콜백 */
  onRefresh?: () => void;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 시간 포맷팅
 */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 날짜 헤더 포맷팅
 */
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = date.toISOString().split('T')[0];
  const todayOnly = today.toISOString().split('T')[0];
  const yesterdayOnly = yesterday.toISOString().split('T')[0];

  if (dateOnly === todayOnly) return '오늘';
  if (dateOnly === yesterdayOnly) return '어제';

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

/**
 * 알림 아이템 컴포넌트
 */
function NotificationItem({
  notification,
  onPress,
  colorScheme,
}: {
  notification: StoredNotification;
  onPress: (notification: StoredNotification) => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');
  const surfaceColor = getSemanticColor(colorScheme, 'surface');

  const icon = NOTIFICATION_TYPE_ICONS[notification.type] || 'bell.fill';
  const typeLabel = NOTIFICATION_TYPE_LABELS[notification.type] || '알림';

  const iconColor = notification.isRead ? Palette.textMuted : Palette.primary;
  const iconBgColor = notification.isRead
    ? Palette.background
    : Palette.primaryBackground;

  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.notificationItem,
        { backgroundColor: surfaceColor },
        !notification.isRead && styles.notificationUnread,
        pressed && styles.notificationPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}, ${notification.body}`}
      accessibilityHint="탭하여 자세히 보기"
    >
      {/* 아이콘 */}
      <View style={[styles.notificationIcon, { backgroundColor: iconBgColor }]}>
        <IconSymbol name={icon as any} size={20} color={iconColor} />
      </View>

      {/* 내용 */}
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              { color: notification.isRead ? mutedTextColor : textColor },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={[styles.notificationTime, { color: mutedTextColor }]}>
            {formatTime(notification.receivedAt)}
          </Text>
        </View>
        <Text
          style={[
            styles.notificationBody,
            { color: notification.isRead ? mutedTextColor : textColor },
          ]}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
        <View style={styles.notificationMeta}>
          <Text style={[styles.notificationType, { color: mutedTextColor }]}>
            {typeLabel}
          </Text>
        </View>
      </View>

      {/* 읽지 않음 표시 */}
      {!notification.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState({ colorScheme }: { colorScheme: ReturnType<typeof useColorScheme> }) {
  const textColor = getSemanticColor(colorScheme, 'text');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  return (
    <View style={styles.emptyState}>
      <IconSymbol name="bell.slash" size={64} color={Palette.border} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        알림이 없습니다
      </Text>
      <Text style={[styles.emptyDescription, { color: mutedTextColor }]}>
        마감 임박, 신규 혜택 등의 알림이{'\n'}여기에 표시됩니다
      </Text>
    </View>
  );
}

/**
 * 알림 내역 목록
 */
export function NotificationList({
  onRefresh,
  testID = 'notification-list',
}: NotificationListProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const {
    notifications,
    refresh,
    markNotificationAsRead,
  } = useNotifications();

  const backgroundColor = getSemanticColor(colorScheme, 'background');
  const mutedTextColor = getSemanticColor(colorScheme, 'mutedText');

  // 날짜별 그룹화
  const groupedNotifications = notifications.reduce<{
    date: string;
    data: StoredNotification[];
  }[]>((acc, notification) => {
    const date = notification.receivedAt.split('T')[0];
    const existingGroup = acc.find(g => g.date === date);

    if (existingGroup) {
      existingGroup.data.push(notification);
    } else {
      acc.push({ date, data: [notification] });
    }

    return acc;
  }, []);

  // 알림 탭 핸들러
  const handleNotificationPress = useCallback(
    (notification: StoredNotification) => {
      markNotificationAsRead(notification.id);

      // 딥링크로 이동
      if (notification.data?.deepLink) {
        router.push(notification.data.deepLink as Href);
      } else if (notification.data?.benefitId) {
        router.push(`/benefit/${notification.data.benefitId}` as Href);
      } else if (notification.data?.applicationId) {
        router.push('/(tabs)/applications' as Href);
      }
    },
    [router, markNotificationAsRead]
  );

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  // 섹션 헤더 렌더러
  const renderSectionHeader = (date: string) => (
    <View style={[styles.sectionHeader, { backgroundColor }]}>
      <Text style={[styles.sectionTitle, { color: mutedTextColor }]}>
        {formatDateHeader(date)}
      </Text>
    </View>
  );

  if (notifications.length === 0) {
    return <EmptyState colorScheme={colorScheme} />;
  }

  return (
    <FlatList
      data={groupedNotifications}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => (
        <View>
          {renderSectionHeader(item.date)}
          {item.data.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={handleNotificationPress}
              colorScheme={colorScheme}
            />
          ))}
        </View>
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleRefresh}
          tintColor={Palette.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  notificationUnread: {
    backgroundColor: Palette.primaryBackground,
  },
  notificationPressed: {
    opacity: 0.8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    ...Typography.labelBold,
    flex: 1,
  },
  notificationTime: {
    ...Typography.caption,
    fontSize: 11,
  },
  notificationBody: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  notificationMeta: {
    marginTop: 4,
  },
  notificationType: {
    ...Typography.caption,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.heading,
    marginTop: Spacing.md,
  },
  emptyDescription: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
