/**
 * Benefit 모델 타입 정의
 * 온통청년, 고용24 API 응답을 통합한 정규화 모델
 */
import type { BenefitCategory } from './user';

// Re-export for convenience
export type { BenefitCategory } from './user';

/**
 * 혜택 출처
 */
export type BenefitSource = 'youth-policy' | 'employment24';

/**
 * 혜택 상태
 */
export type BenefitStatus = 'active' | 'upcoming' | 'ended' | 'unknown';

/**
 * 혜택 필터
 */
export interface BenefitFilters {
  /** 카테고리 필터 */
  category?: BenefitCategory;
  /** 출처 필터 */
  source?: BenefitSource;
  /** 검색 키워드 */
  keyword?: string;
  /** 지역 코드 */
  region?: string;
  /** 페이지 번호 */
  page?: number;
  /** 페이지 크기 */
  pageSize?: number;
}

/**
 * 통합 혜택 모델
 */
export interface Benefit {
  /** 고유 ID (source-originalId 형식) */
  id: string;
  /** 원본 ID */
  originalId: string;
  /** 출처 */
  source: BenefitSource;
  /** 혜택명 */
  title: string;
  /** 혜택 설명 */
  description: string;
  /** 지원 내용 */
  supportContent?: string;
  /** 지원 금액 (원) */
  amount?: number;
  /** 신청 마감일 */
  deadline?: string;
  /** 신청 시작일 */
  startDate?: string;
  /** 카테고리 */
  category: BenefitCategory;
  /** 자격 요건 */
  requirements: string[];
  /** 연령 조건 */
  ageRequirement?: string;
  /** 지역 */
  region?: string;
  /** 운영 기관명 */
  organization?: string;
  /** 신청 URL */
  applicationUrl?: string;
  /** 상세 URL */
  detailUrl?: string;
  /** 상태 */
  status: BenefitStatus;
}

/**
 * 혜택 상세 모델
 */
export interface BenefitDetail extends Benefit {
  /** 학력 요건 */
  educationRequirement?: string;
  /** 전공 요건 */
  majorRequirement?: string;
  /** 취업 상태 요건 */
  employmentRequirement?: string;
  /** 소득 요건 */
  incomeRequirement?: string;
  /** 거주지 요건 */
  residenceRequirement?: string;
  /** 제외 대상 */
  exclusions?: string;
  /** 신청 방법 */
  applicationMethod?: string;
  /** 심사 및 발표 */
  selectionProcess?: string;
  /** 기타 사항 */
  additionalInfo?: string;
  /** 담당 기관 연락처 */
  contactInfo?: string;
  /** 참고 사이트 */
  referenceUrls?: string[];
  /** 최종 수정일 */
  lastUpdated?: string;
}

/**
 * 혜택 목록 응답
 */
export interface BenefitListResult {
  /** 혜택 목록 */
  items: Benefit[];
  /** 총 개수 */
  totalCount: number;
  /** 현재 페이지 */
  page: number;
  /** 페이지 크기 */
  pageSize: number;
  /** 총 페이지 수 */
  totalPages: number;
}
