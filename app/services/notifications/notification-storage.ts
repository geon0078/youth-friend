/**
 * Notification Storage Service
 * Story 6.7: Implement Notification History Screen
 *
 * 알림 내역 저장 및 관리
 */
import { cacheStorage } from '@/services/storage/cache-storage';
import type {
  StoredNotification,
  NotificationType,
  NOTIFICATION_RETENTION_DAYS,
} from '@/types/models/notification';

const STORAGE_KEY = 'notification_history';
const MAX_NOTIFICATIONS = 100;
const RETENTION_DAYS = 30;

/**
 * 알림 내역 저장
 */
export function saveNotification(notification: StoredNotification): void {
  try {
    const existing = getNotifications();

    // 중복 체크
    if (existing.some(n => n.id === notification.id)) {
      return;
    }

    // 최신 순으로 추가
    const updated = [notification, ...existing];

    // 최대 개수 제한
    const trimmed = updated.slice(0, MAX_NOTIFICATIONS);

    cacheStorage.set(STORAGE_KEY, trimmed);
  } catch (error) {
    console.error('[NotificationStorage] Error saving notification:', error);
  }
}

/**
 * 모든 알림 내역 조회
 */
export function getNotifications(): StoredNotification[] {
  try {
    const notifications = cacheStorage.get<StoredNotification[]>(STORAGE_KEY) || [];

    // 만료된 알림 필터링
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    return notifications.filter(n => {
      const receivedAt = new Date(n.receivedAt);
      return receivedAt >= cutoffDate;
    });
  } catch {
    return [];
  }
}

/**
 * 읽지 않은 알림 조회
 */
export function getUnreadNotifications(): StoredNotification[] {
  return getNotifications().filter(n => !n.isRead);
}

/**
 * 읽지 않은 알림 수 조회
 */
export function getUnreadCount(): number {
  return getUnreadNotifications().length;
}

/**
 * 특정 알림 읽음 처리
 */
export function markAsRead(notificationId: string): void {
  try {
    const notifications = getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    cacheStorage.set(STORAGE_KEY, updated);
  } catch (error) {
    console.error('[NotificationStorage] Error marking as read:', error);
  }
}

/**
 * 모든 알림 읽음 처리
 */
export function markAllAsRead(): void {
  try {
    const notifications = getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    cacheStorage.set(STORAGE_KEY, updated);
  } catch (error) {
    console.error('[NotificationStorage] Error marking all as read:', error);
  }
}

/**
 * 특정 알림 삭제
 */
export function deleteNotification(notificationId: string): void {
  try {
    const notifications = getNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    cacheStorage.set(STORAGE_KEY, updated);
  } catch (error) {
    console.error('[NotificationStorage] Error deleting notification:', error);
  }
}

/**
 * 모든 알림 삭제
 */
export function clearAllNotifications(): void {
  try {
    cacheStorage.remove(STORAGE_KEY);
  } catch (error) {
    console.error('[NotificationStorage] Error clearing notifications:', error);
  }
}

/**
 * 유형별 알림 조회
 */
export function getNotificationsByType(type: NotificationType): StoredNotification[] {
  return getNotifications().filter(n => n.type === type);
}

/**
 * 날짜별 알림 그룹화
 */
export function getNotificationsByDate(): Record<string, StoredNotification[]> {
  const notifications = getNotifications();
  const grouped: Record<string, StoredNotification[]> = {};

  notifications.forEach(notification => {
    const date = new Date(notification.receivedAt).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(notification);
  });

  return grouped;
}

/**
 * 오래된 알림 정리
 */
export function cleanupOldNotifications(): number {
  try {
    const allNotifications = cacheStorage.get<StoredNotification[]>(STORAGE_KEY) || [];
    const validNotifications = getNotifications(); // 이미 만료 체크 포함

    const removedCount = allNotifications.length - validNotifications.length;

    if (removedCount > 0) {
      cacheStorage.set(STORAGE_KEY, validNotifications);
      console.log('[NotificationStorage] Cleaned up', removedCount, 'old notifications');
    }

    return removedCount;
  } catch {
    return 0;
  }
}

/**
 * 새 알림 생성 헬퍼
 */
export function createStoredNotification(
  id: string,
  title: string,
  body: string,
  type: NotificationType,
  data?: StoredNotification['data']
): StoredNotification {
  return {
    id,
    title,
    body,
    type,
    data,
    isRead: false,
    receivedAt: new Date().toISOString(),
  };
}
