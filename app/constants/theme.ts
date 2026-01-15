/**
 * 디자인 토큰 (UX Design Specification 기준)
 */

import { Platform } from 'react-native';

/**
 * Color Palette
 */
export const Palette = {
  // Primary
  primary: '#3182F6',
  primaryLight: '#E6F4FE',

  // Semantic Colors
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Neutral (Gray Scale)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
} as const;

/**
 * Spacing System (px)
 */
export const Spacing = {
  /** 4px - 아이콘-텍스트 간격 */
  xs: 4,
  /** 8px - 요소 내부 패딩 */
  sm: 8,
  /** 16px - 카드 패딩, 섹션 간격 */
  md: 16,
  /** 24px - 섹션 구분 */
  lg: 24,
  /** 32px - 화면 상하 여백 */
  xl: 32,
  /** 48px - 큰 여백 */
  xxl: 48,
} as const;

/**
 * Border Radius (px)
 */
export const Radius = {
  /** 4px - Badge */
  sm: 4,
  /** 8px - Button, Input */
  md: 8,
  /** 12px - Card */
  lg: 12,
  /** 9999px - Chip, Avatar */
  full: 9999,
} as const;

/**
 * Typography
 */
export const Typography = {
  // Font Sizes
  fontSize: {
    hero: 32,
    title: 20,
    subtitle: 16,
    body: 14,
    caption: 12,
  },
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  // Line Heights
  lineHeight: {
    hero: 40,
    title: 28,
    subtitle: 24,
    body: 20,
    caption: 16,
  },
} as const;

/**
 * Shadows
 */
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

/**
 * Accessibility
 */
export const Accessibility = {
  /** 최소 터치 타겟 크기 (pt) */
  minTouchTarget: 44,
  /** 최소 명암비 */
  minContrastRatio: 4.5,
} as const;

// Legacy Colors (기존 호환)
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
