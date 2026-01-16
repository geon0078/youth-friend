/**
 * deadline 유틸리티 테스트
 */
import {
  getDaysUntilDeadline,
  isDeadlineSoon,
  isDeadlineVeryUrgent,
  getDeadlineText,
  formatDeadlineDate,
  getDeadlineDescription,
} from '@/utils/deadline';

describe('deadline utilities', () => {
  // 테스트 날짜 설정 (2026-01-16 기준)
  const mockDate = new Date('2026-01-16T00:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getDaysUntilDeadline', () => {
    it('should return null for undefined deadline', () => {
      expect(getDaysUntilDeadline(undefined)).toBeNull();
    });

    it('should return positive days for future deadline', () => {
      expect(getDaysUntilDeadline('2026-01-23')).toBe(7);
    });

    it('should return 0 for today deadline', () => {
      expect(getDaysUntilDeadline('2026-01-16')).toBe(0);
    });

    it('should return negative days for past deadline', () => {
      expect(getDaysUntilDeadline('2026-01-10')).toBe(-6);
    });
  });

  describe('isDeadlineSoon', () => {
    it('should return false for undefined deadline', () => {
      expect(isDeadlineSoon(undefined)).toBe(false);
    });

    it('should return true for deadline within threshold (7 days)', () => {
      expect(isDeadlineSoon('2026-01-20', 7)).toBe(true); // 4 days away
    });

    it('should return true for deadline exactly at threshold', () => {
      expect(isDeadlineSoon('2026-01-23', 7)).toBe(true); // 7 days away
    });

    it('should return false for deadline beyond threshold', () => {
      expect(isDeadlineSoon('2026-01-25', 7)).toBe(false); // 9 days away
    });

    it('should return false for past deadline', () => {
      expect(isDeadlineSoon('2026-01-10', 7)).toBe(false);
    });

    it('should use default threshold of 7 days', () => {
      expect(isDeadlineSoon('2026-01-23')).toBe(true);
      expect(isDeadlineSoon('2026-01-24')).toBe(false);
    });
  });

  describe('isDeadlineVeryUrgent', () => {
    it('should return false for undefined deadline', () => {
      expect(isDeadlineVeryUrgent(undefined)).toBe(false);
    });

    it('should return true for deadline within 3 days', () => {
      expect(isDeadlineVeryUrgent('2026-01-18')).toBe(true); // 2 days away
    });

    it('should return true for today (D-Day)', () => {
      expect(isDeadlineVeryUrgent('2026-01-16')).toBe(true);
    });

    it('should return true for deadline in 3 days', () => {
      expect(isDeadlineVeryUrgent('2026-01-19')).toBe(true); // 3 days away
    });

    it('should return false for deadline in 4+ days', () => {
      expect(isDeadlineVeryUrgent('2026-01-20')).toBe(false); // 4 days away
    });

    it('should return false for past deadline', () => {
      expect(isDeadlineVeryUrgent('2026-01-10')).toBe(false);
    });
  });

  describe('getDeadlineText', () => {
    it('should return empty string for undefined deadline', () => {
      expect(getDeadlineText(undefined)).toBe('');
    });

    it('should return "D-7" for deadline in 7 days', () => {
      expect(getDeadlineText('2026-01-23')).toBe('D-7');
    });

    it('should return "D-Day" for today deadline', () => {
      expect(getDeadlineText('2026-01-16')).toBe('D-Day');
    });

    it('should return "마감됨" for past deadline', () => {
      expect(getDeadlineText('2026-01-10')).toBe('마감됨');
    });

    it('should return "D-1" for tomorrow deadline', () => {
      expect(getDeadlineText('2026-01-17')).toBe('D-1');
    });
  });

  describe('formatDeadlineDate', () => {
    it('should return empty string for undefined deadline', () => {
      expect(formatDeadlineDate(undefined)).toBe('');
    });

    it('should format date as "월 일" in Korean', () => {
      expect(formatDeadlineDate('2026-01-23')).toBe('1월 23일');
    });

    it('should handle different months correctly', () => {
      expect(formatDeadlineDate('2026-12-25')).toBe('12월 25일');
    });
  });

  describe('getDeadlineDescription', () => {
    it('should return "마감일 정보 없음" for undefined deadline', () => {
      expect(getDeadlineDescription(undefined)).toBe('마감일 정보 없음');
    });

    it('should describe future deadline with days remaining', () => {
      expect(getDeadlineDescription('2026-01-23')).toBe('1월 23일 마감, 7일 남음');
    });

    it('should describe today deadline', () => {
      expect(getDeadlineDescription('2026-01-16')).toBe('1월 16일 오늘 마감');
    });

    it('should describe past deadline as 마감됨', () => {
      expect(getDeadlineDescription('2026-01-10')).toBe('1월 10일 마감됨');
    });
  });
});
