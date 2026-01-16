/**
 * Notification Types
 * Epic 6: Push Notifications (푸시 알림)
 *
 * 푸시 알림 관련 타입 정의
 */

/**
 * 알림 유형
 */
export type NotificationType =
  | 'deadline'      // 마감 임박 알림
  | 'new_benefit'   // 신규 혜택 알림
  | 'result'        // 신청 결과 알림
  | 'system';       // 시스템 알림

/**
 * 알림 우선순위
 */
export type NotificationPriority = 'high' | 'default' | 'low';

/**
 * 알림 데이터 (딥링크용)
 */
export interface NotificationData {
  /** 알림 유형 */
  type: NotificationType;
  /** 관련 혜택 ID */
  benefitId?: string;
  /** 관련 신청 ID */
  applicationId?: string;
  /** 딥링크 경로 */
  deepLink?: string;
  /** 추가 데이터 */
  extra?: Record<string, unknown>;
}

/**
 * 저장된 알림 항목
 */
export interface StoredNotification {
  /** 고유 ID */
  id: string;
  /** 알림 제목 */
  title: string;
  /** 알림 본문 */
  body: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 알림 데이터 */
  data?: NotificationData;
  /** 읽음 여부 */
  isRead: boolean;
  /** 수신 시각 */
  receivedAt: string;
  /** 만료 시각 (선택) */
  expiresAt?: string;
}

/**
 * 알림 설정
 */
export interface NotificationSettings {
  /** 전체 알림 활성화 */
  enabled: boolean;
  /** 마감 임박 알림 */
  deadlineAlerts: boolean;
  /** 신규 혜택 알림 */
  newBenefitAlerts: boolean;
  /** 신청 결과 알림 */
  resultAlerts: boolean;
  /** 방해 금지 시작 시간 (HH:mm) */
  quietHoursStart?: string;
  /** 방해 금지 종료 시간 (HH:mm) */
  quietHoursEnd?: string;
}

/**
 * 기본 알림 설정
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  deadlineAlerts: true,
  newBenefitAlerts: true,
  resultAlerts: true,
  quietHoursStart: undefined,
  quietHoursEnd: undefined,
};

/**
 * 알림 타입별 라벨
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  deadline: '마감 임박',
  new_benefit: '신규 혜택',
  result: '신청 결과',
  system: '시스템',
};

/**
 * 알림 타입별 아이콘
 */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  deadline: 'clock.badge.exclamationmark',
  new_benefit: 'star.fill',
  result: 'checkmark.circle.fill',
  system: 'bell.fill',
};

/**
 * 마감 알림 스케줄 (일 단위)
 */
export const DEADLINE_ALERT_DAYS = [7, 3, 1] as const;

/**
 * 최대 하루 알림 수
 */
export const MAX_DAILY_NOTIFICATIONS = 5;

/**
 * 알림 보관 기간 (일)
 */
export const NOTIFICATION_RETENTION_DAYS = 30;

/**
 * 스케줄된 알림 정보
 */
export interface ScheduledNotification {
  /** 알림 식별자 */
  identifier: string;
  /** 관련 혜택 ID */
  benefitId: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 스케줄된 날짜 */
  scheduledDate: string;
}

/**
 * 푸시 토큰 정보
 */
export interface PushTokenInfo {
  /** Expo Push Token */
  token: string;
  /** 토큰 획득 시각 */
  obtainedAt: string;
  /** 디바이스 플랫폼 */
  platform: 'ios' | 'android';
}
