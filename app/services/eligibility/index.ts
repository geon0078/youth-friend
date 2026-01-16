/**
 * Eligibility Services
 * Story 4.2: Implement Eligibility Rule Parser
 * Story 4.3: Implement Profile-Benefit Matching Engine
 */
export {
  parseAgeRule,
  parseIncomeRule,
  parseRegionRule,
  parseEmploymentRule,
  parseBenefitRequirements,
  calculateOverallConfidence,
  resetRuleIdCounter,
  type ParseResult,
} from './rule-parser';

export {
  checkEligibility,
  checkEligibilityBatch,
  checkAgeRule,
  checkIncomeRule,
  checkRegionRule,
  checkEmploymentRule,
  checkCustomRule,
  calculateFutureEligibility,
  getCachedResult,
  setCachedResult,
  invalidateCache,
  invalidateBenefitCache,
  type CheckEligibilityInput,
} from './matching-engine';
