/**
 * 혜택 카테고리 관련 유틸리티
 */
import type { BenefitCategory } from '@/types';

/**
 * 카테고리 아이콘 타입 (IconSymbol에서 지원하는 아이콘)
 */
export type CategoryIconName =
  | 'briefcase.fill'
  | 'house.fill'
  | 'book.fill'
  | 'heart.fill'
  | 'banknote.fill'
  | 'theatermasks.fill'
  | 'gift.fill';

/**
 * 카테고리 한글 라벨 매핑
 */
export const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  employment: '취업',
  housing: '주거',
  education: '교육',
  welfare: '복지',
  finance: '금융',
  culture: '문화',
};

/**
 * 카테고리 라벨 반환
 * @param category - 혜택 카테고리
 * @returns 한글 라벨
 *
 * @example
 * getCategoryLabel('employment') // "취업"
 */
export function getCategoryLabel(category?: BenefitCategory): string {
  if (!category) {
    return '기타';
  }
  return CATEGORY_LABELS[category] || '기타';
}

/**
 * 카테고리 아이콘 이름 반환 (SF Symbols)
 * @param category - 혜택 카테고리
 * @returns SF Symbol 아이콘 이름
 */
export function getCategoryIcon(category?: BenefitCategory): CategoryIconName {
  const icons: Record<BenefitCategory, CategoryIconName> = {
    employment: 'briefcase.fill',
    housing: 'house.fill',
    education: 'book.fill',
    welfare: 'heart.fill',
    finance: 'banknote.fill',
    culture: 'theatermasks.fill',
  };

  if (!category) {
    return 'gift.fill';
  }
  return icons[category] || 'gift.fill';
}
