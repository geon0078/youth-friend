import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { BenefitFilters } from '@/types';
import { BENEFITS_QUERY_KEY } from './use-benefits';

export interface BenefitsMetadata {
  primaryUpdatedAt?: number;
  gov24UpdatedAt?: number;
  latestUpdatedAt?: number;
}

export function useBenefitsMetadata(filters?: BenefitFilters): BenefitsMetadata {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const primaryUpdatedAt = queryClient.getQueryState([
      BENEFITS_QUERY_KEY,
      'primary',
      filters,
    ])?.dataUpdatedAt;

    const gov24UpdatedAt = queryClient.getQueryState([
      BENEFITS_QUERY_KEY,
      'gov24',
      filters,
    ])?.dataUpdatedAt;

    const latestUpdatedAt = Math.max(
      primaryUpdatedAt ?? 0,
      gov24UpdatedAt ?? 0
    );

    return {
      primaryUpdatedAt,
      gov24UpdatedAt,
      latestUpdatedAt: latestUpdatedAt > 0 ? latestUpdatedAt : undefined,
    };
  }, [filters, queryClient]);
}
