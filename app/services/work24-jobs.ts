// 고용24 채용정보 API 서비스
import { API_CONFIG, fetchWithTimeout, parseXMLValue, parseXMLArray } from './api';

export interface JobPosting {
  wantedAuthNo: string;     // 구인인증번호
  company: string;          // 회사명
  title: string;            // 채용제목
  salTpNm: string;          // 임금형태
  sal: string;              // 급여
  region: string;           // 근무지역
  holidayTpNm: string;      // 근무형태
  minEdubg: string;         // 학력
  career: string;           // 경력
  closeDt: string;          // 마감일자
  wantedInfoUrl: string;    // 채용정보 URL
  jobsCd: string;           // 직종코드
  empTpNm: string;          // 고용형태
  regDt: string;            // 등록일
}

export interface JobSearchParams {
  startPage?: number;
  display?: number;
  region?: string;          // 근무지역코드
  occupation?: string;      // 직종코드
  salTp?: string;           // 임금형태 (D:일급, H:시급, M:월급, Y:연봉)
  education?: string;       // 학력코드
  career?: string;          // 경력 (N:신입, E:경력, Z:관계없음)
  empTp?: string;           // 고용형태
  keyword?: string;         // 키워드
  coTp?: string;            // 기업형태 (09:청년친화강소기업)
}

export interface JobListResponse {
  totalCount: number;
  startPage: number;
  display: number;
  jobs: JobPosting[];
}

// 채용정보 목록 조회
export async function fetchJobs(params: JobSearchParams = {}): Promise<JobListResponse> {
  const {
    startPage = 1,
    display = 10,
    region,
    occupation,
    salTp,
    education,
    career,
    empTp,
    keyword,
    coTp,
  } = params;

  const url = new URL(`${API_CONFIG.work24.baseUrl}/wk/callOpenApiSvcInfo210L01.do`);
  url.searchParams.set('authKey', API_CONFIG.work24.jobKey || '');
  url.searchParams.set('callTp', 'L');
  url.searchParams.set('returnType', 'XML');
  url.searchParams.set('startPage', String(startPage));
  url.searchParams.set('display', String(display));

  if (region) url.searchParams.set('region', region);
  if (occupation) url.searchParams.set('occupation', occupation);
  if (salTp) url.searchParams.set('salTp', salTp);
  if (education) url.searchParams.set('education', education);
  if (career) url.searchParams.set('career', career);
  if (empTp) url.searchParams.set('empTp', empTp);
  if (keyword) url.searchParams.set('keyword', keyword);
  if (coTp) url.searchParams.set('coTp', coTp);

  try {
    const response = await fetchWithTimeout(url.toString());
    const xml = await response.text();

    const totalCount = parseInt(parseXMLValue(xml, 'total'), 10) || 0;
    const items = parseXMLArray(xml, 'wanted');

    return {
      totalCount,
      startPage,
      display,
      jobs: items.map(parseJobXML),
    };
  } catch (error) {
    console.error('채용정보 조회 실패:', error);
    throw error;
  }
}

// 청년친화 강소기업 채용정보 조회
export async function fetchYouthFriendlyJobs(pageSize = 10): Promise<JobPosting[]> {
  const result = await fetchJobs({ coTp: '09', display: pageSize });
  return result.jobs;
}

// 신입 채용정보 조회
export async function fetchEntryLevelJobs(pageSize = 10): Promise<JobPosting[]> {
  const result = await fetchJobs({ career: 'N', display: pageSize });
  return result.jobs;
}

// 지역별 채용정보 조회
export async function fetchJobsByRegion(regionCode: string, pageSize = 10): Promise<JobPosting[]> {
  const result = await fetchJobs({ region: regionCode, display: pageSize });
  return result.jobs;
}

// XML 파싱
function parseJobXML(xml: string): JobPosting {
  return {
    wantedAuthNo: parseXMLValue(xml, 'wantedAuthNo'),
    company: parseXMLValue(xml, 'company'),
    title: parseXMLValue(xml, 'title'),
    salTpNm: parseXMLValue(xml, 'salTpNm'),
    sal: parseXMLValue(xml, 'sal'),
    region: parseXMLValue(xml, 'region'),
    holidayTpNm: parseXMLValue(xml, 'holidayTpNm'),
    minEdubg: parseXMLValue(xml, 'minEdubg'),
    career: parseXMLValue(xml, 'career'),
    closeDt: parseXMLValue(xml, 'closeDt'),
    wantedInfoUrl: parseXMLValue(xml, 'wantedInfoUrl'),
    jobsCd: parseXMLValue(xml, 'jobsCd'),
    empTpNm: parseXMLValue(xml, 'empTpNm'),
    regDt: parseXMLValue(xml, 'regDt'),
  };
}
