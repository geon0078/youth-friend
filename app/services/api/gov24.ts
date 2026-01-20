/**
 * 보조금24 (정부24 공공서비스) API 서비스
 * API 문서: https://infuser.odcloud.kr/api/stages/44436/api-docs
 */
import { apiClient, ApiError } from './client';
import type {
  Gov24ApiResponse,
  Gov24ServiceListItem,
  Gov24ApiParams,
} from '@/types/api/gov24';

// ========================================
// API 설정
// ========================================

const GOV24_BASE_URL = 'https://api.odcloud.kr/api/gov24/v3/serviceList';
const GOV24_API_KEY = process.env.EXPO_PUBLIC_GOV24_API_KEY || '';

/** 요청 타임아웃 (15초 - 대용량 데이터 고려) */
const GOV24_TIMEOUT = 15000;

/** 최대 재시도 횟수 */
const GOV24_RETRIES = 3;

/** 페이지당 최대 항목 수 */
const MAX_PER_PAGE = 500;

/** 병렬 요청 최대 페이지 수 (안정성을 위해 3페이지로 제한) */
const MAX_PARALLEL_PAGES = 3;

// ========================================
// API 함수
// ========================================

/**
 * 보조금24 서비스 목록 단일 페이지 조회
 */
export async function fetchGov24ServiceList(
  params?: Gov24ApiParams
): Promise<Gov24ApiResponse<Gov24ServiceListItem>> {
  if (!GOV24_API_KEY) {
    if (__DEV__) {
      console.warn('[Gov24] API 키가 설정되지 않았습니다. EXPO_PUBLIC_GOV24_API_KEY 환경 변수를 설정하세요.');
    }
    throw ApiError.http(401, { code: 'NO_API_KEY', message: 'API 키가 설정되지 않았습니다' });
  }

  const queryParams = new URLSearchParams({
    serviceKey: GOV24_API_KEY,
    page: String(params?.page ?? 1),
    perPage: String(params?.perPage ?? MAX_PER_PAGE),
    returnType: params?.returnType ?? 'JSON',
  });

  // 선택적 필터 파라미터
  if (params?.serviceName) {
    queryParams.append('cond[서비스명::LIKE]', params.serviceName);
  }
  if (params?.orgType) {
    queryParams.append('cond[소관기관유형::EQ]', params.orgType);
  }
  if (params?.userType) {
    queryParams.append('cond[사용자구분::EQ]', params.userType);
  }
  if (params?.serviceField) {
    queryParams.append('cond[서비스분야::EQ]', params.serviceField);
  }

  const url = `${GOV24_BASE_URL}?${queryParams.toString()}`;

  if (__DEV__) {
    console.log(`[Gov24] API 호출: page=${params?.page ?? 1}, perPage=${params?.perPage ?? MAX_PER_PAGE}`);
  }

  const response = await apiClient.get<Gov24ApiResponse<Gov24ServiceListItem>>(url, {
    timeout: GOV24_TIMEOUT,
    retries: GOV24_RETRIES,
  });

  return response;
}

/**
 * 보조금24 전체 서비스 목록 조회 (병렬 페이지 요청)
 * @param filterYouth - 청년 대상 서비스만 필터링 (기본: true)
 */
export async function fetchAllGov24Services(
  filterYouth: boolean = true
): Promise<Gov24ServiceListItem[]> {
  if (!GOV24_API_KEY) {
    if (__DEV__) {
      console.warn('[Gov24] API 키가 설정되지 않았습니다.');
    }
    return [];
  }

  try {
    // 1. 첫 페이지 조회 (총 개수 파악)
    let firstResponse;
    try {
      firstResponse = await fetchGov24ServiceList({
        page: 1,
        perPage: MAX_PER_PAGE,
      });
    } catch (firstPageError) {
      if (__DEV__) {
        console.warn('[Gov24] 첫 페이지 조회 실패:', firstPageError);
      }
      return []; // 첫 페이지 실패 시 빈 배열 반환
    }

    const totalCount = firstResponse.totalCount;
    const totalPages = Math.ceil(totalCount / MAX_PER_PAGE);
    const pagesToFetch = Math.min(totalPages, MAX_PARALLEL_PAGES);

    if (__DEV__) {
      console.log(`[Gov24] 총 ${totalCount}개 서비스, ${totalPages} 페이지 (최대 ${pagesToFetch} 페이지 조회)`);
    }

    let allItems = [...firstResponse.data];

    // 2. 추가 페이지 병렬 조회
    if (pagesToFetch > 1) {
      const additionalPromises: Promise<Gov24ApiResponse<Gov24ServiceListItem> | null>[] = [];

      for (let p = 2; p <= pagesToFetch; p++) {
        additionalPromises.push(
          fetchGov24ServiceList({ page: p, perPage: MAX_PER_PAGE })
            .catch((error) => {
              if (__DEV__) {
                console.warn(`[Gov24] 페이지 ${p} 조회 실패:`, error);
              }
              return null;
            })
        );
      }

      const responses = await Promise.all(additionalPromises);

      for (const response of responses) {
        if (response?.data) {
          allItems.push(...response.data);
        }
      }
    }

    if (__DEV__) {
      console.log(`[Gov24] 총 ${allItems.length}개 서비스 조회 완료`);
    }

    // 3. 청년 대상 필터링
    if (filterYouth) {
      const beforeCount = allItems.length;
      allItems = filterYouthTargetServices(allItems);

      if (__DEV__) {
        console.log(`[Gov24] 청년 대상 필터링: ${beforeCount}개 → ${allItems.length}개`);
      }
    }

    return allItems;
  } catch (error) {
    if (__DEV__) {
      console.error('[Gov24] 전체 서비스 목록 조회 실패:', error);
    }
    return [];
  }
}

// ========================================
// 필터링 헬퍼 함수
// ========================================

/**
 * 청년 대상 서비스 필터링
 * 지원대상 또는 서비스명에 청년 관련 키워드가 포함된 서비스 추출
 */
function filterYouthTargetServices(
  services: Gov24ServiceListItem[]
): Gov24ServiceListItem[] {
  const YOUTH_KEYWORDS = [
    '청년',
    '19세',
    '20세',
    '34세',
    '39세',
    '청소년',
    '대학생',
    '취준생',
    '미취업',
    '신혼',
    '사회초년',
  ];

  return services.filter((service) => {
    const searchText = [
      service.서비스명,
      service.지원대상,
      service.서비스목적요약,
      service.지원내용,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // 청년 관련 키워드 포함 여부 확인
    return YOUTH_KEYWORDS.some((keyword) => searchText.includes(keyword.toLowerCase()));
  });
}
