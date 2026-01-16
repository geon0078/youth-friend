/**
 * 온통청년 API 서비스
 * https://youthcenter.go.kr
 *
 * 2026년 새 API 엔드포인트 사용
 * - 엔드포인트: /go/ythip/getPlcy
 * - 응답 형식: JSON
 */
import { ApiError } from './client';
import type {
  YouthPolicyListParams,
  YouthPolicyListItem,
  YouthPolicyDetail,
} from '@/types/api/youth-policy';

/** API 기본 URL */
const BASE_URL = 'https://www.youthcenter.go.kr/go/ythip';

/** API 키 */
const API_KEY = process.env.EXPO_PUBLIC_YOUTH_POLICY_API_KEY || '';

/** 타임아웃 (ms) */
const TIMEOUT = 10000;

/** 재시도 횟수 */
const MAX_RETRIES = 3;

/**
 * 새 API 응답의 정책 아이템 타입
 */
interface NewApiPolicyItem {
  plcyNo: string;
  plcyNm: string;
  plcyExplnCn: string;
  plcySprtCn: string;
  plcyKywdNm?: string;
  lclsfNm: string;
  mclsfNm?: string;
  sprvsnInstCdNm?: string;
  operInstCdNm?: string;
  aplyYmd?: string;
  bizPrdBgngYmd?: string;
  bizPrdEndYmd?: string;
  sprtTrgtMinAge?: string;
  sprtTrgtMaxAge?: string;
  refUrlAddr1?: string;
  refUrlAddr2?: string;
  aplyUrlAddr?: string;
  plcyAplyMthdCn?: string;
  srngMthdCn?: string;
  sbmsnDcmntCn?: string;
  addAplyQlfcCndCn?: string;
  ptcpPrpTrgtCn?: string;
  etcMttrCn?: string;
  earnCndSeCd?: string;
  earnMinAmt?: string;
  earnMaxAmt?: string;
  zipCd?: string;
  rgtrInstCdNm?: string;
  lastMdfcnDt?: string;
}

/**
 * 새 API 응답 타입
 */
interface NewApiResponse {
  resultCode: number;
  resultMessage: string;
  result: {
    pagging: {
      totCount: number;
      pageNum: number;
      pageSize: number;
    };
    youthPolicyList: NewApiPolicyItem[];
  };
}

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
 * 새 API 응답을 기존 타입으로 변환
 */
function convertToLegacyFormat(item: NewApiPolicyItem): YouthPolicyListItem {
  // 대분류를 정책 유형 코드로 변환
  const categoryToCode: Record<string, string> = {
    '일자리': '023010',
    '주거': '023020',
    '교육': '023030',
    '복지문화': '023040',
    '참여권리': '023050',
  };

  // 지역 코드 추출 (zipCd 또는 rgtrInstCdNm에서)
  const regionCode = item.zipCd || '';

  return {
    bizId: item.plcyNo,
    polyBizSjnm: item.plcyNm,
    polyItcnCn: item.plcyExplnCn,
    sporCn: item.plcySprtCn,
    rqutPrdCn: item.aplyYmd || (item.bizPrdEndYmd ? `~${item.bizPrdEndYmd}` : '상시'),
    polyBizTy: categoryToCode[item.lclsfNm] || '023040',
    polyBizSecd: regionCode,
    polyBizSecdNm: item.rgtrInstCdNm || '',
    cnsgNmor: item.sprvsnInstCdNm || item.operInstCdNm || '',
  };
}

/**
 * 새 API 응답을 상세 타입으로 변환
 */
function convertToDetailFormat(item: NewApiPolicyItem): YouthPolicyDetail {
  const categoryToCode: Record<string, string> = {
    '일자리': '023010',
    '주거': '023020',
    '교육': '023030',
    '복지문화': '023040',
    '참여권리': '023050',
  };

  // 나이 정보 생성
  const minAge = item.sprtTrgtMinAge || '0';
  const maxAge = item.sprtTrgtMaxAge || '0';
  const ageInfo = minAge !== '0' || maxAge !== '0'
    ? `만 ${minAge}세 ~ ${maxAge}세`
    : '';

  // 지역 코드
  const regionCode = item.zipCd || '';

  return {
    bizId: item.plcyNo,
    polyBizSjnm: item.plcyNm,
    polyItcnCn: item.plcyExplnCn,
    sporCn: item.plcySprtCn,
    rqutPrdCn: item.aplyYmd || (item.bizPrdEndYmd ? `~${item.bizPrdEndYmd}` : '상시'),
    polyBizTy: categoryToCode[item.lclsfNm] || '023040',
    polyBizSecd: regionCode,
    polyBizSecdNm: item.rgtrInstCdNm || '',
    cnsgNmor: item.sprvsnInstCdNm || item.operInstCdNm || '',
    // 상세 필드
    polyBizSj: item.plcyExplnCn || '',
    sporScvl: '', // 지원 규모 (새 API에 없음)
    ageInfo,
    accrRqisCn: '', // 학력 조건 (새 API에 없음)
    splzRlmRqisCn: '', // 특화 분야 (새 API에 없음)
    empmSttsCn: '', // 취업상태 (새 API에 없음)
    majrRqisCn: '', // 전공 조건 (새 API에 없음)
    prcpCn: item.addAplyQlfcCndCn || '',
    prcpLmttTrgtCn: item.ptcpPrpTrgtCn || '',
    rqutProcCn: item.plcyAplyMthdCn || '',
    jdgnPresCn: item.srngMthdCn || '',
    rqutUrla: item.aplyUrlAddr || item.refUrlAddr1 || '',
    etct: item.etcMttrCn || '',
    mngtMson: item.operInstCdNm || '', // 담당 기관명
    mngtMsttNm: item.sprvsnInstCdNm || '',
    rfcSiteUrla1: item.refUrlAddr1 || '',
    rfcSiteUrla2: item.refUrlAddr2 || '',
    lastModyYmd: item.lastMdfcnDt?.split(' ')[0] || '',
  };
}

/**
 * JSON API 요청 수행
 */
async function fetchJson<T>(
  url: string,
  params: Record<string, string | number | undefined>
): Promise<T> {
  const searchParams = new URLSearchParams();
  searchParams.append('apiKeyNm', API_KEY);
  searchParams.append('rtnType', 'json');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const fullUrl = `${url}?${searchParams.toString()}`;

  if (__DEV__) {
    const maskedUrl = fullUrl.replace(/apiKeyNm=[^&]+/, 'apiKeyNm=***');
    console.log('[YouthPolicy API] URL:', maskedUrl);
    console.log('[YouthPolicy API] API_KEY 존재:', !!API_KEY, 'length:', API_KEY?.length);
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
            Accept: 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw ApiError.http(response.status);
        }

        const json = await response.json();

        if (json.resultCode !== 200) {
          throw new ApiError(json.resultMessage || 'API 응답 오류', 'http', {
            code: json.resultCode,
          });
        }

        return json as T;
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
  // API 요청 파라미터 구성
  const apiParams: Record<string, string | number> = {
    pageNum: params.pageIndex ?? 1,
    pageSize: params.display ?? 100, // 더 많은 데이터 요청
  };

  // 지역 코드 추가 (선택된 경우)
  if (params.srchPolyBizSecd) {
    apiParams.zipCd = params.srchPolyBizSecd;
  }

  // 정책 유형 코드 추가 (선택된 경우)
  if (params.bizTycdSel) {
    apiParams.lclsfCd = params.bizTycdSel;
  }

  // 검색어 추가 (선택된 경우)
  if (params.query) {
    apiParams.srchWord = params.query;
  }

  const response = await fetchJson<NewApiResponse>(`${BASE_URL}/getPlcy`, apiParams);

  const items = response.result.youthPolicyList.map(convertToLegacyFormat);

  return {
    items,
    totalCount: response.result.pagging.totCount,
    pageIndex: response.result.pagging.pageNum,
  };
}

/**
 * 청년정책 상세 조회
 */
export async function fetchYouthPolicyDetail(bizId: string): Promise<YouthPolicyDetail | null> {
  if (!bizId) {
    throw new Error('bizId is required');
  }

  // 정책 번호로 단일 정책 조회 (목록에서 찾기)
  const response = await fetchJson<NewApiResponse>(`${BASE_URL}/getPlcy`, {
    pageNum: 1,
    pageSize: 100,
  });

  const item = response.result.youthPolicyList.find((p) => p.plcyNo === bizId);

  return item ? convertToDetailFormat(item) : null;
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

/**
 * 사용자 지역 타입을 API 지역 코드로 변환
 */
export const REGION_TO_API_CODE: Record<string, string> = {
  seoul: '003001',
  busan: '003002',
  daegu: '003003',
  incheon: '003004',
  gwangju: '003005',
  daejeon: '003006',
  ulsan: '003007',
  gyeonggi: '003008',
  gangwon: '003009',
  chungbuk: '003010',
  chungnam: '003011',
  jeonbuk: '003012',
  jeonnam: '003013',
  gyeongbuk: '003014',
  gyeongnam: '003015',
  jeju: '003016',
  sejong: '003017',
};

/**
 * 지역 코드를 사용자 지역 타입으로 변환 (역매핑)
 */
export const API_CODE_TO_REGION: Record<string, string> = {
  '003001': 'seoul',
  '003002': 'busan',
  '003003': 'daegu',
  '003004': 'incheon',
  '003005': 'gwangju',
  '003006': 'daejeon',
  '003007': 'ulsan',
  '003008': 'gyeonggi',
  '003009': 'gangwon',
  '003010': 'chungbuk',
  '003011': 'chungnam',
  '003012': 'jeonbuk',
  '003013': 'jeonnam',
  '003014': 'gyeongbuk',
  '003015': 'gyeongnam',
  '003016': 'jeju',
  '003017': 'sejong',
};

/**
 * 지역명(한글)을 사용자 지역 타입으로 변환
 */
export const REGION_NAME_TO_CODE: Record<string, string> = {
  '서울': 'seoul',
  '서울시': 'seoul',
  '서울특별시': 'seoul',
  '부산': 'busan',
  '부산시': 'busan',
  '부산광역시': 'busan',
  '대구': 'daegu',
  '대구시': 'daegu',
  '대구광역시': 'daegu',
  '인천': 'incheon',
  '인천시': 'incheon',
  '인천광역시': 'incheon',
  '광주': 'gwangju',
  '광주시': 'gwangju',
  '광주광역시': 'gwangju',
  '대전': 'daejeon',
  '대전시': 'daejeon',
  '대전광역시': 'daejeon',
  '울산': 'ulsan',
  '울산시': 'ulsan',
  '울산광역시': 'ulsan',
  '세종': 'sejong',
  '세종시': 'sejong',
  '세종특별자치시': 'sejong',
  '경기': 'gyeonggi',
  '경기도': 'gyeonggi',
  '강원': 'gangwon',
  '강원도': 'gangwon',
  '강원특별자치도': 'gangwon',
  '충북': 'chungbuk',
  '충청북도': 'chungbuk',
  '충남': 'chungnam',
  '충청남도': 'chungnam',
  '전북': 'jeonbuk',
  '전라북도': 'jeonbuk',
  '전북특별자치도': 'jeonbuk',
  '전남': 'jeonnam',
  '전라남도': 'jeonnam',
  '경북': 'gyeongbuk',
  '경상북도': 'gyeongbuk',
  '경남': 'gyeongnam',
  '경상남도': 'gyeongnam',
  '제주': 'jeju',
  '제주도': 'jeju',
  '제주특별자치도': 'jeju',
  // 중앙부처 (전국 대상)
  '중앙부처': 'all',
  '전국': 'all',
};
