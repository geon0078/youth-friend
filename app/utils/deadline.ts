/**
 * 마감일 관련 유틸리티 함수
 * - 마감 임박 판단
 * - D-Day 텍스트 생성
 */

/**
 * 마감일까지 남은 일수 계산
 * @param deadline - ISO 8601 형식 마감일 문자열
 * @returns 남은 일수 (음수면 이미 지남) 또는 null (deadline 없음)
 *
 * @example
 * getDaysUntilDeadline('2026-01-23') // 7 (오늘이 1/16인 경우)
 * getDaysUntilDeadline('2026-01-10') // -6 (이미 지남)
 */
export function getDaysUntilDeadline(deadline?: string): number | null {
  if (!deadline || typeof deadline !== 'string') {
    return null;
  }

  // "상시", "수시" 등 텍스트는 null 반환
  if (deadline.includes('상시') || deadline.includes('수시')) {
    return null;
  }

  // "~20261231" 형식 처리 (앞의 ~ 제거)
  const cleanDeadline = deadline.replace(/^~/, '').trim();

  // 날짜 파싱 시도 (YYYYMMDD 또는 YYYY-MM-DD)
  let dateStr = cleanDeadline;
  if (/^\d{8}$/.test(cleanDeadline)) {
    dateStr = `${cleanDeadline.slice(0, 4)}-${cleanDeadline.slice(4, 6)}-${cleanDeadline.slice(6, 8)}`;
  }

  const deadlineDate = new Date(dateStr);

  // Invalid Date 체크
  if (isNaN(deadlineDate.getTime())) {
    return null;
  }

  const now = new Date();

  // 시간 제거하고 날짜만 비교
  deadlineDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 마감 임박 여부 판단
 * @param deadline - ISO 8601 형식 마감일 문자열
 * @param daysThreshold - 임박 기준 일수 (기본값: 7일)
 * @returns 마감 임박 여부
 *
 * @example
 * isDeadlineSoon('2026-01-20', 7) // true (7일 이내)
 * isDeadlineSoon('2026-02-01', 7) // false (7일 초과)
 * isDeadlineSoon('2026-01-10', 7) // false (이미 지남)
 */
export function isDeadlineSoon(
  deadline?: string,
  daysThreshold: number = 7
): boolean {
  const days = getDaysUntilDeadline(deadline);

  if (days === null) {
    return false;
  }

  // 0보다 크고 threshold 이하면 임박
  return days > 0 && days <= daysThreshold;
}

/**
 * 매우 긴급한 마감 여부 (3일 이내)
 * @param deadline - ISO 8601 형식 마감일 문자열
 * @returns 매우 긴급 여부
 */
export function isDeadlineVeryUrgent(deadline?: string): boolean {
  const days = getDaysUntilDeadline(deadline);

  if (days === null) {
    return false;
  }

  return days >= 0 && days <= 3;
}

/**
 * D-Day 텍스트 생성
 * @param deadline - ISO 8601 형식 마감일 문자열
 * @returns D-Day 텍스트 (예: "D-7", "D-Day", "마감됨")
 *
 * @example
 * getDeadlineText('2026-01-23') // "D-7"
 * getDeadlineText('2026-01-16') // "D-Day"
 * getDeadlineText('2026-01-10') // "마감됨"
 */
export function getDeadlineText(deadline?: string): string {
  const days = getDaysUntilDeadline(deadline);

  if (days === null) {
    return '';
  }

  if (days < 0) {
    return '마감됨';
  }

  if (days === 0) {
    return 'D-Day';
  }

  return `D-${days}`;
}

/**
 * 마감일 포맷팅 (한국어)
 * @param deadline - ISO 8601 형식 마감일 문자열 또는 텍스트
 * @returns 포맷팅된 날짜 문자열 (예: "1월 23일") 또는 원본 텍스트
 *
 * @example
 * formatDeadlineDate('2026-01-23') // "1월 23일"
 * formatDeadlineDate('상시') // "상시"
 */
export function formatDeadlineDate(deadline?: string): string {
  if (!deadline || typeof deadline !== 'string') {
    return '';
  }

  // "상시", "수시" 등 텍스트는 그대로 반환
  if (deadline.includes('상시') || deadline.includes('수시')) {
    return deadline;
  }

  // "~20261231" 형식 처리 (앞의 ~ 제거)
  let cleanDeadline = deadline.replace(/^~/, '').trim();

  // 날짜 파싱 시도 (YYYYMMDD 또는 YYYY-MM-DD)
  let dateStr = cleanDeadline;
  if (/^\d{8}$/.test(cleanDeadline)) {
    dateStr = `${cleanDeadline.slice(0, 4)}-${cleanDeadline.slice(4, 6)}-${cleanDeadline.slice(6, 8)}`;
  }

  const date = new Date(dateStr);

  // Invalid Date 체크
  if (isNaN(date.getTime())) {
    return deadline; // 원본 문자열 반환
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${month}월 ${day}일`;
}

/**
 * 마감일까지의 텍스트 설명 생성
 * @param deadline - ISO 8601 형식 마감일 문자열
 * @returns 접근성용 설명 텍스트
 *
 * @example
 * getDeadlineDescription('2026-01-23') // "1월 23일 마감, 7일 남음"
 */
export function getDeadlineDescription(deadline?: string): string {
  if (!deadline) {
    return '마감일 정보 없음';
  }

  const days = getDaysUntilDeadline(deadline);
  const dateText = formatDeadlineDate(deadline);

  if (days === null) {
    return '마감일 정보 없음';
  }

  if (days < 0) {
    return `${dateText} 마감됨`;
  }

  if (days === 0) {
    return `${dateText} 오늘 마감`;
  }

  return `${dateText} 마감, ${days}일 남음`;
}
