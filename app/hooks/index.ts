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

// Total benefits hook
export {
  useTotalBenefits,
  type UseTotalBenefitsResult,
  type TotalBenefitsData,
} from './use-total-benefits';

// Search hooks
export { useDebounce } from './use-debounce';
export { useRecentSearches } from './use-recent-searches';

// Eligibility hooks
export {
  useCheckEligibility,
  useEligibilityBatch,
  useInvalidateAllEligibility,
  ELIGIBILITY_QUERY_KEY,
  type UseCheckEligibilityResult,
  type UseEligibilityBatchResult,
} from './use-eligibility';

// Application hooks (Epic 5)
export {
  useDocumentChecklist,
  clearAllChecklists,
  deleteChecklist,
} from './use-document-checklist';

export {
  useSavedApplications,
  useBenefitSaveStatus,
} from './use-saved-applications';

// Notification hooks (Epic 6)
export {
  useNotifications,
  useNotificationPermission,
} from './use-notifications';

export {
  useNotificationDeepLink,
  createDeepLinkUrl,
} from './use-notification-deep-link';
