/**
 * Push Notification Service
 * Story 6.1: Configure Push Notification Infrastructure
 *
 * Expo Notifications를 사용한 푸시 알림 서비스
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type {
  NotificationData,
  NotificationType,
  PushTokenInfo,
  ScheduledNotification,
} from '@/types/models/notification';
import { cacheStorage } from '@/services/storage/cache-storage';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowInForeground: true,
  }),
});

// 저장소 키
const STORAGE_KEYS = {
  PUSH_TOKEN: 'push_token',
  SCHEDULED_NOTIFICATIONS: 'scheduled_notifications',
  NOTIFICATION_HISTORY: 'notification_history',
} as const;

/**
 * 푸시 알림 권한 요청
 * @returns 권한 부여 여부
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // 실제 디바이스에서만 동작
    if (!Device.isDevice) {
      console.warn('[PushService] Must use physical device for Push Notifications');
      return false;
    }

    // 현재 권한 상태 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 권한이 없으면 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushService] Notification permission denied');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[PushService] Error requesting permissions:', error);
    return false;
  }
}

/**
 * 현재 알림 권한 상태 확인
 */
export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return 'undetermined';
  }
}

/**
 * Expo Push Token 획득
 * @returns 푸시 토큰 정보 또는 null
 */
export async function getExpoPushToken(): Promise<PushTokenInfo | null> {
  try {
    if (!Device.isDevice) {
      console.warn('[PushService] Must use physical device for Push Notifications');
      return null;
    }

    // 권한 확인
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // 프로젝트 ID 확인
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[PushService] No projectId found in expo config');
    }

    // 토큰 획득
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    const tokenInfo: PushTokenInfo = {
      token: tokenData.data,
      obtainedAt: new Date().toISOString(),
      platform: Platform.OS as 'ios' | 'android',
    };

    // 토큰 저장
    await savePushToken(tokenInfo);

    return tokenInfo;
  } catch (error) {
    console.error('[PushService] Error getting push token:', error);
    return null;
  }
}

/**
 * 푸시 토큰 저장
 */
async function savePushToken(tokenInfo: PushTokenInfo): Promise<void> {
  try {
    cacheStorage.set(STORAGE_KEYS.PUSH_TOKEN, tokenInfo);
  } catch (error) {
    console.error('[PushService] Error saving push token:', error);
  }
}

/**
 * 저장된 푸시 토큰 조회
 */
export function getSavedPushToken(): PushTokenInfo | null {
  try {
    return cacheStorage.get<PushTokenInfo>(STORAGE_KEYS.PUSH_TOKEN) || null;
  } catch {
    return null;
  }
}

/**
 * Android 알림 채널 설정
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // 마감 임박 알림 채널
    await Notifications.setNotificationChannelAsync('deadline', {
      name: '마감 임박 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF4444',
      description: '혜택 신청 마감 임박 알림',
    });

    // 신규 혜택 알림 채널
    await Notifications.setNotificationChannelAsync('new_benefit', {
      name: '신규 혜택 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: '새로운 혜택 추가 알림',
    });

    // 신청 결과 알림 채널
    await Notifications.setNotificationChannelAsync('result', {
      name: '신청 결과 알림',
      importance: Notifications.AndroidImportance.HIGH,
      description: '혜택 신청 결과 알림',
    });

    // 시스템 알림 채널
    await Notifications.setNotificationChannelAsync('system', {
      name: '시스템 알림',
      importance: Notifications.AndroidImportance.LOW,
      description: '앱 관련 시스템 알림',
    });

    console.log('[PushService] Notification channels created');
  } catch (error) {
    console.error('[PushService] Error setting up channels:', error);
  }
}

/**
 * 로컬 알림 즉시 발송
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data: NotificationData
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data as Record<string, unknown>,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: data.type || 'system',
        }),
      },
      trigger: null, // 즉시 발송
    });

    console.log('[PushService] Local notification sent:', identifier);
    return identifier;
  } catch (error) {
    console.error('[PushService] Error sending notification:', error);
    return null;
  }
}

/**
 * 스케줄된 알림 등록
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data: NotificationData,
  triggerDate: Date
): Promise<ScheduledNotification | null> {
  try {
    // 과거 시간이면 스케줄하지 않음
    if (triggerDate.getTime() <= Date.now()) {
      console.log('[PushService] Skipping past date notification');
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data as Record<string, unknown>,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && {
          channelId: data.type || 'system',
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    const scheduled: ScheduledNotification = {
      identifier,
      benefitId: data.benefitId || '',
      type: data.type,
      scheduledDate: triggerDate.toISOString(),
    };

    // 스케줄된 알림 저장
    await saveScheduledNotification(scheduled);

    console.log('[PushService] Notification scheduled:', identifier, triggerDate);
    return scheduled;
  } catch (error) {
    console.error('[PushService] Error scheduling notification:', error);
    return null;
  }
}

/**
 * 스케줄된 알림 저장
 */
async function saveScheduledNotification(notification: ScheduledNotification): Promise<void> {
  try {
    const existing = getScheduledNotifications();
    const updated = [...existing.filter(n => n.identifier !== notification.identifier), notification];
    cacheStorage.set(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, updated);
  } catch (error) {
    console.error('[PushService] Error saving scheduled notification:', error);
  }
}

/**
 * 스케줄된 알림 목록 조회
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  try {
    return cacheStorage.get<ScheduledNotification[]>(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS) || [];
  } catch {
    return [];
  }
}

/**
 * 특정 혜택의 스케줄된 알림 취소
 */
export async function cancelBenefitNotifications(benefitId: string): Promise<void> {
  try {
    const scheduled = getScheduledNotifications();
    const toCancel = scheduled.filter(n => n.benefitId === benefitId);

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    // 저장소에서 제거
    const remaining = scheduled.filter(n => n.benefitId !== benefitId);
    cacheStorage.set(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, remaining);

    console.log('[PushService] Cancelled notifications for benefit:', benefitId);
  } catch (error) {
    console.error('[PushService] Error cancelling notifications:', error);
  }
}

/**
 * 모든 스케줄된 알림 취소
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    cacheStorage.set(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, []);
    console.log('[PushService] All scheduled notifications cancelled');
  } catch (error) {
    console.error('[PushService] Error cancelling all notifications:', error);
  }
}

/**
 * 앱 뱃지 수 설정
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('[PushService] Error setting badge count:', error);
  }
}

/**
 * 앱 뱃지 수 초기화
 */
export async function clearBadgeCount(): Promise<void> {
  await setBadgeCount(0);
}

/**
 * 푸시 알림 서비스 초기화
 */
export async function initializePushService(): Promise<void> {
  try {
    // Android 채널 설정
    await setupNotificationChannels();

    console.log('[PushService] Push service initialized');
  } catch (error) {
    console.error('[PushService] Error initializing push service:', error);
  }
}

/**
 * 알림 카테고리 액션 등록 (iOS)
 */
export async function registerNotificationCategories(): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    await Notifications.setNotificationCategoryAsync('deadline', [
      {
        identifier: 'view',
        buttonTitle: '자세히 보기',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: '닫기',
        options: {
          isDestructive: true,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('result', [
      {
        identifier: 'view',
        buttonTitle: '결과 확인',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    console.log('[PushService] Notification categories registered');
  } catch (error) {
    console.error('[PushService] Error registering categories:', error);
  }
}
