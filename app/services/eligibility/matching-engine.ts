/**
 * 자격 매칭 엔진
 * Story 4.3: Implement Profile-Benefit Matching Engine
 * 사용자 프로필과 혜택 자격요건을 비교하여 매칭 결과 제공
 */
import type { BenefitDetail } from '@/types/models/benefit';
import type {
  EligibilityResult,
  EligibilityRule,
  EligibilityStatus,
  EligibilityCheckOptions,
  MatchScore,
  RuleCheckResult,
  UnmetRequirement,
  FutureEligibility,
  RangeValue,
  RuleValue,
} from '@/types/models/eligibility';
import type { UserProfile, IncomeLevel, EmploymentStatus, Region } from '@/types/models/user';
import {
  DEFAULT_ELIGIBILITY_OPTIONS,
  ELIGIBILITY_CACHE_TTL,
  FIELD_TYPE_LABELS,
} from '@/types/models/eligibility';
import {
  REGION_LABELS,
  INCOME_LEVEL_LABELS,
  EMPLOYMENT_STATUS_LABELS,
} from '@/types/models/user';
import { parseBenefitRequirements } from './rule-parser';

// ============================================
// 캐시 관리
// ============================================

interface CacheEntry {
  result: EligibilityResult;
  expiresAt: number;
}

const eligibilityCache = new Map<string, CacheEntry>();

/**
 * 프로필 해시 생성
 */
function generateProfileHash(profile: UserProfile): string {
  return `${profile.birthYear}-${profile.region}-${profile.incomeLevel}-${profile.employmentStatus}`;
}

/**
 * 캐시 키 생성
 */
function generateCacheKey(benefitId: string, profileHash: string): string {
  return `${benefitId}-${profileHash}`;
}

/**
 * 캐시에서 결과 조회
 */
export function getCachedResult(
  benefitId: string,
  profile: UserProfile
): EligibilityResult | null {
  const profileHash = generateProfileHash(profile);
  const cacheKey = generateCacheKey(benefitId, profileHash);
  const entry = eligibilityCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    eligibilityCache.delete(cacheKey);
    return null;
  }

  return entry.result;
}

/**
 * 캐시에 결과 저장
 */
export function setCachedResult(
  benefitId: string,
  profile: UserProfile,
  result: EligibilityResult
): void {
  const profileHash = generateProfileHash(profile);
  const cacheKey = generateCacheKey(benefitId, profileHash);

  eligibilityCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + ELIGIBILITY_CACHE_TTL,
  });
}

/**
 * 캐시 무효화
 */
export function invalidateCache(): void {
  eligibilityCache.clear();
}

/**
 * 특정 혜택 캐시 무효화
 */
export function invalidateBenefitCache(benefitId: string): void {
  for (const key of eligibilityCache.keys()) {
    if (key.startsWith(benefitId)) {
      eligibilityCache.delete(key);
    }
  }
}

// ============================================
// 개별 규칙 검증
// ============================================

/**
 * 사용자 나이 계산
 */
function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * 나이 규칙 검증
 */
export function checkAgeRule(
  profile: UserProfile,
  rule: EligibilityRule
): RuleCheckResult {
  const userAge = calculateAge(profile.birthYear);

  let passed = false;
  let message = '';

  switch (rule.operator) {
    case 'range': {
      const range = rule.value as RangeValue;
      const minOk = range.min === undefined || userAge >= range.min;
      const maxOk = range.max === undefined ||
        (range.maxExclusive ? userAge < range.max : userAge <= range.max);
      passed = minOk && maxOk;
      if (!passed) {
        if (range.min !== undefined && userAge < range.min) {
          message = `현재 ${userAge}세 (${range.min}세 이상 필요)`;
        } else if (range.max !== undefined) {
          message = `현재 ${userAge}세 (${range.max}세 ${range.maxExclusive ? '미만' : '이하'} 필요)`;
        }
      } else {
        message = `${userAge}세 - 조건 충족`;
      }
      break;
    }
    case 'gte':
      passed = userAge >= (rule.value as number);
      message = passed
        ? `${userAge}세 - 조건 충족`
        : `현재 ${userAge}세 (${rule.value}세 이상 필요)`;
      break;
    case 'lte':
      passed = userAge <= (rule.value as number);
      message = passed
        ? `${userAge}세 - 조건 충족`
        : `현재 ${userAge}세 (${rule.value}세 이하 필요)`;
      break;
    case 'lt':
      passed = userAge < (rule.value as number);
      message = passed
        ? `${userAge}세 - 조건 충족`
        : `현재 ${userAge}세 (${rule.value}세 미만 필요)`;
      break;
    case 'gt':
      passed = userAge > (rule.value as number);
      message = passed
        ? `${userAge}세 - 조건 충족`
        : `현재 ${userAge}세 (${rule.value}세 초과 필요)`;
      break;
    case 'eq':
      passed = userAge === (rule.value as number);
      message = passed
        ? `${userAge}세 - 조건 충족`
        : `현재 ${userAge}세 (${rule.value}세 필요)`;
      break;
    default:
      passed = false;
      message = '지원하지 않는 연산자';
  }

  return {
    ruleId: rule.id,
    field: 'age',
    passed,
    userValue: userAge,
    requiredValue: rule.value,
    message,
  };
}

/**
 * 소득 규칙 검증
 */
export function checkIncomeRule(
  profile: UserProfile,
  rule: EligibilityRule
): RuleCheckResult {
  const userIncome = profile.incomeLevel;
  let passed = false;
  let message = '';

  if (rule.operator === 'in' && Array.isArray(rule.value)) {
    const allowedLevels = rule.value as IncomeLevel[];
    passed = allowedLevels.includes(userIncome);
    message = passed
      ? `${INCOME_LEVEL_LABELS[userIncome]} - 조건 충족`
      : `${INCOME_LEVEL_LABELS[userIncome]} - 조건 미충족`;
  } else {
    message = '지원하지 않는 소득 검증 형식';
  }

  return {
    ruleId: rule.id,
    field: 'income',
    passed,
    userValue: userIncome,
    requiredValue: rule.value,
    message,
  };
}

/**
 * 지역 규칙 검증
 */
export function checkRegionRule(
  profile: UserProfile,
  rule: EligibilityRule
): RuleCheckResult {
  const userRegion = profile.region;
  let passed = false;
  let message = '';

  if (rule.operator === 'eq') {
    passed = userRegion === rule.value;
    message = passed
      ? `${REGION_LABELS[userRegion]} - 조건 충족`
      : `${REGION_LABELS[userRegion]} (${REGION_LABELS[rule.value as Region]} 거주 필요)`;
  } else if (rule.operator === 'in' && Array.isArray(rule.value)) {
    const allowedRegions = rule.value as Region[];
    passed = allowedRegions.includes(userRegion);
    message = passed
      ? `${REGION_LABELS[userRegion]} - 조건 충족`
      : `${REGION_LABELS[userRegion]} - 해당 지역 미포함`;
  } else {
    message = '지원하지 않는 지역 검증 형식';
  }

  return {
    ruleId: rule.id,
    field: 'region',
    passed,
    userValue: userRegion,
    requiredValue: rule.value,
    message,
  };
}

/**
 * 취업상태 규칙 검증
 */
export function checkEmploymentRule(
  profile: UserProfile,
  rule: EligibilityRule
): RuleCheckResult {
  const userEmployment = profile.employmentStatus;
  let passed = false;
  let message = '';

  if (rule.operator === 'in' && Array.isArray(rule.value)) {
    const allowedStatuses = rule.value as EmploymentStatus[];
    passed = allowedStatuses.includes(userEmployment);
    message = passed
      ? `${EMPLOYMENT_STATUS_LABELS[userEmployment]} - 조건 충족`
      : `${EMPLOYMENT_STATUS_LABELS[userEmployment]} - 조건 미충족`;
  } else if (rule.operator === 'notIn' && Array.isArray(rule.value)) {
    const excludedStatuses = rule.value as EmploymentStatus[];
    passed = !excludedStatuses.includes(userEmployment);
    message = passed
      ? `${EMPLOYMENT_STATUS_LABELS[userEmployment]} - 조건 충족`
      : `${EMPLOYMENT_STATUS_LABELS[userEmployment]} - 해당 상태 제외 대상`;
  } else {
    message = '지원하지 않는 취업상태 검증 형식';
  }

  return {
    ruleId: rule.id,
    field: 'employment',
    passed,
    userValue: userEmployment,
    requiredValue: rule.value,
    message,
  };
}

/**
 * 사용자 정의(custom) 규칙 검증
 * 자동 검증 불가, unknown으로 처리
 */
export function checkCustomRule(rule: EligibilityRule): RuleCheckResult {
  return {
    ruleId: rule.id,
    field: 'custom',
    passed: false,
    userValue: null,
    requiredValue: rule.value,
    message: '직접 확인이 필요합니다',
  };
}

/**
 * 규칙 검증 라우터
 */
function checkRule(
  profile: UserProfile,
  rule: EligibilityRule
): RuleCheckResult {
  switch (rule.field) {
    case 'age':
      return checkAgeRule(profile, rule);
    case 'income':
      return checkIncomeRule(profile, rule);
    case 'region':
      return checkRegionRule(profile, rule);
    case 'employment':
      return checkEmploymentRule(profile, rule);
    case 'custom':
    case 'education':
    case 'major':
    case 'residence':
    default:
      return checkCustomRule(rule);
  }
}

// ============================================
// 미래 자격 계산
// ============================================

/**
 * 미래 자격 획득 가능성 계산
 * 나이 조건 미충족 시 몇 년 후 자격 획득 가능한지 계산
 */
export function calculateFutureEligibility(
  profile: UserProfile,
  rule: EligibilityRule
): FutureEligibility | undefined {
  if (rule.field !== 'age') {
    return undefined;
  }

  const currentYear = new Date().getFullYear();
  const userAge = calculateAge(profile.birthYear);

  // range 연산자 - min보다 작은 경우
  if (rule.operator === 'range') {
    const range = rule.value as RangeValue;
    if (range.min !== undefined && userAge < range.min) {
      const yearsUntil = range.min - userAge;
      return {
        eligibleYear: currentYear + yearsUntil,
        yearsUntilEligible: yearsUntil,
        message: `${yearsUntil}년 후 자격 획득`,
      };
    }
    // max를 초과한 경우 - 미래에도 자격 획득 불가
    if (range.max !== undefined) {
      const exceeded = range.maxExclusive ? userAge >= range.max : userAge > range.max;
      if (exceeded) {
        return undefined; // 이미 나이가 초과됨
      }
    }
  }

  // gte 연산자 - 값보다 작은 경우
  if (rule.operator === 'gte' && typeof rule.value === 'number') {
    if (userAge < rule.value) {
      const yearsUntil = rule.value - userAge;
      return {
        eligibleYear: currentYear + yearsUntil,
        yearsUntilEligible: yearsUntil,
        message: `${yearsUntil}년 후 자격 획득`,
      };
    }
  }

  // gt 연산자 - 값 이하인 경우
  if (rule.operator === 'gt' && typeof rule.value === 'number') {
    if (userAge <= rule.value) {
      const yearsUntil = rule.value - userAge + 1;
      return {
        eligibleYear: currentYear + yearsUntil,
        yearsUntilEligible: yearsUntil,
        message: `${yearsUntil}년 후 자격 획득`,
      };
    }
  }

  return undefined;
}

// ============================================
// 결과 계산
// ============================================

/**
 * 매칭 점수 계산
 */
function calculateScore(
  ruleResults: RuleCheckResult[],
  rules: EligibilityRule[]
): MatchScore {
  if (ruleResults.length === 0) {
    return {
      total: 100,
      metCount: 0,
      unmetCount: 0,
      unknownCount: 0,
      totalRules: 0,
    };
  }

  // custom 규칙은 unknown으로 카운트
  const customRuleIds = new Set(
    rules.filter(r => r.field === 'custom').map(r => r.id)
  );

  let metCount = 0;
  let unmetCount = 0;
  let unknownCount = 0;

  for (const result of ruleResults) {
    if (customRuleIds.has(result.ruleId)) {
      unknownCount++;
    } else if (result.passed) {
      metCount++;
    } else {
      unmetCount++;
    }
  }

  // 점수 계산 (unknown은 제외)
  const scorableResults = ruleResults.length - unknownCount;
  const total = scorableResults > 0
    ? Math.round((metCount / scorableResults) * 100)
    : 100;

  return {
    total,
    metCount,
    unmetCount,
    unknownCount,
    totalRules: ruleResults.length,
  };
}

/**
 * 자격 상태 결정
 */
function determineStatus(
  ruleResults: RuleCheckResult[],
  rules: EligibilityRule[]
): EligibilityStatus {
  if (ruleResults.length === 0) {
    return 'eligible'; // 규칙 없으면 자격 있음
  }

  // 규칙별 결과 매핑
  const resultMap = new Map<string, RuleCheckResult>();
  for (const result of ruleResults) {
    resultMap.set(result.ruleId, result);
  }

  let hasCustomOnly = true;
  let hasFailedRequired = false;
  let hasFailedRecommended = false;

  for (const rule of rules) {
    const result = resultMap.get(rule.id);
    if (!result) continue;

    if (rule.field !== 'custom') {
      hasCustomOnly = false;
    }

    if (!result.passed && rule.field !== 'custom') {
      if (rule.severity === 'required') {
        hasFailedRequired = true;
      } else if (rule.severity === 'recommended') {
        hasFailedRecommended = true;
      }
    }
  }

  // custom 규칙만 있으면 unknown
  if (hasCustomOnly) {
    return 'unknown';
  }

  // 필수 조건 실패
  if (hasFailedRequired) {
    return 'ineligible';
  }

  // 권장 조건 실패
  if (hasFailedRecommended) {
    return 'partial';
  }

  return 'eligible';
}

/**
 * 미충족 요건 목록 생성
 */
function generateUnmetRequirements(
  profile: UserProfile,
  ruleResults: RuleCheckResult[],
  rules: EligibilityRule[]
): UnmetRequirement[] {
  const unmetRequirements: UnmetRequirement[] = [];

  const ruleMap = new Map<string, EligibilityRule>();
  for (const rule of rules) {
    ruleMap.set(rule.id, rule);
  }

  for (const result of ruleResults) {
    if (result.passed) continue;

    const rule = ruleMap.get(result.ruleId);
    if (!rule) continue;

    const currentValue = formatCurrentValue(result.field, result.userValue);
    const requiredValue = formatRequiredValue(rule);
    const futureEligibility = calculateFutureEligibility(profile, rule);
    const canResolveByProfile = ['income', 'region', 'employment'].includes(rule.field);

    unmetRequirements.push({
      ruleId: rule.id,
      field: rule.field,
      severity: rule.severity,
      description: rule.description,
      currentValue,
      requiredValue,
      futureEligibility,
      canResolveByProfile,
    });
  }

  return unmetRequirements;
}

/**
 * 현재 값 포맷팅
 */
function formatCurrentValue(
  field: string,
  value: RuleValue | null
): string | undefined {
  if (value === null) return undefined;

  switch (field) {
    case 'age':
      return `${value}세`;
    case 'income':
      return INCOME_LEVEL_LABELS[value as IncomeLevel] || String(value);
    case 'region':
      return REGION_LABELS[value as Region] || String(value);
    case 'employment':
      return EMPLOYMENT_STATUS_LABELS[value as EmploymentStatus] || String(value);
    default:
      return String(value);
  }
}

/**
 * 요구 값 포맷팅
 */
function formatRequiredValue(rule: EligibilityRule): string {
  return rule.description || FIELD_TYPE_LABELS[rule.field];
}

// ============================================
// 메인 매칭 함수
// ============================================

/**
 * 자격 매칭 입력 타입
 */
export interface CheckEligibilityInput {
  /** 사용자 프로필 */
  profile: UserProfile;
  /** 혜택 상세 정보 */
  benefit: BenefitDetail;
  /** 검증 옵션 */
  options?: EligibilityCheckOptions;
}

/**
 * 자격 매칭 실행
 * @param input 매칭 입력 (프로필, 혜택, 옵션)
 * @returns 자격 검증 결과
 *
 * @example
 * const result = checkEligibility({
 *   profile: userProfile,
 *   benefit: benefitDetail,
 * });
 * // result.status: 'eligible' | 'ineligible' | 'partial' | 'unknown'
 */
export function checkEligibility(input: CheckEligibilityInput): EligibilityResult {
  const { profile, benefit, options = DEFAULT_ELIGIBILITY_OPTIONS } = input;

  // 캐시 확인
  if (options.useCache !== false) {
    const cachedResult = getCachedResult(benefit.id, profile);
    if (cachedResult) {
      return cachedResult;
    }
  }

  // 혜택 자격요건 파싱
  const rules = parseBenefitRequirements(benefit);

  // 각 규칙 검증
  const ruleResults: RuleCheckResult[] = [];
  for (const rule of rules) {
    const result = checkRule(profile, rule);
    ruleResults.push(result);
  }

  // 결과 계산
  const status = determineStatus(ruleResults, rules);
  const score = calculateScore(ruleResults, rules);
  const unmetRequirements = options.includeDetails !== false
    ? generateUnmetRequirements(profile, ruleResults, rules)
    : [];

  const now = new Date();
  const result: EligibilityResult = {
    benefitId: benefit.id,
    status,
    score,
    ruleResults: options.includeDetails !== false ? ruleResults : [],
    unmetRequirements,
    checkedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ELIGIBILITY_CACHE_TTL).toISOString(),
  };

  // 캐시 저장
  if (options.useCache !== false) {
    setCachedResult(benefit.id, profile, result);
  }

  return result;
}

/**
 * 여러 혜택에 대한 자격 매칭 실행
 * @param profile 사용자 프로필
 * @param benefits 혜택 목록
 * @param options 검증 옵션
 * @returns 혜택별 자격 검증 결과 Map
 */
export function checkEligibilityBatch(
  profile: UserProfile,
  benefits: BenefitDetail[],
  options?: EligibilityCheckOptions
): Map<string, EligibilityResult> {
  const results = new Map<string, EligibilityResult>();

  for (const benefit of benefits) {
    const result = checkEligibility({ profile, benefit, options });
    results.set(benefit.id, result);
  }

  return results;
}
