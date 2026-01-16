/**
 * age-filter 유틸리티 테스트
 * Story 3.9: Implement Age Timeline View
 */
import {
  calculateAge,
  parseAgeRequirement,
  isAgeInRange,
  getBenefitsByAge,
  getAgeBenefitCounts,
  YOUTH_AGE_RANGE,
} from '@/utils/age-filter';
import type { Benefit } from '@/types/models/benefit';

// Mock benefits for testing
const createMockBenefit = (
  id: string,
  ageRequirement?: string
): Benefit => ({
  id,
  originalId: id,
  source: 'youth-policy',
  title: `혜택 ${id}`,
  description: '테스트 혜택',
  category: 'employment',
  requirements: [],
  status: 'active',
  ageRequirement,
});

describe('age-filter utils', () => {
  describe('calculateAge', () => {
    it('출생년도로 나이를 계산한다', () => {
      const currentYear = new Date().getFullYear();
      expect(calculateAge(2000)).toBe(currentYear - 2000);
    });

    it('올해 출생이면 0세이다', () => {
      const currentYear = new Date().getFullYear();
      expect(calculateAge(currentYear)).toBe(0);
    });
  });

  describe('parseAgeRequirement', () => {
    it('undefined면 빈 객체를 반환한다', () => {
      expect(parseAgeRequirement(undefined)).toEqual({});
    });

    it('숫자가 없으면 빈 객체를 반환한다', () => {
      expect(parseAgeRequirement('청년')).toEqual({});
    });

    it('"19세 ~ 34세" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('19세 ~ 34세')).toEqual({ min: 19, max: 34 });
    });

    it('"만 19세 이상" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('만 19세 이상')).toEqual({ min: 19 });
    });

    it('"만 34세 이하" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('만 34세 이하')).toEqual({ max: 34 });
    });

    it('"19-34세" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('19-34세')).toEqual({ min: 19, max: 34 });
    });

    it('"청년(19세~34세)" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('청년(19세~34세)')).toEqual({
        min: 19,
        max: 34,
      });
    });

    it('"25세" 단일 나이를 파싱한다', () => {
      expect(parseAgeRequirement('25세')).toEqual({ min: 25, max: 25 });
    });

    it('"19세 이상 34세 이하" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('19세 이상 34세 이하')).toEqual({
        min: 19,
        max: 34,
      });
    });

    it('"19세부터" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('19세부터')).toEqual({ min: 19 });
    });

    it('"34세까지" 형식을 파싱한다', () => {
      expect(parseAgeRequirement('34세까지')).toEqual({ max: 34 });
    });

    it('"34세 미만" 형식을 파싱한다 (exclusive)', () => {
      expect(parseAgeRequirement('34세 미만')).toEqual({
        max: 34,
        maxExclusive: true,
      });
    });
  });

  describe('isAgeInRange', () => {
    it('범위 내 나이면 true를 반환한다', () => {
      expect(isAgeInRange(25, { min: 19, max: 34 })).toBe(true);
    });

    it('최소 나이보다 작으면 false를 반환한다', () => {
      expect(isAgeInRange(18, { min: 19, max: 34 })).toBe(false);
    });

    it('최대 나이보다 크면 false를 반환한다', () => {
      expect(isAgeInRange(35, { min: 19, max: 34 })).toBe(false);
    });

    it('최소 나이만 있고 해당되면 true를 반환한다', () => {
      expect(isAgeInRange(25, { min: 19 })).toBe(true);
    });

    it('최대 나이만 있고 해당되면 true를 반환한다', () => {
      expect(isAgeInRange(25, { max: 34 })).toBe(true);
    });

    it('빈 범위면 true를 반환한다', () => {
      expect(isAgeInRange(25, {})).toBe(true);
    });

    it('경계값(min)도 포함된다', () => {
      expect(isAgeInRange(19, { min: 19, max: 34 })).toBe(true);
    });

    it('경계값(max)도 포함된다', () => {
      expect(isAgeInRange(34, { min: 19, max: 34 })).toBe(true);
    });

    it('maxExclusive가 true면 max와 같은 값은 제외된다', () => {
      expect(isAgeInRange(34, { max: 34, maxExclusive: true })).toBe(false);
      expect(isAgeInRange(33, { max: 34, maxExclusive: true })).toBe(true);
    });
  });

  describe('getBenefitsByAge', () => {
    const benefits: Benefit[] = [
      createMockBenefit('1', '19세 ~ 34세'),
      createMockBenefit('2', '만 25세 이상'),
      createMockBenefit('3', '만 30세 이하'),
      createMockBenefit('4'), // 나이 제한 없음
    ];

    it('해당 나이의 혜택만 필터링한다', () => {
      const result = getBenefitsByAge(benefits, 25);
      expect(result).toHaveLength(4); // 모두 해당
    });

    it('나이 제한이 없는 혜택은 항상 포함된다', () => {
      const result = getBenefitsByAge(benefits, 35);
      expect(result.find((b) => b.id === '4')).toBeTruthy();
    });

    it('최소 나이 미달 시 제외된다', () => {
      const result = getBenefitsByAge(benefits, 20);
      expect(result.find((b) => b.id === '2')).toBeFalsy(); // 25세 이상
    });

    it('최대 나이 초과 시 제외된다', () => {
      const result = getBenefitsByAge(benefits, 35);
      expect(result.find((b) => b.id === '1')).toBeFalsy(); // 34세 이하
      expect(result.find((b) => b.id === '3')).toBeFalsy(); // 30세 이하
    });

    it('빈 배열이면 빈 배열을 반환한다', () => {
      expect(getBenefitsByAge([], 25)).toEqual([]);
    });
  });

  describe('getAgeBenefitCounts', () => {
    const benefits: Benefit[] = [
      createMockBenefit('1', '19세 ~ 24세'),
      createMockBenefit('2', '25세 ~ 34세'),
      createMockBenefit('3'), // 나이 제한 없음
    ];

    it('나이별 혜택 개수를 계산한다', () => {
      const counts = getAgeBenefitCounts(benefits, 19, 26);

      expect(counts[19]).toBe(2); // 1, 3
      expect(counts[24]).toBe(2); // 1, 3
      expect(counts[25]).toBe(2); // 2, 3
      expect(counts[26]).toBe(2); // 2, 3
    });

    it('모든 나이에 대해 개수를 계산한다', () => {
      const counts = getAgeBenefitCounts(benefits, 19, 34);
      expect(Object.keys(counts)).toHaveLength(16); // 19~34세
    });

    it('빈 배열이면 모든 나이가 0개이다', () => {
      const counts = getAgeBenefitCounts([], 19, 34);
      expect(counts[25]).toBe(0);
    });
  });

  describe('YOUTH_AGE_RANGE', () => {
    it('청년 나이 범위 상수가 정의되어 있다', () => {
      expect(YOUTH_AGE_RANGE.MIN).toBe(19);
      expect(YOUTH_AGE_RANGE.MAX).toBe(34);
    });
  });
});
