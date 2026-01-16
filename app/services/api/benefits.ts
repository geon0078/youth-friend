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
import type { TrainingCardItem, EmploymentProgramItem } from '@/types/api/employment24';

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
function determineBenefitStatus(deadline?: string | number): 'active' | 'upcoming' | 'ended' | 'unknown' {
  if (!deadline) return 'unknown';

  // 숫자나 다른 타입일 경우 문자열로 변환
  const deadlineStr = String(deadline);

  // "상시", "수시" 등의 경우 활성 상태
  if (deadlineStr.includes('상시') || deadlineStr.includes('수시')) {
    return 'active';
  }

  // 날짜 파싱 시도
  const dateMatch = deadlineStr.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
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
 * 훈련과정 → Benefit 변환
 */
function normalizeTrainingCard(item: TrainingCardItem): Benefit {
  // 훈련비용 계산 (수강료 - 실비)
  const courseMan = parseInt(item.courseMan || '0', 10);
  const realMan = parseInt(item.realMan || '0', 10);
  const amount = courseMan > 0 ? courseMan - realMan : undefined;

  return {
    id: `employment24-training-${item.trprId}`,
    originalId: item.trprId,
    source: 'employment24',
    title: item.trprNm || '',
    description: `${item.instNm} | ${item.address || ''}`,
    supportContent: item.trainTarget || undefined,
    amount,
    deadline: item.traEndDate || undefined,
    startDate: item.traStartDate || undefined,
    category: 'education',
    requirements: [],
    region: item.address || undefined,
    organization: item.instNm || undefined,
    status: determineBenefitStatus(item.traEndDate),
  };
}

/**
 * 취업지원프로그램 → Benefit 변환
 */
function normalizeEmploymentProgram(item: EmploymentProgramItem): Benefit {
  // 날짜 포맷팅 (YYYYMMDD → YYYY-MM-DD)
  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  return {
    id: `employment24-program-${item.pgmId}`,
    originalId: item.pgmId,
    source: 'employment24',
    title: item.pgmSubNm || item.pgmNm || '',
    description: `${item.orgNm} | ${item.openPlcCont || ''}`,
    supportContent: item.pgmTarget || undefined,
    deadline: formatDate(item.pgmEndt) || undefined,
    startDate: formatDate(item.pgmStdt) || undefined,
    category: 'employment',
    requirements: item.pgmTarget ? [item.pgmTarget] : [],
    organization: item.orgNm || undefined,
    status: determineBenefitStatus(formatDate(item.pgmEndt)),
  };
}

// ========================================
// Mock 데이터 (API 장애 시 fallback)
// ========================================

const MOCK_BENEFITS: Benefit[] = [
  {
    id: 'mock-youth-policy-1',
    originalId: 'R2024010001',
    source: 'youth-policy',
    title: '청년 월세 지원 사업',
    description: '월세 부담을 덜어주는 청년 주거 지원 정책입니다. 최대 월 20만원까지 지원받을 수 있습니다.',
    supportContent: '월 최대 20만원, 최대 12개월 지원',
    amount: 2400000,
    deadline: '2026-12-31',
    category: 'housing',
    requirements: ['만 19세 이상 34세 이하', '기준 중위소득 150% 이하', '무주택자'],
    region: '서울특별시',
    organization: '서울시청',
    status: 'active',
  },
  {
    id: 'mock-youth-policy-2',
    originalId: 'R2024010002',
    source: 'youth-policy',
    title: '청년 취업 성공 패키지',
    description: '취업 준비부터 취업 후 정착까지 단계별 맞춤 지원을 제공하는 종합 취업 지원 프로그램입니다.',
    supportContent: '취업활동비 월 50만원, 최대 6개월',
    amount: 3000000,
    deadline: '상시',
    category: 'employment',
    requirements: ['만 18세 이상 34세 이하', '미취업자'],
    organization: '고용노동부',
    status: 'active',
  },
  {
    id: 'mock-youth-policy-3',
    originalId: 'R2024010003',
    source: 'youth-policy',
    title: '청년 창업 지원 프로그램',
    description: '창업을 준비하는 청년들에게 사업화 자금과 멘토링을 지원합니다.',
    supportContent: '최대 1억원 사업화 자금 지원',
    amount: 100000000,
    deadline: '2026-06-30',
    category: 'employment',
    requirements: ['만 19세 이상 39세 이하', '예비 창업자 또는 3년 이내 창업자'],
    organization: '중소벤처기업부',
    status: 'active',
  },
  {
    id: 'mock-youth-policy-4',
    originalId: 'R2024010004',
    source: 'youth-policy',
    title: '청년 내일채움공제',
    description: '중소기업에 취업한 청년의 자산 형성을 지원하는 정책입니다.',
    supportContent: '2년 만기 시 1,200만원 이상 목돈 마련',
    amount: 12000000,
    deadline: '상시',
    category: 'employment',
    requirements: ['만 15세 이상 34세 이하', '중소기업 정규직 취업자'],
    organization: '고용노동부',
    status: 'active',
  },
  {
    id: 'mock-youth-policy-5',
    originalId: 'R2024010005',
    source: 'youth-policy',
    title: '국민취업지원제도',
    description: '취업 취약계층에게 취업지원서비스와 소득지원을 함께 제공합니다.',
    supportContent: '구직촉진수당 월 50만원, 최대 6개월',
    amount: 3000000,
    deadline: '상시',
    category: 'employment',
    requirements: ['만 15세 이상 69세 이하', '요건심사형 또는 선발형 기준 충족'],
    organization: '고용노동부',
    status: 'active',
  },
  {
    id: 'mock-youth-policy-6',
    originalId: 'R2024010006',
    source: 'youth-policy',
    title: '청년 교육비 지원',
    description: '자격증 취득 및 직업 훈련을 위한 교육비를 지원합니다.',
    supportContent: '연간 최대 300만원 교육비 지원',
    amount: 3000000,
    deadline: '2026-03-31',
    category: 'education',
    requirements: ['만 19세 이상 34세 이하', '기준 중위소득 120% 이하'],
    region: '전국',
    organization: '고용노동부',
    status: 'active',
  },
];

// ========================================
// 통합 API 함수
// ========================================

/**
 * 모든 혜택 조회 (온통청년 + 고용24 통합)
 * API 실패 시 Mock 데이터 반환
 */
export async function fetchAllBenefits(
  filters?: BenefitFilters
): Promise<BenefitListResult> {
  if (__DEV__) {
    console.log('[Benefits] fetchAllBenefits 호출됨, filters:', JSON.stringify(filters));
  }

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
          if (__DEV__) {
            console.log('[Benefits] 온통청년 API 호출 시작...');
          }
          const response = await fetchYouthPolicyList({
            pageIndex: page,
            display: pageSize,
            query: filters?.keyword,
            srchPolyBizSecd: filters?.region,
          });
          if (__DEV__) {
            console.log(`[Benefits] 온통청년 API 성공: ${response.items.length}개 정책`);
          }

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

  // 고용24 API - 취업지원프로그램만 혜택으로 포함
  // 참고: 훈련과정(교육)은 혜택이 아니므로 별도 관리
  if (shouldFetchEmployment24) {
    const category = filters?.category;

    // 채용정보 - 개인회원 API 키로 사용 불가
    // 훈련과정 - 교육/훈련은 혜택이 아니므로 제외 (별도 API로 제공)

    // 취업지원프로그램 (employment 카테고리) - 실제 혜택
    if (!category || category === 'employment') {
      promises.push(
        (async () => {
          try {
            if (__DEV__) {
              console.log('[Benefits] 취업프로그램 API 호출 시작...');
            }
            const response = await fetchEmploymentProgramList({
              pageNo: page,
              numOfRows: Math.floor(pageSize / 2),
              keyword: filters?.keyword,
            });
            if (__DEV__) {
              console.log(`[Benefits] 취업프로그램 API 성공: ${response.items.length}개 프로그램`);
            }

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

  if (__DEV__) {
    console.log(`[Benefits] API 호출 완료: ${results.length}개 결과, ${errors.length}개 오류`);
  }

  // 모든 API가 실패한 경우 Mock 데이터 반환
  if (results.length === 0 && errors.length > 0) {
    if (__DEV__) {
      console.warn('[Benefits] 모든 API 실패, Mock 데이터 사용');
      errors.forEach((e, i) => console.warn(`  오류 ${i + 1}:`, e.message));
    }

    // 필터 적용
    let mockResults = [...MOCK_BENEFITS];
    if (filters?.category) {
      mockResults = mockResults.filter((b) => b.category === filters.category);
    }
    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase();
      mockResults = mockResults.filter(
        (b) =>
          b.title.toLowerCase().includes(keyword) ||
          b.description?.toLowerCase().includes(keyword)
      );
    }

    return {
      items: mockResults,
      totalCount: mockResults.length,
      page,
      pageSize,
      totalPages: 1,
    };
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
  // Mock 데이터 확인
  if (id.startsWith('mock-')) {
    const mockBenefit = MOCK_BENEFITS.find((b) => b.id === id);
    if (mockBenefit) {
      return {
        ...mockBenefit,
        ageRequirement: '만 19세 이상 34세 이하',
        applicationUrl: 'https://www.youthcenter.go.kr',
        detailUrl: 'https://www.youthcenter.go.kr',
        applicationMethod: '온라인 신청 (해당 기관 홈페이지)',
        contactInfo: '정부24 1588-2188',
        lastUpdated: '2026-01-15',
      } as BenefitDetail;
    }
  }

  // ID 형식: source-originalId
  const [sourcePrefix, ...idParts] = id.split('-');

  if (sourcePrefix === 'youth' && idParts[0] === 'policy') {
    // youth-policy-{bizId}
    try {
      const bizId = idParts.slice(1).join('-');
      const detail = await fetchYouthPolicyDetail(bizId);
      return detail ? normalizeYouthPolicyDetail(detail) : null;
    } catch (error) {
      if (__DEV__) {
        console.warn('[Benefits] 상세 조회 실패, Mock 반환:', error);
      }
      // API 실패 시 첫 번째 Mock 데이터 반환
      const mockBenefit = MOCK_BENEFITS[0];
      return {
        ...mockBenefit,
        id,
        ageRequirement: '만 19세 이상 34세 이하',
        applicationUrl: 'https://www.youthcenter.go.kr',
        detailUrl: 'https://www.youthcenter.go.kr',
        applicationMethod: '온라인 신청',
        contactInfo: '정부24 1588-2188',
        lastUpdated: '2026-01-15',
      } as BenefitDetail;
    }
  }

  // employment24-training-{trprId}
  if (sourcePrefix === 'employment24' && idParts[0] === 'training') {
    try {
      const trprId = idParts.slice(1).join('-');
      // 훈련과정 목록에서 해당 항목 찾기
      const response = await fetchTrainingCardList({ numOfRows: 100 });
      const item = response.items.find((i) => i.trprId === trprId);

      if (item) {
        const benefit = normalizeTrainingCard(item);
        return {
          ...benefit,
          ageRequirement: item.trainTarget || '제한 없음',
          applicationUrl: item.titleLink || '',
          detailUrl: item.titleLink || '',
          applicationMethod: '훈련기관 문의',
          contactInfo: item.telNo || '',
          lastUpdated: '',
        } as BenefitDetail;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[Benefits] 훈련과정 상세 조회 실패:', error);
      }
    }
    return null;
  }

  // employment24-program-{pgmId}
  if (sourcePrefix === 'employment24' && idParts[0] === 'program') {
    try {
      const pgmId = idParts.slice(1).join('-');
      // 취업프로그램 목록에서 해당 항목 찾기
      const response = await fetchEmploymentProgramList({ numOfRows: 100 });
      const item = response.items.find((i) => i.pgmId === pgmId);

      if (item) {
        const benefit = normalizeEmploymentProgram(item);
        return {
          ...benefit,
          ageRequirement: item.pgmTarget || '제한 없음',
          applicationUrl: '',
          detailUrl: '',
          applicationMethod: '해당 기관 문의',
          contactInfo: '',
          lastUpdated: '',
        } as BenefitDetail;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[Benefits] 취업프로그램 상세 조회 실패:', error);
      }
    }
    return null;
  }

  // 알 수 없는 ID 형식
  if (__DEV__) {
    console.warn('[Benefits] 알 수 없는 혜택 ID 형식:', id);
  }
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
