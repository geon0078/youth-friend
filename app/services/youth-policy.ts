// 청년정책 API 서비스
import { API_CONFIG, fetchWithTimeout } from './api';

export interface YouthPolicy {
  plcyNo: string;           // 정책번호
  plcyNm: string;           // 정책명
  plcyExpl: string;         // 정책설명
  sprtCntn: string;         // 지원내용
  ageInfo: string;          // 연령정보
  earnCndtn: string;        // 소득조건
  splmntMtr: string;        // 추가요건
  prcpMthd: string;         // 신청방법
  prcpPrd: string;          // 신청기간
  sprvsnInstt: string;      // 주관기관
  operInstt: string;        // 운영기관
  aplyUrl: string;          // 신청URL
  rfrnUrl: string;          // 참고URL
  lclsfNm: string;          // 대분류
  mclsfNm: string;          // 중분류
  rgnNm: string;            // 지역명
}

export interface PolicySearchParams {
  pageNum?: number;
  pageSize?: number;
  plcyNm?: string;          // 정책명 검색
  lclsfNm?: string;         // 대분류 (일자리, 주거, 교육, 복지문화, 참여권리)
  mclsfNm?: string;         // 중분류
  zipCd?: string;           // 지역코드
  plcyKywdNm?: string;      // 키워드 검색
}

export interface PolicyListResponse {
  totalCount: number;
  pageNum: number;
  pageSize: number;
  policies: YouthPolicy[];
}

// 정책 목록 조회
export async function fetchPolicies(params: PolicySearchParams = {}): Promise<PolicyListResponse> {
  const {
    pageNum = 1,
    pageSize = 10,
    plcyNm,
    lclsfNm,
    mclsfNm,
    zipCd,
    plcyKywdNm,
  } = params;

  const url = new URL(`${API_CONFIG.youthCenter.baseUrl}/getPlcy`);
  url.searchParams.set('apiKeyNm', API_CONFIG.youthCenter.policyKey || '');
  url.searchParams.set('rtnType', 'json');
  url.searchParams.set('pageNum', String(pageNum));
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('pageType', '1'); // 목록

  if (plcyNm) url.searchParams.set('plcyNm', plcyNm);
  if (lclsfNm) url.searchParams.set('lclsfNm', lclsfNm);
  if (mclsfNm) url.searchParams.set('mclsfNm', mclsfNm);
  if (zipCd) url.searchParams.set('zipCd', zipCd);
  if (plcyKywdNm) url.searchParams.set('plcyKywdNm', plcyKywdNm);

  try {
    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    if (data.result?.code !== '200') {
      throw new Error(data.result?.message || 'API 요청 실패');
    }

    const items = data.result?.youthPolicy || [];

    return {
      totalCount: data.result?.totalCnt || 0,
      pageNum,
      pageSize,
      policies: items.map(mapPolicyResponse),
    };
  } catch (error) {
    console.error('청년정책 조회 실패:', error);
    throw error;
  }
}

// 정책 상세 조회
export async function fetchPolicyDetail(plcyNo: string): Promise<YouthPolicy | null> {
  const url = new URL(`${API_CONFIG.youthCenter.baseUrl}/getPlcy`);
  url.searchParams.set('apiKeyNm', API_CONFIG.youthCenter.policyKey || '');
  url.searchParams.set('rtnType', 'json');
  url.searchParams.set('pageType', '2'); // 상세
  url.searchParams.set('plcyNo', plcyNo);

  try {
    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    if (data.result?.code !== '200') {
      throw new Error(data.result?.message || 'API 요청 실패');
    }

    const item = data.result?.youthPolicy?.[0];
    return item ? mapPolicyResponse(item) : null;
  } catch (error) {
    console.error('청년정책 상세 조회 실패:', error);
    throw error;
  }
}

// 카테고리별 정책 조회
export async function fetchPoliciesByCategory(
  category: string,
  pageSize = 5
): Promise<YouthPolicy[]> {
  const result = await fetchPolicies({ lclsfNm: category, pageSize });
  return result.policies;
}

// API 응답 매핑
function mapPolicyResponse(item: Record<string, string>): YouthPolicy {
  return {
    plcyNo: item.plcyNo || '',
    plcyNm: item.plcyNm || '',
    plcyExpl: item.plcyExpl || '',
    sprtCntn: item.sprtCntn || '',
    ageInfo: item.ageInfo || '',
    earnCndtn: item.earnCndtn || '',
    splmntMtr: item.splmntMtr || '',
    prcpMthd: item.prcpMthd || '',
    prcpPrd: item.prcpPrd || '',
    sprvsnInstt: item.sprvsnInstt || '',
    operInstt: item.operInstt || '',
    aplyUrl: item.aplyUrl || '',
    rfrnUrl: item.rfrnUrl || '',
    lclsfNm: item.lclsfNm || '',
    mclsfNm: item.mclsfNm || '',
    rgnNm: item.rgnNm || '',
  };
}
