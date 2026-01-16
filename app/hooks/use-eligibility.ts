/**
 * 자격 검증 React Query 훅
 * Story 4.3: Implement Profile-Benefit Matching Engine
 * - 사용자 프로필과 혜택 자격요건 비교
 * - 프로필 변경 시 캐시 무효화
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores';
import {
  checkEligibility,
  invalidateCache,
  invalidateBenefitCache,
} from '@/services/eligibility';
import type { BenefitDetail, EligibilityResult, EligibilityCheckOptions } from '@/types';

/** 캐시 키 */
export const ELIGIBILITY_QUERY_KEY = 'eligibility';

/** staleTime 1시간 */
const STALE_TIME = 1000 * 60 * 60;

/**
 * useCheckEligibility 훅 반환 타입
 */
export interface UseCheckEligibilityResult {
  /** 자격 검증 결과 */
  result: EligibilityResult | null | undefined;
  /** 초기 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 데이터 존재 여부 */
  isSuccess: boolean;
  /** 에러 발생 여부 */
  isError: boolean;
  /** 백그라운드 패칭 진행 중 여부 */
  isFetching: boolean;
  /** 프로필 존재 여부 */
  hasProfile: boolean;
  /** 강제 새로고침 함수 */
  refresh: () => Promise<void>;
  /** 캐시 무효화 함수 */
  invalidate: () => Promise<void>;
}

/**
 * 자격 검증 훅
 * @param benefit - 혜택 상세 정보 (null이면 비활성화)
 * @param options - 검증 옵션
 * @returns UseCheckEligibilityResult 객체
 *
 * @example
 * ```tsx
 * function BenefitDetail({ benefit }: { benefit: BenefitDetail }) {
 *   const { result, isLoading, hasProfile } = useCheckEligibility(benefit);
 *
 *   if (!hasProfile) {
 *     return <Text>프로필을 먼저 설정해주세요</Text>;
 *   }
 *
 *   if (isLoading) return <ActivityIndicator />;
 *
 *   return (
 *     <EligibilityBadge status={result?.status} score={result?.score} />
 *   );
 * }
 * ```
 */
export function useCheckEligibility(
  benefit: BenefitDetail | null | undefined,
  options?: EligibilityCheckOptions
): UseCheckEligibilityResult {
  const queryClient = useQueryClient();
  const profile = useUserStore((state) => state.profile);
  const prevProfileRef = useRef(profile);

  const hasProfile = !!profile;
  const enabled = !!benefit && hasProfile;

  // 프로필 변경 감지하여 캐시 무효화
  useEffect(() => {
    if (prevProfileRef.current !== profile && benefit) {
      // 프로필 변경됨 - 해당 혜택 캐시 무효화
      invalidateBenefitCache(benefit.id);
      queryClient.invalidateQueries({
        queryKey: [ELIGIBILITY_QUERY_KEY, benefit.id],
      });
    }
    prevProfileRef.current = profile;
  }, [profile, benefit, queryClient]);

  const query = useQuery<EligibilityResult | null, Error>({
    queryKey: [ELIGIBILITY_QUERY_KEY, benefit?.id, profile],
    queryFn: () => {
      if (!benefit || !profile) {
        return null;
      }
      return checkEligibility({
        profile,
        benefit,
        options,
      });
    },
    staleTime: STALE_TIME,
    enabled,
  });

  // 강제 새로고침
  const refresh = useCallback(async () => {
    if (benefit) {
      invalidateBenefitCache(benefit.id);
    }
    await query.refetch();
  }, [query, benefit]);

  // 캐시 무효화
  const invalidate = useCallback(async () => {
    if (benefit) {
      invalidateBenefitCache(benefit.id);
      await queryClient.invalidateQueries({
        queryKey: [ELIGIBILITY_QUERY_KEY, benefit.id],
      });
    }
  }, [queryClient, benefit]);

  return {
    result: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isSuccess: query.isSuccess,
    isError: query.isError,
    isFetching: query.isFetching,
    hasProfile,
    refresh,
    invalidate,
  };
}

/**
 * 여러 혜택에 대한 자격 검증 결과 가져오기
 */
export interface UseEligibilityBatchResult {
  /** 혜택ID별 자격 검증 결과 */
  results: Map<string, EligibilityResult>;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 프로필 존재 여부 */
  hasProfile: boolean;
  /** 특정 혜택의 결과 가져오기 */
  getResult: (benefitId: string) => EligibilityResult | undefined;
}

/**
 * 여러 혜택에 대한 자격 검증 훅
 * @param benefits - 혜택 목록
 * @param options - 검증 옵션
 * @returns UseEligibilityBatchResult 객체
 *
 * @example
 * ```tsx
 * function BenefitList({ benefits }: { benefits: BenefitDetail[] }) {
 *   const { getResult, isLoading } = useEligibilityBatch(benefits);
 *
 *   return benefits.map(benefit => (
 *     <BenefitCard
 *       key={benefit.id}
 *       benefit={benefit}
 *       eligibility={getResult(benefit.id)}
 *     />
 *   ));
 * }
 * ```
 */
export function useEligibilityBatch(
  benefits: BenefitDetail[],
  options?: EligibilityCheckOptions
): UseEligibilityBatchResult {
  const profile = useUserStore((state) => state.profile);
  const hasProfile = !!profile;

  // 각 혜택에 대해 개별 쿼리 결과를 메모이제이션
  const results = useMemo(() => {
    const map = new Map<string, EligibilityResult>();
    if (!profile || benefits.length === 0) {
      return map;
    }

    for (const benefit of benefits) {
      const result = checkEligibility({
        profile,
        benefit,
        options,
      });
      map.set(benefit.id, result);
    }

    return map;
  }, [profile, benefits, options]);

  const getResult = useCallback(
    (benefitId: string): EligibilityResult | undefined => {
      return results.get(benefitId);
    },
    [results]
  );

  return {
    results,
    isLoading: false, // 동기 계산이므로 항상 false
    error: null,
    hasProfile,
    getResult,
  };
}

/**
 * 전체 캐시 무효화 훅
 * 프로필 변경 후 모든 자격 검증 결과를 무효화할 때 사용
 */
export function useInvalidateAllEligibility(): () => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    invalidateCache();
    await queryClient.invalidateQueries({
      queryKey: [ELIGIBILITY_QUERY_KEY],
    });
  }, [queryClient]);
}
