/**
 * 혜택 상세 조회 React Query 훅
 * - Pull-to-refresh 지원
 * - 오프라인 우선 캐싱 (NFR20)
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchBenefitDetail } from '@/services/api';
import type { BenefitDetail } from '@/types';

/** 캐시 키 */
export const BENEFIT_DETAIL_QUERY_KEY = 'benefit-detail';

/** staleTime 1시간 (NFR20) */
const STALE_TIME = 1000 * 60 * 60;

/**
 * 혜택 상세 조회 훅 반환 타입
 */
export interface UseBenefitDetailResult {
  /** 혜택 상세 데이터 */
  data: BenefitDetail | null | undefined;
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
 * 혜택 상세 조회 훅
 * @param benefitId - 혜택 ID (형식: source-originalId)
 * @returns UseBenefitDetailResult 객체
 *
 * @example
 * ```tsx
 * function BenefitDetailScreen({ id }: { id: string }) {
 *   const { data, isLoading, refresh } = useBenefitDetail(id);
 *
 *   if (isLoading) return <LoadingSkeleton />;
 *
 *   return (
 *     <ScrollView
 *       refreshControl={
 *         <RefreshControl refreshing={isRefetching} onRefresh={refresh} />
 *       }
 *     >
 *       <BenefitContent data={data} />
 *     </ScrollView>
 *   );
 * }
 * ```
 */
export function useBenefitDetail(
  benefitId: string | null | undefined
): UseBenefitDetailResult {
  const queryClient = useQueryClient();

  const query = useQuery<BenefitDetail | null, Error>({
    queryKey: [BENEFIT_DETAIL_QUERY_KEY, benefitId],
    queryFn: () => fetchBenefitDetail(benefitId!),
    staleTime: STALE_TIME,
    enabled: !!benefitId,
  });

  // Pull-to-refresh 함수
  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // 캐시 무효화 함수
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [BENEFIT_DETAIL_QUERY_KEY, benefitId],
    });
  }, [queryClient, benefitId]);

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
