/**
 * useTheme Hook
 * Story 7.3: Implement High Contrast Mode
 *
 * 테마 및 고대비 모드 관리
 */
import { useMemo, useCallback } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useAppStore } from '@/stores';
import {
  Palette,
  SemanticColors,
  HighContrastColors,
  HighContrastPalette,
  getSemanticColor,
  getPaletteColor,
  type SemanticColorKey,
  type ThemeMode,
} from '@/design-system/colors';

/**
 * 테마 훅 반환 타입
 */
interface UseThemeReturn {
  /** 현재 색상 스킴 (light/dark) */
  colorScheme: ThemeMode;
  /** 시스템 색상 스킴 */
  systemColorScheme: ThemeMode;
  /** 고대비 모드 활성화 여부 */
  highContrastMode: boolean;
  /** 고대비 모드 토글 */
  toggleHighContrast: (enabled: boolean) => void;
  /** 시맨틱 색상 가져오기 */
  getColor: (key: SemanticColorKey) => string;
  /** Palette 색상 가져오기 */
  getPalette: (key: keyof typeof HighContrastPalette.light) => string;
  /** 현재 테마의 전체 색상 */
  colors: typeof SemanticColors.light;
  /** 현재 테마의 Palette */
  palette: typeof Palette;
}

/**
 * 테마 및 고대비 모드 관리 훅
 *
 * @example
 * ```tsx
 * const { colors, getColor, highContrastMode } = useTheme();
 *
 * <View style={{ backgroundColor: getColor('background') }}>
 *   <Text style={{ color: getColor('text') }}>텍스트</Text>
 * </View>
 * ```
 */
export function useTheme(): UseThemeReturn {
  const systemScheme = useSystemColorScheme();
  const highContrastMode = useAppStore((s) => s.settings.highContrastMode);
  const toggleHighContrastStore = useAppStore((s) => s.toggleHighContrast);

  // 색상 스킴 결정
  const colorScheme: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';

  // 현재 테마의 전체 색상
  const colors = useMemo(() => {
    if (highContrastMode) {
      return HighContrastColors[colorScheme];
    }
    return SemanticColors[colorScheme];
  }, [colorScheme, highContrastMode]);

  // 현재 테마의 Palette
  const palette = useMemo(() => {
    if (highContrastMode) {
      return {
        ...Palette,
        ...HighContrastPalette[colorScheme],
      };
    }
    return Palette;
  }, [colorScheme, highContrastMode]);

  // 시맨틱 색상 가져오기
  const getColor = useCallback(
    (key: SemanticColorKey) => getSemanticColor(colorScheme, key, highContrastMode),
    [colorScheme, highContrastMode]
  );

  // Palette 색상 가져오기
  const getPalette = useCallback(
    (key: keyof typeof HighContrastPalette.light) =>
      getPaletteColor(key, colorScheme, highContrastMode),
    [colorScheme, highContrastMode]
  );

  return {
    colorScheme,
    systemColorScheme: colorScheme,
    highContrastMode,
    toggleHighContrast: toggleHighContrastStore,
    getColor,
    getPalette,
    colors,
    palette,
  };
}

/**
 * 간단한 색상 스킴만 반환하는 훅
 */
export function useColorSchemeWithContrast(): {
  colorScheme: ThemeMode;
  highContrast: boolean;
} {
  const systemScheme = useSystemColorScheme();
  const highContrastMode = useAppStore((s) => s.settings.highContrastMode);

  return {
    colorScheme: systemScheme === 'dark' ? 'dark' : 'light',
    highContrast: highContrastMode,
  };
}
