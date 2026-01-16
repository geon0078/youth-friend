/**
 * useNotifications Hook
 * Epic 6: Push Notifications (푸시 알림)
 *
 * 알림 관련 기능을 제공하는 커스텀 훅
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import type { Subscription } from 'expo-notifications';
import {
  requestNotificationPermissions,
  getNotificationPermissionStatus,
  initializePushService,
  getExpoPushToken,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  saveNotification,
  createStoredNotification,
  clearBadgeCount,
  setBadgeCount,
} from '@/services/notifications';
import type { StoredNotification, NotificationData } from '@/types/models/notification';
import { useAppStore } from '@/stores';

/**
 * 알림 권한 상태
 */
type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'loading';

/**
 * 알림 훅 반환 타입
 */
interface UseNotificationsReturn {
  /** 권한 상태 */
  permissionStatus: PermissionStatus;
  /** 권한 요청 */
  requestPermission: () => Promise<boolean>;
  /** 알림 내역 */
  notifications: StoredNotification[];
  /** 읽지 않은 알림 수 */
  unreadCount: number;
  /** 알림 새로고침 */
  refresh: () => void;
  /** 알림 읽음 처리 */
  markNotificationAsRead: (id: string) => void;
  /** 모든 알림 읽음 처리 */
  markAllNotificationsAsRead: () => void;
  /** 초기화 완료 여부 */
  isInitialized: boolean;
}

/**
 * 알림 관리 훅
 */
export function useNotifications(): UseNotificationsReturn {
  const router = useRouter();
  const settings = useAppStore((state) => state.settings);

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('loading');
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // 구독 참조
  const notificationReceivedRef = useRef<Subscription | null>(null);
  const notificationResponseRef = useRef<Subscription | null>(null);

  // 알림 목록 새로고침
  const refresh = useCallback(() => {
    const storedNotifications = getNotifications();
    setNotifications(storedNotifications);
    setUnreadCount(getUnreadCount());
  }, []);

  // 권한 상태 확인
  const checkPermission = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

  // 권한 요청
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setPermissionStatus(granted ? 'granted' : 'denied');

    if (granted) {
      await getExpoPushToken();
    }

    return granted;
  }, []);

  // 알림 읽음 처리
  const markNotificationAsRead = useCallback((id: string) => {
    markAsRead(id);
    refresh();

    // 뱃지 업데이트
    const newUnreadCount = getUnreadCount();
    setBadgeCount(newUnreadCount);
  }, [refresh]);

  // 모든 알림 읽음 처리
  const markAllNotificationsAsRead = useCallback(() => {
    markAllAsRead();
    refresh();
    clearBadgeCount();
  }, [refresh]);

  // 알림 수신 처리
  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      const { title, body, data } = notification.request.content;
      const notificationData = data as NotificationData | undefined;

      // 설정에 따라 저장
      if (!settings.notificationsEnabled) {
        return;
      }

      const stored = createStoredNotification(
        notification.request.identifier,
        title || '알림',
        body || '',
        notificationData?.type || 'system',
        notificationData
      );

      saveNotification(stored);
      refresh();

      // 뱃지 업데이트
      const newUnreadCount = getUnreadCount();
      setBadgeCount(newUnreadCount);
    },
    [settings.notificationsEnabled, refresh]
  );

  // 알림 탭 처리 (딥링크)
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const { data } = response.notification.request.content;
      const notificationData = data as NotificationData | undefined;

      // 알림 읽음 처리
      markAsRead(response.notification.request.identifier);
      refresh();

      // 딥링크 처리
      if (notificationData?.deepLink) {
        router.push(notificationData.deepLink as any);
      } else if (notificationData?.benefitId) {
        router.push(`/benefit/${notificationData.benefitId}` as any);
      } else if (notificationData?.applicationId) {
        router.push('/(tabs)/applications' as any);
      }

      // 뱃지 업데이트
      const newUnreadCount = getUnreadCount();
      setBadgeCount(newUnreadCount);
    },
    [router, refresh]
  );

  // 초기화
  useEffect(() => {
    const init = async () => {
      await initializePushService();
      await checkPermission();
      refresh();
      setIsInitialized(true);
    };

    init();
  }, [checkPermission, refresh]);

  // 알림 리스너 등록
  useEffect(() => {
    // 알림 수신 리스너
    notificationReceivedRef.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // 알림 응답 리스너
    notificationResponseRef.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationReceivedRef.current) {
        Notifications.removeNotificationSubscription(notificationReceivedRef.current);
      }
      if (notificationResponseRef.current) {
        Notifications.removeNotificationSubscription(notificationResponseRef.current);
      }
    };
  }, [handleNotificationReceived, handleNotificationResponse]);

  // 앱 시작 시 마지막 알림 응답 확인
  useEffect(() => {
    const checkLastNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        handleNotificationResponse(response);
      }
    };

    if (isInitialized) {
      checkLastNotification();
    }
  }, [isInitialized, handleNotificationResponse]);

  return {
    permissionStatus,
    requestPermission,
    notifications,
    unreadCount,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isInitialized,
  };
}

/**
 * 알림 권한만 확인하는 간단한 훅
 */
export function useNotificationPermission() {
  const [status, setStatus] = useState<PermissionStatus>('loading');

  useEffect(() => {
    const check = async () => {
      const permissionStatus = await getNotificationPermissionStatus();
      setStatus(permissionStatus);
    };
    check();
  }, []);

  const request = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setStatus(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  return { status, request };
}
