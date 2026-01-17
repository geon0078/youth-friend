/**
 * 혜택 추천 스코어링 시스템
 * - 긴급도 (Urgency): 40%
 * - 혜택가치 (Value): 35%
 * - 신청용이도 (Ease): 25%
 */
import type { Benefit, SortOption } from '@/types';
import { getDaysUntilDeadline } from './deadline';

/** 스코어링된 혜택 타입 */
export interface ScoredBenefit extends Benefit {
  scores: {
    urgency: number;
    value: number;
    ease: number;
    total: number;
  };
  daysUntilDeadline: number | null;
  parsedAmount: number | null;
}

/** 스코어 가중치 */
const WEIGHTS = {
  urgency: 0.4,
  value: 0.35,
  ease: 0.25,
} as const;

/**
 * 긴급도 점수 계산 (0-100)
 * D-3 이내: 100점, D-7: 80점, D-14: 60점, D-30: 40점, 상시: 20점
 */
function calculateUrgencyScore(daysUntilDeadline: number | null): number {
  if (daysUntilDeadline === null) return 20; // 상시
  if (daysUntilDeadline < 0) return 0; // 마감됨
  if (daysUntilDeadline <= 3) return 100;
  if (daysUntilDeadline <= 7) return 80;
  if (daysUntilDeadline <= 14) return 60;
  if (daysUntilDeadline <= 30) return 40;
  return 20;
}

/**
 * 금액 파싱 (원 단위)
 */
export function parseAmount(text?: string): number | null {
  if (!text) return null;

  // "월 30만원", "최대 500만원", "연 1,200만원" 등 파싱
  const patterns = [
    /(\d{1,3}(?:,\d{3})*)\s*만\s*원/g,  // X만원
    /(\d{1,3}(?:,\d{3})*)\s*천\s*원/g,  // X천원
    /(\d{1,3}(?:,\d{3})*)\s*원/g,       // X원
  ];

  let maxAmount = 0;

  // 만원 단위
  const manwonMatches = text.matchAll(/(\d{1,3}(?:,\d{3})*)\s*만\s*원/g);
  for (const match of manwonMatches) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    maxAmount = Math.max(maxAmount, num * 10000);
  }

  // 천원 단위
  const cheonwonMatches = text.matchAll(/(\d{1,3}(?:,\d{3})*)\s*천\s*원/g);
  for (const match of cheonwonMatches) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    maxAmount = Math.max(maxAmount, num * 1000);
  }

  // 원 단위 (만원/천원이 없을 때만)
  if (maxAmount === 0) {
    const wonMatches = text.matchAll(/(\d{1,3}(?:,\d{3})*)\s*원/g);
    for (const match of wonMatches) {
      const num = parseInt(match[1].replace(/,/g, ''), 10);
      maxAmount = Math.max(maxAmount, num);
    }
  }

  return maxAmount > 0 ? maxAmount : null;
}

/**
 * 혜택가치 점수 계산 (0-100)
 * 1000만원+: 100점, 500만원+: 80점, 100만원+: 60점, 50만원+: 40점, 미상: 30점
 */
function calculateValueScore(parsedAmount: number | null): number {
  if (parsedAmount === null) return 30; // 금액 미상
  if (parsedAmount >= 10000000) return 100; // 1000만원 이상
  if (parsedAmount >= 5000000) return 80;   // 500만원 이상
  if (parsedAmount >= 1000000) return 60;   // 100만원 이상
  if (parsedAmount >= 500000) return 40;    // 50만원 이상
  return 20;
}

/**
 * 신청용이도 점수 계산 (0-100)
 * URL 있음: 80점, URL 없음: 50점
 * (applicationMethod는 BenefitDetail에만 있으므로 URL 기반으로 판단)
 */
function calculateEaseScore(benefit: Benefit): number {
  const url = benefit.applicationUrl || '';
  const supportContent = benefit.supportContent?.toLowerCase() || '';
  const description = benefit.description?.toLowerCase() || '';
  const combinedText = `${supportContent} ${description}`;

  // URL이 있으면 온라인 신청 가능으로 간주
  if (url) {
    // 텍스트에서 온라인/인터넷 언급이 있으면 더 높은 점수
    if (combinedText.includes('온라인') || combinedText.includes('인터넷') || combinedText.includes('홈페이지')) {
      return 100;
    }
    return 80;
  }

  // URL이 없어도 텍스트에서 온라인 언급이 있으면
  if (combinedText.includes('온라인') || combinedText.includes('인터넷')) {
    return 70;
  }

  // 방문 필요한 경우
  if (combinedText.includes('방문') || combinedText.includes('내방')) {
    return 30;
  }

  return 50; // 미상
}

/**
 * 혜택에 스코어 부여
 */
export function scoreBenefit(benefit: Benefit): ScoredBenefit {
  const daysUntilDeadline = getDaysUntilDeadline(benefit.deadline);
  const parsedAmount = parseAmount(benefit.supportContent) || parseAmount(benefit.description);

  const urgency = calculateUrgencyScore(daysUntilDeadline);
  const value = calculateValueScore(parsedAmount);
  const ease = calculateEaseScore(benefit);

  const total = Math.round(
    urgency * WEIGHTS.urgency +
    value * WEIGHTS.value +
    ease * WEIGHTS.ease
  );

  return {
    ...benefit,
    scores: { urgency, value, ease, total },
    daysUntilDeadline,
    parsedAmount,
  };
}

/**
 * 혜택 목록에 스코어 부여 및 정렬
 */
export function sortBenefits(
  benefits: Benefit[],
  sortBy: SortOption = 'recommended'
): ScoredBenefit[] {
  // 모든 혜택에 스코어 부여
  const scored = benefits.map(scoreBenefit);

  // 정렬
  switch (sortBy) {
    case 'recommended':
      return scored.sort((a, b) => b.scores.total - a.scores.total);

    case 'deadline':
      return scored.sort((a, b) => {
        // 마감일 없는 것(상시)은 뒤로
        if (a.daysUntilDeadline === null && b.daysUntilDeadline === null) return 0;
        if (a.daysUntilDeadline === null) return 1;
        if (b.daysUntilDeadline === null) return -1;
        return a.daysUntilDeadline - b.daysUntilDeadline;
      });

    case 'amount':
      return scored.sort((a, b) => {
        // 금액 없는 것은 뒤로
        if (a.parsedAmount === null && b.parsedAmount === null) return 0;
        if (a.parsedAmount === null) return 1;
        if (b.parsedAmount === null) return -1;
        return b.parsedAmount - a.parsedAmount;
      });

    default:
      return scored;
  }
}

/**
 * 스마트 그룹핑: 긴급 섹션 (이번 주 마감)
 */
export function getUrgentBenefits(scoredBenefits: ScoredBenefit[]): ScoredBenefit[] {
  return scoredBenefits.filter(
    (b) => b.daysUntilDeadline !== null && b.daysUntilDeadline >= 0 && b.daysUntilDeadline <= 7
  );
}

/**
 * 스마트 그룹핑: 고액 혜택 섹션 (100만원 이상)
 */
export function getHighValueBenefits(scoredBenefits: ScoredBenefit[]): ScoredBenefit[] {
  return scoredBenefits
    .filter((b) => b.parsedAmount !== null && b.parsedAmount >= 1000000)
    .sort((a, b) => (b.parsedAmount || 0) - (a.parsedAmount || 0))
    .slice(0, 5); // 상위 5개만
}

/**
 * 금액 포맷팅 (표시용)
 */
export function formatAmount(amount: number | null): string {
  if (amount === null) return '';

  if (amount >= 10000) {
    const manwon = Math.floor(amount / 10000);
    return `${manwon.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}
