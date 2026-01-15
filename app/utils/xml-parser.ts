/**
 * XML Parser Utility
 *
 * XML 응답을 JSON으로 변환하는 유틸리티
 * 공공 API(온통청년, 고용24)에서 XML 형식으로 응답하기 때문에 필요
 */
import { XMLParser } from 'fast-xml-parser';

/**
 * XML 파서 옵션
 */
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
  parseAttributeValue: true,
  removeNSPrefix: true, // 네임스페이스 접두사 제거
};

/**
 * XML 파서 인스턴스
 */
const parser = new XMLParser(parserOptions);

/**
 * XML 문자열을 JSON 객체로 변환
 * @param xmlString - 변환할 XML 문자열
 * @returns 파싱된 JSON 객체
 * @throws XML 파싱 실패 시 에러
 */
export function parseXml<T = unknown>(xmlString: string): T {
  if (!xmlString || typeof xmlString !== 'string') {
    throw new Error('Invalid XML input: expected non-empty string');
  }

  try {
    const result = parser.parse(xmlString);
    return result as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error';
    throw new Error(`XML parsing failed: ${message}`);
  }
}

/**
 * XML 응답에서 결과 데이터 추출
 * 공공 API는 보통 response > body > items 구조를 가짐
 *
 * @param xmlString - XML 응답 문자열
 * @param itemPath - 아이템 경로 (기본: ['response', 'body', 'items', 'item'])
 * @returns 추출된 아이템 배열
 */
export function extractItemsFromXml<T = unknown>(
  xmlString: string,
  itemPath: string[] = ['response', 'body', 'items', 'item']
): T[] {
  const parsed = parseXml(xmlString);

  let current: unknown = parsed;
  for (const key of itemPath) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return [];
    }
  }

  // 단일 아이템인 경우 배열로 변환
  if (current && !Array.isArray(current)) {
    return [current as T];
  }

  return (current as T[]) || [];
}

/**
 * XML 응답에서 총 개수 추출
 * @param xmlString - XML 응답 문자열
 * @returns 총 개수 (찾지 못하면 0)
 */
export function extractTotalCountFromXml(xmlString: string): number {
  const parsed = parseXml<{
    response?: {
      body?: {
        totalCount?: number;
      };
    };
  }>(xmlString);

  return parsed?.response?.body?.totalCount ?? 0;
}

/**
 * XML 응답에서 결과 코드 추출
 * @param xmlString - XML 응답 문자열
 * @returns 결과 코드 및 메시지
 */
export function extractResultFromXml(xmlString: string): {
  code: string;
  message: string;
  success: boolean;
} {
  const parsed = parseXml<{
    response?: {
      header?: {
        resultCode?: string;
        resultMsg?: string;
      };
    };
  }>(xmlString);

  const code = parsed?.response?.header?.resultCode ?? '';
  const message = parsed?.response?.header?.resultMsg ?? '';

  return {
    code,
    message,
    success: code === '00' || code === '0000',
  };
}
