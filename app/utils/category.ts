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

/**
 * 카테고리 색상 매핑
 */
const CATEGORY_COLORS: Record<BenefitCategory, { color: string; backgroundColor: string }> = {
  employment: { color: '#0B4DFF', backgroundColor: '#EFF6FF' },
  housing: { color: '#22C55E', backgroundColor: '#DCFCE7' },
  education: { color: '#8B5CF6', backgroundColor: '#F3E8FF' },
  welfare: { color: '#EC4899', backgroundColor: '#FCE7F3' },
  finance: { color: '#F59E0B', backgroundColor: '#FEF3C7' },
  culture: { color: '#06B6D4', backgroundColor: '#CFFAFE' },
};

/**
 * 카테고리 정보 반환 (라벨, 아이콘, 색상)
 */
export interface CategoryInfo {
  label: string;
  icon: CategoryIconName;
  color: string;
  backgroundColor: string;
}

/**
 * 카테고리 전체 정보 반환
 * @param category - 혜택 카테고리
 * @returns 카테고리 정보 객체
 */
export function getCategoryInfo(category?: BenefitCategory): CategoryInfo {
  const defaultInfo: CategoryInfo = {
    label: '기타',
    icon: 'gift.fill',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
  };

  if (!category) {
    return defaultInfo;
  }

  const colors = CATEGORY_COLORS[category];
  if (!colors) {
    return defaultInfo;
  }

  return {
    label: CATEGORY_LABELS[category] || '기타',
    icon: getCategoryIcon(category),
    color: colors.color,
    backgroundColor: colors.backgroundColor,
  };
}
