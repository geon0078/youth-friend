/**
 * 자격요건 텍스트 파서
 * Story 4.2: Implement Eligibility Rule Parser
 * API 응답의 자격요건 텍스트를 EligibilityRule로 변환
 */
import type { BenefitDetail } from '@/types/models/benefit';
import type {
  EligibilityRule,
  RuleFieldType,
  RuleOperator,
  RuleValue,
  RangeValue,
  RequirementSeverity,
  RuleMetadata,
} from '@/types/models/eligibility';
import type { Region, IncomeLevel, EmploymentStatus } from '@/types/models/user';
import { REGION_LABELS } from '@/types/models/user';

// ============================================
// 타입 정의
// ============================================

/**
 * 파싱 결과
 */
export interface ParseResult {
  /** 파싱된 규칙 (실패 시 null) */
  rule: EligibilityRule | null;
  /** 파싱 신뢰도 (0-1) */
  confidence: number;
}

/**
 * 규칙 ID 생성 카운터
 */
let ruleIdCounter = 0;

/**
 * 고유 규칙 ID 생성
 */
function generateRuleId(): string {
  ruleIdCounter += 1;
  return `rule-${Date.now()}-${ruleIdCounter}`;
}

/**
 * 규칙 ID 카운터 리셋 (테스트용)
 */
export function resetRuleIdCounter(): void {
  ruleIdCounter = 0;
}

// ============================================
// 나이 조건 파서
// ============================================

/**
 * 나이 조건 텍스트 파싱
 * @param text 나이 조건 텍스트 (예: "만 19세 이상 34세 이하")
 * @returns 파싱 결과
 *
 * @example
 * parseAgeRule("만 19세 이상 34세 이하")
 * // → { rule: { field: 'age', operator: 'range', value: { min: 19, max: 34 } }, confidence: 1 }
 */
export function parseAgeRule(text: string): ParseResult {
  if (!text || text.trim() === '') {
    return { rule: null, confidence: 0 };
  }

  // 숫자 추출
  const numbers = text.match(/\d+/g)?.map(Number) || [];

  if (numbers.length === 0) {
    return createCustomRule(text, 'age', '나이 조건을 파싱할 수 없습니다');
  }

  // 패턴 감지
  const isMinOnly =
    text.includes('이상') || text.includes('이후') || text.includes('부터');
  const isMaxOnlyInclusive =
    text.includes('이하') || text.includes('까지');
  const isMaxOnlyExclusive = text.includes('미만');

  let operator: RuleOperator;
  let value: RuleValue;
  let confidence = 1;

  if (numbers.length === 1) {
    const num = numbers[0];
    if (isMinOnly && !isMaxOnlyInclusive && !isMaxOnlyExclusive) {
      operator = 'gte';
      value = num;
    } else if (isMaxOnlyExclusive) {
      operator = 'lt';
      value = num;
    } else if (isMaxOnlyInclusive) {
      operator = 'lte';
      value = num;
    } else {
      // 단일 숫자, 범위 표현 없음 - 정확히 해당 나이
      operator = 'eq';
      value = num;
      confidence = 0.8; // 약간의 불확실성
    }
  } else {
    // 두 개 이상의 숫자 - 범위
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    operator = 'range';
    value = { min, max, maxExclusive: isMaxOnlyExclusive } as RangeValue;
  }

  const rule: EligibilityRule = {
    id: generateRuleId(),
    field: 'age',
    operator,
    value,
    severity: 'required',
    description: formatAgeDescription(operator, value),
    metadata: {
      originalText: text,
      confidence,
    },
  };

  return { rule, confidence };
}

/**
 * 나이 조건 설명 생성
 */
function formatAgeDescription(operator: RuleOperator, value: RuleValue): string {
  if (operator === 'range' && typeof value === 'object' && 'min' in value) {
    const range = value as RangeValue;
    if (range.min !== undefined && range.max !== undefined) {
      return `만 ${range.min}세 이상 ${range.max}세 ${range.maxExclusive ? '미만' : '이하'}`;
    }
    if (range.min !== undefined) {
      return `만 ${range.min}세 이상`;
    }
    if (range.max !== undefined) {
      return `만 ${range.max}세 ${range.maxExclusive ? '미만' : '이하'}`;
    }
  }
  if (operator === 'gte' && typeof value === 'number') {
    return `만 ${value}세 이상`;
  }
  if (operator === 'lte' && typeof value === 'number') {
    return `만 ${value}세 이하`;
  }
  if (operator === 'lt' && typeof value === 'number') {
    return `만 ${value}세 미만`;
  }
  if (operator === 'eq' && typeof value === 'number') {
    return `만 ${value}세`;
  }
  return '나이 조건';
}

// ============================================
// 소득 조건 파서
// ============================================

/**
 * 소득 조건 텍스트 파싱
 * @param text 소득 조건 텍스트 (예: "기준 중위소득 100% 이하")
 * @returns 파싱 결과
 *
 * @example
 * parseIncomeRule("기준 중위소득 100% 이하")
 * // → { rule: { field: 'income', operator: 'in', value: ['below50', '50to100', '100to150'] }, confidence: 1 }
 */
export function parseIncomeRule(text: string): ParseResult {
  if (!text || text.trim() === '') {
    return { rule: null, confidence: 0 };
  }

  const lowerText = text.toLowerCase();

  // 중위소득 % 추출
  const percentMatch = text.match(/(\d+)\s*%/);
  let matchedLevels: IncomeLevel[] = [];
  let confidence = 1;

  if (percentMatch) {
    const percent = parseInt(percentMatch[1], 10);
    const isLte = text.includes('이하') || text.includes('미만');
    const isGte = text.includes('이상') || text.includes('초과');

    if (isLte) {
      // X% 이하
      if (percent <= 50) {
        matchedLevels = ['below50'];
      } else if (percent <= 100) {
        matchedLevels = ['below50', '50to100'];
      } else if (percent <= 150) {
        matchedLevels = ['below50', '50to100', '100to150'];
      } else {
        matchedLevels = ['below50', '50to100', '100to150', 'above150'];
      }
    } else if (isGte) {
      // X% 이상
      if (percent >= 150) {
        matchedLevels = ['above150'];
      } else if (percent >= 100) {
        matchedLevels = ['100to150', 'above150'];
      } else if (percent >= 50) {
        matchedLevels = ['50to100', '100to150', 'above150'];
      } else {
        matchedLevels = ['below50', '50to100', '100to150', 'above150'];
      }
    } else {
      // 정확히 X%
      if (percent <= 50) {
        matchedLevels = ['below50'];
      } else if (percent <= 100) {
        matchedLevels = ['50to100'];
      } else if (percent <= 150) {
        matchedLevels = ['100to150'];
      } else {
        matchedLevels = ['above150'];
      }
      confidence = 0.8;
    }
  } else {
    // 키워드 기반 파싱
    if (lowerText.includes('저소득') || lowerText.includes('기초생활')) {
      matchedLevels = ['below50'];
      confidence = 0.9;
    } else if (lowerText.includes('차상위')) {
      matchedLevels = ['below50', '50to100'];
      confidence = 0.9;
    } else {
      return createCustomRule(text, 'income', '소득 조건을 파싱할 수 없습니다');
    }
  }

  const rule: EligibilityRule = {
    id: generateRuleId(),
    field: 'income',
    operator: 'in',
    value: matchedLevels,
    severity: 'required',
    description: formatIncomeDescription(matchedLevels),
    metadata: {
      originalText: text,
      confidence,
    },
  };

  return { rule, confidence };
}

/**
 * 소득 조건 설명 생성
 */
function formatIncomeDescription(levels: IncomeLevel[]): string {
  if (levels.length === 0) return '소득 조건';

  const hasBelow50 = levels.includes('below50');
  const has50to100 = levels.includes('50to100');
  const has100to150 = levels.includes('100to150');
  const hasAbove150 = levels.includes('above150');

  if (hasBelow50 && has50to100 && has100to150 && hasAbove150) {
    return '소득 제한 없음';
  }
  if (hasBelow50 && has50to100 && has100to150 && !hasAbove150) {
    return '기준 중위소득 150% 이하';
  }
  if (hasBelow50 && has50to100 && !has100to150) {
    return '기준 중위소득 100% 이하';
  }
  if (hasBelow50 && !has50to100) {
    return '기준 중위소득 50% 이하';
  }

  return '소득 조건 해당';
}

// ============================================
// 지역 조건 파서
// ============================================

/**
 * 지역명 역매핑 (한글 → Region 코드)
 */
const REGION_REVERSE_MAP: Record<string, Region> = {};
for (const [code, label] of Object.entries(REGION_LABELS)) {
  REGION_REVERSE_MAP[label] = code as Region;
  // 약칭도 매핑
  if (label.includes('특별시')) {
    REGION_REVERSE_MAP[label.replace('특별시', '')] = code as Region;
  }
  if (label.includes('광역시')) {
    REGION_REVERSE_MAP[label.replace('광역시', '')] = code as Region;
  }
  if (label.includes('특별자치시')) {
    REGION_REVERSE_MAP[label.replace('특별자치시', '')] = code as Region;
  }
  if (label.includes('특별자치도')) {
    REGION_REVERSE_MAP[label.replace('특별자치도', '')] = code as Region;
    REGION_REVERSE_MAP[label.replace('특별자치도', '도')] = code as Region;
  }
  if (label.endsWith('도')) {
    REGION_REVERSE_MAP[label.replace('도', '')] = code as Region;
  }
}
// 추가 별칭
REGION_REVERSE_MAP['경기'] = 'gyeonggi';
REGION_REVERSE_MAP['강원'] = 'gangwon';
REGION_REVERSE_MAP['충북'] = 'chungbuk';
REGION_REVERSE_MAP['충남'] = 'chungnam';
REGION_REVERSE_MAP['전북'] = 'jeonbuk';
REGION_REVERSE_MAP['전남'] = 'jeonnam';
REGION_REVERSE_MAP['경북'] = 'gyeongbuk';
REGION_REVERSE_MAP['경남'] = 'gyeongnam';

/**
 * 지역 조건 텍스트 파싱
 * @param text 지역 조건 텍스트 (예: "서울특별시 거주자")
 * @returns 파싱 결과
 *
 * @example
 * parseRegionRule("서울특별시 거주자")
 * // → { rule: { field: 'region', operator: 'eq', value: 'seoul' }, confidence: 1 }
 */
export function parseRegionRule(text: string): ParseResult {
  if (!text || text.trim() === '') {
    return { rule: null, confidence: 0 };
  }

  // 지역명 매칭
  let matchedRegion: Region | null = null;
  let confidence = 1;

  for (const [name, code] of Object.entries(REGION_REVERSE_MAP)) {
    if (text.includes(name)) {
      matchedRegion = code;
      break;
    }
  }

  if (!matchedRegion) {
    return createCustomRule(text, 'region', '지역 조건을 파싱할 수 없습니다');
  }

  // "거주", "주소", "거주지" 등 키워드 확인으로 신뢰도 조정
  if (!text.includes('거주') && !text.includes('주소') && !text.includes('지역')) {
    confidence = 0.8;
  }

  const rule: EligibilityRule = {
    id: generateRuleId(),
    field: 'region',
    operator: 'eq',
    value: matchedRegion,
    severity: 'required',
    description: `${REGION_LABELS[matchedRegion]} 거주자`,
    metadata: {
      originalText: text,
      confidence,
    },
  };

  return { rule, confidence };
}

// ============================================
// 취업상태 조건 파서
// ============================================

/**
 * 취업상태 키워드 매핑
 */
const EMPLOYMENT_KEYWORDS: Record<string, EmploymentStatus[]> = {
  // 재직중
  '재직': ['employed'],
  '재직자': ['employed'],
  '재직중': ['employed'],
  '취업자': ['employed'],
  '취업중': ['employed'],
  '근로자': ['employed'],
  '직장인': ['employed'],
  // 미취업
  '미취업': ['unemployed'],
  '미취업자': ['unemployed'],
  '구직자': ['unemployed'],
  '구직중': ['unemployed'],
  '실업자': ['unemployed'],
  '무직': ['unemployed'],
  // 학생
  '학생': ['student'],
  '대학생': ['student'],
  '재학생': ['student'],
  '재학': ['student'],
  '대학원생': ['student'],
  // 자영업
  '자영업': ['self-employed'],
  '자영업자': ['self-employed'],
  '사업자': ['self-employed'],
  '창업자': ['self-employed'],
  // 아르바이트
  '아르바이트': ['part-time'],
  '알바': ['part-time'],
  '파트타임': ['part-time'],
  '시간제': ['part-time'],
  // 복합
  '청년': ['unemployed', 'student', 'part-time'], // 일반적으로 청년 정책 대상
};

/**
 * 취업상태 조건 텍스트 파싱
 * @param text 취업상태 조건 텍스트 (예: "미취업자")
 * @returns 파싱 결과
 *
 * @example
 * parseEmploymentRule("미취업자")
 * // → { rule: { field: 'employment', operator: 'in', value: ['unemployed'] }, confidence: 1 }
 */
export function parseEmploymentRule(text: string): ParseResult {
  if (!text || text.trim() === '') {
    return { rule: null, confidence: 0 };
  }

  let matchedStatuses: EmploymentStatus[] = [];
  let confidence = 1;

  // 키워드 매칭 - 가장 긴 키워드 우선
  let longestMatchLength = 0;
  for (const [keyword, statuses] of Object.entries(EMPLOYMENT_KEYWORDS)) {
    if (text.includes(keyword) && keyword.length > longestMatchLength) {
      matchedStatuses = statuses;
      longestMatchLength = keyword.length;
    }
  }

  if (matchedStatuses.length === 0) {
    return createCustomRule(text, 'employment', '취업상태 조건을 파싱할 수 없습니다');
  }

  // 부정어 확인
  if (text.includes('제외') || text.includes('아닌') || text.includes('불가')) {
    // 부정의 경우 notIn 연산자 사용
    const rule: EligibilityRule = {
      id: generateRuleId(),
      field: 'employment',
      operator: 'notIn',
      value: matchedStatuses,
      severity: 'required',
      description: `${formatEmploymentDescription(matchedStatuses)} 제외`,
      metadata: {
        originalText: text,
        confidence,
      },
    };
    return { rule, confidence };
  }

  const rule: EligibilityRule = {
    id: generateRuleId(),
    field: 'employment',
    operator: 'in',
    value: matchedStatuses,
    severity: 'required',
    description: formatEmploymentDescription(matchedStatuses),
    metadata: {
      originalText: text,
      confidence,
    },
  };

  return { rule, confidence };
}

/**
 * 취업상태 설명 생성
 */
function formatEmploymentDescription(statuses: EmploymentStatus[]): string {
  const labels: Record<EmploymentStatus, string> = {
    employed: '재직자',
    unemployed: '미취업자',
    student: '학생',
    'self-employed': '자영업자',
    'part-time': '아르바이트',
  };

  return statuses.map((s) => labels[s]).join(' 또는 ');
}

// ============================================
// 통합 파서
// ============================================

/**
 * 파싱 실패 시 custom 규칙 생성
 */
function createCustomRule(
  originalText: string,
  attemptedField: RuleFieldType,
  errorMessage: string
): ParseResult {
  const rule: EligibilityRule = {
    id: generateRuleId(),
    field: 'custom',
    operator: 'eq',
    value: originalText,
    severity: 'required',
    description: '직접 확인 필요',
    metadata: {
      originalText,
      confidence: 0,
      parseError: errorMessage,
    },
  };

  return { rule, confidence: 0 };
}

/**
 * BenefitDetail의 모든 자격요건 파싱
 * @param benefit 혜택 상세 정보
 * @returns 파싱된 규칙 배열
 *
 * @example
 * parseBenefitRequirements(benefitDetail)
 * // → [ageRule, incomeRule, regionRule, ...]
 */
export function parseBenefitRequirements(benefit: BenefitDetail): EligibilityRule[] {
  const rules: EligibilityRule[] = [];

  // 나이 조건
  if (benefit.ageRequirement) {
    const result = parseAgeRule(benefit.ageRequirement);
    if (result.rule) {
      rules.push(result.rule);
    }
  }

  // 소득 조건
  if (benefit.incomeRequirement) {
    const result = parseIncomeRule(benefit.incomeRequirement);
    if (result.rule) {
      rules.push(result.rule);
    }
  }

  // 지역 조건
  if (benefit.residenceRequirement) {
    const result = parseRegionRule(benefit.residenceRequirement);
    if (result.rule) {
      rules.push(result.rule);
    }
  }

  // 취업상태 조건
  if (benefit.employmentRequirement) {
    const result = parseEmploymentRule(benefit.employmentRequirement);
    if (result.rule) {
      rules.push(result.rule);
    }
  }

  // 학력 조건 (현재 custom으로 처리)
  if (benefit.educationRequirement) {
    const result = createCustomRule(
      benefit.educationRequirement,
      'education',
      '학력 조건 파서 미구현'
    );
    if (result.rule) {
      rules.push(result.rule);
    }
  }

  // 전공 조건 (현재 custom으로 처리)
  if (benefit.majorRequirement) {
    const result = createCustomRule(
      benefit.majorRequirement,
      'major',
      '전공 조건 파서 미구현'
    );
    if (result.rule) {
      rules.push(result.rule);
    }
  }

  return rules;
}

/**
 * 전체 파싱 신뢰도 계산
 * @param rules 파싱된 규칙 배열
 * @returns 평균 신뢰도 (0-1)
 */
export function calculateOverallConfidence(rules: EligibilityRule[]): number {
  if (rules.length === 0) {
    return 1; // 규칙 없으면 완전 신뢰
  }

  const totalConfidence = rules.reduce(
    (sum, rule) => sum + rule.metadata.confidence,
    0
  );

  return totalConfidence / rules.length;
}
