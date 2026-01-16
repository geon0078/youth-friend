import { PixelRatio } from 'react-native';

export const FontFamilies = {
  sans: 'System',
  rounded: 'System',
};

/**
 * 텍스트 크기 설정 타입
 */
export type TextSizePreference = 'small' | 'medium' | 'large';

/**
 * 텍스트 크기별 배율
 */
export const TEXT_SIZE_SCALES: Record<TextSizePreference, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
};

/**
 * 기본 타이포그래피 스타일
 */
export const Typography = {
  heroTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  labelBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

/**
 * 타이포그래피 스타일 타입
 */
export type TypographyStyle = keyof typeof Typography;

/**
 * 스케일이 적용된 타이포그래피 스타일
 */
export type ScaledTypographyStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight?: '400' | '600' | '700';
  letterSpacing?: number;
};

/**
 * 폰트 크기에 스케일 적용
 * @param fontSize 기본 폰트 크기
 * @param scale 스케일 배율
 * @param maxScale 최대 스케일 (기본: 1.5)
 */
export function scaleFontSize(
  fontSize: number,
  scale: number,
  maxScale: number = 1.5
): number {
  // 시스템 폰트 스케일과 결합
  const systemScale = PixelRatio.getFontScale();
  const combinedScale = Math.min(scale * systemScale, maxScale);
  return Math.round(fontSize * combinedScale);
}

/**
 * 라인 높이 계산 (폰트 크기 대비 비율 유지)
 * @param scaledFontSize 스케일이 적용된 폰트 크기
 * @param originalFontSize 원본 폰트 크기
 * @param originalLineHeight 원본 라인 높이
 */
export function calculateLineHeight(
  scaledFontSize: number,
  originalFontSize: number,
  originalLineHeight: number
): number {
  const ratio = originalLineHeight / originalFontSize;
  return Math.round(scaledFontSize * ratio);
}

/**
 * 스케일이 적용된 타이포그래피 스타일 생성
 * @param style 타이포그래피 스타일 이름
 * @param textSizePreference 텍스트 크기 설정
 * @param respectSystemScale 시스템 스케일 적용 여부 (기본: true)
 */
export function getScaledTypography(
  style: TypographyStyle,
  textSizePreference: TextSizePreference = 'medium',
  respectSystemScale: boolean = true
): ScaledTypographyStyle {
  const baseStyle = Typography[style];
  const scale = TEXT_SIZE_SCALES[textSizePreference];

  // 시스템 스케일 포함 여부
  const systemScale = respectSystemScale ? PixelRatio.getFontScale() : 1;
  const combinedScale = scale * systemScale;

  // 최대 스케일 제한 (1.5배)
  const effectiveScale = Math.min(combinedScale, 1.5);

  const scaledFontSize = Math.round(baseStyle.fontSize * effectiveScale);
  const scaledLineHeight = calculateLineHeight(
    scaledFontSize,
    baseStyle.fontSize,
    baseStyle.lineHeight
  );

  return {
    fontSize: scaledFontSize,
    lineHeight: scaledLineHeight,
    ...('fontWeight' in baseStyle && { fontWeight: baseStyle.fontWeight }),
    ...('letterSpacing' in baseStyle && { letterSpacing: baseStyle.letterSpacing }),
  };
}

/**
 * 모든 타이포그래피 스타일에 스케일 적용
 * @param textSizePreference 텍스트 크기 설정
 */
export function createScaledTypography(
  textSizePreference: TextSizePreference = 'medium'
): Record<TypographyStyle, ScaledTypographyStyle> {
  const styles = Object.keys(Typography) as TypographyStyle[];

  return styles.reduce((acc, style) => {
    acc[style] = getScaledTypography(style, textSizePreference);
    return acc;
  }, {} as Record<TypographyStyle, ScaledTypographyStyle>);
}
