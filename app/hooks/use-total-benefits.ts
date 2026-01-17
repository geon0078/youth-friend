/**
 * 총 혜택 금액 계산 훅
 * - useBenefits 훅에서 혜택 목록 가져오기
 * - supportContent/description에서 금액 파싱
 * - 추정 총 금액과 개수 반환
 */
import { useMemo } from 'react';
import { useBenefits } from './use-benefits';
import { formatBenefitCount } from '@/utils/format-currency';
import { parseAmount, formatAmount } from '@/utils/benefit-scoring';
import type { BenefitFilters } from '@/types';

/**
 * 총 혜택 계산 결과 타입
 */
export interface TotalBenefitsData {
  /** 추정 총 금액 (원) */
  totalAmount: number;
  /** 포맷팅된 총 금액 (예: "약 1,200만원 이상") */
  formattedAmount: string;
  /** 전체 혜택 개수 */
  benefitCount: number;
  /** 포맷팅된 혜택 개수 */
  formattedCount: string;
  /** 금액 파싱된 혜택 개수 */
  parsedBenefitCount: number;
  /** 금액 정보 있는 비율 (0-100) */
  coveragePercent: number;
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
    const benefitCount = items.length;

    // supportContent/description에서 금액 파싱하여 합산
    let totalAmount = 0;
    let parsedBenefitCount = 0;

    for (const benefit of items) {
      // 우선순위: amount > supportContent > description
      let amount: number | null = benefit.amount ?? null;

      if (!amount) {
        amount = parseAmount(benefit.supportContent);
      }
      if (!amount) {
        amount = parseAmount(benefit.description);
      }

      if (amount && amount > 0) {
        totalAmount += amount;
        parsedBenefitCount++;
      }
    }

    const coveragePercent = benefitCount > 0
      ? Math.round((parsedBenefitCount / benefitCount) * 100)
      : 0;

    // 추정 금액 포맷팅 (파싱된 것만 합산했으므로 "약 X 이상")
    const formattedAmount = totalAmount > 0
      ? `약 ${formatAmount(totalAmount)} 이상`
      : '금액 정보 확인 필요';

    return {
      totalAmount,
      formattedAmount,
      benefitCount,
      formattedCount: formatBenefitCount(benefitCount),
      parsedBenefitCount,
      coveragePercent,
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
