/**
 * useScaledTypography Hook
 * Story 7.2: Implement Dynamic Text Sizing
 *
 * 사용자의 텍스트 크기 설정에 따라 스케일된 타이포그래피 제공
 */
import { useMemo } from 'react';
import { useAppStore } from '@/stores';
import {
  Typography,
  createScaledTypography,
  getScaledTypography,
  type TypographyStyle,
  type ScaledTypographyStyle,
  type TextSizePreference,
} from '@/design-system/typography';

/**
 * 스케일된 타이포그래피 훅 반환 타입
 */
interface UseScaledTypographyReturn {
  /** 현재 텍스트 크기 설정 */
  textSize: TextSizePreference;
  /** 스케일된 전체 타이포그래피 스타일 */
  scaled: Record<TypographyStyle, ScaledTypographyStyle>;
  /** 특정 스타일 가져오기 */
  getStyle: (style: TypographyStyle) => ScaledTypographyStyle;
  /** 원본 (스케일 미적용) 타이포그래피 */
  original: typeof Typography;
}

/**
 * 사용자 설정에 따른 스케일된 타이포그래피 제공
 *
 * @example
 * ```tsx
 * const { scaled, getStyle } = useScaledTypography();
 *
 * // 전체 스타일 사용
 * <Text style={scaled.body}>본문 텍스트</Text>
 *
 * // 특정 스타일 가져오기
 * <Text style={getStyle('heading')}>제목</Text>
 * ```
 */
export function useScaledTypography(): UseScaledTypographyReturn {
  const textSize = useAppStore((s) => s.settings.textSize);

  // 스케일된 전체 타이포그래피 (메모이제이션)
  const scaled = useMemo(
    () => createScaledTypography(textSize),
    [textSize]
  );

  // 특정 스타일 가져오기 함수
  const getStyle = useMemo(
    () => (style: TypographyStyle) => getScaledTypography(style, textSize),
    [textSize]
  );

  return {
    textSize,
    scaled,
    getStyle,
    original: Typography,
  };
}

/**
 * 특정 타이포그래피 스타일만 스케일된 상태로 가져오는 훅
 *
 * @example
 * ```tsx
 * const bodyStyle = useTypographyStyle('body');
 * <Text style={bodyStyle}>본문 텍스트</Text>
 * ```
 */
export function useTypographyStyle(style: TypographyStyle): ScaledTypographyStyle {
  const textSize = useAppStore((s) => s.settings.textSize);

  return useMemo(
    () => getScaledTypography(style, textSize),
    [style, textSize]
  );
}
