/**
 * New Benefit Notifier
 * Story 6.4: Implement New Benefit Notifications
 *
 * 신규 혜택 감지 및 알림 발송
 */
import { sendLocalNotification } from './push-service';
import { cacheStorage } from '@/services/storage/cache-storage';
import type { Benefit } from '@/types/models/benefit';
import type { NotificationData } from '@/types/models/notification';
import { MAX_DAILY_NOTIFICATIONS } from '@/types/models/notification';
import { formatCurrency } from '@/utils/format-currency';

// 저장소 키
const KNOWN_BENEFIT_IDS_KEY = 'known_benefit_ids';
const DAILY_NOTIFICATION_COUNT_KEY = 'daily_notification_count';
const LAST_NOTIFICATION_DATE_KEY = 'last_notification_date';

/**
 * 알려진 혜택 ID 목록 조회
 */
function getKnownBenefitIds(): string[] {
  try {
    return cacheStorage.get<string[]>(KNOWN_BENEFIT_IDS_KEY) || [];
  } catch {
    return [];
  }
}

/**
 * 알려진 혜택 ID 목록 저장
 */
function saveKnownBenefitIds(ids: string[]): void {
  try {
    cacheStorage.set(KNOWN_BENEFIT_IDS_KEY, ids);
  } catch (error) {
    console.error('[NewBenefitNotifier] Error saving known IDs:', error);
  }
}

/**
 * 오늘 발송한 알림 수 조회
 */
function getDailyNotificationCount(): number {
  try {
    const lastDate = cacheStorage.get<string>(LAST_NOTIFICATION_DATE_KEY);
    const today = new Date().toISOString().split('T')[0];

    // 날짜가 다르면 카운트 초기화
    if (lastDate !== today) {
      return 0;
    }

    return cacheStorage.get<number>(DAILY_NOTIFICATION_COUNT_KEY) || 0;
  } catch {
    return 0;
  }
}

/**
 * 오늘 발송한 알림 수 증가
 */
function incrementDailyNotificationCount(): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentCount = getDailyNotificationCount();

    cacheStorage.set(LAST_NOTIFICATION_DATE_KEY, today);
    cacheStorage.set(DAILY_NOTIFICATION_COUNT_KEY, currentCount + 1);
  } catch (error) {
    console.error('[NewBenefitNotifier] Error incrementing count:', error);
  }
}

/**
 * 알림 발송 가능 여부 확인
 */
export function canSendNotification(): boolean {
  return getDailyNotificationCount() < MAX_DAILY_NOTIFICATIONS;
}

/**
 * 남은 알림 가능 횟수 조회
 */
export function getRemainingNotifications(): number {
  return Math.max(0, MAX_DAILY_NOTIFICATIONS - getDailyNotificationCount());
}

/**
 * 신규 혜택 감지
 * @param currentBenefits 현재 혜택 목록
 * @returns 새로 추가된 혜택 목록
 */
export function detectNewBenefits(currentBenefits: Benefit[]): Benefit[] {
  const knownIds = getKnownBenefitIds();
  const currentIds = currentBenefits.map(b => b.id);

  // 새로운 혜택 찾기
  const newBenefits = currentBenefits.filter(benefit => !knownIds.includes(benefit.id));

  // 알려진 혜택 ID 업데이트
  saveKnownBenefitIds(currentIds);

  return newBenefits;
}

/**
 * 알려진 혜택 목록 초기화 (최초 실행 시 사용)
 */
export function initializeKnownBenefits(benefits: Benefit[]): void {
  const ids = benefits.map(b => b.id);
  saveKnownBenefitIds(ids);
}

/**
 * 알려진 혜택 수 조회
 */
export function getKnownBenefitCount(): number {
  return getKnownBenefitIds().length;
}

/**
 * 알림 제목 생성
 */
function getNotificationTitle(benefit: Benefit): string {
  return '새로운 혜택이 추가되었어요!';
}

/**
 * 알림 본문 생성
 */
function getNotificationBody(benefit: Benefit): string {
  const amountText = benefit.amount
    ? ` (최대 ${formatCurrency(benefit.amount)})`
    : '';

  return `${benefit.title}${amountText}`;
}

/**
 * 단일 신규 혜택 알림 발송
 */
export async function notifyNewBenefit(benefit: Benefit): Promise<boolean> {
  // 일일 한도 확인
  if (!canSendNotification()) {
    console.log('[NewBenefitNotifier] Daily limit reached');
    return false;
  }

  const data: NotificationData = {
    type: 'new_benefit',
    benefitId: benefit.id,
    deepLink: `/benefit/${benefit.id}`,
  };

  const identifier = await sendLocalNotification(
    getNotificationTitle(benefit),
    getNotificationBody(benefit),
    data
  );

  if (identifier) {
    incrementDailyNotificationCount();
    return true;
  }

  return false;
}

/**
 * 여러 신규 혜택 알림 발송
 * 일일 한도 내에서 발송
 */
export async function notifyNewBenefits(benefits: Benefit[]): Promise<{
  sent: number;
  skipped: number;
}> {
  let sent = 0;
  let skipped = 0;

  for (const benefit of benefits) {
    if (!canSendNotification()) {
      skipped += benefits.length - sent;
      break;
    }

    const success = await notifyNewBenefit(benefit);
    if (success) {
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}

/**
 * 혜택 데이터 동기화 시 신규 혜택 확인 및 알림
 * @param benefits 새로 받은 혜택 목록
 * @param matchedBenefitIds 사용자 자격에 맞는 혜택 ID 목록 (선택)
 */
export async function checkAndNotifyNewBenefits(
  benefits: Benefit[],
  matchedBenefitIds?: string[]
): Promise<{
  newBenefits: Benefit[];
  notificationsSent: number;
}> {
  // 신규 혜택 감지
  const newBenefits = detectNewBenefits(benefits);

  if (newBenefits.length === 0) {
    return { newBenefits: [], notificationsSent: 0 };
  }

  // 자격 매칭된 혜택만 필터 (제공된 경우)
  let benefitsToNotify = newBenefits;
  if (matchedBenefitIds && matchedBenefitIds.length > 0) {
    benefitsToNotify = newBenefits.filter(b => matchedBenefitIds.includes(b.id));
  }

  // 금액 순으로 정렬 (높은 금액 먼저)
  benefitsToNotify.sort((a, b) => (b.amount || 0) - (a.amount || 0));

  // 알림 발송
  const { sent } = await notifyNewBenefits(benefitsToNotify);

  return {
    newBenefits,
    notificationsSent: sent,
  };
}

/**
 * 일일 알림 카운트 초기화 (테스트/디버그용)
 */
export function resetDailyNotificationCount(): void {
  cacheStorage.remove(DAILY_NOTIFICATION_COUNT_KEY);
  cacheStorage.remove(LAST_NOTIFICATION_DATE_KEY);
}

/**
 * 알려진 혜택 목록 초기화 (테스트/디버그용)
 */
export function resetKnownBenefits(): void {
  cacheStorage.remove(KNOWN_BENEFIT_IDS_KEY);
}
