import * as Sentry from '@sentry/react-native';
import * as Crypto from 'expo-crypto';

/**
 * Sentry 에러 모니터링 서비스
 * NFR22-24: 가용성 및 에러 모니터링
 */

/**
 * Sentry 초기화
 * - 프로덕션 환경에서만 활성화
 * - 개인정보 최소화 (NFR7)
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  // DSN이 없으면 초기화하지 않음
  if (!dsn) {
    if (__DEV__) {
      console.log('[Sentry] DSN not configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn,
    // 환경 설정
    environment: __DEV__ ? 'development' : 'production',
    // 개발 환경에서는 비활성화
    enabled: !__DEV__,
    // 디버그 모드 (개발 환경에서만)
    debug: __DEV__,
    // 성능 모니터링 샘플 레이트 (20%)
    tracesSampleRate: 0.2,
    // 에러 샘플 레이트 (100% - 모든 에러 수집)
    sampleRate: 1.0,
    // 세션 리플레이 비활성화 (개인정보 보호)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // 민감한 데이터 제거
    beforeSend: (event) => {
      // 개인정보 제거
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
      }
      return event;
    },
    // 민감한 breadcrumb 필터링
    beforeBreadcrumb: (breadcrumb) => {
      // XHR 요청의 민감한 데이터 제거
      if (breadcrumb.category === 'xhr' && breadcrumb.data) {
        // 요청 바디에서 민감한 정보 제거
        delete breadcrumb.data.requestBody;
        delete breadcrumb.data.responseBody;
      }
      return breadcrumb;
    },
  });
}

/**
 * 익명화된 사용자 컨텍스트 설정
 * @param userId - 사용자 ID (앱 내부 ID, 해시됨)
 */
export async function setUserContext(userId: string | null): Promise<void> {
  if (userId) {
    // 익명화된 사용자 ID만 전송 (NFR7 준수)
    const hashedId = await hashUserId(userId);
    Sentry.setUser({
      id: hashedId,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * 사용자 ID 해시 (개인정보 보호)
 * expo-crypto SHA-256 사용
 */
async function hashUserId(userId: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    userId
  );
  // 처음 16자리만 사용 (충분한 엔트로피)
  return `user_${hash.substring(0, 16)}`;
}

/**
 * 에러 캡처
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * 메시지 캡처
 * @param message - 메시지
 * @param level - 레벨 (info, warning, error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.captureMessage(message, level);
}

/**
 * 태그 설정
 * @param key - 태그 키
 * @param value - 태그 값
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * 컨텍스트 설정
 * @param name - 컨텍스트 이름
 * @param context - 컨텍스트 데이터
 */
export function setContext(
  name: string,
  context: Record<string, unknown>
): void {
  Sentry.setContext(name, context);
}

// Sentry 네이티브 래퍼 re-export
export { Sentry };
