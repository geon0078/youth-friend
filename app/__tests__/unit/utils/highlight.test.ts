/**
 * highlight 유틸리티 테스트
 * Story 3.6: 검색어 하이라이팅
 */
import { getHighlightSegments, containsQuery } from '@/utils/highlight';

describe('getHighlightSegments', () => {
  it('검색어가 없으면 전체 텍스트를 비하이라이트로 반환한다', () => {
    const result = getHighlightSegments('청년 취업 지원금', '');

    expect(result).toEqual([{ text: '청년 취업 지원금', highlight: false }]);
  });

  it('공백 검색어도 전체 텍스트를 비하이라이트로 반환한다', () => {
    const result = getHighlightSegments('청년 취업 지원금', '   ');

    expect(result).toEqual([{ text: '청년 취업 지원금', highlight: false }]);
  });

  it('검색어에 매칭되는 부분을 하이라이트로 표시한다', () => {
    const result = getHighlightSegments('청년 취업 지원금', '취업');

    expect(result).toEqual([
      { text: '청년 ', highlight: false },
      { text: '취업', highlight: true },
      { text: ' 지원금', highlight: false },
    ]);
  });

  it('대소문자 구분 없이 하이라이트한다', () => {
    const result = getHighlightSegments('Hello World', 'HELLO');

    expect(result).toEqual([
      { text: 'Hello', highlight: true },
      { text: ' World', highlight: false },
    ]);
  });

  it('여러 매칭을 모두 하이라이트한다', () => {
    const result = getHighlightSegments('청년 취업 청년 지원금', '청년');

    expect(result).toEqual([
      { text: '청년', highlight: true },
      { text: ' 취업 ', highlight: false },
      { text: '청년', highlight: true },
      { text: ' 지원금', highlight: false },
    ]);
  });

  it('전체 텍스트가 매칭되면 전체를 하이라이트한다', () => {
    const result = getHighlightSegments('취업', '취업');

    expect(result).toEqual([{ text: '취업', highlight: true }]);
  });

  it('특수 문자를 포함한 검색어를 안전하게 처리한다', () => {
    const result = getHighlightSegments('지원금 (100만원)', '(100만원)');

    expect(result).toEqual([
      { text: '지원금 ', highlight: false },
      { text: '(100만원)', highlight: true },
    ]);
  });

  it('텍스트 시작 부분이 매칭되면 올바르게 처리한다', () => {
    const result = getHighlightSegments('청년 지원금', '청년');

    expect(result).toEqual([
      { text: '청년', highlight: true },
      { text: ' 지원금', highlight: false },
    ]);
  });

  it('텍스트 끝 부분이 매칭되면 올바르게 처리한다', () => {
    const result = getHighlightSegments('취업 지원금', '지원금');

    expect(result).toEqual([
      { text: '취업 ', highlight: false },
      { text: '지원금', highlight: true },
    ]);
  });
});

describe('containsQuery', () => {
  it('검색어가 포함되면 true를 반환한다', () => {
    expect(containsQuery('청년 취업 지원금', '취업')).toBe(true);
  });

  it('검색어가 포함되지 않으면 false를 반환한다', () => {
    expect(containsQuery('청년 취업 지원금', '주거')).toBe(false);
  });

  it('대소문자 구분 없이 검색한다', () => {
    expect(containsQuery('Hello World', 'hello')).toBe(true);
    expect(containsQuery('hello world', 'HELLO')).toBe(true);
  });

  it('빈 검색어는 항상 true를 반환한다', () => {
    expect(containsQuery('청년 취업 지원금', '')).toBe(true);
    expect(containsQuery('청년 취업 지원금', '   ')).toBe(true);
  });
});
