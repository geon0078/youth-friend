import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { mmkvStorage } from '@/services/storage/mmkv-storage';
import type { AppSettings, TextSize } from '@/types';

/**
 * 앱 스토어 상태 타입
 */
interface AppState {
  /** 앱 설정 */
  settings: AppSettings;
  /** 마지막 활동 시간 (자동 로그아웃용, FR26) */
  lastActivityAt: string | null;
}

/**
 * 앱 스토어 액션 타입
 */
interface AppActions {
  /** 알림 설정 토글 (FR22) */
  toggleNotifications: (enabled: boolean) => void;
  /** 마감 알림 토글 */
  toggleDeadlineAlert: (enabled: boolean) => void;
  /** 신규 혜택 알림 토글 */
  toggleNewBenefitAlert: (enabled: boolean) => void;
  /** 고대비 모드 토글 (FR30) */
  toggleHighContrast: (enabled: boolean) => void;
  /** 텍스트 크기 설정 (FR29) */
  setTextSize: (size: TextSize) => void;
  /** 모션 감소 토글 */
  toggleReduceMotion: (enabled: boolean) => void;
  /** 활동 시간 업데이트 */
  updateLastActivity: () => void;
  /** 설정 초기화 */
  resetSettings: () => void;
}

type AppStore = AppState & AppActions;

/**
 * 기본 앱 설정
 */
const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  deadlineAlertEnabled: true,
  newBenefitAlertEnabled: true,
  highContrastMode: false,
  textSize: 'medium',
  reduceMotion: false,
};

/**
 * 앱 스토어
 * - 앱 설정 관리 (알림, 접근성)
 * - MMKV persist로 로컬 저장
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // State
      settings: defaultSettings,
      lastActivityAt: null,

      // Actions
      toggleNotifications: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled: enabled },
        })),

      toggleDeadlineAlert: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, deadlineAlertEnabled: enabled },
        })),

      toggleNewBenefitAlert: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, newBenefitAlertEnabled: enabled },
        })),

      toggleHighContrast: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, highContrastMode: enabled },
        })),

      setTextSize: (size) =>
        set((state) => ({
          settings: { ...state.settings, textSize: size },
        })),

      toggleReduceMotion: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, reduceMotion: enabled },
        })),

      updateLastActivity: () =>
        set({ lastActivityAt: new Date().toISOString() }),

      resetSettings: () =>
        set({ settings: defaultSettings }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
