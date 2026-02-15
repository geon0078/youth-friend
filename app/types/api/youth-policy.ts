/**
 * 온통청년 API 타입 정의
 * https://youthcenter.go.kr
 */

/**
 * 청년정책 목록 조회 파라미터
 */
export interface YouthPolicyListParams {
  /** 현재 페이지 (기본: 1) */
  pageIndex?: number;
  /** 페이지당 표시 건수 (기본: 10) */
  display?: number;
  /** 정책유형 코드 (023010: 일자리, 023020: 주거, 023030: 교육, 023040: 복지/문화, 023050: 참여/권리) */
  bizTycdSel?: string;
  /** 지역 코드 (003001: 서울, 003002: 부산 등) */
  srchPolyBizSecd?: string;
  /** 검색 키워드 */
  query?: string;
}

/**
 * 청년정책 목록 아이템 (API 원본)
 */
export interface YouthPolicyListItem {
  /** 정책 ID */
  bizId: string;
  /** 정책명 */
  polyBizSjnm: string;
  /** 정책 소개 */
  polyItcnCn: string;
  /** 지원 내용 */
  sporCn: string;
  /** 운영 기관명 */
  cnsgNmor: string;
  /** 신청 기간 */
  rqutPrdCn: string;
  /** 정책 유형 코드 */
  polyBizTy: string;
  /** 정책 유형명 */
  polyBizTyNm?: string;
  /** 지역 코드 */
  polyBizSecd: string;
  /** 지역명 */
  polyBizSecdNm?: string;
  /** 조회수 */
  views?: number;
  // === 추가 필드 (사용자 맞춤 필터링용) ===
  /** 사업 시작일 (YYYYMMDD) */
  bizPrdBgngYmd?: string;
  /** 사업 종료일 (YYYYMMDD) */
  bizPrdEndYmd?: string;
  /** 지원 대상 최소 나이 */
  sprtTrgtMinAge?: string;
  /** 지원 대상 최대 나이 */
  sprtTrgtMaxAge?: string;
  /** 등록 기관명 */
  rgtrInstCdNm?: string;
}

/**
 * 청년정책 상세 조회 응답
 */
export interface YouthPolicyDetail extends YouthPolicyListItem {
  /** 정책 설명 */
  polyBizSj: string;
  /** 지원 규모 */
  sporScvl: string;
  /** 연령 조건 */
  ageInfo: string;
  /** 학력 요건 */
  accrRqisCn: string;
  /** 특화 분야 */
  splzRlmRqisCn: string;
  /** 취업 상태 */
  empmSttsCn: string;
  /** 전공 요건 */
  majrRqisCn: string;
  /** 거주지 및 소득 조건 */
  prcpCn: string;
  /** 참여 제한 대상 */
  prcpLmttTrgtCn: string;
  /** 신청 방법 */
  rqutProcCn: string;
  /** 심사 및 발표 */
  jdgnPresCn: string;
  /** 신청 사이트 */
  rqutUrla: string;
  /** 기타 사항 */
  etct: string;
  /** 담당 기관명 */
  mngtMson: string;
  /** 담당 기관 연락처 */
  mngtMsttNm: string;
  /** 참고 사이트 1 */
  rfcSiteUrla1: string;
  /** 참고 사이트 2 */
  rfcSiteUrla2: string;
  /** 최종 수정일 */
  lastModyYmd: string;
}

/**
 * 청년정책 목록 API 응답
 */
export interface YouthPolicyListResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: YouthPolicyListItem | YouthPolicyListItem[];
      };
      pageIndex: number;
      totalCount: number;
    };
  };
}

/**
 * 청년정책 상세 API 응답
 */
export interface YouthPolicyDetailResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: YouthPolicyDetail;
      };
    };
  };
}
