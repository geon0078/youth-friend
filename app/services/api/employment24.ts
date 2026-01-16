/**
 * 고용24 API 서비스
 * https://work24.go.kr
 *
 * 2026년 새 API 엔드포인트 사용
 * - 훈련과정: /cm/openApi/call/hr/
 * - 취업정보: /cm/openApi/call/wk/
 * - 응답 형식: XML
 */
import { ApiError } from './client';
import { parseXml } from '@/utils/xml-parser';
import type {
  Employment24ListParams,
  TrainingCardItem,
  ConsortiumTrainingItem,
  WorkStudyItem,
  EmploymentProgramItem,
  SmallGiantItem,
  JobInfoItem,
  JobDutyItem,
  CommonCodeItem,
} from '@/types/api/employment24';

/** API 기본 URL */
const BASE_URL = 'https://www.work24.go.kr/cm/openApi/call';

/** API 키 맵 - 환경 변수 또는 기본값 사용 */
const API_KEYS = {
  trainingCard: process.env.EXPO_PUBLIC_WORK24_TRAINING_CARD_API_KEY || '',
  consortiumTraining: process.env.EXPO_PUBLIC_WORK24_CONSORTIUM_TRAINING_API_KEY || '',
  workStudy: process.env.EXPO_PUBLIC_WORK24_WORK_STUDY_API_KEY || '',
  employmentProgram: process.env.EXPO_PUBLIC_WORK24_EMPLOYMENT_PROGRAM_API_KEY || '',
  smallGiant: process.env.EXPO_PUBLIC_WORK24_SMALL_GIANT_API_KEY || '',
  jobInfo: process.env.EXPO_PUBLIC_WORK24_JOB_INFO_API_KEY || '',
  jobDuty: process.env.EXPO_PUBLIC_WORK24_JOB_DUTY_API_KEY || '',
  commonCode: process.env.EXPO_PUBLIC_WORK24_COMMON_CODE_API_KEY || '',
} as const;

/** API 엔드포인트 경로 맵 */
const ENDPOINTS = {
  // 훈련과정 API (hr)
  trainingCard: '/hr/callOpenApiSvcInfo310L01.do',
  consortiumTraining: '/hr/callOpenApiSvcInfo312L01.do',
  workStudy: '/hr/callOpenApiSvcInfo313L01.do',
  // 취업정보 API (wk)
  employmentProgram: '/wk/callOpenApiSvcInfo217L01.do',
  smallGiant: '/wk/callOpenApiSvcInfo216L01.do',
  jobInfo: '/wk/callOpenApiSvcInfo212L01.do',
  jobDuty: '/wk/callOpenApiSvcInfo215L01.do',
  commonCode: '/wk/callOpenApiSvcInfo21L01.do',
} as const;

type EndpointType = keyof typeof ENDPOINTS;

/** 타임아웃 (ms) */
const TIMEOUT = 10000;

/** 재시도 횟수 */
const MAX_RETRIES = 3;

/**
 * 지수 백오프 딜레이 계산
 */
function getRetryDelay(attempt: number): number {
  const baseDelay = 1000;
  const delay = baseDelay * Math.pow(2, attempt);
  const maxDelay = 8000;
  const jitter = 0.2;
  const actualDelay = Math.min(delay, maxDelay);
  return actualDelay * (1 + (Math.random() - 0.5) * jitter);
}

/**
 * 훈련과정 API 페이지네이션 타입
 */
type TrainingPaginationType = 'trainingCard' | 'consortiumTraining' | 'workStudy';

/**
 * 취업정보 API 페이지네이션 타입
 */
type WorkPaginationType = 'employmentProgram' | 'smallGiant' | 'jobInfo' | 'jobDuty' | 'commonCode';

/**
 * XML API 요청 수행
 */
async function fetchXml(
  endpoint: EndpointType,
  params: Record<string, string | number | undefined>
): Promise<string> {
  const path = ENDPOINTS[endpoint];
  const apiKey = API_KEYS[endpoint];

  if (!apiKey) {
    throw new ApiError(`API key not configured for ${endpoint}`, 'http', { code: '401' });
  }

  // URL 파라미터 구성
  const searchParams = new URLSearchParams();
  searchParams.append('authKey', apiKey);
  searchParams.append('returnType', 'XML');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const fullUrl = `${BASE_URL}${path}?${searchParams.toString()}`;

  if (__DEV__) {
    const maskedUrl = fullUrl.replace(/authKey=[^&]+/, 'authKey=***');
    console.log('[Employment24 API] URL:', maskedUrl);
    console.log('[Employment24 API] API_KEY 존재:', !!apiKey, 'length:', apiKey?.length);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt - 1)));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/xml',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw ApiError.http(response.status);
        }

        const xml = await response.text();

        // 에러 응답 확인 (GO24 에러 형식)
        if (xml.includes('<GO24>') && xml.includes('<error>')) {
          const errorMatch = xml.match(/<error>([^<]+)<\/error>/);
          throw new ApiError(errorMatch?.[1] || 'API 오류', 'http', { code: '400' });
        }

        // 메시지 에러 확인 (jobsList 등)
        if (xml.includes('<messageCd>') && !xml.includes('<messageCd>000</messageCd>')) {
          const msgMatch = xml.match(/<message>([^<]+)<\/message>/);
          throw new ApiError(msgMatch?.[1] || 'API 오류', 'http', { code: '400' });
        }

        return xml;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw ApiError.timeout();
        }
        throw error;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (__DEV__) {
        console.warn(`[Employment24 API] 시도 ${attempt + 1} 실패:`, lastError.message);
      }

      if (error instanceof ApiError && error.type === 'http' && error.status && error.status < 500) {
        throw error;
      }

      if (attempt >= MAX_RETRIES) {
        throw error;
      }
    }
  }

  throw lastError ?? ApiError.network();
}

// ========================================
// HRDNet 훈련과정 API 응답 타입
// ========================================

interface HRDNetResponse<T> {
  HRDNet: {
    pageNum: number;
    pageSize: number;
    scn_cnt: number;
    srchList?: {
      scn_list?: T | T[];
    };
  };
}

/**
 * HRDNet 훈련과정 API 응답 파싱
 */
function parseTrainingResponse<T>(xml: string): { items: T[]; totalCount: number } {
  const parsed = parseXml<HRDNetResponse<T>>(xml);
  const body = parsed.HRDNet;

  if (!body) {
    return { items: [], totalCount: 0 };
  }

  let items: T[] = [];
  if (body.srchList?.scn_list) {
    const list = body.srchList.scn_list;
    items = Array.isArray(list) ? list : [list];
  }

  return {
    items,
    totalCount: body.scn_cnt ?? 0,
  };
}

// ========================================
// 훈련과정 API
// ========================================

/**
 * 새 API 훈련과정 아이템 타입
 */
interface NewTrainingItem {
  address?: string;
  certificate?: string;
  contents?: string;
  courseMan?: string;
  eiEmplCnt3?: string;
  eiEmplCnt3Gt10?: string;
  eiEmplRate3?: string;
  eiEmplRate6?: string;
  grade?: string;
  instCd?: string;
  ncsCd?: string;
  realMan?: string;
  regCourseMan?: string;
  stdgScor?: string;
  subTitle?: string;
  subTitleLink?: string;
  telNo?: string;
  title?: string;
  titleIcon?: string;
  titleLink?: string;
  traEndDate?: string;
  traStartDate?: string;
  trainTarget?: string;
  trainTargetCd?: string;
  trainstCstId?: string;
  trngAreaCd?: string;
  trprDegr?: string;
  trprId?: string;
  wkendSe?: string;
  yardMan?: string;
}

/**
 * 새 API 응답을 기존 타입으로 변환 (훈련카드)
 */
function convertToTrainingCardItem(item: NewTrainingItem): TrainingCardItem {
  return {
    trprId: item.trprId || '',
    trprNm: item.title || '',
    instNm: item.subTitle || '',
    trprDegr: item.trprDegr || '',
    address: item.address || '',
    traStartDate: item.traStartDate || '',
    traEndDate: item.traEndDate || '',
    trainTarget: item.trainTarget || '',
    trainTargetCd: item.trainTargetCd || '',
    courseMan: item.courseMan || '0',
    realMan: item.realMan || '0',
    telNo: item.telNo || '',
    ncsCd: item.ncsCd || '',
    titleLink: item.titleLink || '',
    subTitleLink: item.subTitleLink || '',
  };
}

/**
 * 국민내일배움카드 훈련과정 목록 조회
 */
export async function fetchTrainingCardList(
  params: Employment24ListParams = {}
): Promise<{ items: TrainingCardItem[]; totalCount: number }> {
  const xml = await fetchXml('trainingCard', {
    pageNum: params.pageNo ?? 1,
    pageSize: params.numOfRows ?? 10,
    srchTraProcessNm: params.keyword,
  });

  const result = parseTrainingResponse<NewTrainingItem>(xml);
  return {
    items: result.items.map(convertToTrainingCardItem),
    totalCount: result.totalCount,
  };
}

/**
 * 컨소시엄훈련 목록 조회
 */
export async function fetchConsortiumTrainingList(
  params: Employment24ListParams = {}
): Promise<{ items: ConsortiumTrainingItem[]; totalCount: number }> {
  const xml = await fetchXml('consortiumTraining', {
    pageNum: params.pageNo ?? 1,
    pageSize: params.numOfRows ?? 10,
    srchTraProcessNm: params.keyword,
  });

  const result = parseTrainingResponse<NewTrainingItem>(xml);
  return {
    items: result.items.map((item) => ({
      ...convertToTrainingCardItem(item),
    })),
    totalCount: result.totalCount,
  };
}

/**
 * 일학습병행 목록 조회
 */
export async function fetchWorkStudyList(
  params: Employment24ListParams = {}
): Promise<{ items: WorkStudyItem[]; totalCount: number }> {
  const xml = await fetchXml('workStudy', {
    pageNum: params.pageNo ?? 1,
    pageSize: params.numOfRows ?? 10,
    srchTraProcessNm: params.keyword,
  });

  const result = parseTrainingResponse<NewTrainingItem>(xml);
  return {
    items: result.items.map((item) => ({
      ...convertToTrainingCardItem(item),
    })),
    totalCount: result.totalCount,
  };
}

// ========================================
// 취업지원 API
// ========================================

/**
 * 취업지원프로그램 API 응답 타입
 */
interface EmploymentProgramResponse {
  empPgmSchdInviteList: {
    total: number;
    startPage: number;
    display: number;
    empPgmSchdInvite?: NewEmploymentProgramItem | NewEmploymentProgramItem[];
  };
}

interface NewEmploymentProgramItem {
  orgNm?: string;
  pgmNm?: string;
  pgmSubNm?: string;
  pgmTarget?: string;
  pgmStdt?: string;
  pgmEndt?: string;
  openTimeClcd?: string;
  openTime?: string;
  operationTime?: string;
  openPlcCont?: string;
}

function convertToEmploymentProgramItem(item: NewEmploymentProgramItem): EmploymentProgramItem {
  return {
    pgmId: `${item.orgNm}-${item.pgmSubNm}-${item.pgmStdt}`,
    pgmNm: item.pgmNm || '',
    pgmSubNm: item.pgmSubNm || '',
    orgNm: item.orgNm || '',
    pgmTarget: item.pgmTarget || '',
    pgmStdt: item.pgmStdt || '',
    pgmEndt: item.pgmEndt || '',
    openTime: item.openTime || '',
    operationTime: item.operationTime || '',
    openPlcCont: item.openPlcCont || '',
  };
}

/**
 * 취업지원프로그램 목록 조회
 */
export async function fetchEmploymentProgramList(
  params: Employment24ListParams = {}
): Promise<{ items: EmploymentProgramItem[]; totalCount: number }> {
  const xml = await fetchXml('employmentProgram', {
    startPage: params.pageNo ?? 1,
    display: params.numOfRows ?? 10,
  });

  const parsed = parseXml<EmploymentProgramResponse>(xml);
  const body = parsed.empPgmSchdInviteList;

  if (!body) {
    return { items: [], totalCount: 0 };
  }

  let items: NewEmploymentProgramItem[] = [];
  if (body.empPgmSchdInvite) {
    const list = body.empPgmSchdInvite;
    items = Array.isArray(list) ? list : [list];
  }

  return {
    items: items.map(convertToEmploymentProgramItem),
    totalCount: body.total ?? 0,
  };
}

// ========================================
// 강소기업 API
// ========================================

/**
 * 강소기업 API 응답 타입
 */
interface SmallGiantResponse {
  smallGiantsList: {
    total: number;
    startPage: number;
    display: number;
    smallGiant?: NewSmallGiantItem | NewSmallGiantItem[];
  };
}

interface NewSmallGiantItem {
  selYear?: string;
  sgBrandNm?: string;
  coNm?: string;
  busiNo?: string;
  reperNm?: string;
  superIndTpCd?: string;
  superIndTpNm?: string;
  indTpCd?: string;
  indTpNm?: string;
  regionCd?: string;
  regionNm?: string;
  coAddr?: string;
  coMainProd?: string;
  alwaysWorkerCnt?: string;
  smlgntCoClcd?: string;
}

function convertToSmallGiantItem(item: NewSmallGiantItem): SmallGiantItem {
  return {
    coNm: item.coNm || '',
    busiNo: item.busiNo || '',
    reperNm: item.reperNm || '',
    indTpNm: item.indTpNm || '',
    superIndTpNm: item.superIndTpNm || '',
    regionNm: item.regionNm || '',
    coAddr: item.coAddr || '',
    coMainProd: item.coMainProd || '',
    alwaysWorkerCnt: item.alwaysWorkerCnt || '',
    selYear: item.selYear || '',
    sgBrandNm: item.sgBrandNm || '',
  };
}

/**
 * 강소기업 목록 조회
 */
export async function fetchSmallGiantList(
  params: Employment24ListParams = {}
): Promise<{ items: SmallGiantItem[]; totalCount: number }> {
  const xml = await fetchXml('smallGiant', {
    startPage: params.pageNo ?? 1,
    display: params.numOfRows ?? 10,
    srchCoNm: params.keyword,
  });

  const parsed = parseXml<SmallGiantResponse>(xml);
  const body = parsed.smallGiantsList;

  if (!body) {
    return { items: [], totalCount: 0 };
  }

  let items: NewSmallGiantItem[] = [];
  if (body.smallGiant) {
    const list = body.smallGiant;
    items = Array.isArray(list) ? list : [list];
  }

  return {
    items: items.map(convertToSmallGiantItem),
    totalCount: body.total ?? 0,
  };
}

// ========================================
// 직업/직무정보 API (추후 구현)
// ========================================

/**
 * 직업정보 목록 조회
 * 참고: 이 API는 target 파라미터가 필요함
 */
export async function fetchJobInfoList(
  _params: Employment24ListParams = {}
): Promise<{ items: JobInfoItem[]; totalCount: number }> {
  // 직업정보 API는 target 파라미터가 필요하며 현재 미구현
  return { items: [], totalCount: 0 };
}

/**
 * 직무정보 목록 조회
 */
export async function fetchJobDutyList(
  _params: Employment24ListParams = {}
): Promise<{ items: JobDutyItem[]; totalCount: number }> {
  // 직무정보 API는 현재 미구현
  return { items: [], totalCount: 0 };
}

/**
 * 공통코드 조회
 */
export async function fetchCommonCodeList(
  _codeType?: string
): Promise<{ items: CommonCodeItem[]; totalCount: number }> {
  // 공통코드 API는 현재 미구현
  return { items: [], totalCount: 0 };
}

// ========================================
// 더 이상 지원되지 않는 API
// ========================================

/**
 * 채용정보 목록 조회 - 더 이상 지원되지 않음
 * 참고: 이 API는 사업자 회원만 사용 가능
 * @deprecated 개인회원 API 키로는 사용 불가
 */
export async function fetchJobPostingList(): Promise<{ items: never[]; totalCount: number }> {
  console.warn('[Employment24] 채용정보 API는 사업자 회원만 사용 가능합니다.');
  return { items: [], totalCount: 0 };
}

/**
 * 사업주훈련 목록 조회 - 더 이상 지원되지 않음
 * @deprecated 개인회원 API 키로는 사용 불가
 */
export async function fetchEmployerTrainingList(): Promise<{ items: never[]; totalCount: number }> {
  console.warn('[Employment24] 사업주훈련 API는 사업자 회원만 사용 가능합니다.');
  return { items: [], totalCount: 0 };
}
