/**
 * Deadline Alert Scheduler
 * Story 6.3: Implement Deadline Alert Notifications
 *
 * 마감 임박 혜택에 대한 알림 스케줄링
 */
import {
  scheduleNotification,
  cancelBenefitNotifications,
  getScheduledNotifications,
} from './push-service';
import { cacheStorage } from '@/services/storage/cache-storage';
import type { Benefit } from '@/types/models/benefit';
import type { NotificationData, ScheduledNotification } from '@/types/models/notification';
import { DEADLINE_ALERT_DAYS } from '@/types/models/notification';
import { getDaysUntilDeadline } from '@/types/models/application';
import { formatCurrency } from '@/utils/format-currency';

// 저장소 키
const SCHEDULED_BENEFITS_KEY = 'scheduled_deadline_benefits';
const LAST_SCHEDULE_DATE_KEY = 'last_deadline_schedule_date';

/**
 * 혜택의 마감일 파싱
 * @param deadline 마감일 문자열
 * @returns Date 객체 또는 null
 */
function parseDeadlineDate(deadline?: string): Date | null {
  if (!deadline) return null;

  // 상시/수시 모집은 무시
  if (deadline.includes('상시') || deadline.includes('수시')) {
    return null;
  }

  // YYYY.MM.DD 또는 YYYY-MM-DD 형식 파싱
  const dateMatch = deadline.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 9, 0, 0);
  }

  // MM월 DD일 형식 파싱 (현재 연도 사용)
  const koreanMatch = deadline.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (koreanMatch) {
    const [, month, day] = koreanMatch;
    const year = new Date().getFullYear();
    return new Date(year, parseInt(month) - 1, parseInt(day), 9, 0, 0);
  }

  return null;
}

/**
 * 알림 발송 시간 계산
 * @param deadlineDate 마감일
 * @param daysBeforeDeadline 마감 N일 전
 * @returns 알림 발송 시간
 */
function getNotificationTime(deadlineDate: Date, daysBeforeDeadline: number): Date {
  const notificationDate = new Date(deadlineDate);
  notificationDate.setDate(notificationDate.getDate() - daysBeforeDeadline);
  // 오전 9시에 알림
  notificationDate.setHours(9, 0, 0, 0);
  return notificationDate;
}

/**
 * 알림 제목 생성
 */
function getNotificationTitle(daysLeft: number): string {
  if (daysLeft === 0) return '오늘 마감!';
  if (daysLeft === 1) return '내일 마감!';
  return `${daysLeft}일 후 마감`;
}

/**
 * 알림 본문 생성
 */
function getNotificationBody(benefit: Benefit, daysLeft: number): string {
  const benefitAmount = benefit.supportAmount
    ? ` (최대 ${formatCurrency(benefit.supportAmount)})`
    : '';

  if (daysLeft === 0) {
    return `"${benefit.title}"${benefitAmount} 신청이 오늘 마감됩니다. 놓치지 마세요!`;
  }
  if (daysLeft === 1) {
    return `"${benefit.title}"${benefitAmount} 신청이 내일 마감됩니다.`;
  }
  return `"${benefit.title}"${benefitAmount} 신청이 ${daysLeft}일 후 마감됩니다.`;
}

/**
 * 특정 혜택에 대한 마감 알림 스케줄
 */
export async function scheduleDeadlineAlerts(benefit: Benefit): Promise<ScheduledNotification[]> {
  const scheduled: ScheduledNotification[] = [];

  // 마감일 파싱
  const deadlineDate = parseDeadlineDate(benefit.deadline);
  if (!deadlineDate) {
    return scheduled;
  }

  // 이전 알림 취소
  await cancelBenefitNotifications(benefit.id);

  const now = new Date();

  // 각 알림 기간에 대해 스케줄
  for (const daysBeforeDeadline of DEADLINE_ALERT_DAYS) {
    const notificationTime = getNotificationTime(deadlineDate, daysBeforeDeadline);

    // 이미 지난 시간이면 스킵
    if (notificationTime <= now) {
      continue;
    }

    const data: NotificationData = {
      type: 'deadline',
      benefitId: benefit.id,
      deepLink: `/benefit/${benefit.id}`,
    };

    const result = await scheduleNotification(
      getNotificationTitle(daysBeforeDeadline),
      getNotificationBody(benefit, daysBeforeDeadline),
      data,
      notificationTime
    );

    if (result) {
      scheduled.push(result);
    }
  }

  // 스케줄된 혜택 ID 저장
  await saveScheduledBenefitId(benefit.id);

  return scheduled;
}

/**
 * 여러 혜택에 대한 마감 알림 일괄 스케줄
 */
export async function scheduleDeadlineAlertsForBenefits(
  benefits: Benefit[]
): Promise<{ scheduled: number; skipped: number }> {
  let scheduled = 0;
  let skipped = 0;

  for (const benefit of benefits) {
    // 이미 신청 완료된 혜택은 제외 (추후 확장 가능)
    const results = await scheduleDeadlineAlerts(benefit);

    if (results.length > 0) {
      scheduled += results.length;
    } else {
      skipped++;
    }
  }

  // 마지막 스케줄 날짜 저장
  cacheStorage.set(LAST_SCHEDULE_DATE_KEY, new Date().toISOString());

  return { scheduled, skipped };
}

/**
 * 스케줄된 혜택 ID 저장
 */
async function saveScheduledBenefitId(benefitId: string): Promise<void> {
  try {
    const existing = getScheduledBenefitIds();
    if (!existing.includes(benefitId)) {
      cacheStorage.set(SCHEDULED_BENEFITS_KEY, [...existing, benefitId]);
    }
  } catch (error) {
    console.error('[DeadlineScheduler] Error saving scheduled benefit:', error);
  }
}

/**
 * 스케줄된 혜택 ID 목록 조회
 */
export function getScheduledBenefitIds(): string[] {
  try {
    return cacheStorage.get<string[]>(SCHEDULED_BENEFITS_KEY) || [];
  } catch {
    return [];
  }
}

/**
 * 마지막 스케줄 날짜 조회
 */
export function getLastScheduleDate(): Date | null {
  try {
    const dateStr = cacheStorage.get<string>(LAST_SCHEDULE_DATE_KEY);
    return dateStr ? new Date(dateStr) : null;
  } catch {
    return null;
  }
}

/**
 * 스케줄 갱신 필요 여부 확인
 * 하루에 한 번만 갱신
 */
export function shouldRefreshSchedule(): boolean {
  const lastSchedule = getLastScheduleDate();
  if (!lastSchedule) return true;

  const now = new Date();
  const hoursSinceLastSchedule =
    (now.getTime() - lastSchedule.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastSchedule >= 24;
}

/**
 * 특정 혜택의 알림 취소
 */
export async function cancelDeadlineAlerts(benefitId: string): Promise<void> {
  await cancelBenefitNotifications(benefitId);

  // 저장된 목록에서 제거
  const existing = getScheduledBenefitIds();
  const updated = existing.filter(id => id !== benefitId);
  cacheStorage.set(SCHEDULED_BENEFITS_KEY, updated);
}

/**
 * 모든 마감 알림 취소
 */
export async function cancelAllDeadlineAlerts(): Promise<void> {
  const benefitIds = getScheduledBenefitIds();

  for (const benefitId of benefitIds) {
    await cancelBenefitNotifications(benefitId);
  }

  cacheStorage.set(SCHEDULED_BENEFITS_KEY, []);
}

/**
 * 현재 스케줄된 마감 알림 수 조회
 */
export function getScheduledDeadlineAlertsCount(): number {
  const allScheduled = getScheduledNotifications();
  return allScheduled.filter(n => n.type === 'deadline').length;
}

/**
 * 곧 마감되는 혜택 필터링 (7일 이내)
 */
export function filterUpcomingDeadlines(benefits: Benefit[]): Benefit[] {
  return benefits.filter(benefit => {
    const daysLeft = getDaysUntilDeadline(benefit.deadline);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  });
}
