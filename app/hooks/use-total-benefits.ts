/**
 * 총 혜택 금액 계산 훅
 * - useBenefits 훅에서 혜택 목록 가져오기
 * - amount 필드 합산
 * - 포맷팅된 금액과 개수 반환
 */
import { useMemo } from 'react';
import { useBenefits } from './use-benefits';
import { formatCurrency, formatBenefitCount } from '@/utils/format-currency';
import type { BenefitFilters } from '@/types';

/**
 * 총 혜택 계산 결과 타입
 */
export interface TotalBenefitsData {
  /** 총 금액 (원) */
  totalAmount: number;
  /** 포맷팅된 총 금액 */
  formattedAmount: string;
  /** 혜택 개수 */
  benefitCount: number;
  /** 포맷팅된 혜택 개수 */
  formattedCount: string;
}

/**
 * useTotalBenefits 훅 반환 타입
 */
export interface UseTotalBenefitsResult {
  /** 계산된 총 혜택 데이터 */
  data: TotalBenefitsData | undefined;
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
  /** Pull-to-refresh 함수 */
  refresh: () => Promise<void>;
}

/**
 * 총 혜택 금액 계산 훅
 * @param filters - 필터 옵션 (선택)
 * @returns UseTotalBenefitsResult 객체
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, isLoading } = useTotalBenefits();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <View>
 *       <Text>{data?.formattedAmount}</Text>
 *       <Text>{data?.formattedCount}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTotalBenefits(
  filters?: BenefitFilters
): UseTotalBenefitsResult {
  const {
    data: benefitsData,
    isLoading,
    error,
    isSuccess,
    isError,
    isRefetching,
    refresh,
  } = useBenefits(filters);

  // 총 금액 및 개수 계산 (메모이제이션)
  const totalBenefitsData = useMemo<TotalBenefitsData | undefined>(() => {
    if (!benefitsData?.items) {
      return undefined;
    }

    const items = benefitsData.items;

    // amount 필드 합산 (null/undefined 처리)
    const totalAmount = items.reduce((sum, benefit) => {
      const amount = benefit.amount ?? 0;
      return sum + amount;
    }, 0);

    const benefitCount = items.length;

    return {
      totalAmount,
      formattedAmount: formatCurrency(totalAmount),
      benefitCount,
      formattedCount: formatBenefitCount(benefitCount),
    };
  }, [benefitsData?.items]);

  return {
    data: totalBenefitsData,
    isLoading,
    error,
    isSuccess,
    isError,
    isRefetching,
    refresh,
  };
}
