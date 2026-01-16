/**
 * 검색어 하이라이팅 텍스트 컴포넌트
 * - 검색어에 매칭되는 부분을 강조 표시 (AC4)
 */
import { useMemo } from 'react';
import { Text, type TextStyle } from 'react-native';

import { getHighlightSegments } from '@/utils/highlight';
import { Palette } from '@/design-system';

interface HighlightedTextProps {
  /** 원본 텍스트 */
  text: string;
  /** 검색어 (하이라이트할 부분) */
  query: string;
  /** 기본 텍스트 스타일 */
  style?: TextStyle;
  /** 하이라이트 텍스트 스타일 */
  highlightStyle?: TextStyle;
  /** 최대 라인 수 */
  numberOfLines?: number;
}

/** 기본 하이라이트 스타일 */
const defaultHighlightStyle: TextStyle = {
  backgroundColor: Palette.warningBackground,
  color: Palette.textPrimary,
};

/**
 * 검색어 하이라이팅 텍스트
 *
 * @example
 * ```tsx
 * <HighlightedText
 *   text="청년 취업 지원금 안내"
 *   query="취업"
 *   style={styles.title}
 * />
 * // "청년 [취업] 지원금 안내" (취업 부분 강조)
 * ```
 */
export function HighlightedText({
  text,
  query,
  style,
  highlightStyle = defaultHighlightStyle,
  numberOfLines,
}: HighlightedTextProps) {
  // 성능 최적화: text나 query가 변경될 때만 세그먼트 재계산
  const segments = useMemo(
    () => getHighlightSegments(text, query),
    [text, query]
  );

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={segment.highlight ? highlightStyle : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}
