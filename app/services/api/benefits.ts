/**
 * 통합 혜택 서비스
 * 온통청년 + 고용24 API를 통합하여 단일 인터페이스 제공
 */
import {
  fetchYouthPolicyList,
  fetchYouthPolicyDetail,
  POLICY_TYPE_CODES,
} from './youth-policy';
import {
  fetchJobPostingList,
  fetchTrainingCardList,
  fetchEmploymentProgramList,
} from './employment24';
import { ApiError } from './client';
import type {
  Benefit,
  BenefitDetail,
  BenefitFilters,
  BenefitListResult,
  BenefitCategory,
} from '@/types/models/benefit';
import type { YouthPolicyListItem, YouthPolicyDetail } from '@/types/api/youth-policy';
import type { JobPostingItem, TrainingCardItem, EmploymentProgramItem } from '@/types/api/employment24';

// ========================================
// 정규화 헬퍼 함수
// ========================================

/**
 * 온통청년 정책 유형을 카테고리로 변환
 */
function mapYouthPolicyCategory(polyBizTy: string): BenefitCategory {
  switch (polyBizTy) {
    case POLICY_TYPE_CODES.JOB:
      return 'employment';
    case POLICY_TYPE_CODES.HOUSING:
      return 'housing';
    case POLICY_TYPE_CODES.EDUCATION:
      return 'education';
    case POLICY_TYPE_CODES.WELFARE:
      return 'welfare';
    case POLICY_TYPE_CODES.PARTICIPATION:
      return 'culture';
    default:
      return 'welfare';
  }
}

/**
 * 혜택 상태 판정
 */
function determineBenefitStatus(deadline?: string): 'active' | 'upcoming' | 'ended' | 'unknown' {
  if (!deadline) return 'unknown';

  // "상시", "수시" 등의 경우 활성 상태
  if (deadline.includes('상시') || deadline.includes('수시')) {
    return 'active';
  }

  // 날짜 파싱 시도
  const dateMatch = deadline.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (dateMatch) {
    const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    const now = new Date();

    if (endDate < now) return 'ended';
    return 'active';
  }

  return 'unknown';
}

/**
 * 온통청년 정책 → Benefit 변환
 */
function normalizeYouthPolicy(item: YouthPolicyListItem): Benefit {
  return {
    id: `youth-policy-${item.bizId}`,
    originalId: item.bizId,
    source: 'youth-policy',
    title: item.polyBizSjnm || '',
    description: item.polyItcnCn || '',
    supportContent: item.sporCn || undefined,
    deadline: item.rqutPrdCn || undefined,
    category: mapYouthPolicyCategory(item.polyBizTy),
    requirements: [],
    region: item.polyBizSecdNm || undefined,
    organization: item.cnsgNmor || undefined,
    status: determineBenefitStatus(item.rqutPrdCn),
  };
}

/**
 * 온통청년 상세 → BenefitDetail 변환
 */
function normalizeYouthPolicyDetail(item: YouthPolicyDetail): BenefitDetail {
  const requirements: string[] = [];
  if (item.ageInfo) requirements.push(`연령: ${item.ageInfo}`);
  if (item.accrRqisCn) requirements.push(`학력: ${item.accrRqisCn}`);
  if (item.empmSttsCn) requirements.push(`취업상태: ${item.empmSttsCn}`);
  if (item.prcpCn) requirements.push(`거주/소득: ${item.prcpCn}`);

  return {
    id: `youth-policy-${item.bizId}`,
    originalId: item.bizId,
    source: 'youth-policy',
    title: item.polyBizSjnm || '',
    description: item.polyItcnCn || '',
    supportContent: item.sporCn || undefined,
    deadline: item.rqutPrdCn || undefined,
    category: mapYouthPolicyCategory(item.polyBizTy),
    requirements,
    ageRequirement: item.ageInfo || undefined,
    region: item.polyBizSecdNm || undefined,
    organization: item.cnsgNmor || undefined,
    applicationUrl: item.rqutUrla || undefined,
    status: determineBenefitStatus(item.rqutPrdCn),
    educationRequirement: item.accrRqisCn || undefined,
    majorRequirement: item.majrRqisCn || undefined,
    employmentRequirement: item.empmSttsCn || undefined,
    residenceRequirement: item.prcpCn || undefined,
    exclusions: item.prcpLmttTrgtCn || undefined,
    applicationMethod: item.rqutProcCn || undefined,
    selectionProcess: item.jdgnPresCn || undefined,
    additionalInfo: item.etct || undefined,
    contactInfo: item.mngtMsttNm || undefined,
    referenceUrls: [item.rfcSiteUrla1, item.rfcSiteUrla2].filter(Boolean) as string[],
    lastUpdated: item.lastModyYmd || undefined,
  };
}

/**
 * 채용정보 → Benefit 변환
 */
function normalizeJobPosting(item: JobPostingItem): Benefit {
  const requirements: string[] = [];
  if (item.carrerTcdNm) requirements.push(`경력: ${item.carrerTcdNm}`);
  if (item.sclsTcdNm) requirements.push(`학력: ${item.sclsTcdNm}`);

  return {
    id: `employment24-job-${item.empmnBzadwBdpTlId}`,
    originalId: item.empmnBzadwBdpTlId,
    source: 'employment24',
    title: item.empmnBzadwBdpTl || '',
    description: `${item.bzEntNm} | ${item.workAreaNm || ''}`,
    supportContent: item.empyPayWgeTcd || undefined,
    deadline: item.ddlnYmd || undefined,
    category: 'employment',
    requirements,
    region: item.workAreaNm || undefined,
    organization: item.bzEntNm || undefined,
    status: determineBenefitStatus(item.ddlnYmd),
  };
}

/**
 * 훈련과정 → Benefit 변환
 */
function normalizeTrainingCard(item: TrainingCardItem): Benefit {
  return {
    id: `employment24-training-${item.trprId}`,
    originalId: item.trprId,
    source: 'employment24',
    title: item.trprNm || '',
    description: `${item.trOrgnzNm} | ${item.trAreaNm || ''}`,
    supportContent: item.trprPrdCn || undefined,
    amount: item.trprCost - item.slvcSbrdn,
    deadline: item.trprEndYmd || undefined,
    startDate: item.trprStrtYmd || undefined,
    category: 'education',
    requirements: [],
    region: item.trAreaNm || undefined,
    organization: item.trOrgnzNm || undefined,
    status: determineBenefitStatus(item.trprEndYmd),
  };
}

/**
 * 취업지원프로그램 → Benefit 변환
 */
function normalizeEmploymentProgram(item: EmploymentProgramItem): Benefit {
  return {
    id: `employment24-program-${item.empSprtPrgrId}`,
    originalId: item.empSprtPrgrId,
    source: 'employment24',
    title: item.empSprtPrgrNm || '',
    description: item.sprtCn || '',
    supportContent: item.sprtTrgt || undefined,
    deadline: item.aplyPrdCn || undefined,
    category: 'employment',
    requirements: item.sprtTrgt ? [item.sprtTrgt] : [],
    organization: item.enfrcOrgNm || undefined,
    status: determineBenefitStatus(item.aplyPrdCn),
  };
}

// ========================================
// 통합 API 함수
// ========================================

/**
 * 모든 혜택 조회 (온통청년 + 고용24 통합)
 */
export async function fetchAllBenefits(
  filters?: BenefitFilters
): Promise<BenefitListResult> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;

  // 출처 필터에 따른 API 호출 결정
  const shouldFetchYouthPolicy = !filters?.source || filters.source === 'youth-policy';
  const shouldFetchEmployment24 = !filters?.source || filters.source === 'employment24';

  const results: Benefit[] = [];
  let totalCount = 0;
  const errors: Error[] = [];

  // 병렬 API 호출
  const promises: Promise<void>[] = [];

  // 온통청년 API
  if (shouldFetchYouthPolicy) {
    promises.push(
      (async () => {
        try {
          const response = await fetchYouthPolicyList({
            pageIndex: page,
            display: pageSize,
            query: filters?.keyword,
            srchPolyBizSecd: filters?.region,
          });

          const normalized = response.items.map(normalizeYouthPolicy);

          // 카테고리 필터 적용
          const filtered = filters?.category
            ? normalized.filter((b) => b.category === filters.category)
            : normalized;

          results.push(...filtered);
          totalCount += response.totalCount;
        } catch (error) {
          if (__DEV__) {
            console.warn('[Benefits] 온통청년 API 오류:', error);
          }
          errors.push(error instanceof Error ? error : new Error('온통청년 API 오류'));
        }
      })()
    );
  }

  // 고용24 API - 카테고리에 따라 선택적 호출
  if (shouldFetchEmployment24) {
    const category = filters?.category;

    // 채용정보 (employment 카테고리)
    if (!category || category === 'employment') {
      promises.push(
        (async () => {
          try {
            const response = await fetchJobPostingList({
              pageNo: page,
              numOfRows: Math.floor(pageSize / 2),
              keyword: filters?.keyword,
            });

            results.push(...response.items.map(normalizeJobPosting));
            totalCount += response.totalCount;
          } catch (error) {
            if (__DEV__) {
              console.warn('[Benefits] 채용정보 API 오류:', error);
            }
            errors.push(error instanceof Error ? error : new Error('채용정보 API 오류'));
          }
        })()
      );
    }

    // 훈련과정 (education 카테고리)
    if (!category || category === 'education') {
      promises.push(
        (async () => {
          try {
            const response = await fetchTrainingCardList({
              pageNo: page,
              numOfRows: Math.floor(pageSize / 2),
              keyword: filters?.keyword,
            });

            results.push(...response.items.map(normalizeTrainingCard));
            totalCount += response.totalCount;
          } catch (error) {
            if (__DEV__) {
              console.warn('[Benefits] 훈련과정 API 오류:', error);
            }
            errors.push(error instanceof Error ? error : new Error('훈련과정 API 오류'));
          }
        })()
      );
    }

    // 취업지원프로그램 (employment 카테고리)
    if (!category || category === 'employment') {
      promises.push(
        (async () => {
          try {
            const response = await fetchEmploymentProgramList({
              pageNo: page,
              numOfRows: Math.floor(pageSize / 2),
              keyword: filters?.keyword,
            });

            results.push(...response.items.map(normalizeEmploymentProgram));
            totalCount += response.totalCount;
          } catch (error) {
            if (__DEV__) {
              console.warn('[Benefits] 취업지원프로그램 API 오류:', error);
            }
            errors.push(
              error instanceof Error ? error : new Error('취업지원프로그램 API 오류')
            );
          }
        })()
      );
    }
  }

  await Promise.all(promises);

  // 모든 API가 실패한 경우에만 에러 throw
  if (results.length === 0 && errors.length > 0) {
    throw new ApiError(
      '혜택 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.',
      'network'
    );
  }

  return {
    items: results,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * 혜택 상세 조회
 */
export async function fetchBenefitDetail(
  id: string
): Promise<BenefitDetail | null> {
  // ID 형식: source-originalId
  const [sourcePrefix, ...idParts] = id.split('-');
  const originalId = idParts.join('-');

  if (sourcePrefix === 'youth' && idParts[0] === 'policy') {
    // youth-policy-{bizId}
    const bizId = idParts.slice(1).join('-');
    const detail = await fetchYouthPolicyDetail(bizId);
    return detail ? normalizeYouthPolicyDetail(detail) : null;
  }

  // 고용24 API는 상세 조회 API가 별도로 없으므로 null 반환
  // TODO: 필요시 상세 API 구현
  return null;
}

/**
 * 사용자 맞춤 혜택 조회 (프로필 기반)
 */
export async function fetchPersonalizedBenefits(
  userProfile: {
    birthYear?: number;
    region?: string;
    incomeLevel?: string;
    employmentStatus?: string;
  },
  filters?: Omit<BenefitFilters, 'region'>
): Promise<BenefitListResult> {
  // 사용자 지역 코드 매핑
  const regionCode = userProfile.region; // TODO: 지역 코드 매핑 로직 추가

  return fetchAllBenefits({
    ...filters,
    region: regionCode,
  });
}
