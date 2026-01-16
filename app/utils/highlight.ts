/**
 * 텍스트 하이라이팅 유틸리티
 * 검색어에 매칭되는 부분을 강조 표시하기 위한 세그먼트 생성
 */

/**
 * 하이라이트 세그먼트
 */
export interface HighlightSegment {
  /** 텍스트 내용 */
  text: string;
  /** 하이라이트 여부 */
  highlight: boolean;
}

/**
 * 정규식 특수 문자 이스케이프
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 텍스트에서 검색어를 찾아 하이라이트 세그먼트로 분리
 *
 * @param text - 원본 텍스트
 * @param query - 검색어
 * @returns 하이라이트 세그먼트 배열
 *
 * @example
 * ```ts
 * const segments = getHighlightSegments('청년 취업 지원금', '취업');
 * // [
 * //   { text: '청년 ', highlight: false },
 * //   { text: '취업', highlight: true },
 * //   { text: ' 지원금', highlight: false }
 * // ]
 * ```
 */
export function getHighlightSegments(
  text: string,
  query: string
): HighlightSegment[] {
  // 검색어가 없으면 전체 텍스트를 비하이라이트로 반환
  if (!query.trim()) {
    return [{ text, highlight: false }];
  }

  // 대소문자 무시 정규식으로 분리
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: part.toLowerCase() === query.toLowerCase(),
    }));
}

/**
 * 텍스트에 검색어가 포함되어 있는지 확인
 *
 * @param text - 원본 텍스트
 * @param query - 검색어
 * @returns 포함 여부
 */
export function containsQuery(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.toLowerCase().trim());
}
