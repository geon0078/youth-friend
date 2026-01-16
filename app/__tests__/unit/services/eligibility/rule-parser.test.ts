/**
 * rule-parser 테스트
 * Story 4.2: Implement Eligibility Rule Parser
 */
import {
  parseAgeRule,
  parseIncomeRule,
  parseRegionRule,
  parseEmploymentRule,
  parseBenefitRequirements,
  calculateOverallConfidence,
  resetRuleIdCounter,
} from '@/services/eligibility/rule-parser';
import type { BenefitDetail } from '@/types/models/benefit';
import type { RangeValue } from '@/types/models/eligibility';

describe('rule-parser', () => {
  beforeEach(() => {
    resetRuleIdCounter();
  });

  describe('parseAgeRule', () => {
    it('빈 문자열은 null을 반환한다', () => {
      const result = parseAgeRule('');
      expect(result.rule).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('"만 19세 이상 34세 이하" 범위를 파싱한다', () => {
      const result = parseAgeRule('만 19세 이상 34세 이하');
      expect(result.rule?.field).toBe('age');
      expect(result.rule?.operator).toBe('range');
      expect((result.rule?.value as RangeValue).min).toBe(19);
      expect((result.rule?.value as RangeValue).max).toBe(34);
      expect(result.confidence).toBe(1);
    });

    it('"19세~34세" 범위를 파싱한다', () => {
      const result = parseAgeRule('19세~34세');
      expect(result.rule?.operator).toBe('range');
      expect((result.rule?.value as RangeValue).min).toBe(19);
      expect((result.rule?.value as RangeValue).max).toBe(34);
    });

    it('"만 19세 이상"은 gte 연산자를 사용한다', () => {
      const result = parseAgeRule('만 19세 이상');
      expect(result.rule?.operator).toBe('gte');
      expect(result.rule?.value).toBe(19);
    });

    it('"만 34세 이하"는 lte 연산자를 사용한다', () => {
      const result = parseAgeRule('만 34세 이하');
      expect(result.rule?.operator).toBe('lte');
      expect(result.rule?.value).toBe(34);
    });

    it('"만 25세 미만"은 lt 연산자를 사용한다', () => {
      const result = parseAgeRule('만 25세 미만');
      expect(result.rule?.operator).toBe('lt');
      expect(result.rule?.value).toBe(25);
    });

    it('"청년(19세-34세)" 형식을 파싱한다', () => {
      const result = parseAgeRule('청년(19세-34세)');
      expect(result.rule?.operator).toBe('range');
      expect((result.rule?.value as RangeValue).min).toBe(19);
      expect((result.rule?.value as RangeValue).max).toBe(34);
    });

    it('숫자가 없으면 custom 필드로 처리한다', () => {
      const result = parseAgeRule('청년 우대');
      expect(result.rule?.field).toBe('custom');
      expect(result.confidence).toBe(0);
    });

    it('"만 19세 이상 34세 미만" 범위를 maxExclusive로 파싱한다', () => {
      const result = parseAgeRule('만 19세 이상 34세 미만');
      expect(result.rule?.operator).toBe('range');
      expect((result.rule?.value as RangeValue).min).toBe(19);
      expect((result.rule?.value as RangeValue).max).toBe(34);
      expect((result.rule?.value as RangeValue).maxExclusive).toBe(true);
    });

    it('"만 19세 이상 34세 이하" 범위는 maxExclusive가 false이다', () => {
      const result = parseAgeRule('만 19세 이상 34세 이하');
      expect((result.rule?.value as RangeValue).maxExclusive).toBe(false);
    });

    it('description이 올바르게 생성된다', () => {
      const result = parseAgeRule('만 19세 이상 34세 이하');
      expect(result.rule?.description).toBe('만 19세 이상 34세 이하');
    });

    it('metadata.originalText가 설정된다', () => {
      const text = '만 19세 이상';
      const result = parseAgeRule(text);
      expect(result.rule?.metadata.originalText).toBe(text);
    });
  });

  describe('parseIncomeRule', () => {
    it('빈 문자열은 null을 반환한다', () => {
      const result = parseIncomeRule('');
      expect(result.rule).toBeNull();
    });

    it('"기준 중위소득 100% 이하"를 파싱한다', () => {
      const result = parseIncomeRule('기준 중위소득 100% 이하');
      expect(result.rule?.field).toBe('income');
      expect(result.rule?.operator).toBe('in');
      expect(result.rule?.value).toEqual(['below50', '50to100']);
    });

    it('"기준 중위소득 50% 이하"를 파싱한다', () => {
      const result = parseIncomeRule('기준 중위소득 50% 이하');
      expect(result.rule?.value).toEqual(['below50']);
    });

    it('"기준 중위소득 150% 이하"를 파싱한다', () => {
      const result = parseIncomeRule('기준 중위소득 150% 이하');
      expect(result.rule?.value).toEqual(['below50', '50to100', '100to150']);
    });

    it('"저소득층" 키워드를 파싱한다', () => {
      const result = parseIncomeRule('저소득층 대상');
      expect(result.rule?.value).toEqual(['below50']);
      expect(result.confidence).toBe(0.9);
    });

    it('"차상위" 키워드를 파싱한다', () => {
      const result = parseIncomeRule('차상위 계층');
      expect(result.rule?.value).toEqual(['below50', '50to100']);
    });

    it('파싱 불가 시 custom 필드로 처리한다', () => {
      const result = parseIncomeRule('소득 무관');
      expect(result.rule?.field).toBe('custom');
      expect(result.confidence).toBe(0);
    });

    it('description이 올바르게 생성된다', () => {
      const result = parseIncomeRule('기준 중위소득 100% 이하');
      expect(result.rule?.description).toBe('기준 중위소득 100% 이하');
    });
  });

  describe('parseRegionRule', () => {
    it('빈 문자열은 null을 반환한다', () => {
      const result = parseRegionRule('');
      expect(result.rule).toBeNull();
    });

    it('"서울특별시 거주자"를 파싱한다', () => {
      const result = parseRegionRule('서울특별시 거주자');
      expect(result.rule?.field).toBe('region');
      expect(result.rule?.operator).toBe('eq');
      expect(result.rule?.value).toBe('seoul');
      expect(result.confidence).toBe(1);
    });

    it('"서울 거주자"를 파싱한다', () => {
      const result = parseRegionRule('서울 거주자');
      expect(result.rule?.value).toBe('seoul');
    });

    it('"경기도민"을 파싱한다', () => {
      const result = parseRegionRule('경기도민');
      expect(result.rule?.value).toBe('gyeonggi');
    });

    it('"부산광역시"를 파싱한다', () => {
      const result = parseRegionRule('부산광역시 대상');
      expect(result.rule?.value).toBe('busan');
    });

    it('"세종특별자치시"를 파싱한다', () => {
      const result = parseRegionRule('세종특별자치시 주민');
      expect(result.rule?.value).toBe('sejong');
    });

    it('"강원" 약칭을 파싱한다', () => {
      const result = parseRegionRule('강원 지역');
      expect(result.rule?.value).toBe('gangwon');
    });

    it('거주/주소 키워드 없으면 신뢰도 낮아진다', () => {
      const result = parseRegionRule('서울특별시');
      expect(result.confidence).toBe(0.8);
    });

    it('파싱 불가 시 custom 필드로 처리한다', () => {
      const result = parseRegionRule('수도권 지역');
      expect(result.rule?.field).toBe('custom');
    });

    it('description이 올바르게 생성된다', () => {
      const result = parseRegionRule('서울특별시 거주자');
      expect(result.rule?.description).toBe('서울특별시 거주자');
    });
  });

  describe('parseEmploymentRule', () => {
    it('빈 문자열은 null을 반환한다', () => {
      const result = parseEmploymentRule('');
      expect(result.rule).toBeNull();
    });

    it('"미취업자"를 파싱한다', () => {
      const result = parseEmploymentRule('미취업자');
      expect(result.rule?.field).toBe('employment');
      expect(result.rule?.operator).toBe('in');
      expect(result.rule?.value).toEqual(['unemployed']);
    });

    it('"구직자"를 파싱한다', () => {
      const result = parseEmploymentRule('구직자 대상');
      expect(result.rule?.value).toEqual(['unemployed']);
    });

    it('"재직자"를 파싱한다', () => {
      const result = parseEmploymentRule('재직자 우대');
      expect(result.rule?.value).toEqual(['employed']);
    });

    it('"학생"을 파싱한다', () => {
      const result = parseEmploymentRule('대학생 및 재학생');
      expect(result.rule?.value).toContain('student');
    });

    it('"자영업자"를 파싱한다', () => {
      const result = parseEmploymentRule('자영업자');
      expect(result.rule?.value).toEqual(['self-employed']);
    });

    it('"아르바이트"를 파싱한다', () => {
      const result = parseEmploymentRule('아르바이트 가능');
      expect(result.rule?.value).toEqual(['part-time']);
    });

    it('부정어 있으면 notIn 연산자 사용', () => {
      const result = parseEmploymentRule('재직자 제외');
      expect(result.rule?.operator).toBe('notIn');
      expect(result.rule?.value).toEqual(['employed']);
    });

    it('파싱 불가 시 custom 필드로 처리한다', () => {
      const result = parseEmploymentRule('경력 무관');
      expect(result.rule?.field).toBe('custom');
    });
  });

  describe('parseBenefitRequirements', () => {
    it('모든 자격요건 필드를 파싱한다', () => {
      const benefit: BenefitDetail = {
        id: 'test-1',
        originalId: '1',
        source: 'youth-policy',
        title: '테스트 혜택',
        description: '테스트',
        category: 'employment',
        requirements: [],
        status: 'active',
        ageRequirement: '만 19세 이상 34세 이하',
        incomeRequirement: '기준 중위소득 100% 이하',
        residenceRequirement: '서울특별시 거주자',
        employmentRequirement: '미취업자',
      };

      const rules = parseBenefitRequirements(benefit);
      expect(rules).toHaveLength(4);
      expect(rules.map((r) => r.field)).toEqual([
        'age',
        'income',
        'region',
        'employment',
      ]);
    });

    it('자격요건이 없으면 빈 배열 반환', () => {
      const benefit: BenefitDetail = {
        id: 'test-1',
        originalId: '1',
        source: 'youth-policy',
        title: '테스트 혜택',
        description: '테스트',
        category: 'employment',
        requirements: [],
        status: 'active',
      };

      const rules = parseBenefitRequirements(benefit);
      expect(rules).toHaveLength(0);
    });

    it('학력/전공 조건은 custom으로 처리', () => {
      const benefit: BenefitDetail = {
        id: 'test-1',
        originalId: '1',
        source: 'youth-policy',
        title: '테스트 혜택',
        description: '테스트',
        category: 'employment',
        requirements: [],
        status: 'active',
        educationRequirement: '대학 재학생',
        majorRequirement: '이공계 전공자',
      };

      const rules = parseBenefitRequirements(benefit);
      expect(rules).toHaveLength(2);
      expect(rules.every((r) => r.field === 'custom')).toBe(true);
    });
  });

  describe('calculateOverallConfidence', () => {
    it('빈 배열은 1을 반환한다', () => {
      expect(calculateOverallConfidence([])).toBe(1);
    });

    it('평균 신뢰도를 계산한다', () => {
      const rules = [
        { metadata: { confidence: 1, originalText: '' } },
        { metadata: { confidence: 0.8, originalText: '' } },
        { metadata: { confidence: 0.6, originalText: '' } },
      ] as any[];

      expect(calculateOverallConfidence(rules)).toBeCloseTo(0.8);
    });
  });
});
