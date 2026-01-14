// API 기본 설정 및 유틸리티

export const API_CONFIG = {
  youthCenter: {
    baseUrl: 'https://www.youthcenter.go.kr/go/ythip',
    policyKey: process.env.EXPO_PUBLIC_YOUTH_POLICY_API_KEY,
    centerKey: process.env.EXPO_PUBLIC_YOUTH_CENTER_API_KEY,
  },
  work24: {
    baseUrl: 'https://www.work24.go.kr/cm/openApi/call',
    jobKey: process.env.EXPO_PUBLIC_WORK24_JOB_API_KEY,
    trainingKey: process.env.EXPO_PUBLIC_WORK24_TRAINING_API_KEY,
    companyKey: process.env.EXPO_PUBLIC_WORK24_COMPANY_API_KEY,
    careerKey: process.env.EXPO_PUBLIC_WORK24_CAREER_API_KEY,
    programKey: process.env.EXPO_PUBLIC_WORK24_PROGRAM_API_KEY,
  },
};

// 공통 지역 코드
export const REGION_CODES: Record<string, string> = {
  서울: '11',
  부산: '26',
  대구: '27',
  인천: '28',
  광주: '29',
  대전: '30',
  울산: '31',
  세종: '36',
  경기: '41',
  강원: '42',
  충북: '43',
  충남: '44',
  전북: '45',
  전남: '46',
  경북: '47',
  경남: '48',
  제주: '50',
};

// 정책 분류 코드
export const POLICY_CATEGORIES = {
  일자리: '일자리',
  주거: '주거',
  교육: '교육',
  복지문화: '복지문화',
  참여권리: '참여권리',
};

// API 요청 헬퍼
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// XML 파싱 헬퍼 (고용24 API용)
export function parseXMLValue(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}><!\\[CDATA\\[(.+?)\\]\\]></${tagName}>|<${tagName}>(.+?)</${tagName}>`, 's');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

export function parseXMLArray(xml: string, itemTag: string): string[] {
  const regex = new RegExp(`<${itemTag}>([\\s\\S]*?)</${itemTag}>`, 'g');
  const matches = xml.matchAll(regex);
  return Array.from(matches, (m) => m[1]);
}
