/**
 * useNotificationDeepLink Hook
 * Story 6.8: Implement Deep Link Handling
 *
 * 알림 탭 시 딥링크 처리
 */
import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { Subscription } from 'expo-notifications';
import type { NotificationData } from '@/types/models/notification';

/**
 * 딥링크 경로 검증
 */
function isValidDeepLink(path: string): boolean {
  // 허용된 경로 패턴
  const validPatterns = [
    /^\/(tabs)\/(benefits|applications|timeline|notifications|profile)$/,
    /^\/benefit\/[a-zA-Z0-9-]+$/,
    /^\/(tabs)\/profile\/settings\/notifications$/,
  ];

  return validPatterns.some(pattern => pattern.test(path));
}

/**
 * 알림 데이터에서 딥링크 추출
 */
function extractDeepLink(data?: NotificationData): string | null {
  if (!data) return null;

  // 명시적 딥링크가 있는 경우
  if (data.deepLink && isValidDeepLink(data.deepLink)) {
    return data.deepLink;
  }

  // 혜택 ID가 있는 경우
  if (data.benefitId) {
    return `/benefit/${data.benefitId}`;
  }

  // 신청 ID가 있는 경우
  if (data.applicationId) {
    return '/(tabs)/applications';
  }

  // 타입별 기본 경로
  switch (data.type) {
    case 'deadline':
    case 'new_benefit':
      return '/(tabs)/benefits';
    case 'result':
      return '/(tabs)/applications';
    default:
      return null;
  }
}

/**
 * 알림 딥링크 처리 훅
 *
 * 앱 실행 중 또는 백그라운드에서 알림 탭 시 해당 화면으로 이동
 */
export function useNotificationDeepLink() {
  const router = useRouter();
  const pathname = usePathname();
  const responseReceivedRef = useRef<Subscription | null>(null);
  const lastHandledIdRef = useRef<string | null>(null);

  // 알림 응답 처리
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const { identifier, content } = response.notification.request;

      // 중복 처리 방지
      if (lastHandledIdRef.current === identifier) {
        return;
      }
      lastHandledIdRef.current = identifier;

      const data = content.data as unknown as NotificationData | undefined;
      const deepLink = extractDeepLink(data);

      if (deepLink) {
        // 현재 경로와 다른 경우에만 이동
        if (pathname !== deepLink) {
          console.log('[DeepLink] Navigating to:', deepLink);
          router.push(deepLink as any);
        }
      } else {
        // 기본적으로 알림 화면으로 이동
        console.log('[DeepLink] Navigating to notifications (fallback)');
        router.push('/(tabs)/notifications' as any);
      }
    },
    [router, pathname]
  );

  // 앱 시작 시 마지막 알림 응답 확인
  useEffect(() => {
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        // 약간의 지연 후 처리 (앱 초기화 완료 대기)
        setTimeout(() => {
          handleNotificationResponse(response);
        }, 500);
      }
    };

    checkInitialNotification();
  }, [handleNotificationResponse]);

  // 알림 응답 리스너 등록
  useEffect(() => {
    responseReceivedRef.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (responseReceivedRef.current) {
        responseReceivedRef.current.remove();
      }
    };
  }, [handleNotificationResponse]);

  // 수동 딥링크 처리
  const navigateToDeepLink = useCallback(
    (data: NotificationData) => {
      const deepLink = extractDeepLink(data);
      if (deepLink) {
        router.push(deepLink as any);
      }
    },
    [router]
  );

  return {
    navigateToDeepLink,
  };
}

/**
 * 딥링크 URL 생성 헬퍼
 */
export function createDeepLinkUrl(
  type: NotificationData['type'],
  params?: { benefitId?: string; applicationId?: string }
): string {
  switch (type) {
    case 'deadline':
    case 'new_benefit':
      return params?.benefitId ? `/benefit/${params.benefitId}` : '/(tabs)/benefits';
    case 'result':
      return '/(tabs)/applications';
    default:
      return '/(tabs)/notifications';
  }
}
