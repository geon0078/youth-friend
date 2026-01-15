/**
 * 혜택 목록 조회 React Query 훅
 * - Pull-to-refresh 지원
 * - 오프라인 우선 캐싱 (NFR20)
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchAllBenefits, fetchPersonalizedBenefits } from '@/services/api';
import type { BenefitFilters, BenefitListResult } from '@/types';

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

  const query = useQuery<BenefitListResult, Error>({
    queryKey: [BENEFITS_QUERY_KEY, filters],
    queryFn: () => fetchAllBenefits(filters),
    staleTime: STALE_TIME,
  });

  // Pull-to-refresh 함수
  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // 캐시 무효화 함수 (강제 새로고침)
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [BENEFITS_QUERY_KEY, filters],
    });
  }, [queryClient, filters]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isSuccess: query.isSuccess,
    isError: query.isError,
    isRefetching: query.isRefetching,
    isFetching: query.isFetching,
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

  const query = useQuery<BenefitListResult, Error>({
    queryKey: [BENEFITS_QUERY_KEY, 'personalized', userProfile, filters],
    queryFn: () => fetchPersonalizedBenefits(userProfile ?? {}, filters),
    staleTime: STALE_TIME,
    enabled: !!userProfile,
  });

  // Pull-to-refresh 함수
  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // 캐시 무효화 함수
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [BENEFITS_QUERY_KEY, 'personalized', userProfile, filters],
    });
  }, [queryClient, userProfile, filters]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isSuccess: query.isSuccess,
    isError: query.isError,
    isRefetching: query.isRefetching,
    isFetching: query.isFetching,
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
