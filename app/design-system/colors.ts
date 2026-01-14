import { ColorSchemeName } from 'react-native';

export const Palette = {
  primary: '#0B4DFF',
  secondary: '#00B8A9',
  accent: '#FF8A34',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#E2E5ED',
  textPrimary: '#1F2432',
  textMuted: '#4B5565',
  textOnPrimary: '#FFFFFF',
  textOnSurface: '#1F2432',
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

export type SemanticColorKey = keyof typeof SemanticColors.light;

export const getSemanticColor = (
  scheme: ColorSchemeName,
  key: SemanticColorKey,
): string => {
  const resolvedScheme = scheme === 'dark' ? 'dark' : 'light';
  return SemanticColors[resolvedScheme][key];
};
