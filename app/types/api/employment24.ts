/**
 * 고용24 API 타입 정의
 * https://work24.go.kr
 *
 * 2026년 새 API 엔드포인트 기준
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
// 훈련과정 (Training)
// ========================================

/**
 * 훈련카드 과정 아이템 (국민내일배움카드)
 */
export interface TrainingCardItem {
  /** 훈련과정 ID */
  trprId: string;
  /** 훈련과정명 */
  trprNm: string;
  /** 훈련기관명 */
  instNm: string;
  /** 훈련회차 */
  trprDegr: string;
  /** 주소 */
  address: string;
  /** 훈련시작일 */
  traStartDate: string;
  /** 훈련종료일 */
  traEndDate: string;
  /** 훈련대상 */
  trainTarget: string;
  /** 훈련대상코드 */
  trainTargetCd: string;
  /** 수강료 */
  courseMan: string;
  /** 실제훈련비 */
  realMan: string;
  /** 연락처 */
  telNo: string;
  /** NCS 코드 */
  ncsCd: string;
  /** 과정 상세 링크 */
  titleLink: string;
  /** 기관 상세 링크 */
  subTitleLink: string;
}

/**
 * 컨소시엄훈련 아이템
 * 국가인적자원개발 컨소시엄 훈련
 */
export interface ConsortiumTrainingItem extends TrainingCardItem {}

/**
 * 일학습병행 아이템
 */
export interface WorkStudyItem extends TrainingCardItem {}

// ========================================
// 취업지원 (Employment Support)
// ========================================

/**
 * 취업지원프로그램 아이템
 */
export interface EmploymentProgramItem {
  /** 프로그램 ID (자동 생성) */
  pgmId: string;
  /** 프로그램명 */
  pgmNm: string;
  /** 프로그램 부제 */
  pgmSubNm: string;
  /** 운영기관명 */
  orgNm: string;
  /** 대상 */
  pgmTarget: string;
  /** 시작일 (YYYYMMDD) */
  pgmStdt: string;
  /** 종료일 (YYYYMMDD) */
  pgmEndt: string;
  /** 운영시간 */
  openTime: string;
  /** 운영시간(시간) */
  operationTime: string;
  /** 장소 */
  openPlcCont: string;
}

/**
 * 강소기업 아이템
 */
export interface SmallGiantItem {
  /** 기업명 */
  coNm: string;
  /** 사업자등록번호 */
  busiNo: string;
  /** 대표자명 */
  reperNm: string;
  /** 업종명 (세분류) */
  indTpNm: string;
  /** 업종명 (대분류) */
  superIndTpNm: string;
  /** 지역명 */
  regionNm: string;
  /** 주소 */
  coAddr: string;
  /** 주요생산품 */
  coMainProd: string;
  /** 상시근로자수 */
  alwaysWorkerCnt: string;
  /** 선정연도 */
  selYear: string;
  /** 인증 브랜드명 */
  sgBrandNm: string;
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
// 더 이상 지원되지 않는 타입 (채용정보, 사업주훈련)
// ========================================

/**
 * 채용정보 목록 아이템
 * @deprecated 개인회원 API 키로는 사용 불가
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

/**
 * 사업주훈련 아이템
 * @deprecated 개인회원 API 키로는 사용 불가
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

// ========================================
// API 응답 타입
// ========================================

/**
 * 고용24 API 응답 기본 구조 (레거시)
 * @deprecated 새 API는 다른 응답 구조를 가짐
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
  | 'trainingCard'
  | 'consortiumTraining'
  | 'workStudy'
  | 'employmentProgram'
  | 'smallGiant'
  | 'jobInfo'
  | 'jobDuty'
  | 'commonCode';
