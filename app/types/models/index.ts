export type {
  UserProfile,
  Region,
  IncomeLevel,
  EmploymentStatus,
  AppSettings,
  TextSize,
  BenefitFilter,
  BenefitCategory,
  SortOption,
  ConsentItems,
  ConsentState,
} from './user';

export {
  REGION_LABELS,
  REGIONS,
  INCOME_LEVEL_LABELS,
  INCOME_LEVELS,
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUSES,
  DEFAULT_CONSENT_ITEMS,
} from './user';

export type {
  BenefitSource,
  BenefitStatus,
  BenefitFilters,
  Benefit,
  BenefitDetail,
  BenefitListResult,
} from './benefit';

// Eligibility types (Story 4.1)
export type {
  EligibilityStatus,
  RuleOperator,
  RuleFieldType,
  RuleValue,
  RangeValue,
  RequirementSeverity,
  RuleMetadata,
  EligibilityRule,
  RuleCheckResult,
  MatchScore,
  UnmetRequirement,
  FutureEligibility,
  EligibilityResult,
  EligibilityCheckOptions,
} from './eligibility';

export {
  ELIGIBILITY_STATUS_LABELS,
  ELIGIBILITY_STATUS_COLORS,
  SEVERITY_LABELS,
  FIELD_TYPE_LABELS,
  DEFAULT_MATCH_SCORE,
  DEFAULT_ELIGIBILITY_RESULT,
  DEFAULT_ELIGIBILITY_OPTIONS,
  ELIGIBILITY_DISCLAIMER,
  ELIGIBILITY_CACHE_TTL,
} from './eligibility';

// Application types (Story 5.1)
export type {
  ApplicationStatus,
  DocumentIssuanceMethod,
  RequiredDocument,
  DocumentCheckItem,
  DocumentChecklist,
  ApplicationStep,
  ApplicationProgress,
  SavedApplication,
  StatusHistoryItem,
  SavedApplicationFilters,
} from './application';

export {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  ISSUANCE_METHOD_LABELS,
  APPLICATION_STEP_LABELS,
  DEFAULT_APPLICATION_PROGRESS,
  COMMON_DOCUMENTS,
  APPLICATION_STEP_PROGRESS,
  findCommonDocument,
  calculateChecklistProgress,
  isDeadlineApproaching,
  getDaysUntilDeadline,
} from './application';

// Notification types (Epic 6)
export type {
  NotificationType,
  NotificationPriority,
  NotificationData,
  StoredNotification,
  NotificationSettings,
  ScheduledNotification,
  PushTokenInfo,
} from './notification';

export {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
  DEADLINE_ALERT_DAYS,
  MAX_DAILY_NOTIFICATIONS,
  NOTIFICATION_RETENTION_DAYS,
} from './notification';
