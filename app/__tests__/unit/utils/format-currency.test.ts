/**
 * 원화 포맷팅 유틸리티 테스트
 */
import { formatCurrency, formatBenefitCount } from '@/utils/format-currency';

describe('formatCurrency', () => {
  describe('0원 이하', () => {
    it('0을 "0원"으로 포맷팅한다', () => {
      expect(formatCurrency(0)).toBe('0원');
    });

    it('음수를 "0원"으로 포맷팅한다', () => {
      expect(formatCurrency(-1000)).toBe('0원');
    });
  });

  describe('1만원 미만', () => {
    it('5000원을 "5,000원"으로 포맷팅한다', () => {
      expect(formatCurrency(5000)).toBe('5,000원');
    });

    it('1원을 "1원"으로 포맷팅한다', () => {
      expect(formatCurrency(1)).toBe('1원');
    });

    it('9999원을 "9,999원"으로 포맷팅한다', () => {
      expect(formatCurrency(9999)).toBe('9,999원');
    });
  });

  describe('1만원 이상 ~ 1천만원 미만', () => {
    it('10000원을 "약 1만원"으로 포맷팅한다', () => {
      expect(formatCurrency(10000)).toBe('약 1만원');
    });

    it('50000원을 "약 5만원"으로 포맷팅한다', () => {
      expect(formatCurrency(50000)).toBe('약 5만원');
    });

    it('120만원을 "약 120만원"으로 포맷팅한다', () => {
      expect(formatCurrency(1200000)).toBe('약 120만원');
    });

    it('999만원을 "약 999만원"으로 포맷팅한다', () => {
      expect(formatCurrency(9990000)).toBe('약 999만원');
    });
  });

  describe('1천만원 이상 ~ 1억 미만', () => {
    it('1000만원을 "약 1천만원"으로 포맷팅한다', () => {
      expect(formatCurrency(10000000)).toBe('약 1천만원');
    });

    it('1200만원을 "약 1,2백만원"으로 포맷팅한다', () => {
      expect(formatCurrency(12000000)).toBe('약 1,2백만원');
    });

    it('5000만원을 "약 5천만원"으로 포맷팅한다', () => {
      expect(formatCurrency(50000000)).toBe('약 5천만원');
    });
  });

  describe('1억 이상', () => {
    it('1억을 "약 1억원"으로 포맷팅한다', () => {
      expect(formatCurrency(100000000)).toBe('약 1억원');
    });

    it('1억 5천만원을 "약 1억 5천만원"으로 포맷팅한다', () => {
      expect(formatCurrency(150000000)).toBe('약 1억 5천만원');
    });

    it('10억을 "약 10억원"으로 포맷팅한다', () => {
      expect(formatCurrency(1000000000)).toBe('약 10억원');
    });

    it('2억 3천만원을 "약 2억 3천만원"으로 포맷팅한다', () => {
      expect(formatCurrency(230000000)).toBe('약 2억 3천만원');
    });
  });
});

describe('formatBenefitCount', () => {
  it('12개 혜택을 포맷팅한다', () => {
    expect(formatBenefitCount(12)).toBe('12개 혜택');
  });

  it('0개 혜택을 포맷팅한다', () => {
    expect(formatBenefitCount(0)).toBe('0개 혜택');
  });

  it('1000개 혜택을 "1,000개 혜택"으로 포맷팅한다', () => {
    expect(formatBenefitCount(1000)).toBe('1,000개 혜택');
  });
});
