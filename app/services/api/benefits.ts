/**
 * 통합 혜택 서비스
 * 온통청년 + 고용24 API를 통합하여 단일 인터페이스 제공
 */
import {
  fetchYouthPolicyList,
  fetchYouthPolicyDetail,
  POLICY_TYPE_CODES,
  REGION_TO_API_CODE,
  REGION_NAME_TO_CODE,
  API_CODE_TO_REGION,
} from './youth-policy';
import {
  fetchTrainingCardList,
  fetchEmploymentProgramList,
} from './employment24';
import { fetchAllGov24Services } from './gov24';
import { ApiError } from './client';
import { cacheStorage, CacheKeys, CacheTTL } from '@/services/storage';
import type {
  Benefit,
  BenefitDetail,
  BenefitFilters,
  BenefitListResult,
  BenefitCategory,
} from '@/types/models/benefit';
import type { YouthPolicyListItem, YouthPolicyDetail } from '@/types/api/youth-policy';
import type { TrainingCardItem, EmploymentProgramItem } from '@/types/api/employment24';
import type { Gov24ServiceListItem } from '@/types/api/gov24';

// ========================================
// 정규화 헬퍼 함수
// ========================================

const BENEFITS_CACHE_VERSION = 'v1';

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    const serialized = entries.map(([key, entryValue]) => {
      return `${JSON.stringify(key)}:${stableStringify(entryValue)}`;
    });
    return `{${serialized.join(',')}}`;
  }
  return JSON.stringify(value);
}

function getBenefitsCacheKey(filters?: BenefitFilters): string {
  if (!filters || Object.keys(filters).length === 0) {
    return `${CacheKeys.BENEFITS_LIST}:${BENEFITS_CACHE_VERSION}`;
  }
  return `${CacheKeys.FILTER_RESULTS}${BENEFITS_CACHE_VERSION}:${stableStringify(filters)}`;
}

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
 * @param endDateYmd 사업 종료일 (YYYYMMDD 형식)
 * @param applicationPeriod 신청 기간 텍스트 (fallback용)
 */
function determineBenefitStatus(
  endDateYmd?: string,
  applicationPeriod?: string
): 'active' | 'upcoming' | 'ended' | 'unknown' {
  // 1. 사업 종료일(bizPrdEndYmd)로 우선 판정
  if (endDateYmd) {
    const endDateStr = String(endDateYmd);
    // YYYYMMDD 형식 파싱
    const dateMatch = endDateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (dateMatch) {
      const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (endDate < now) return 'ended';
      return 'active';
    }
  }

  // 2. 신청 기간 텍스트로 fallback 판정
  if (applicationPeriod) {
    const periodStr = String(applicationPeriod);

    // "상시", "수시" 등의 경우 활성 상태
    if (periodStr.includes('상시') || periodStr.includes('수시')) {
      return 'active';
    }

    // 날짜 파싱 시도 (YYYY-MM-DD 또는 YYYY.MM.DD)
    const dateMatch = periodStr.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
    if (dateMatch) {
      const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (endDate < now) return 'ended';
      return 'active';
    }
  }

  return 'unknown';
}

/**
 * 시/군/구 → 광역시/도 매핑 (주요 지역)
 */
const CITY_TO_REGION: Record<string, string> = {
  // 경기도
  '수원': '경기', '성남': '경기', '의정부': '경기', '안양': '경기', '부천': '경기',
  '광명': '경기', '평택': '경기', '동두천': '경기', '안산': '경기', '고양': '경기',
  '과천': '경기', '구리': '경기', '남양주': '경기', '오산': '경기', '시흥': '경기',
  '군포': '경기', '의왕': '경기', '하남': '경기', '용인': '경기', '파주': '경기',
  '이천': '경기', '안성': '경기', '김포': '경기', '화성': '경기', // 경기도 광주시는 제외 (광주광역시와 혼동 방지)
  '양주': '경기', '포천': '경기', '여주': '경기', '연천': '경기', '가평': '경기', '양평': '경기',
  // 강원도
  '춘천': '강원', '원주': '강원', '강릉': '강원', '동해': '강원', '태백': '강원',
  '속초': '강원', '삼척': '강원', '홍천': '강원', '횡성': '강원', '영월': '강원',
  '평창': '강원', '정선': '강원', '철원': '강원', '화천': '강원', '양구': '강원',
  '인제': '강원', '고성': '강원', '양양': '강원',
  // 충청북도
  '청주': '충북', '충주': '충북', '제천': '충북', '보은': '충북', '옥천': '충북',
  '영동': '충북', '증평': '충북', '진천': '충북', '괴산': '충북', '음성': '충북', '단양': '충북',
  // 충청남도
  '천안': '충남', '공주': '충남', '보령': '충남', '아산': '충남', '서산': '충남',
  '논산': '충남', '계룡': '충남', '당진': '충남', '금산': '충남', '부여': '충남',
  '서천': '충남', '청양': '충남', '홍성': '충남', '예산': '충남', '태안': '충남',
  // 전라북도
  '전주': '전북', '군산': '전북', '익산': '전북', '정읍': '전북', '남원': '전북',
  '김제': '전북', '완주': '전북', '진안': '전북', '무주': '전북', '장수': '전북',
  '임실': '전북', '순창': '전북', '고창': '전북', '부안': '전북',
  // 전라남도
  '목포': '전남', '여수': '전남', '순천': '전남', '나주': '전남', '광양': '전남',
  '담양': '전남', '곡성': '전남', '구례': '전남', '고흥': '전남', '보성': '전남',
  '화순': '전남', '장흥': '전남', '강진': '전남', '해남': '전남', '영암': '전남',
  '무안': '전남', '함평': '전남', '영광': '전남', '장성': '전남', '완도': '전남',
  '진도': '전남', '신안': '전남',
  // 경상북도
  '포항': '경북', '경주': '경북', '김천': '경북', '안동': '경북', '구미': '경북',
  '영주': '경북', '영천': '경북', '상주': '경북', '문경': '경북', '경산': '경북',
  '군위': '경북', '의성': '경북', '청송': '경북', '영양': '경북', '영덕': '경북',
  '청도': '경북', '고령': '경북', '성주': '경북', '칠곡': '경북', '예천': '경북',
  '봉화': '경북', '울진': '경북', '울릉': '경북',
  // 경상남도
  '창원': '경남', '진주': '경남', '통영': '경남', '사천': '경남', '김해': '경남',
  '밀양': '경남', '거제': '경남', '양산': '경남', '의령': '경남', '함안': '경남',
  '창녕': '경남', '남해': '경남', '하동': '경남', '산청': '경남',
  '함양': '경남', '거창': '경남', '합천': '경남',
};

/**
 * 기관명에서 지역 정보 추출
 * - 광역시/도 키워드가 있으면 해당 지역 반환
 * - 시/군/구명을 광역시/도로 매핑
 * - 중앙부처 키워드가 있으면 undefined 반환 (전국 정책)
 */
function extractRegionFromOrganization(orgName: string): string | undefined {
  if (!orgName) return undefined;

  // 중앙부처 키워드 (전국 대상 정책)
  const centralKeywords = [
    '고용노동부', '교육부', '중소벤처기업부', '국토교통부', '보건복지부',
    '과학기술정보통신부', '산업통상자원부', '환경부', '문화체육관광부',
    '농림축산식품부', '해양수산부', '여성가족부', '국가보훈부', '법무부',
    '행정안전부', '통일부', '외교부', '국방부', '기획재정부',
    '금융위원회', '공정거래위원회', '국민권익위원회', '방송통신위원회',
    '한국장학재단', '근로복지공단', '국민건강보험공단', '한국고용정보원',
    '한국산업인력공단', '소상공인시장진흥공단', '중소벤처기업진흥공단',
  ];

  for (const keyword of centralKeywords) {
    if (orgName.includes(keyword)) {
      return undefined; // 전국 정책
    }
  }

  // 광역시/특별시/도 패턴 매칭
  const regionPatterns = [
    { pattern: /서울/, region: '서울' },
    { pattern: /부산/, region: '부산' },
    { pattern: /대구/, region: '대구' },
    { pattern: /인천/, region: '인천' },
    { pattern: /광주/, region: '광주' }, // 광주광역시
    { pattern: /대전/, region: '대전' },
    { pattern: /울산/, region: '울산' },
    { pattern: /세종/, region: '세종' },
    { pattern: /경기/, region: '경기' },
    { pattern: /강원/, region: '강원' },
    { pattern: /충북|충청북/, region: '충북' },
    { pattern: /충남|충청남/, region: '충남' },
    { pattern: /전북|전라북/, region: '전북' },
    { pattern: /전남|전라남/, region: '전남' },
    { pattern: /경북|경상북/, region: '경북' },
    { pattern: /경남|경상남/, region: '경남' },
    { pattern: /제주/, region: '제주' },
  ];

  for (const { pattern, region } of regionPatterns) {
    if (pattern.test(orgName)) {
      return region;
    }
  }

  // 시/군/구명에서 광역시/도 매핑 시도
  for (const [city, region] of Object.entries(CITY_TO_REGION)) {
    if (orgName.includes(city)) {
      return region;
    }
  }

  // 시/군/구로 끝나지만 매핑 안되면 local-unknown
  if (/[시군구]$/.test(orgName) || /[시군구]\s/.test(orgName)) {
    return 'local-unknown';
  }

  return undefined;
}

/**
 * 온통청년 정책 → Benefit 변환
 */
function normalizeYouthPolicy(item: YouthPolicyListItem): Benefit {
  // 나이 파싱 (문자열 → 숫자)
  const minAge = item.sprtTrgtMinAge ? parseInt(item.sprtTrgtMinAge, 10) : undefined;
  const maxAge = item.sprtTrgtMaxAge ? parseInt(item.sprtTrgtMaxAge, 10) : undefined;

  // 지역 결정: API 지역명 > 정책명에서 추출 > 기관명에서 추출
  const region = item.polyBizSecdNm
    || extractRegionFromOrganization(item.polyBizSjnm || '')
    || extractRegionFromOrganization(item.cnsgNmor || '')
    || undefined;

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
    region,
    organization: item.cnsgNmor || undefined,
    // 사업종료일(bizPrdEndYmd)로 상태 판정, fallback으로 신청기간 사용
    status: determineBenefitStatus(item.bizPrdEndYmd, item.rqutPrdCn),
    // 사용자 맞춤 필터링용 필드
    minAge: minAge && !isNaN(minAge) ? minAge : undefined,
    maxAge: maxAge && !isNaN(maxAge) ? maxAge : undefined,
    endDate: item.bizPrdEndYmd || undefined,
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

  // 지역 추출: 주소 또는 기관명에서 지역 정보 파싱
  const region = extractRegionFromOrganization(item.address || '')
    || extractRegionFromOrganization(item.instNm || '')
    || undefined;

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
    region,
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

  // 지역 추출: 기관명 또는 장소에서 지역 정보 파싱
  const region = extractRegionFromOrganization(item.orgNm || '')
    || extractRegionFromOrganization(item.openPlcCont || '')
    || undefined;

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
    region,
    organization: item.orgNm || undefined,
    status: determineBenefitStatus(formatDate(item.pgmEndt)),
  };
}

/**
 * 보조금24 서비스분야 → BenefitCategory 매핑
 */
function mapGov24Category(serviceField: string): BenefitCategory {
  const field = serviceField?.toLowerCase() || '';

  // 고용, 사업 → employment
  if (field.includes('고용') || field.includes('사업')) {
    return 'employment';
  }
  // 주거 → housing
  if (field.includes('주거')) {
    return 'housing';
  }
  // 교육 → education
  if (field.includes('교육')) {
    return 'education';
  }
  // 문화 → culture
  if (field.includes('문화')) {
    return 'culture';
  }
  // 복지, 보건의료, 안전, 환경, 농림축산어업 → welfare
  return 'welfare';
}

/**
 * 보조금24 지원대상에서 나이 범위 추출
 */
function parseAgeFromGov24Target(
  targetText: string
): { minAge?: number; maxAge?: number } {
  if (!targetText) return {};

  // 청년 키워드 기반 기본 범위 설정
  if (targetText.includes('청년')) {
    // 기본 청년 범위: 19~34세
    let minAge = 19;
    let maxAge = 34;

    // 구체적인 나이 범위 추출 시도
    // 패턴: "19세~34세", "만 19세 이상 34세 이하", "19-34세" 등
    const rangeMatch = targetText.match(/(\d{2})\s*[세~\-이상]\s*[~\-]?\s*(\d{2})\s*세?/);
    if (rangeMatch) {
      minAge = parseInt(rangeMatch[1], 10);
      maxAge = parseInt(rangeMatch[2], 10);
    }

    // 단일 하한 추출: "만 19세 이상"
    const minMatch = targetText.match(/(\d{2})\s*세\s*이상/);
    if (minMatch) {
      minAge = parseInt(minMatch[1], 10);
    }

    // 단일 상한 추출: "34세 이하"
    const maxMatch = targetText.match(/(\d{2})\s*세\s*이하/);
    if (maxMatch) {
      maxAge = parseInt(maxMatch[1], 10);
    }

    return { minAge, maxAge };
  }

  // 대학생, 청소년 키워드
  if (targetText.includes('대학생')) {
    return { minAge: 19, maxAge: 29 };
  }
  if (targetText.includes('청소년')) {
    return { minAge: 13, maxAge: 24 };
  }

  // 일반적인 나이 범위 추출
  const generalRangeMatch = targetText.match(/(\d{2})\s*[세~\-]\s*[~\-]?\s*(\d{2})\s*세?/);
  if (generalRangeMatch) {
    return {
      minAge: parseInt(generalRangeMatch[1], 10),
      maxAge: parseInt(generalRangeMatch[2], 10),
    };
  }

  return {};
}

/**
 * 보조금24 신청기한으로 상태 판정
 */
function determineGov24Status(
  deadline: string
): 'active' | 'upcoming' | 'ended' | 'unknown' {
  if (!deadline) return 'unknown';

  const deadlineStr = deadline.toLowerCase();

  // 상시, 수시 등은 활성 상태
  if (
    deadlineStr.includes('상시') ||
    deadlineStr.includes('수시') ||
    deadlineStr.includes('연중') ||
    deadlineStr.includes('계속')
  ) {
    return 'active';
  }

  // 날짜 형식 파싱 시도 (YYYY-MM-DD, YYYY.MM.DD, YYYYMMDD)
  const dateMatch = deadline.match(/(\d{4})[.-]?(\d{2})[.-]?(\d{2})/);
  if (dateMatch) {
    const endDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (endDate < now) return 'ended';
    return 'active';
  }

  return 'unknown';
}

/**
 * 보조금24 서비스 → Benefit 변환
 */
function normalizeGov24Service(item: Gov24ServiceListItem): Benefit {
  const ageRange = parseAgeFromGov24Target(item.지원대상 || '');

  return {
    id: `gov24-${item.서비스ID}`,
    originalId: item.서비스ID,
    source: 'gov24',
    title: item.서비스명 || '',
    description: item.서비스목적요약 || '',
    supportContent: item.지원내용 || undefined,
    deadline: item.신청기한 || undefined,
    category: mapGov24Category(item.서비스분야 || ''),
    requirements: item.선정기준 ? [item.선정기준] : [],
    ageRequirement: item.지원대상 || undefined,
    organization: item.소관기관명 || undefined,
    status: determineGov24Status(item.신청기한 || ''),
    minAge: ageRange.minAge,
    maxAge: ageRange.maxAge,
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

  const cacheKey = getBenefitsCacheKey(filters);

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 100; // 페이지당 100개 요청

  // 출처 필터에 따른 API 호출 결정
  const shouldFetchYouthPolicy = !filters?.source || filters.source === 'youth-policy';
  const shouldFetchEmployment24 = !filters?.source || filters.source === 'employment24';
  // 보조금24는 명시적으로 includeGov24=true이거나 source='gov24'일 때만 로드 (지연 로드 최적화)
  const shouldFetchGov24 = filters?.includeGov24 === true || filters?.source === 'gov24';

  // 지역 코드 변환 (사용자 지역 타입 → API 코드)
  const regionApiCode = filters?.region ? REGION_TO_API_CODE[filters.region] : undefined;
  if (__DEV__ && filters?.region) {
    console.log(`[Benefits] 지역 필터: ${filters.region} → API 코드: ${regionApiCode}`);
  }

  const results: Benefit[] = [];
  let totalCount = 0;
  const errors: Error[] = [];

  // 병렬 API 호출
  const promises: Promise<void>[] = [];

  // 온통청년 API - 모든 페이지 가져오기
  if (shouldFetchYouthPolicy) {
    promises.push(
      (async () => {
        try {
          if (__DEV__) {
            console.log('[Benefits] 온통청년 API 호출 시작...');
          }

          // 첫 페이지 조회 (총 개수 파악)
          const firstResponse = await fetchYouthPolicyList({
            pageIndex: 1,
            display: pageSize,
            query: filters?.keyword,
            srchPolyBizSecd: regionApiCode,
          });

          let allItems = [...firstResponse.items];
          const totalPages = Math.ceil(firstResponse.totalCount / pageSize);

          if (__DEV__) {
            console.log(`[Benefits] 온통청년 API 첫 페이지: ${firstResponse.items.length}개, 총 ${firstResponse.totalCount}개 (${totalPages} 페이지)`);
          }

          // 추가 페이지가 있으면 모두 가져오기 (최대 20페이지 = 2000개)
          if (totalPages > 1) {
            const maxPages = Math.min(totalPages, 20);
            const additionalPromises: Promise<void>[] = [];

            for (let p = 2; p <= maxPages; p++) {
              additionalPromises.push(
                (async () => {
                  try {
                    const response = await fetchYouthPolicyList({
                      pageIndex: p,
                      display: pageSize,
                      query: filters?.keyword,
                      srchPolyBizSecd: regionApiCode,
                    });
                    allItems.push(...response.items);
                  } catch (e) {
                    if (__DEV__) {
                      console.warn(`[Benefits] 온통청년 API 페이지 ${p} 오류:`, e);
                    }
                  }
                })()
              );
            }

            await Promise.all(additionalPromises);
          }

          if (__DEV__) {
            console.log(`[Benefits] 온통청년 API 총 ${allItems.length}개 정책 조회됨`);
          }

          const normalized = allItems.map(normalizeYouthPolicy);

          // 카테고리 필터 적용
          const filtered = filters?.category
            ? normalized.filter((b) => b.category === filters.category)
            : normalized;

          results.push(...filtered);
          totalCount += firstResponse.totalCount;
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

            // 첫 페이지 조회
            const firstResponse = await fetchEmploymentProgramList({
              pageNo: 1,
              numOfRows: pageSize,
              keyword: filters?.keyword,
            });

            let allItems = [...firstResponse.items];
            const totalPages = Math.ceil(firstResponse.totalCount / pageSize);

            if (__DEV__) {
              console.log(`[Benefits] 취업프로그램 API 첫 페이지: ${firstResponse.items.length}개, 총 ${firstResponse.totalCount}개 (${totalPages} 페이지)`);
            }

            // 추가 페이지가 있으면 모두 가져오기 (최대 5페이지까지)
            if (totalPages > 1) {
              const maxPages = Math.min(totalPages, 5);
              const additionalPromises: Promise<void>[] = [];

              for (let p = 2; p <= maxPages; p++) {
                additionalPromises.push(
                  (async () => {
                    try {
                      const response = await fetchEmploymentProgramList({
                        pageNo: p,
                        numOfRows: pageSize,
                        keyword: filters?.keyword,
                      });
                      allItems.push(...response.items);
                    } catch (e) {
                      if (__DEV__) {
                        console.warn(`[Benefits] 취업프로그램 API 페이지 ${p} 오류:`, e);
                      }
                    }
                  })()
                );
              }

              await Promise.all(additionalPromises);
            }

            if (__DEV__) {
              console.log(`[Benefits] 취업프로그램 API 총 ${allItems.length}개 프로그램 조회됨`);
            }

            results.push(...allItems.map(normalizeEmploymentProgram));
            totalCount += firstResponse.totalCount;
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

  // 보조금24 API - 청년 대상 서비스 필터링하여 가져오기
  if (shouldFetchGov24) {
    promises.push(
      (async () => {
        try {
          if (__DEV__) {
            console.log('[Benefits] 보조금24 API 호출 시작...');
          }

          // 청년 대상 서비스만 필터링하여 조회
          const gov24Services = await fetchAllGov24Services(true);

          if (__DEV__) {
            console.log(`[Benefits] 보조금24 API ${gov24Services.length}개 청년 대상 서비스 조회됨`);
          }

          const normalized = gov24Services.map(normalizeGov24Service);

          // 카테고리 필터 적용
          const filtered = filters?.category
            ? normalized.filter((b) => b.category === filters.category)
            : normalized;

          results.push(...filtered);
          totalCount += gov24Services.length;
        } catch (error) {
          if (__DEV__) {
            console.warn('[Benefits] 보조금24 API 오류:', error);
          }
          errors.push(error instanceof Error ? error : new Error('보조금24 API 오류'));
        }
      })()
    );
  }

  await Promise.all(promises);

  if (__DEV__) {
    console.log(`[Benefits] API 호출 완료: ${results.length}개 결과, ${errors.length}개 오류`);
  }

  // 모든 API가 실패한 경우 캐시 또는 Mock 데이터 반환
  if (results.length === 0 && errors.length > 0) {
    if (__DEV__) {
      console.warn('[Benefits] 모든 API 실패, 캐시 확인 후 Mock 데이터 사용');
      errors.forEach((e, i) => console.warn(`  오류 ${i + 1}:`, e.message));
    }

    const cached = cacheStorage.get<BenefitListResult>(cacheKey);
    if (cached) {
      return cached;
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

  // ========================================
  // 사용자 맞춤 필터링 적용
  // ========================================

  let filteredResults = results;

  // 1. 마감 정책 필터링 (기본: true - 마감된 정책 숨김)
  const hideEnded = filters?.hideEnded !== false; // undefined면 true
  if (hideEnded) {
    const beforeCount = filteredResults.length;
    filteredResults = filteredResults.filter((b) => b.status !== 'ended');
    if (__DEV__) {
      console.log(`[Benefits] 마감 정책 필터링: ${beforeCount}개 → ${filteredResults.length}개 (${beforeCount - filteredResults.length}개 제외)`);
    }
  }

  // 2. 나이 필터링 (사용자 birthYear 기반)
  const filterByAge = filters?.filterByAge !== false; // undefined면 true
  if (filterByAge && filters?.userBirthYear) {
    const currentYear = new Date().getFullYear();
    const userAge = currentYear - filters.userBirthYear;

    const beforeCount = filteredResults.length;
    filteredResults = filteredResults.filter((benefit) => {
      // 나이 정보가 없는 경우 포함 (전체 대상 정책)
      if (!benefit.minAge && !benefit.maxAge) return true;

      const minAge = benefit.minAge ?? 0;
      const maxAge = benefit.maxAge ?? 999;

      // 사용자 나이가 정책의 대상 범위에 포함되는지 확인
      return userAge >= minAge && userAge <= maxAge;
    });

    if (__DEV__) {
      console.log(`[Benefits] 나이 필터링 (${userAge}세): ${beforeCount}개 → ${filteredResults.length}개 (${beforeCount - filteredResults.length}개 제외)`);
    }
  }

  // 3. 클라이언트 측 지역 필터링 - 유연하게 적용
  // 참고: 지역 필터링은 API 레벨에서 처리하므로, 클라이언트에서는 보조적으로만 적용
  const filterByRegion = filters?.filterByRegion !== false; // undefined면 true
  if (filterByRegion && filters?.region && filteredResults.length > 0) {
    const userRegion = filters.region.toLowerCase();

    // 사용자 지역의 한글명 찾기
    const REGION_CODE_TO_KOREAN: Record<string, string[]> = {
      seoul: ['서울', '서울시', '서울특별시'],
      busan: ['부산', '부산시', '부산광역시'],
      daegu: ['대구', '대구시', '대구광역시'],
      incheon: ['인천', '인천시', '인천광역시'],
      gwangju: ['광주', '광주시', '광주광역시'],
      daejeon: ['대전', '대전시', '대전광역시'],
      ulsan: ['울산', '울산시', '울산광역시'],
      sejong: ['세종', '세종시', '세종특별자치시'],
      gyeonggi: ['경기', '경기도'],
      gangwon: ['강원', '강원도', '강원특별자치도'],
      chungbuk: ['충북', '충청북도'],
      chungnam: ['충남', '충청남도'],
      jeonbuk: ['전북', '전라북도', '전북특별자치도'],
      jeonnam: ['전남', '전라남도'],
      gyeongbuk: ['경북', '경상북도'],
      gyeongnam: ['경남', '경상남도'],
      jeju: ['제주', '제주도', '제주특별자치도'],
    };

    // 중앙부처/국가기관 키워드 (이들은 전국 대상 정책)
    const CENTRAL_GOVERNMENT_KEYWORDS = [
      '부', '처', '청', '원', '위원회', '공단', '재단', '진흥원', '기금',
      '고용노동', '교육', '중소벤처', '국토교통', '보건복지', '과학기술',
      '산업통상', '환경', '문화체육', '외교', '국방', '법무', '행정안전',
      '농림축산', '해양수산', '여성가족', '통일', '국가보훈', '방위사업',
      '금융', '특허', '조달', '통계', '공정거래', '국민건강보험', '신용',
    ];

    const userRegionKoreanNames = REGION_CODE_TO_KOREAN[userRegion] || [];

    const beforeRegionFilter = filteredResults.length;
    filteredResults = filteredResults.filter((benefit) => {
      // 지역이 없는 경우 (전국 정책) 포함
      if (!benefit.region) return true;

      const benefitRegion = benefit.region;

      // 'local-unknown': 시/군/구 단위 정책이지만 광역 정보 없음 → 제외
      if (benefitRegion === 'local-unknown') {
        return false;
      }

      // 중앙부처/전국 정책은 모든 지역에 포함
      if (
        benefitRegion.includes('중앙') ||
        benefitRegion.includes('전국') ||
        benefitRegion === '' ||
        benefitRegion.toLowerCase() === 'all'
      ) {
        return true;
      }

      // 중앙부처/국가기관 키워드 체크 (지자체가 아닌 경우)
      const isLocalGov = ['시', '도', '군', '구'].some(
        suffix => benefitRegion.includes('특별') ||
                  benefitRegion.includes('광역') ||
                  benefitRegion.endsWith(suffix + ' ') ||
                  benefitRegion.match(new RegExp(`(시|도|군|구)($| |청)`))
      );

      if (!isLocalGov) {
        // 중앙부처 키워드 포함 여부 확인
        for (const keyword of CENTRAL_GOVERNMENT_KEYWORDS) {
          if (benefitRegion.includes(keyword)) {
            return true; // 전국 대상 정책
          }
        }
      }

      // 사용자 지역과 혜택 지역이 매칭되는지 확인
      // 1. 혜택 지역이 사용자 지역명 중 하나를 포함하는 경우
      for (const koreanName of userRegionKoreanNames) {
        if (benefitRegion.includes(koreanName)) {
          return true;
        }
      }

      // 2. 역으로 확인: 사용자 지역명이 혜택 지역을 포함하는 경우
      const benefitRegionLower = benefitRegion.toLowerCase();
      if (benefitRegionLower.includes(userRegion)) {
        return true;
      }

      return false;
    });

    if (__DEV__) {
      console.log(`[Benefits] 지역 필터 적용: ${beforeRegionFilter}개 → ${filteredResults.length}개 (지역: ${userRegion}, ${beforeRegionFilter - filteredResults.length}개 제외)`);
    }
  }

  const result: BenefitListResult = {
    items: filteredResults,
    totalCount: filteredResults.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredResults.length / pageSize),
  };

  cacheStorage.set(cacheKey, result, { ttl: CacheTTL.HOUR });

  return result;
}

/**
 * 혜택 상세 조회
 */
export async function fetchBenefitDetail(
  id: string
): Promise<BenefitDetail | null> {
  const detailCacheKey = `${CacheKeys.BENEFIT_DETAIL}${id}`;
  const cachedDetail = cacheStorage.get<BenefitDetail>(detailCacheKey);

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
      if (!detail) return cachedDetail ?? null;
      const normalized = normalizeYouthPolicyDetail(detail);
      cacheStorage.set(detailCacheKey, normalized, { ttl: CacheTTL.HOUR });
      return normalized;
    } catch (error) {
      if (__DEV__) {
        console.warn('[Benefits] 상세 조회 실패, Mock 반환:', error);
      }
      if (cachedDetail) {
        return cachedDetail;
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
        const detail: BenefitDetail = {
          ...benefit,
          ageRequirement: item.trainTarget || '제한 없음',
          applicationUrl: item.titleLink || '',
          detailUrl: item.titleLink || '',
          applicationMethod: '훈련기관 문의',
          contactInfo: item.telNo || '',
          lastUpdated: '',
        };
        cacheStorage.set(detailCacheKey, detail, { ttl: CacheTTL.HOUR });
        return detail;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[Benefits] 훈련과정 상세 조회 실패:', error);
      }
    }
    return cachedDetail ?? null;
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
        const detail: BenefitDetail = {
          ...benefit,
          ageRequirement: item.pgmTarget || '제한 없음',
          applicationUrl: '',
          detailUrl: '',
          applicationMethod: '해당 기관 문의',
          contactInfo: '',
          lastUpdated: '',
        };
        cacheStorage.set(detailCacheKey, detail, { ttl: CacheTTL.HOUR });
        return detail;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[Benefits] 취업프로그램 상세 조회 실패:', error);
      }
    }
    return cachedDetail ?? null;
  }

  // 알 수 없는 ID 형식
  if (__DEV__) {
    console.warn('[Benefits] 알 수 없는 혜택 ID 형식:', id);
  }
  return cachedDetail ?? null;
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
  // 사용자 지역 코드 매핑 (Region 타입으로 정규화)
  const normalizedRegion = (() => {
    const rawRegion = userProfile.region;
    if (!rawRegion) return undefined;

    if (REGION_TO_API_CODE[rawRegion]) {
      return rawRegion;
    }

    const fromApiCode = API_CODE_TO_REGION[rawRegion];
    if (fromApiCode) {
      return fromApiCode;
    }

    const fromName = REGION_NAME_TO_CODE[rawRegion];
    if (fromName) {
      return fromName;
    }

    if (__DEV__) {
      console.warn('[Benefits] 알 수 없는 사용자 지역 코드:', rawRegion);
    }

    return undefined;
  })();

  return fetchAllBenefits({
    ...filters,
    region: normalizedRegion,
  });
}
