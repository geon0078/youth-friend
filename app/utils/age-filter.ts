/**
 * 나이 기반 혜택 필터링 유틸리티
 * Story 3.9: Implement Age Timeline View
 */
import type { Benefit } from '@/types/models/benefit';

/**
 * 나이 범위 타입
 */
export interface AgeRange {
  min?: number;
  max?: number;
  maxExclusive?: boolean; // true면 max 미만 (exclusive)
}

/**
 * 나이별 혜택 개수 맵 타입
 */
export type AgeBenefitCountMap = Record<number, number>;

/**
 * 출생년도로부터 현재 나이 계산
 * @param birthYear 출생년도
 * @returns 만 나이
 */
export function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * ageRequirement 문자열에서 나이 범위 파싱
 * 예시 형식:
 * - "19세 ~ 34세"
 * - "만 19세 이상"
 * - "만 34세 이하"
 * - "19-34세"
 * - "청년(19세~34세)"
 * @param ageRequirement 나이 요건 문자열
 * @returns 나이 범위 { min, max }
 */
export function parseAgeRequirement(
  ageRequirement: string | undefined
): AgeRange {
  if (!ageRequirement) {
    return {};
  }

  // 숫자 추출
  const numbers = ageRequirement.match(/\d+/g)?.map(Number) || [];

  if (numbers.length === 0) {
    return {};
  }

  // "이상", "이하", "미만" 패턴 확인
  const isMinOnly =
    ageRequirement.includes('이상') ||
    ageRequirement.includes('이후') ||
    ageRequirement.includes('부터');
  const isMaxOnlyInclusive =
    ageRequirement.includes('이하') || ageRequirement.includes('까지');
  const isMaxOnlyExclusive = ageRequirement.includes('미만'); // 미만은 exclusive

  if (numbers.length === 1) {
    if (isMinOnly) {
      return { min: numbers[0] };
    }
    if (isMaxOnlyExclusive) {
      return { max: numbers[0], maxExclusive: true };
    }
    if (isMaxOnlyInclusive) {
      return { max: numbers[0] };
    }
    // 단일 숫자이고 지정이 없으면 해당 나이만
    return { min: numbers[0], max: numbers[0] };
  }

  // 두 개 이상의 숫자: 첫 번째가 min, 마지막이 max
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}

/**
 * 특정 나이가 나이 범위에 해당하는지 확인
 * @param age 확인할 나이
 * @param range 나이 범위
 * @returns 해당 여부
 */
export function isAgeInRange(age: number, range: AgeRange): boolean {
  if (range.min !== undefined && age < range.min) {
    return false;
  }
  if (range.max !== undefined) {
    // maxExclusive가 true면 "미만" (< 비교), 아니면 "이하" (<= 비교)
    if (range.maxExclusive) {
      if (age >= range.max) {
        return false;
      }
    } else {
      if (age > range.max) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 특정 나이에 해당하는 혜택 필터링
 * @param benefits 전체 혜택 목록
 * @param age 필터링할 나이
 * @returns 해당 나이에 맞는 혜택 목록
 */
export function getBenefitsByAge(
  benefits: Benefit[],
  age: number
): Benefit[] {
  return benefits.filter((benefit) => {
    const range = parseAgeRequirement(benefit.ageRequirement);

    // 나이 요건이 없으면 모든 나이에 해당
    if (range.min === undefined && range.max === undefined) {
      return true;
    }

    return isAgeInRange(age, range);
  });
}

/**
 * 나이별 혜택 개수 맵 생성
 * @param benefits 전체 혜택 목록
 * @param startAge 시작 나이
 * @param endAge 종료 나이
 * @returns 나이별 혜택 개수 맵
 */
export function getAgeBenefitCounts(
  benefits: Benefit[],
  startAge: number,
  endAge: number
): AgeBenefitCountMap {
  const counts: AgeBenefitCountMap = {};

  for (let age = startAge; age <= endAge; age++) {
    counts[age] = getBenefitsByAge(benefits, age).length;
  }

  return counts;
}

/**
 * 청년 정책 나이 범위 상수
 */
export const YOUTH_AGE_RANGE = {
  MIN: 19,
  MAX: 34,
};
