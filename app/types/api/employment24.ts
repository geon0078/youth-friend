/**
 * 고용24 API 타입 정의
 * https://work24.go.kr
 */

/**
 * 공통 목록 조회 파라미터
 */
export interface Employment24ListParams {
  /** 현재 페이지 (기본: 1) */
  pageNo?: number;
  /** 페이지당 표시 건수 (기본: 10) */
  numOfRows?: number;
  /** 검색 키워드 */
  keyword?: string;
}

// ========================================
// 채용정보 (Job Posting)
// ========================================

/**
 * 채용정보 목록 아이템
 */
export interface JobPostingItem {
  /** 채용공고 ID */
  empmnBzadwBdpTlId: string;
  /** 기업명 */
  bzEntNm: string;
  /** 채용제목 */
  empmnBzadwBdpTl: string;
  /** 근무지역 */
  workAreaNm: string;
  /** 경력조건 */
  carrerTcdNm: string;
  /** 학력조건 */
  sclsTcdNm: string;
  /** 고용형태 */
  empyEmpTpCd: string;
  /** 급여조건 */
  empyPayWgeTcd: string;
  /** 마감일 */
  ddlnYmd: string;
  /** 등록일 */
  rgstYmd: string;
}

// ========================================
// 훈련과정 (Training)
// ========================================

/**
 * 훈련카드 과정 아이템
 */
export interface TrainingCardItem {
  /** 훈련과정 ID */
  trprId: string;
  /** 훈련과정명 */
  trprNm: string;
  /** 훈련기관명 */
  trOrgnzNm: string;
  /** 훈련지역 */
  trAreaNm: string;
  /** 훈련기간 */
  trprPrdCn: string;
  /** 훈련비용 */
  trprCost: number;
  /** 자비부담금 */
  slvcSbrdn: number;
  /** 훈련정원 */
  trprCpctCnt: number;
  /** 훈련시작일 */
  trprStrtYmd: string;
  /** 훈련종료일 */
  trprEndYmd: string;
}

/**
 * 사업주훈련 아이템
 */
export interface EmployerTrainingItem {
  /** 훈련과정 ID */
  trprId: string;
  /** 훈련과정명 */
  trprNm: string;
  /** 훈련기관명 */
  trOrgnzNm: string;
  /** 훈련분야 */
  trFldNm: string;
  /** 훈련방법 */
  trMthNm: string;
  /** 훈련시간 */
  trprTrgtTime: number;
  /** 훈련비용 */
  trprCost: number;
}

/**
 * 컨소시엄훈련 아이템
 */
export interface ConsortiumTrainingItem {
  /** 훈련과정 ID */
  trprId: string;
  /** 훈련과정명 */
  trprNm: string;
  /** 훈련기관명 */
  trOrgnzNm: string;
  /** 컨소시엄명 */
  cnsrtrNm: string;
  /** 훈련분야 */
  trFldNm: string;
  /** 훈련기간 */
  trprPrdCn: string;
  /** 훈련비용 */
  trprCost: number;
}

/**
 * 일학습병행 아이템
 */
export interface WorkStudyItem {
  /** 과정 ID */
  prgrId: string;
  /** 프로그램명 */
  prgrNm: string;
  /** 기업명 */
  bzEntNm: string;
  /** 직종명 */
  wrkDtyNm: string;
  /** 지역 */
  areaNm: string;
  /** 교육기간 */
  prgrPrdCn: string;
  /** 모집인원 */
  rcritNmpr: number;
  /** 마감일 */
  ddlnYmd: string;
}

// ========================================
// 취업지원 (Employment Support)
// ========================================

/**
 * 취업지원프로그램 아이템
 */
export interface EmploymentProgramItem {
  /** 프로그램 ID */
  empSprtPrgrId: string;
  /** 프로그램명 */
  empSprtPrgrNm: string;
  /** 시행기관명 */
  enfrcOrgNm: string;
  /** 지원대상 */
  sprtTrgt: string;
  /** 지원내용 */
  sprtCn: string;
  /** 신청기간 */
  aplyPrdCn: string;
  /** 신청방법 */
  aplyMth: string;
}

/**
 * 강소기업 아이템
 */
export interface SmallGiantItem {
  /** 기업 ID */
  bzEntId: string;
  /** 기업명 */
  bzEntNm: string;
  /** 업종명 */
  indstrNm: string;
  /** 대표자명 */
  rprsntvNm: string;
  /** 주소 */
  bsplcAddr: string;
  /** 설립일 */
  estbYmd: string;
  /** 종업원수 */
  empCnt: number;
}

// ========================================
// 직업/직무정보 (Job Info)
// ========================================

/**
 * 직업정보 아이템
 */
export interface JobInfoItem {
  /** 직업 코드 */
  jobCd: string;
  /** 직업명 */
  jobNm: string;
  /** 직업설명 */
  jobDesc: string;
  /** 하는일 */
  wrkDtyCn: string;
  /** 적성/흥미 */
  aptdIntrstCn: string;
  /** 되는길 */
  bcmPathCn: string;
  /** 관련학과 */
  relMajr: string;
  /** 관련자격증 */
  relCrtfc: string;
  /** 연봉정보 */
  slryInfo: string;
}

/**
 * 직무정보 아이템
 */
export interface JobDutyItem {
  /** 직무 코드 */
  wrkDtyCd: string;
  /** 직무명 */
  wrkDtyNm: string;
  /** 직무설명 */
  wrkDtyDesc: string;
  /** 필요역량 */
  ncCpbltCn: string;
  /** 필요지식 */
  ncKnwlCn: string;
  /** 필요기술 */
  ncSkllCn: string;
  /** 관련자격 */
  relCrtfcCn: string;
}

/**
 * 공통코드 아이템
 */
export interface CommonCodeItem {
  /** 코드 */
  cd: string;
  /** 코드명 */
  cdNm: string;
  /** 코드설명 */
  cdDesc?: string;
  /** 상위코드 */
  upperCd?: string;
}

// ========================================
// API 응답 타입
// ========================================

/**
 * 고용24 API 응답 기본 구조
 */
export interface Employment24Response<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

/**
 * API 엔드포인트 타입
 */
export type Employment24Endpoint =
  | 'jobPosting'
  | 'trainingCard'
  | 'employerTraining'
  | 'consortiumTraining'
  | 'workStudy'
  | 'employmentProgram'
  | 'smallGiant'
  | 'jobInfo'
  | 'jobDuty'
  | 'commonCode';
