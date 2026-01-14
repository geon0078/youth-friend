// 고용24 훈련과정 API 서비스
import { API_CONFIG, fetchWithTimeout } from './api';

export interface TrainingCourse {
  trprId: string;           // 훈련과정 ID
  trprNm: string;           // 훈련과정명
  trainstCstId: string;     // 훈련기관 ID
  inoNm: string;            // 훈련기관명
  addr1: string;            // 주소
  telNo: string;            // 전화번호
  ncsCd: string;            // NCS코드
  ncsNm: string;            // NCS명
  traStartDate: string;     // 훈련시작일
  traEndDate: string;       // 훈련종료일
  traineeCnt: string;       // 정원
  realExpAmt: string;       // 수강비
  eiEmplRate3: string;      // 취업률
  grade: string;            // 만족도점수
  trainTime: string;        // 훈련시간
  trprChap: string;         // 자격증
}

export interface TrainingSearchParams {
  pageNum?: number;
  pageSize?: number;
  srchTraStDt?: string;     // 훈련시작일 From (YYYYMMDD)
  srchTraEndDt?: string;    // 훈련시작일 To (YYYYMMDD)
  srchTraArea1?: string;    // 훈련지역 대분류
  srchNcs1?: string;        // NCS 1차분류
  crseTracseSe?: string;    // 훈련유형
  sort?: 'ASC' | 'DESC';
  sortCol?: '1' | '2' | '3' | '5'; // 1:기관명, 2:시작일, 3:취업률, 5:만족도
}

export interface TrainingListResponse {
  totalCount: number;
  pageNum: number;
  pageSize: number;
  courses: TrainingCourse[];
}

// 훈련유형 코드
export const TRAINING_TYPES = {
  내일배움카드: 'C0061',
  국가기간전략산업: 'C0054',
  K디지털트레이닝: 'C0104',
  K디지털기초역량: 'C0105',
  산업구조변화대응: 'C0102',
};

// 훈련과정 목록 조회
export async function fetchTrainingCourses(
  params: TrainingSearchParams = {}
): Promise<TrainingListResponse> {
  const {
    pageNum = 1,
    pageSize = 10,
    srchTraStDt,
    srchTraEndDt,
    srchTraArea1,
    srchNcs1,
    crseTracseSe,
    sort = 'DESC',
    sortCol = '2',
  } = params;

  // 기본값: 오늘부터 3개월
  const today = new Date();
  const threeMonthsLater = new Date(today);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  const url = new URL(`${API_CONFIG.work24.baseUrl}/hr/callOpenApiSvcInfo310L01.do`);
  url.searchParams.set('authKey', API_CONFIG.work24.trainingKey || '');
  url.searchParams.set('returnType', 'JSON');
  url.searchParams.set('outType', '1');
  url.searchParams.set('pageNum', String(pageNum));
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('srchTraStDt', srchTraStDt || formatDate(today));
  url.searchParams.set('srchTraEndDt', srchTraEndDt || formatDate(threeMonthsLater));
  url.searchParams.set('sort', sort);
  url.searchParams.set('sortCol', sortCol);

  if (srchTraArea1) url.searchParams.set('srchTraArea1', srchTraArea1);
  if (srchNcs1) url.searchParams.set('srchNcs1', srchNcs1);
  if (crseTracseSe) url.searchParams.set('crseTracseSe', crseTracseSe);

  try {
    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    const items = data.srchList || [];

    return {
      totalCount: data.scn_cnt || 0,
      pageNum,
      pageSize,
      courses: items.map(mapTrainingResponse),
    };
  } catch (error) {
    console.error('훈련과정 조회 실패:', error);
    throw error;
  }
}

// K-디지털 트레이닝 과정 조회
export async function fetchKDigitalCourses(pageSize = 10): Promise<TrainingCourse[]> {
  const result = await fetchTrainingCourses({
    crseTracseSe: TRAINING_TYPES.K디지털트레이닝,
    pageSize,
    sortCol: '3', // 취업률순
  });
  return result.courses;
}

// 지역별 훈련과정 조회
export async function fetchTrainingByRegion(
  regionCode: string,
  pageSize = 10
): Promise<TrainingCourse[]> {
  const result = await fetchTrainingCourses({
    srchTraArea1: regionCode,
    pageSize,
  });
  return result.courses;
}

// NCS 분야별 훈련과정 조회
export async function fetchTrainingByNcs(
  ncsCode: string,
  pageSize = 10
): Promise<TrainingCourse[]> {
  const result = await fetchTrainingCourses({
    srchNcs1: ncsCode,
    pageSize,
  });
  return result.courses;
}

// API 응답 매핑
function mapTrainingResponse(item: Record<string, string>): TrainingCourse {
  return {
    trprId: item.trprId || '',
    trprNm: item.trprNm || '',
    trainstCstId: item.trainstCstId || '',
    inoNm: item.inoNm || '',
    addr1: item.addr1 || '',
    telNo: item.telNo || '',
    ncsCd: item.ncsCd || '',
    ncsNm: item.ncsNm || '',
    traStartDate: item.traStartDate || '',
    traEndDate: item.traEndDate || '',
    traineeCnt: item.traineeCnt || '',
    realExpAmt: item.realExpAmt || '',
    eiEmplRate3: item.eiEmplRate3 || '',
    grade: item.grade || '',
    trainTime: item.trainTime || '',
    trprChap: item.trprChap || '',
  };
}
