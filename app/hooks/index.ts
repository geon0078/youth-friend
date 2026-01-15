export { useProfile } from './use-profile';
export type {
  UseProfileReturn,
  ProfileSaveResult,
  ProfileLoadResult,
} from './use-profile';

// Benefits hooks
export {
  useBenefits,
  usePersonalizedBenefits,
  getBenefitsNextPageParam,
  useInvalidateAllBenefits,
  BENEFITS_QUERY_KEY,
  type UseBenefitsResult,
} from './use-benefits';

export {
  useBenefitDetail,
  BENEFIT_DETAIL_QUERY_KEY,
  type UseBenefitDetailResult,
} from './use-benefit-detail';

// Network status hooks
export {
  useNetworkStatus,
  useIsOffline,
  useRefreshNetworkStatus,
  type NetworkStatus,
} from './use-network-status';
