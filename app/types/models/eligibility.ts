/**
 * 자격 검증 타입 정의
 * Story 4.1: Define Eligibility Rule Engine Types
 * FR11-14: 자격 검증, 매칭, 미충족 안내, 면책 표시
 */

// ============================================
// 기본 타입 및 유니온 타입
// ============================================

/**
 * 자격 상태
 * - eligible: 모든 조건 충족
 * - ineligible: 필수 조건 미충족
 * - partial: 일부 조건만 충족
 * - unknown: 검증 불가 (파싱 실패 등)
 */
export type EligibilityStatus = 'eligible' | 'ineligible' | 'partial' | 'unknown';

/**
 * 규칙 비교 연산자
 */
export type RuleOperator =
  | 'eq'       // 같음 (==)
  | 'ne'       // 같지 않음 (!=)
  | 'gt'       // 초과 (>)
  | 'gte'      // 이상 (>=)
  | 'lt'       // 미만 (<)
  | 'lte'      // 이하 (<=)
  | 'in'       // 포함 (배열 내 존재)
  | 'notIn'    // 미포함 (배열 내 미존재)
  | 'contains' // 문자열 포함
  | 'range';   // 범위 (min-max)

/**
 * 규칙 필드 타입
 */
export type RuleFieldType =
  | 'age'          // 나이
  | 'income'       // 소득수준
  | 'region'       // 지역
  | 'employment'   // 취업상태
  | 'education'    // 학력
  | 'major'        // 전공
  | 'residence'    // 거주지
  | 'custom';      // 기타 (직접 확인 필요)

/**
 * 규칙 값 타입
 * 단일 값 또는 배열 (in, notIn 연산자용)
 */
export type RuleValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | RangeValue;

/**
 * 범위 값 타입 (range 연산자용)
 */
export interface RangeValue {
  /** 최소값 */
  min?: number;
  /** 최대값 */
  max?: number;
  /** max가 exclusive인지 (미만 vs 이하) */
  maxExclusive?: boolean;
}

/**
 * 요건 심각도
 * - required: 필수 조건 (미충족 시 자격 없음)
 * - recommended: 권장 조건 (미충족 시 부분 충족)
 * - optional: 선택 조건 (매칭 점수에만 영향)
 */
export type RequirementSeverity = 'required' | 'recommended' | 'optional';

// ============================================
// 규칙 관련 인터페이스
// ============================================

/**
 * 규칙 메타데이터
 * 원문 텍스트와 파싱 신뢰도 정보
 */
export interface RuleMetadata {
  /** 원문 자격요건 텍스트 (파싱 전) */
  originalText: string;
  /** 파싱 신뢰도 (0-1, 1이면 완전 파싱) */
  confidence: number;
  /** 파싱 실패 사유 (confidence < 1인 경우) */
  parseError?: string;
}

/**
 * 자격 검증 규칙
 * 혜택의 자격요건을 프로그래밍적으로 표현
 */
export interface EligibilityRule {
  /** 규칙 고유 ID (자동 생성) */
  id: string;
  /** 검증 필드 타입 */
  field: RuleFieldType;
  /** 비교 연산자 */
  operator: RuleOperator;
  /** 비교 값 */
  value: RuleValue;
  /** 요건 심각도 */
  severity: RequirementSeverity;
  /** 사용자 표시용 설명 */
  description: string;
  /** 파싱 메타데이터 */
  metadata: RuleMetadata;
}

/**
 * 개별 규칙 검증 결과
 */
export interface RuleCheckResult {
  /** 규칙 ID */
  ruleId: string;
  /** 규칙 필드 */
  field: RuleFieldType;
  /** 충족 여부 */
  passed: boolean;
  /** 사용자의 현재 값 */
  userValue: RuleValue | null;
  /** 요구되는 값 */
  requiredValue: RuleValue;
  /** 결과 설명 */
  message: string;
}

// ============================================
// 결과 관련 인터페이스
// ============================================

/**
 * 매칭 점수
 * 자격 충족률을 수치화
 */
export interface MatchScore {
  /** 총점 (0-100) */
  total: number;
  /** 충족한 규칙 수 */
  metCount: number;
  /** 미충족 규칙 수 */
  unmetCount: number;
  /** 검증 불가 규칙 수 */
  unknownCount: number;
  /** 총 규칙 수 */
  totalRules: number;
}

/**
 * 미충족 요건 정보
 * FR13: 사용자가 부족한 요건을 확인할 수 있도록
 */
export interface UnmetRequirement {
  /** 규칙 ID */
  ruleId: string;
  /** 필드 타입 */
  field: RuleFieldType;
  /** 요건 심각도 */
  severity: RequirementSeverity;
  /** 요건 설명 (사용자 표시용) */
  description: string;
  /** 현재 값 (표시용) */
  currentValue?: string;
  /** 필요 값 (표시용) */
  requiredValue: string;
  /** 미래 충족 가능성 (나이 조건 등) */
  futureEligibility?: FutureEligibility;
  /** 프로필 수정으로 해결 가능 여부 */
  canResolveByProfile: boolean;
}

/**
 * 미래 자격 획득 정보
 * 나이 조건 미충족 시 "N년 후 자격 획득" 표시용
 */
export interface FutureEligibility {
  /** 자격 획득 예상 연도 */
  eligibleYear: number;
  /** 자격 획득까지 남은 연수 */
  yearsUntilEligible: number;
  /** 메시지 (예: "2년 후 자격 획득") */
  message: string;
}

/**
 * 자격 검증 결과
 * FR11-14의 핵심 데이터 구조
 */
export interface EligibilityResult {
  /** 검증 대상 혜택 ID */
  benefitId: string;
  /** 자격 상태 */
  status: EligibilityStatus;
  /** 매칭 점수 */
  score: MatchScore;
  /** 개별 규칙 검증 결과 */
  ruleResults: RuleCheckResult[];
  /** 미충족 요건 목록 (FR13) */
  unmetRequirements: UnmetRequirement[];
  /** 검증 시각 (ISO 8601) */
  checkedAt: string;
  /** 캐시 만료 시각 (프로필 변경 시 무효화) */
  expiresAt: string;
}

// ============================================
// 옵션 및 설정 인터페이스
// ============================================

/**
 * 자격 검증 옵션
 */
export interface EligibilityCheckOptions {
  /** unknown 상태 포함 여부 (기본: true) */
  includeUnknown?: boolean;
  /** 캐시 사용 여부 (기본: true) */
  useCache?: boolean;
  /** 상세 결과 포함 여부 (기본: true) */
  includeDetails?: boolean;
}

// ============================================
// 상수 및 기본값
// ============================================

/**
 * 자격 상태별 UI 레이블
 */
export const ELIGIBILITY_STATUS_LABELS: Record<EligibilityStatus, string> = {
  eligible: '자격 충족',
  ineligible: '자격 미충족',
  partial: '일부 조건 미충족',
  unknown: '직접 확인 필요',
};

/**
 * 자격 상태별 색상 키 (Palette 참조용)
 */
export const ELIGIBILITY_STATUS_COLORS: Record<EligibilityStatus, string> = {
  eligible: 'success',
  ineligible: 'error',
  partial: 'warning',
  unknown: 'textMuted',
};

/**
 * 요건 심각도별 UI 레이블
 */
export const SEVERITY_LABELS: Record<RequirementSeverity, string> = {
  required: '필수',
  recommended: '권장',
  optional: '선택',
};

/**
 * 필드 타입별 UI 레이블
 */
export const FIELD_TYPE_LABELS: Record<RuleFieldType, string> = {
  age: '나이',
  income: '소득수준',
  region: '지역',
  employment: '취업상태',
  education: '학력',
  major: '전공',
  residence: '거주지',
  custom: '기타',
};

/**
 * 기본 매칭 점수 (검증 전)
 */
export const DEFAULT_MATCH_SCORE: MatchScore = {
  total: 0,
  metCount: 0,
  unmetCount: 0,
  unknownCount: 0,
  totalRules: 0,
};

/**
 * 기본 자격 검증 결과 (검증 전)
 */
export const DEFAULT_ELIGIBILITY_RESULT: Omit<EligibilityResult, 'benefitId' | 'checkedAt' | 'expiresAt'> = {
  status: 'unknown',
  score: DEFAULT_MATCH_SCORE,
  ruleResults: [],
  unmetRequirements: [],
};

/**
 * 기본 자격 검증 옵션
 */
export const DEFAULT_ELIGIBILITY_OPTIONS: EligibilityCheckOptions = {
  includeUnknown: true,
  useCache: true,
  includeDetails: true,
};

/**
 * 면책 문구 (FR14)
 */
export const ELIGIBILITY_DISCLAIMER =
  '이 결과는 참고용이며, 실제 자격 여부는 담당 기관에서 최종 결정합니다.';

/**
 * 캐시 만료 시간 (밀리초) - 1시간
 */
export const ELIGIBILITY_CACHE_TTL = 1000 * 60 * 60;
