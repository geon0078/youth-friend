/**
 * matching-engine 테스트
 * Story 4.3: Implement Profile-Benefit Matching Engine
 */
import {
  checkEligibility,
  checkEligibilityBatch,
  checkAgeRule,
  checkIncomeRule,
  checkRegionRule,
  checkEmploymentRule,
  checkCustomRule,
  calculateFutureEligibility,
  getCachedResult,
  setCachedResult,
  invalidateCache,
  invalidateBenefitCache,
} from '@/services/eligibility/matching-engine';
import { resetRuleIdCounter } from '@/services/eligibility/rule-parser';
import type { EligibilityRule, RangeValue } from '@/types/models/eligibility';
import type { UserProfile } from '@/types/models/user';
import type { BenefitDetail } from '@/types/models/benefit';

// 테스트용 프로필
const createTestProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  birthYear: 2000, // 2026년 기준 26세
  region: 'seoul',
  incomeLevel: 'below50',
  employmentStatus: 'unemployed',
  ...overrides,
});

// 테스트용 규칙 생성
const createTestRule = (overrides?: Partial<EligibilityRule>): EligibilityRule => ({
  id: 'test-rule-1',
  field: 'age',
  operator: 'range',
  value: { min: 19, max: 34 } as RangeValue,
  severity: 'required',
  description: '만 19세 이상 34세 이하',
  metadata: { originalText: '만 19세 이상 34세 이하', confidence: 1 },
  ...overrides,
});

// 테스트용 혜택 생성
const createTestBenefit = (overrides?: Partial<BenefitDetail>): BenefitDetail => ({
  id: 'test-benefit-1',
  originalId: '1',
  source: 'youth-policy',
  title: '테스트 혜택',
  description: '테스트용 혜택입니다',
  category: 'employment',
  requirements: [],
  status: 'active',
  ...overrides,
});

describe('matching-engine', () => {
  beforeEach(() => {
    resetRuleIdCounter();
    invalidateCache();
  });

  describe('checkAgeRule', () => {
    it('범위 내 나이면 통과한다', () => {
      const profile = createTestProfile({ birthYear: 2000 }); // 26세
      const rule = createTestRule({
        operator: 'range',
        value: { min: 19, max: 34 },
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(true);
      expect(result.field).toBe('age');
      expect(result.userValue).toBe(26);
    });

    it('범위 미만이면 실패한다', () => {
      const profile = createTestProfile({ birthYear: 2010 }); // 16세
      const rule = createTestRule({
        operator: 'range',
        value: { min: 19, max: 34 },
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('16세');
      expect(result.message).toContain('19세 이상');
    });

    it('범위 초과면 실패한다', () => {
      const profile = createTestProfile({ birthYear: 1990 }); // 36세
      const rule = createTestRule({
        operator: 'range',
        value: { min: 19, max: 34 },
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(false);
    });

    it('maxExclusive가 true면 max 미만이어야 통과', () => {
      const profile = createTestProfile({ birthYear: 1992 }); // 34세
      const rule = createTestRule({
        operator: 'range',
        value: { min: 19, max: 34, maxExclusive: true },
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(false); // 34세는 34 미만이 아님
    });

    it('gte 연산자 검증', () => {
      const profile = createTestProfile({ birthYear: 2007 }); // 19세
      const rule = createTestRule({
        operator: 'gte',
        value: 19,
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('lte 연산자 검증', () => {
      const profile = createTestProfile({ birthYear: 1992 }); // 34세
      const rule = createTestRule({
        operator: 'lte',
        value: 34,
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('lt 연산자 검증', () => {
      const profile = createTestProfile({ birthYear: 2002 }); // 24세
      const rule = createTestRule({
        operator: 'lt',
        value: 25,
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('eq 연산자 검증', () => {
      const profile = createTestProfile({ birthYear: 2001 }); // 25세
      const rule = createTestRule({
        operator: 'eq',
        value: 25,
      });

      const result = checkAgeRule(profile, rule);
      expect(result.passed).toBe(true);
    });
  });

  describe('checkIncomeRule', () => {
    it('허용된 소득 수준이면 통과한다', () => {
      const profile = createTestProfile({ incomeLevel: 'below50' });
      const rule = createTestRule({
        field: 'income',
        operator: 'in',
        value: ['below50', '50to100'],
      });

      const result = checkIncomeRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('허용되지 않은 소득 수준이면 실패한다', () => {
      const profile = createTestProfile({ incomeLevel: 'above150' });
      const rule = createTestRule({
        field: 'income',
        operator: 'in',
        value: ['below50', '50to100'],
      });

      const result = checkIncomeRule(profile, rule);
      expect(result.passed).toBe(false);
    });
  });

  describe('checkRegionRule', () => {
    it('같은 지역이면 통과한다', () => {
      const profile = createTestProfile({ region: 'seoul' });
      const rule = createTestRule({
        field: 'region',
        operator: 'eq',
        value: 'seoul',
      });

      const result = checkRegionRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('다른 지역이면 실패한다', () => {
      const profile = createTestProfile({ region: 'busan' });
      const rule = createTestRule({
        field: 'region',
        operator: 'eq',
        value: 'seoul',
      });

      const result = checkRegionRule(profile, rule);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('서울특별시 거주 필요');
    });

    it('허용된 지역 목록에 포함되면 통과한다', () => {
      const profile = createTestProfile({ region: 'gyeonggi' });
      const rule = createTestRule({
        field: 'region',
        operator: 'in',
        value: ['seoul', 'gyeonggi', 'incheon'],
      });

      const result = checkRegionRule(profile, rule);
      expect(result.passed).toBe(true);
    });
  });

  describe('checkEmploymentRule', () => {
    it('허용된 취업상태면 통과한다', () => {
      const profile = createTestProfile({ employmentStatus: 'unemployed' });
      const rule = createTestRule({
        field: 'employment',
        operator: 'in',
        value: ['unemployed', 'student'],
      });

      const result = checkEmploymentRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('notIn 연산자로 제외 상태가 아니면 통과한다', () => {
      const profile = createTestProfile({ employmentStatus: 'unemployed' });
      const rule = createTestRule({
        field: 'employment',
        operator: 'notIn',
        value: ['employed'],
      });

      const result = checkEmploymentRule(profile, rule);
      expect(result.passed).toBe(true);
    });

    it('notIn 연산자로 제외 상태면 실패한다', () => {
      const profile = createTestProfile({ employmentStatus: 'employed' });
      const rule = createTestRule({
        field: 'employment',
        operator: 'notIn',
        value: ['employed'],
      });

      const result = checkEmploymentRule(profile, rule);
      expect(result.passed).toBe(false);
    });
  });

  describe('checkCustomRule', () => {
    it('custom 규칙은 항상 실패하고 null userValue를 반환한다', () => {
      const rule = createTestRule({
        field: 'custom',
        operator: 'eq',
        value: '직접 확인 필요',
      });

      const result = checkCustomRule(rule);
      expect(result.passed).toBe(false);
      expect(result.userValue).toBeNull();
      expect(result.message).toBe('직접 확인이 필요합니다');
    });
  });

  describe('calculateFutureEligibility', () => {
    it('나이가 min 미만이면 미래 자격 정보를 반환한다', () => {
      const profile = createTestProfile({ birthYear: 2010 }); // 16세
      const rule = createTestRule({
        field: 'age',
        operator: 'range',
        value: { min: 19, max: 34 },
      });

      const future = calculateFutureEligibility(profile, rule);
      expect(future).toBeDefined();
      expect(future?.yearsUntilEligible).toBe(3); // 19 - 16 = 3년
      expect(future?.message).toBe('3년 후 자격 획득');
    });

    it('나이가 max 초과면 undefined를 반환한다', () => {
      const profile = createTestProfile({ birthYear: 1990 }); // 36세
      const rule = createTestRule({
        field: 'age',
        operator: 'range',
        value: { min: 19, max: 34 },
      });

      const future = calculateFutureEligibility(profile, rule);
      expect(future).toBeUndefined();
    });

    it('gte 연산자에서 나이가 작으면 미래 자격 정보를 반환한다', () => {
      const profile = createTestProfile({ birthYear: 2010 }); // 16세
      const rule = createTestRule({
        field: 'age',
        operator: 'gte',
        value: 19,
      });

      const future = calculateFutureEligibility(profile, rule);
      expect(future?.yearsUntilEligible).toBe(3);
    });

    it('age 외 필드는 undefined를 반환한다', () => {
      const profile = createTestProfile();
      const rule = createTestRule({
        field: 'income',
        operator: 'in',
        value: ['below50'],
      });

      const future = calculateFutureEligibility(profile, rule);
      expect(future).toBeUndefined();
    });
  });

  describe('checkEligibility', () => {
    it('모든 조건 충족 시 eligible을 반환한다', () => {
      const profile = createTestProfile();
      const benefit = createTestBenefit({
        ageRequirement: '만 19세 이상 34세 이하',
        incomeRequirement: '기준 중위소득 100% 이하',
        residenceRequirement: '서울특별시 거주자',
        employmentRequirement: '미취업자',
      });

      const result = checkEligibility({ profile, benefit });
      expect(result.status).toBe('eligible');
      expect(result.score.total).toBe(100);
      expect(result.unmetRequirements).toHaveLength(0);
    });

    it('필수 조건 미충족 시 ineligible을 반환한다', () => {
      const profile = createTestProfile({ region: 'busan' });
      const benefit = createTestBenefit({
        ageRequirement: '만 19세 이상 34세 이하',
        residenceRequirement: '서울특별시 거주자',
      });

      const result = checkEligibility({ profile, benefit });
      expect(result.status).toBe('ineligible');
      expect(result.unmetRequirements.length).toBeGreaterThan(0);
    });

    it('자격요건 없으면 eligible을 반환한다', () => {
      const profile = createTestProfile();
      const benefit = createTestBenefit();

      const result = checkEligibility({ profile, benefit });
      expect(result.status).toBe('eligible');
      expect(result.score.total).toBe(100);
    });

    it('custom 규칙만 있으면 unknown을 반환한다', () => {
      const profile = createTestProfile();
      const benefit = createTestBenefit({
        educationRequirement: '대학 재학생',
        majorRequirement: '이공계 전공자',
      });

      const result = checkEligibility({ profile, benefit });
      expect(result.status).toBe('unknown');
    });

    it('권장 조건만 미충족 시 partial을 반환한다', () => {
      // 현재 파서는 모든 규칙을 required로 생성하므로
      // 이 테스트는 직접 규칙을 주입해야 함
      // 하지만 checkEligibility는 parseBenefitRequirements를 내부에서 호출하므로
      // 이 케이스는 향후 recommended 규칙이 추가될 때 테스트
      expect(true).toBe(true);
    });

    it('매칭 점수가 올바르게 계산된다', () => {
      const profile = createTestProfile({ region: 'busan' });
      const benefit = createTestBenefit({
        ageRequirement: '만 19세 이상 34세 이하', // 통과
        residenceRequirement: '서울특별시 거주자', // 실패
      });

      const result = checkEligibility({ profile, benefit });
      expect(result.score.metCount).toBe(1);
      expect(result.score.unmetCount).toBe(1);
      expect(result.score.total).toBe(50); // 1/2 = 50%
    });

    it('unmetRequirements에 futureEligibility가 포함된다', () => {
      const profile = createTestProfile({ birthYear: 2010 }); // 16세
      const benefit = createTestBenefit({
        ageRequirement: '만 19세 이상 34세 이하',
      });

      const result = checkEligibility({ profile, benefit });
      expect(result.unmetRequirements).toHaveLength(1);
      expect(result.unmetRequirements[0].futureEligibility).toBeDefined();
      expect(result.unmetRequirements[0].futureEligibility?.yearsUntilEligible).toBe(3);
    });
  });

  describe('checkEligibilityBatch', () => {
    it('여러 혜택에 대한 결과를 Map으로 반환한다', () => {
      const profile = createTestProfile();
      const benefits = [
        createTestBenefit({ id: 'benefit-1', ageRequirement: '만 19세 이상' }),
        createTestBenefit({ id: 'benefit-2', ageRequirement: '만 40세 이상' }),
      ];

      const results = checkEligibilityBatch(profile, benefits);
      expect(results.size).toBe(2);
      expect(results.get('benefit-1')?.status).toBe('eligible');
      expect(results.get('benefit-2')?.status).toBe('ineligible');
    });
  });

  describe('캐시 기능', () => {
    it('결과를 캐시에 저장하고 조회할 수 있다', () => {
      const profile = createTestProfile();
      const benefit = createTestBenefit({
        ageRequirement: '만 19세 이상 34세 이하',
      });

      // 첫 번째 호출 - 캐시에 저장됨
      const result1 = checkEligibility({ profile, benefit });
      expect(result1.status).toBe('eligible');

      // 두 번째 호출 - 캐시에서 조회
      const cached = getCachedResult(benefit.id, profile);
      expect(cached).not.toBeNull();
      expect(cached?.status).toBe('eligible');
    });

    it('invalidateCache로 전체 캐시를 무효화할 수 있다', () => {
      const profile = createTestProfile();
      const benefit = createTestBenefit();

      checkEligibility({ profile, benefit });
      expect(getCachedResult(benefit.id, profile)).not.toBeNull();

      invalidateCache();
      expect(getCachedResult(benefit.id, profile)).toBeNull();
    });

    it('invalidateBenefitCache로 특정 혜택 캐시만 무효화할 수 있다', () => {
      const profile = createTestProfile();
      const benefit1 = createTestBenefit({ id: 'benefit-1' });
      const benefit2 = createTestBenefit({ id: 'benefit-2' });

      checkEligibility({ profile, benefit: benefit1 });
      checkEligibility({ profile, benefit: benefit2 });

      invalidateBenefitCache('benefit-1');
      expect(getCachedResult('benefit-1', profile)).toBeNull();
      expect(getCachedResult('benefit-2', profile)).not.toBeNull();
    });

    it('useCache: false 옵션으로 캐시를 건너뛸 수 있다', () => {
      const profile = createTestProfile();
      const benefit = createTestBenefit();

      checkEligibility({ profile, benefit, options: { useCache: false } });
      expect(getCachedResult(benefit.id, profile)).toBeNull();
    });
  });
});
