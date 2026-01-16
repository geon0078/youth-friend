import { ColorSchemeName } from 'react-native';

export const Palette = {
  // Primary colors
  primary: '#0B4DFF',
  secondary: '#00B8A9',
  accent: '#FF8A34',
  // Base colors
  background: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#E2E5ED',
  // Text colors
  textPrimary: '#1F2432',
  textMuted: '#4B5565',
  textOnPrimary: '#FFFFFF',
  textOnSurface: '#1F2432',
  // Alert colors
  error: '#E53935',
  errorBackground: '#FFEBEE',
  warning: '#FF8A34',
  warningBackground: '#FFF3E0',
  // Success colors
  success: '#22C55E',
  successBackground: '#DCFCE7',
  // Info colors
  info: '#3B82F6',
  infoBackground: '#EFF6FF',
  // Primary shades
  primaryBackground: '#EFF6FF',
  // Grayscale for accessibility
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F4F6FB',
  gray200: '#E2E5ED',
  gray400: '#9CA3AF',
  gray600: '#4B5565',
  gray800: '#1F2432',
  gray900: '#111827',
};

export const SemanticColors = {
  light: {
    background: Palette.background,
    surface: Palette.surface,
    elevatedSurface: '#F8FAFF',
    text: Palette.textPrimary,
    mutedText: Palette.textMuted,
    border: Palette.border,
    heroBackground: Palette.primary,
    heroText: Palette.textOnPrimary,
    badgePositive: Palette.secondary,
    badgeAlert: Palette.accent,
    quickAction: '#F0F0F5',
  },
  dark: {
    background: '#0E111A',
    surface: '#151A24',
    elevatedSurface: '#1D2532',
    text: '#F5F6FB',
    mutedText: '#BAC1D4',
    border: '#2B3142',
    heroBackground: '#1E3AA9',
    heroText: Palette.textOnPrimary,
    badgePositive: '#2ED1C4',
    badgeAlert: '#FFB07A',
    quickAction: '#1E2332',
  },
};

/**
 * 고대비 테마 색상 (WCAG 2.1 AA 준수)
 * 최소 대비율 4.5:1 보장
 */
export const HighContrastColors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    elevatedSurface: '#F5F5F5',
    text: '#000000',
    mutedText: '#333333',
    border: '#000000',
    heroBackground: '#003399',
    heroText: '#FFFFFF',
    badgePositive: '#006600',
    badgeAlert: '#CC3300',
    quickAction: '#E0E0E0',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1A',
    elevatedSurface: '#2D2D2D',
    text: '#FFFFFF',
    mutedText: '#CCCCCC',
    border: '#FFFFFF',
    heroBackground: '#0055CC',
    heroText: '#FFFFFF',
    badgePositive: '#33CC33',
    badgeAlert: '#FF6633',
    quickAction: '#333333',
  },
};

/**
 * 고대비 모드용 Palette 오버라이드
 */
export const HighContrastPalette = {
  light: {
    primary: '#003399',
    secondary: '#006600',
    accent: '#CC3300',
    error: '#CC0000',
    errorBackground: '#FFE0E0',
    warning: '#CC6600',
    warningBackground: '#FFF0CC',
    success: '#006600',
    successBackground: '#E0FFE0',
    info: '#003399',
    infoBackground: '#E0E8FF',
    border: '#000000',
    textPrimary: '#000000',
    textMuted: '#333333',
  },
  dark: {
    primary: '#6699FF',
    secondary: '#33CC33',
    accent: '#FF9966',
    error: '#FF6666',
    errorBackground: '#330000',
    warning: '#FFCC00',
    warningBackground: '#332200',
    success: '#33CC33',
    successBackground: '#003300',
    info: '#6699FF',
    infoBackground: '#001133',
    border: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textMuted: '#CCCCCC',
  },
};

export type SemanticColorKey = keyof typeof SemanticColors.light;
export type ThemeMode = 'light' | 'dark';

/**
 * 시맨틱 색상 가져오기
 * @param scheme 색상 스킴 (light/dark)
 * @param key 색상 키
 * @param highContrast 고대비 모드 여부
 */
export const getSemanticColor = (
  scheme: ColorSchemeName,
  key: SemanticColorKey,
  highContrast: boolean = false
): string => {
  const resolvedScheme: ThemeMode = scheme === 'dark' ? 'dark' : 'light';

  if (highContrast) {
    return HighContrastColors[resolvedScheme][key];
  }

  return SemanticColors[resolvedScheme][key];
};

/**
 * 고대비 모드용 Palette 색상 가져오기
 * @param key Palette 키
 * @param scheme 색상 스킴
 * @param highContrast 고대비 모드 여부
 */
export const getPaletteColor = (
  key: keyof typeof HighContrastPalette.light,
  scheme: ColorSchemeName = 'light',
  highContrast: boolean = false
): string => {
  const resolvedScheme: ThemeMode = scheme === 'dark' ? 'dark' : 'light';

  if (highContrast) {
    return HighContrastPalette[resolvedScheme][key];
  }

  return Palette[key as keyof typeof Palette] || Palette.textPrimary;
};

/**
 * 대비율 계산 (WCAG 기준)
 * @param foreground 전경색 (hex)
 * @param background 배경색 (hex)
 * @returns 대비율 (1 - 21)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((val) => {
      const n = parseInt(val, 16) / 255;
      return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG AA 기준 충족 여부 확인
 * @param contrastRatio 대비율
 * @param isLargeText 큰 텍스트 여부 (18pt+ 또는 14pt+ bold)
 */
export function meetsWCAGAA(contrastRatio: number, isLargeText: boolean = false): boolean {
  return contrastRatio >= (isLargeText ? 3 : 4.5);
}

/**
 * WCAG AAA 기준 충족 여부 확인
 */
export function meetsWCAGAAA(contrastRatio: number, isLargeText: boolean = false): boolean {
  return contrastRatio >= (isLargeText ? 4.5 : 7);
}
