/**
 * Application Result Notifier
 * Story 6.5: Implement Application Result Notifications
 *
 * 신청 결과(상태 변경) 알림 발송
 */
import { sendLocalNotification } from './push-service';
import type { NotificationData } from '@/types/models/notification';
import type { ApplicationStatus, SavedApplication } from '@/types/models/application';
import { APPLICATION_STATUS_LABELS } from '@/types/models/application';

/**
 * 상태별 알림 메시지
 */
const STATUS_MESSAGES: Record<
  ApplicationStatus,
  {
    title: string;
    getBody: (benefitTitle: string) => string;
  }
> = {
  preparing: {
    title: '서류 준비 중',
    getBody: (title) => `"${title}" 신청을 위한 서류를 준비하고 있습니다.`,
  },
  applied: {
    title: '신청 완료!',
    getBody: (title) => `"${title}" 신청이 접수되었습니다. 결과를 기다려 주세요.`,
  },
  approved: {
    title: '축하합니다! 승인되었어요 🎉',
    getBody: (title) => `"${title}" 신청이 승인되었습니다!`,
  },
  rejected: {
    title: '아쉽게도 거부되었어요',
    getBody: (title) => `"${title}" 신청이 거부되었습니다. 다른 혜택을 확인해보세요.`,
  },
  withdrawn: {
    title: '신청이 철회되었습니다',
    getBody: (title) => `"${title}" 신청을 철회했습니다.`,
  },
};

/**
 * 신청 상태 변경 알림 발송
 * @param application 저장된 신청 정보
 * @param newStatus 새로운 상태
 * @param note 메모 (선택)
 */
export async function notifyApplicationStatusChange(
  application: SavedApplication,
  newStatus: ApplicationStatus,
  note?: string
): Promise<boolean> {
  const message = STATUS_MESSAGES[newStatus];

  const data: NotificationData = {
    type: 'result',
    applicationId: application.id,
    benefitId: application.benefitId,
    deepLink: '/(tabs)/applications',
  };

  const body = note
    ? `${message.getBody(application.benefitTitle)}\n\n📝 ${note}`
    : message.getBody(application.benefitTitle);

  const identifier = await sendLocalNotification(
    message.title,
    body,
    data
  );

  return identifier !== null;
}

/**
 * 승인 알림 발송
 */
export async function notifyApplicationApproved(
  application: SavedApplication,
  note?: string
): Promise<boolean> {
  return notifyApplicationStatusChange(application, 'approved', note);
}

/**
 * 거부 알림 발송
 */
export async function notifyApplicationRejected(
  application: SavedApplication,
  note?: string
): Promise<boolean> {
  return notifyApplicationStatusChange(application, 'rejected', note);
}

/**
 * 신청 완료 알림 발송
 */
export async function notifyApplicationSubmitted(
  application: SavedApplication
): Promise<boolean> {
  return notifyApplicationStatusChange(application, 'applied');
}

/**
 * 상태 변경 시 알림 필요 여부 확인
 * 중요한 상태 변경(신청완료, 승인, 거부)에만 알림
 */
export function shouldNotifyStatusChange(
  previousStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): boolean {
  // 같은 상태로는 알림 안 함
  if (previousStatus === newStatus) {
    return false;
  }

  // 중요한 상태 변경만 알림
  const importantStatuses: ApplicationStatus[] = ['applied', 'approved', 'rejected'];
  return importantStatuses.includes(newStatus);
}

/**
 * 재신청 안내 알림 발송
 */
export async function notifyReapplyGuidance(
  benefitTitle: string,
  benefitId: string
): Promise<boolean> {
  const data: NotificationData = {
    type: 'result',
    benefitId,
    deepLink: `/benefit/${benefitId}`,
  };

  const identifier = await sendLocalNotification(
    '다시 도전해보세요!',
    `"${benefitTitle}" 신청이 거부되었지만, 조건이 변경되면 다시 신청할 수 있습니다.`,
    data
  );

  return identifier !== null;
}

/**
 * 대안 혜택 안내 알림 발송
 */
export async function notifyAlternativeBenefits(
  rejectedBenefitTitle: string,
  alternativeCount: number
): Promise<boolean> {
  if (alternativeCount === 0) {
    return false;
  }

  const data: NotificationData = {
    type: 'result',
    deepLink: '/(tabs)/benefits',
  };

  const identifier = await sendLocalNotification(
    '비슷한 혜택이 있어요',
    `"${rejectedBenefitTitle}"이(가) 거부되었지만, ${alternativeCount}개의 비슷한 혜택이 있습니다.`,
    data
  );

  return identifier !== null;
}
