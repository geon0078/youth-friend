export { apiClient, ApiError } from './client';

// 온통청년 API
export {
  fetchYouthPolicyList,
  fetchYouthPolicyDetail,
  POLICY_TYPE_CODES,
  REGION_CODES,
} from './youth-policy';

// 고용24 API
export {
  fetchJobPostingList,
  fetchTrainingCardList,
  fetchEmployerTrainingList,
  fetchConsortiumTrainingList,
  fetchWorkStudyList,
  fetchEmploymentProgramList,
  fetchSmallGiantList,
  fetchJobInfoList,
  fetchJobDutyList,
  fetchCommonCodeList,
} from './employment24';

// 보조금24 API
export { fetchGov24ServiceList, fetchAllGov24Services } from './gov24';

// 통합 혜택 서비스
export {
  fetchAllBenefits,
  fetchBenefitDetail,
  fetchPersonalizedBenefits,
} from './benefits';
