/**
 * 혜택 목록 조회 React Query 훅
 * - Pull-to-refresh 지원
 * - 오프라인 우선 캐싱 (NFR20)
 * - 보조금24 지연 로드 (성능 최적화)
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { fetchAllBenefits, fetchPersonalizedBenefits } from '@/services/api';
import type { BenefitFilters, BenefitListResult, Benefit } from '@/types';

/** 캐시 키 */
export const BENEFITS_QUERY_KEY = 'benefits';

/** staleTime 1시간 (NFR20) */
const STALE_TIME = 1000 * 60 * 60;

/**
 * 혜택 목록 조회 훅 반환 타입
 */
export interface UseBenefitsResult {
  /** 혜택 목록 데이터 */
  data: BenefitListResult | undefined;
  /** 초기 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 데이터 존재 여부 */
  isSuccess: boolean;
  /** 에러 발생 여부 */
  isError: boolean;
  /** Pull-to-refresh 진행 중 여부 */
  isRefetching: boolean;
  /** 백그라운드 패칭 진행 중 여부 */
  isFetching: boolean;
  /** Pull-to-refresh 함수 */
  refresh: () => Promise<void>;
  /** 캐시 무효화 함수 */
  invalidate: () => Promise<void>;
}

/**
 * 혜택 목록 조회 훅
 * @param filters - 필터 옵션
 * @returns UseBenefitsResult 객체
 *
 * @example
 * ```tsx
 * function BenefitsList() {
 *   const { data, isLoading, isRefetching, refresh } = useBenefits();
 *
 *   return (
 *     <FlatList
 *       data={data?.items}
 *       refreshControl={
 *         <RefreshControl
 *           refreshing={isRefetching}
 *           onRefresh={refresh}
 *         />
 *       }
 *     />
 *   );
 * }
 * ```
 */
export function useBenefits(filters?: BenefitFilters): UseBenefitsResult {
  const queryClient = useQueryClient();

  // 1단계: 온통청년 + 고용24 빠른 로드 (보조금24 제외)
  const primaryQuery = useQuery<BenefitListResult, Error>({
    queryKey: [BENEFITS_QUERY_KEY, 'primary', filters],
    queryFn: () => fetchAllBenefits({ ...filters, includeGov24: false }),
    staleTime: STALE_TIME,
  });

  // 2단계: 보조금24 지연 로드 (1단계와 동시에 시작하되, 독립적으로 로드)
  const gov24Query = useQuery<BenefitListResult, Error>({
    queryKey: [BENEFITS_QUERY_KEY, 'gov24', filters],
    queryFn: () => fetchAllBenefits({ ...filters, source: 'gov24' }),
    staleTime: STALE_TIME,
    // 1단계와 동시에 로드 시작 (더 빠른 데이터 표시를 위해)
    enabled: true,
  });

  // 두 쿼리 결과 병합
  const mergedData = useMemo<BenefitListResult | undefined>(() => {
    if (!primaryQuery.data) return undefined;

    const primaryItems = primaryQuery.data.items;
    const gov24Items = gov24Query.data?.items ?? [];

    // 중복 제거를 위한 ID 세트
    const existingIds = new Set(primaryItems.map((b: Benefit) => b.id));
    const uniqueGov24Items = gov24Items.filter((b: Benefit) => !existingIds.has(b.id));

    const mergedItems = [...primaryItems, ...uniqueGov24Items];

    return {
      items: mergedItems,
      totalCount: mergedItems.length,
      page: primaryQuery.data.page,
      pageSize: primaryQuery.data.pageSize,
      totalPages: Math.ceil(mergedItems.length / primaryQuery.data.pageSize),
    };
  }, [primaryQuery.data, gov24Query.data]);

  // Pull-to-refresh 함수 (두 쿼리 모두 새로고침)
  const refresh = useCallback(async () => {
    await Promise.all([
      primaryQuery.refetch(),
      gov24Query.refetch(),
    ]);
  }, [primaryQuery, gov24Query]);

  // 캐시 무효화 함수
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [BENEFITS_QUERY_KEY],
    });
  }, [queryClient]);

  return {
    data: mergedData,
    isLoading: primaryQuery.isLoading, // 1단계 로딩만 표시 (빠른 초기 로드)
    error: primaryQuery.error || gov24Query.error,
    isSuccess: primaryQuery.isSuccess,
    isError: primaryQuery.isError,
    isRefetching: primaryQuery.isRefetching || gov24Query.isRefetching,
    isFetching: primaryQuery.isFetching || gov24Query.isFetching,
    refresh,
    invalidate,
  };
}

/**
 * 사용자 맞춤 혜택 목록 조회 훅
 * @param userProfile - 사용자 프로필
 * @param filters - 추가 필터 옵션
 * @returns UseBenefitsResult 객체
 */
export function usePersonalizedBenefits(
  userProfile: {
    birthYear?: number;
    region?: string;
    incomeLevel?: string;
    employmentStatus?: string;
  } | null,
  filters?: Omit<BenefitFilters, 'region'>
): UseBenefitsResult {
  const queryClient = useQueryClient();

  // 1단계: 온통청년 + 고용24 빠른 로드
  const primaryQuery = useQuery<BenefitListResult, Error>({
    queryKey: [BENEFITS_QUERY_KEY, 'personalized', 'primary', userProfile, filters],
    queryFn: () => fetchPersonalizedBenefits(userProfile ?? {}, { ...filters, includeGov24: false }),
    staleTime: STALE_TIME,
    enabled: !!userProfile,
  });

  // 2단계: 보조금24 지연 로드
  const gov24Query = useQuery<BenefitListResult, Error>({
    queryKey: [BENEFITS_QUERY_KEY, 'personalized', 'gov24', userProfile, filters],
    queryFn: () => fetchAllBenefits({ ...filters, source: 'gov24' }),
    staleTime: STALE_TIME,
    enabled: !!userProfile && primaryQuery.isSuccess,
  });

  // 두 쿼리 결과 병합
  const mergedData = useMemo<BenefitListResult | undefined>(() => {
    if (!primaryQuery.data) return undefined;

    const primaryItems = primaryQuery.data.items;
    const gov24Items = gov24Query.data?.items ?? [];

    const existingIds = new Set(primaryItems.map((b: Benefit) => b.id));
    const uniqueGov24Items = gov24Items.filter((b: Benefit) => !existingIds.has(b.id));

    const mergedItems = [...primaryItems, ...uniqueGov24Items];

    return {
      items: mergedItems,
      totalCount: mergedItems.length,
      page: primaryQuery.data.page,
      pageSize: primaryQuery.data.pageSize,
      totalPages: Math.ceil(mergedItems.length / primaryQuery.data.pageSize),
    };
  }, [primaryQuery.data, gov24Query.data]);

  // Pull-to-refresh 함수
  const refresh = useCallback(async () => {
    await Promise.all([
      primaryQuery.refetch(),
      gov24Query.refetch(),
    ]);
  }, [primaryQuery, gov24Query]);

  // 캐시 무효화 함수
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [BENEFITS_QUERY_KEY, 'personalized'],
    });
  }, [queryClient]);

  return {
    data: mergedData,
    isLoading: primaryQuery.isLoading,
    error: primaryQuery.error || gov24Query.error,
    isSuccess: primaryQuery.isSuccess,
    isError: primaryQuery.isError,
    isRefetching: primaryQuery.isRefetching || gov24Query.isRefetching,
    isFetching: primaryQuery.isFetching || gov24Query.isFetching,
    refresh,
    invalidate,
  };
}

/**
 * 무한 스크롤 혜택 목록 조회용 페이지 파라미터 생성
 */
export function getBenefitsNextPageParam(
  lastPage: BenefitListResult
): number | undefined {
  if (lastPage.page < lastPage.totalPages) {
    return lastPage.page + 1;
  }
  return undefined;
}

/**
 * 혜택 캐시 전체 무효화 훅
 * 프로필 변경 등 전체 캐시 갱신이 필요할 때 사용
 */
export function useInvalidateAllBenefits(): () => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [BENEFITS_QUERY_KEY],
    });
  }, [queryClient]);
}
