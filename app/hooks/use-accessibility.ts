/**
 * useAccessibility Hook
 * Epic 7: Accessibility Enhancement (접근성 강화)
 *
 * 접근성 설정 및 시스템 상태를 관리하는 훅
 */
import { useState, useEffect, useCallback } from 'react';
import {
  AccessibilityInfo,
  PixelRatio,
  Dimensions,
  useColorScheme as useSystemColorScheme,
} from 'react-native';
import { useAppStore } from '@/stores';

/**
 * 접근성 상태 타입
 */
interface AccessibilityState {
  /** 스크린 리더 활성화 여부 */
  isScreenReaderEnabled: boolean;
  /** 모션 감소 활성화 여부 */
  isReduceMotionEnabled: boolean;
  /** 굵은 텍스트 활성화 여부 (iOS) */
  isBoldTextEnabled: boolean;
  /** 회색조 모드 활성화 여부 */
  isGrayscaleEnabled: boolean;
  /** 색상 반전 활성화 여부 */
  isInvertColorsEnabled: boolean;
  /** 시스템 폰트 스케일 */
  fontScale: number;
  /** 로딩 완료 여부 */
  isLoaded: boolean;
}

/**
 * 접근성 훅 반환 타입
 */
interface UseAccessibilityReturn extends AccessibilityState {
  /** 앱 설정 - 고대비 모드 */
  highContrastMode: boolean;
  /** 앱 설정 - 텍스트 크기 */
  textSize: 'small' | 'medium' | 'large';
  /** 앱 설정 - 모션 감소 */
  reduceMotion: boolean;
  /** 고대비 모드 토글 */
  toggleHighContrast: (enabled: boolean) => void;
  /** 텍스트 크기 설정 */
  setTextSize: (size: 'small' | 'medium' | 'large') => void;
  /** 모션 감소 토글 */
  toggleReduceMotion: (enabled: boolean) => void;
  /** 폰트 스케일 계산 (시스템 + 앱 설정 조합) */
  getFontScale: () => number;
  /** 스크린 리더에 메시지 읽기 */
  announce: (message: string) => void;
}

/**
 * 접근성 설정 및 시스템 상태 훅
 */
export function useAccessibility(): UseAccessibilityReturn {
  const [state, setState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    fontScale: 1,
    isLoaded: false,
  });

  // 앱 설정
  const settings = useAppStore((s) => s.settings);
  const toggleHighContrastStore = useAppStore((s) => s.toggleHighContrast);
  const setTextSizeStore = useAppStore((s) => s.setTextSize);
  const toggleReduceMotionStore = useAppStore((s) => s.toggleReduceMotion);

  // 시스템 접근성 설정 로드
  useEffect(() => {
    const loadAccessibilitySettings = async () => {
      const [
        screenReaderEnabled,
        reduceMotionEnabled,
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isBoldTextEnabled?.() ?? Promise.resolve(false),
        AccessibilityInfo.isGrayscaleEnabled?.() ?? Promise.resolve(false),
        AccessibilityInfo.isInvertColorsEnabled?.() ?? Promise.resolve(false),
      ]);

      setState({
        isScreenReaderEnabled: screenReaderEnabled,
        isReduceMotionEnabled: reduceMotionEnabled,
        isBoldTextEnabled: boldTextEnabled,
        isGrayscaleEnabled: grayscaleEnabled,
        isInvertColorsEnabled: invertColorsEnabled,
        fontScale: PixelRatio.getFontScale(),
        isLoaded: true,
      });
    };

    loadAccessibilitySettings();

    // 스크린 리더 상태 변경 리스너
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setState((prev) => ({ ...prev, isScreenReaderEnabled: enabled }));
      }
    );

    // 모션 감소 상태 변경 리스너
    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setState((prev) => ({ ...prev, isReduceMotionEnabled: enabled }));
      }
    );

    // 굵은 텍스트 상태 변경 리스너
    const boldTextListener = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      (enabled) => {
        setState((prev) => ({ ...prev, isBoldTextEnabled: enabled }));
      }
    );

    // 회색조 상태 변경 리스너
    const grayscaleListener = AccessibilityInfo.addEventListener(
      'grayscaleChanged',
      (enabled) => {
        setState((prev) => ({ ...prev, isGrayscaleEnabled: enabled }));
      }
    );

    // 색상 반전 상태 변경 리스너
    const invertColorsListener = AccessibilityInfo.addEventListener(
      'invertColorsChanged',
      (enabled) => {
        setState((prev) => ({ ...prev, isInvertColorsEnabled: enabled }));
      }
    );

    // 화면 크기 변경 시 폰트 스케일 업데이트
    const dimensionsListener = Dimensions.addEventListener('change', () => {
      setState((prev) => ({ ...prev, fontScale: PixelRatio.getFontScale() }));
    });

    return () => {
      screenReaderListener.remove();
      reduceMotionListener.remove();
      boldTextListener.remove();
      grayscaleListener.remove();
      invertColorsListener.remove();
      dimensionsListener.remove();
    };
  }, []);

  // 폰트 스케일 계산 (시스템 설정 + 앱 설정)
  const getFontScale = useCallback(() => {
    const textSizeMultipliers = {
      small: 0.85,
      medium: 1,
      large: 1.2,
    };

    return state.fontScale * textSizeMultipliers[settings.textSize];
  }, [state.fontScale, settings.textSize]);

  // 스크린 리더에 메시지 읽기
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return {
    ...state,
    highContrastMode: settings.highContrastMode,
    textSize: settings.textSize,
    reduceMotion: settings.reduceMotion || state.isReduceMotionEnabled,
    toggleHighContrast: toggleHighContrastStore,
    setTextSize: setTextSizeStore,
    toggleReduceMotion: toggleReduceMotionStore,
    getFontScale,
    announce,
  };
}

/**
 * 모션 감소 설정만 확인하는 간단한 훅
 */
export function useReducedMotion(): boolean {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const appReduceMotion = useAppStore((s) => s.settings.reduceMotion);

  useEffect(() => {
    const check = async () => {
      const systemReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      setIsReducedMotion(systemReduceMotion);
    };
    check();

    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotion
    );

    return () => listener.remove();
  }, []);

  return isReducedMotion || appReduceMotion;
}

/**
 * 스크린 리더 활성화 여부만 확인하는 간단한 훅
 */
export function useScreenReader(): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const check = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsEnabled(enabled);
    };
    check();

    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsEnabled
    );

    return () => listener.remove();
  }, []);

  return isEnabled;
}

/**
 * 폰트 스케일을 반환하는 훅
 */
export function useFontScale(): number {
  const [scale, setScale] = useState(PixelRatio.getFontScale());
  const textSize = useAppStore((s) => s.settings.textSize);

  useEffect(() => {
    const listener = Dimensions.addEventListener('change', () => {
      setScale(PixelRatio.getFontScale());
    });

    return () => listener.remove();
  }, []);

  const textSizeMultipliers = {
    small: 0.85,
    medium: 1,
    large: 1.2,
  };

  return scale * textSizeMultipliers[textSize];
}
