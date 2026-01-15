/**
 * 온통청년 API 서비스
 * https://youthcenter.go.kr
 */
import { ApiError } from './client';
import { parseXml, extractResultFromXml } from '@/utils/xml-parser';
import type {
  YouthPolicyListParams,
  YouthPolicyListItem,
  YouthPolicyDetail,
  YouthPolicyListResponse,
  YouthPolicyDetailResponse,
} from '@/types/api/youth-policy';

/** API 기본 URL */
const BASE_URL = 'https://www.youthcenter.go.kr/opi';

/** API 키 */
const API_KEY = process.env.EXPO_PUBLIC_YOUTH_POLICY_API_KEY || '';

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
async function fetchXml(url: string, params: Record<string, string | number | undefined>): Promise<string> {
  // URL 파라미터 구성
  const searchParams = new URLSearchParams();
  searchParams.append('openApiVlak', API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const fullUrl = `${url}?${searchParams.toString()}`;

  if (__DEV__) {
    // API 키 마스킹하여 로그 출력
    const maskedUrl = fullUrl.replace(/openApiVlak=[^&]+/, 'openApiVlak=***');
    console.log('[YouthPolicy API]', maskedUrl);
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
        console.warn(`[YouthPolicy API] 시도 ${attempt + 1} 실패:`, lastError.message);
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
 * 청년정책 목록 조회
 */
export async function fetchYouthPolicyList(
  params: YouthPolicyListParams = {}
): Promise<{ items: YouthPolicyListItem[]; totalCount: number; pageIndex: number }> {
  const xml = await fetchXml(`${BASE_URL}/youthPlcyList.do`, {
    pageIndex: params.pageIndex ?? 1,
    display: params.display ?? 10,
    bizTycdSel: params.bizTycdSel,
    srchPolyBizSecd: params.srchPolyBizSecd,
    query: params.query,
  });

  const parsed = parseXml<YouthPolicyListResponse>(xml);
  const body = parsed.response?.body;

  if (!body) {
    return { items: [], totalCount: 0, pageIndex: 1 };
  }

  let items: YouthPolicyListItem[] = [];
  if (body.items?.item) {
    items = Array.isArray(body.items.item) ? body.items.item : [body.items.item];
  }

  return {
    items,
    totalCount: body.totalCount ?? 0,
    pageIndex: body.pageIndex ?? 1,
  };
}

/**
 * 청년정책 상세 조회
 */
export async function fetchYouthPolicyDetail(bizId: string): Promise<YouthPolicyDetail | null> {
  if (!bizId) {
    throw new Error('bizId is required');
  }

  const xml = await fetchXml(`${BASE_URL}/youthPlcyDtl.do`, {
    bizId,
  });

  const parsed = parseXml<YouthPolicyDetailResponse>(xml);
  const item = parsed.response?.body?.items?.item;

  return item ?? null;
}

/**
 * 정책 유형 코드 상수
 */
export const POLICY_TYPE_CODES = {
  JOB: '023010', // 일자리
  HOUSING: '023020', // 주거
  EDUCATION: '023030', // 교육
  WELFARE: '023040', // 복지/문화
  PARTICIPATION: '023050', // 참여/권리
} as const;

/**
 * 지역 코드 상수
 */
export const REGION_CODES = {
  SEOUL: '003001',
  BUSAN: '003002',
  DAEGU: '003003',
  INCHEON: '003004',
  GWANGJU: '003005',
  DAEJEON: '003006',
  ULSAN: '003007',
  GYEONGGI: '003008',
  GANGWON: '003009',
  CHUNGBUK: '003010',
  CHUNGNAM: '003011',
  JEONBUK: '003012',
  JEONNAM: '003013',
  GYEONGBUK: '003014',
  GYEONGNAM: '003015',
  JEJU: '003016',
  SEJONG: '003017',
} as const;
