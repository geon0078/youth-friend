/**
 * 고용24 API 서비스
 * https://work24.go.kr
 */
import { ApiError } from './client';
import { parseXml, extractResultFromXml } from '@/utils/xml-parser';
import type {
  Employment24ListParams,
  Employment24Response,
  JobPostingItem,
  TrainingCardItem,
  EmployerTrainingItem,
  ConsortiumTrainingItem,
  WorkStudyItem,
  EmploymentProgramItem,
  SmallGiantItem,
  JobInfoItem,
  JobDutyItem,
  CommonCodeItem,
} from '@/types/api/employment24';

/** API 키 맵 */
const API_KEYS = {
  jobPosting: process.env.EXPO_PUBLIC_WORK24_JOB_POSTING_API_KEY || '',
  trainingCard: process.env.EXPO_PUBLIC_WORK24_TRAINING_CARD_API_KEY || '',
  employerTraining: process.env.EXPO_PUBLIC_WORK24_EMPLOYER_TRAINING_API_KEY || '',
  consortiumTraining: process.env.EXPO_PUBLIC_WORK24_CONSORTIUM_TRAINING_API_KEY || '',
  workStudy: process.env.EXPO_PUBLIC_WORK24_WORK_STUDY_API_KEY || '',
  employmentProgram: process.env.EXPO_PUBLIC_WORK24_EMPLOYMENT_PROGRAM_API_KEY || '',
  smallGiant: process.env.EXPO_PUBLIC_WORK24_SMALL_GIANT_API_KEY || '',
  jobInfo: process.env.EXPO_PUBLIC_WORK24_JOB_INFO_API_KEY || '',
  jobDuty: process.env.EXPO_PUBLIC_WORK24_JOB_DUTY_API_KEY || '',
  commonCode: process.env.EXPO_PUBLIC_WORK24_COMMON_CODE_API_KEY || '',
} as const;

/** API 엔드포인트 URL 맵 */
const ENDPOINTS = {
  jobPosting: 'https://openapi.work24.go.kr/svc/openApi/empmnBzadw',
  trainingCard: 'https://openapi.work24.go.kr/svc/openApi/trainCard',
  employerTraining: 'https://openapi.work24.go.kr/svc/openApi/bzdTrain',
  consortiumTraining: 'https://openapi.work24.go.kr/svc/openApi/cnsrtrTrain',
  workStudy: 'https://openapi.work24.go.kr/svc/openApi/workStudy',
  employmentProgram: 'https://openapi.work24.go.kr/svc/openApi/empSprt',
  smallGiant: 'https://openapi.work24.go.kr/svc/openApi/smallGiant',
  jobInfo: 'https://openapi.work24.go.kr/svc/openApi/jobInfo',
  jobDuty: 'https://openapi.work24.go.kr/svc/openApi/jobDuty',
  commonCode: 'https://openapi.work24.go.kr/svc/openApi/commonCode',
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
 * XML API 요청 수행
 */
async function fetchXml(
  endpoint: EndpointType,
  params: Record<string, string | number | undefined>
): Promise<string> {
  const url = ENDPOINTS[endpoint];
  const apiKey = API_KEYS[endpoint];

  // URL 파라미터 구성
  const searchParams = new URLSearchParams();
  searchParams.append('authKey', apiKey);
  searchParams.append('returnType', 'XML');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const fullUrl = `${url}?${searchParams.toString()}`;

  if (__DEV__) {
    // API 키 마스킹하여 로그 출력
    const maskedUrl = fullUrl.replace(/authKey=[^&]+/, 'authKey=***');
    console.log('[Employment24 API]', maskedUrl);
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

        // 응답 결과 코드 확인
        const result = extractResultFromXml(xml);
        if (!result.success) {
          throw new ApiError(result.message || 'API 응답 오류', 'http', {
            code: result.code,
          });
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

      // 재시도 불가능한 에러 확인
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

/**
 * API 응답 파싱 헬퍼
 */
function parseResponse<T>(
  xml: string
): { items: T[]; totalCount: number; pageNo: number; numOfRows: number } {
  const parsed = parseXml<Employment24Response<T>>(xml);
  const body = parsed.response?.body;

  if (!body) {
    return { items: [], totalCount: 0, pageNo: 1, numOfRows: 10 };
  }

  let items: T[] = [];
  if (body.items?.item) {
    items = Array.isArray(body.items.item) ? body.items.item : [body.items.item];
  }

  return {
    items,
    totalCount: body.totalCount ?? 0,
    pageNo: body.pageNo ?? 1,
    numOfRows: body.numOfRows ?? 10,
  };
}

// ========================================
// 채용정보
// ========================================

/**
 * 채용정보 목록 조회
 */
export async function fetchJobPostingList(
  params: Employment24ListParams = {}
): Promise<{ items: JobPostingItem[]; totalCount: number }> {
  const xml = await fetchXml('jobPosting', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<JobPostingItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

// ========================================
// 훈련과정
// ========================================

/**
 * 훈련카드 과정 목록 조회
 */
export async function fetchTrainingCardList(
  params: Employment24ListParams = {}
): Promise<{ items: TrainingCardItem[]; totalCount: number }> {
  const xml = await fetchXml('trainingCard', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<TrainingCardItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

/**
 * 사업주훈련 목록 조회
 */
export async function fetchEmployerTrainingList(
  params: Employment24ListParams = {}
): Promise<{ items: EmployerTrainingItem[]; totalCount: number }> {
  const xml = await fetchXml('employerTraining', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<EmployerTrainingItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

/**
 * 컨소시엄훈련 목록 조회
 */
export async function fetchConsortiumTrainingList(
  params: Employment24ListParams = {}
): Promise<{ items: ConsortiumTrainingItem[]; totalCount: number }> {
  const xml = await fetchXml('consortiumTraining', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<ConsortiumTrainingItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

/**
 * 일학습병행 목록 조회
 */
export async function fetchWorkStudyList(
  params: Employment24ListParams = {}
): Promise<{ items: WorkStudyItem[]; totalCount: number }> {
  const xml = await fetchXml('workStudy', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<WorkStudyItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

// ========================================
// 취업지원
// ========================================

/**
 * 취업지원프로그램 목록 조회
 */
export async function fetchEmploymentProgramList(
  params: Employment24ListParams = {}
): Promise<{ items: EmploymentProgramItem[]; totalCount: number }> {
  const xml = await fetchXml('employmentProgram', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<EmploymentProgramItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

/**
 * 강소기업 목록 조회
 */
export async function fetchSmallGiantList(
  params: Employment24ListParams = {}
): Promise<{ items: SmallGiantItem[]; totalCount: number }> {
  const xml = await fetchXml('smallGiant', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<SmallGiantItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

// ========================================
// 직업/직무정보
// ========================================

/**
 * 직업정보 목록 조회
 */
export async function fetchJobInfoList(
  params: Employment24ListParams = {}
): Promise<{ items: JobInfoItem[]; totalCount: number }> {
  const xml = await fetchXml('jobInfo', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<JobInfoItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

/**
 * 직무정보 목록 조회
 */
export async function fetchJobDutyList(
  params: Employment24ListParams = {}
): Promise<{ items: JobDutyItem[]; totalCount: number }> {
  const xml = await fetchXml('jobDuty', {
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 10,
    keyword: params.keyword,
  });

  const result = parseResponse<JobDutyItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}

/**
 * 공통코드 조회
 */
export async function fetchCommonCodeList(
  codeType?: string
): Promise<{ items: CommonCodeItem[]; totalCount: number }> {
  const xml = await fetchXml('commonCode', {
    codeType,
  });

  const result = parseResponse<CommonCodeItem>(xml);
  return { items: result.items, totalCount: result.totalCount };
}
