/**
 * category 유틸리티 테스트
 */
import {
  getCategoryLabel,
  getCategoryIcon,
  CATEGORY_LABELS,
} from '@/utils/category';
import type { BenefitCategory } from '@/types';

describe('category utilities', () => {
  describe('getCategoryLabel', () => {
    it('should return correct Korean label for each category', () => {
      const categories: BenefitCategory[] = [
        'employment',
        'housing',
        'education',
        'welfare',
        'finance',
        'culture',
      ];

      expect(getCategoryLabel('employment')).toBe('취업');
      expect(getCategoryLabel('housing')).toBe('주거');
      expect(getCategoryLabel('education')).toBe('교육');
      expect(getCategoryLabel('welfare')).toBe('복지');
      expect(getCategoryLabel('finance')).toBe('금융');
      expect(getCategoryLabel('culture')).toBe('문화');
    });

    it('should return "기타" for undefined category', () => {
      expect(getCategoryLabel(undefined)).toBe('기타');
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon for each category', () => {
      expect(getCategoryIcon('employment')).toBe('briefcase.fill');
      expect(getCategoryIcon('housing')).toBe('house.fill');
      expect(getCategoryIcon('education')).toBe('book.fill');
      expect(getCategoryIcon('welfare')).toBe('heart.fill');
      expect(getCategoryIcon('finance')).toBe('banknote.fill');
      expect(getCategoryIcon('culture')).toBe('theatermasks.fill');
    });

    it('should return "gift.fill" for undefined category', () => {
      expect(getCategoryIcon(undefined)).toBe('gift.fill');
    });
  });

  describe('CATEGORY_LABELS', () => {
    it('should have all 6 categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(6);
    });
  });
});
