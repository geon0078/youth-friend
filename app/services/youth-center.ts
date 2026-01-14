// 청년센터 API 서비스
import { API_CONFIG, fetchWithTimeout } from './api';

export interface YouthCenter {
  plcSn: string;            // 센터 일련번호
  plcNm: string;            // 센터명
  plcNo: string;            // 센터번호
  addr: string;             // 주소
  dtlAddr: string;          // 상세주소
  telNo: string;            // 전화번호
  hmpgUrl: string;          // 홈페이지
  ctpvCd: string;           // 시도코드
  ctpvNm: string;           // 시도명
  sggCd: string;            // 시군구코드
  sggNm: string;            // 시군구명
}

export interface CenterSearchParams {
  pageNum?: number;
  pageSize?: number;
  ctpvCd?: string;          // 시도코드
  sggCd?: string;           // 시군구코드
}

export interface CenterListResponse {
  totalCount: number;
  pageNum: number;
  pageSize: number;
  centers: YouthCenter[];
}

// 청년센터 목록 조회
export async function fetchCenters(params: CenterSearchParams = {}): Promise<CenterListResponse> {
  const {
    pageNum = 1,
    pageSize = 10,
    ctpvCd,
    sggCd,
  } = params;

  const url = new URL(`${API_CONFIG.youthCenter.baseUrl}/getSpace`);
  url.searchParams.set('apiKeyNm', API_CONFIG.youthCenter.centerKey || '');
  url.searchParams.set('rtnType', 'json');
  url.searchParams.set('pageNum', String(pageNum));
  url.searchParams.set('pageSize', String(pageSize));

  if (ctpvCd) url.searchParams.set('ctpvCd', ctpvCd);
  if (sggCd) url.searchParams.set('sggCd', sggCd);

  try {
    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    if (data.result?.code !== '200') {
      throw new Error(data.result?.message || 'API 요청 실패');
    }

    const items = data.result?.youthSpace || [];

    return {
      totalCount: data.result?.totalCnt || 0,
      pageNum,
      pageSize,
      centers: items.map(mapCenterResponse),
    };
  } catch (error) {
    console.error('청년센터 조회 실패:', error);
    throw error;
  }
}

// 청년센터 상세 조회
export async function fetchCenterDetail(plcSn: string): Promise<YouthCenter | null> {
  const url = new URL(`${API_CONFIG.youthCenter.baseUrl}/getSpace`);
  url.searchParams.set('apiKeyNm', API_CONFIG.youthCenter.centerKey || '');
  url.searchParams.set('rtnType', 'json');
  url.searchParams.set('plcSn', plcSn);

  try {
    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    if (data.result?.code !== '200') {
      throw new Error(data.result?.message || 'API 요청 실패');
    }

    const item = data.result?.youthSpace?.[0];
    return item ? mapCenterResponse(item) : null;
  } catch (error) {
    console.error('청년센터 상세 조회 실패:', error);
    throw error;
  }
}

// 지역별 청년센터 조회
export async function fetchCentersByRegion(
  ctpvCd: string,
  pageSize = 10
): Promise<YouthCenter[]> {
  const result = await fetchCenters({ ctpvCd, pageSize });
  return result.centers;
}

// API 응답 매핑
function mapCenterResponse(item: Record<string, string>): YouthCenter {
  return {
    plcSn: item.plcSn || '',
    plcNm: item.plcNm || '',
    plcNo: item.plcNo || '',
    addr: item.addr || '',
    dtlAddr: item.dtlAddr || '',
    telNo: item.telNo || '',
    hmpgUrl: item.hmpgUrl || '',
    ctpvCd: item.ctpvCd || '',
    ctpvNm: item.ctpvNm || '',
    sggCd: item.sggCd || '',
    sggNm: item.sggNm || '',
  };
}
