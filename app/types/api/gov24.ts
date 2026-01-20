/**
 * 보조금24 (정부24 공공서비스) API 타입 정의
 * API 문서: https://infuser.odcloud.kr/api/stages/44436/api-docs
 */

/**
 * 보조금24 API 응답 공통 구조
 */
export interface Gov24ApiResponse<T> {
  /** 현재 페이지 */
  page: number;
  /** 페이지당 개수 */
  perPage: number;
  /** 전체 개수 */
  totalCount: number;
  /** 현재 페이지 개수 */
  currentCount: number;
  /** 검색 결과 개수 */
  matchCount: number;
  /** 데이터 배열 */
  data: T[];
}

/**
 * 보조금24 서비스 목록 아이템
 */
export interface Gov24ServiceListItem {
  /** 서비스 ID */
  서비스ID: string;
  /** 서비스명 */
  서비스명: string;
  /** 서비스 목적 요약 */
  서비스목적요약: string;
  /** 지원 유형 (현금, 현물, 서비스 등) */
  지원유형: string;
  /** 서비스 분야 */
  서비스분야: string;
  /** 지원 대상 */
  지원대상: string;
  /** 선정 기준 */
  선정기준: string;
  /** 지원 내용 */
  지원내용: string;
  /** 신청 방법 */
  신청방법: string;
  /** 신청 기한 */
  신청기한: string;
  /** 소관 기관명 */
  소관기관명: string;
  /** 소관 기관 유형 */
  소관기관유형: string;
  /** 부서명 */
  부서명?: string;
  /** 사용자 구분 (개인, 기업 등) */
  사용자구분: string;
  /** 조회수 */
  조회수?: number;
  /** 수정일시 */
  수정일시?: string;
  /** 등록일시 */
  등록일시?: string;
}

/**
 * 보조금24 서비스 상세 정보
 */
export interface Gov24ServiceDetail extends Gov24ServiceListItem {
  /** 서비스 목적 (상세) */
  서비스목적: string;
  /** 구비 서류 */
  구비서류: string;
  /** 접수 기관명 */
  접수기관명?: string;
  /** 문의처 */
  문의처: string;
  /** 온라인신청사이트URL */
  온라인신청사이트URL?: string;
  /** 법령 */
  법령?: string;
  /** 행정규칙 */
  행정규칙?: string;
}

/**
 * 보조금24 지원 조건
 */
export interface Gov24SupportCondition {
  /** 서비스 ID */
  서비스ID: string;
  /** 지원조건코드 */
  지원조건코드: string;
  /** 지원조건코드명 */
  지원조건코드명: string;
  /** 지원조건상세내용 */
  지원조건상세내용?: string;
  /** JA: 성별, JB: 연령, JC: 거주지역, JD: 소득, JE: 가구형태 등 */
  조건분류?: string;
}

/**
 * 보조금24 API 요청 파라미터
 */
export interface Gov24ApiParams {
  /** 페이지 번호 (1부터 시작) */
  page?: number;
  /** 페이지당 개수 (기본 10, 최대 1000) */
  perPage?: number;
  /** 응답 형식 */
  returnType?: 'JSON' | 'XML';
  /** 서비스명 검색 (LIKE) */
  serviceName?: string;
  /** 소관기관유형 필터 */
  orgType?: string;
  /** 사용자구분 필터 (개인, 기업) */
  userType?: string;
  /** 서비스분야 필터 */
  serviceField?: string;
}

/**
 * 서비스 분야 코드
 */
export const GOV24_SERVICE_FIELDS = {
  WELFARE: '복지',
  EMPLOYMENT: '고용',
  HOUSING: '주거',
  EDUCATION: '교육',
  CULTURE: '문화',
  HEALTH: '보건의료',
  SAFETY: '안전',
  AGRICULTURE: '농림축산어업',
  ENVIRONMENT: '환경',
  BUSINESS: '사업',
} as const;

/**
 * 지원 유형 코드
 */
export const GOV24_SUPPORT_TYPES = {
  CASH: '현금',
  GOODS: '현물',
  SERVICE: '서비스',
  TAX: '세금감면',
  LOAN: '대출',
  EDUCATION: '교육',
  CONSULTING: '상담',
  MEDICAL: '의료지원',
} as const;

/**
 * 사용자 구분 코드
 */
export const GOV24_USER_TYPES = {
  INDIVIDUAL: '개인',
  BUSINESS: '기업',
  ALL: '개인/기업',
} as const;
