import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { mmkvStorage } from '@/services/storage/mmkv-storage';
import type { UserProfile, ConsentItems } from '@/types';
import { DEFAULT_CONSENT_ITEMS } from '@/types';

/**
 * 사용자 스토어 상태 타입
 */
interface UserState {
  /** 사용자 프로필 */
  profile: UserProfile | null;
  /** 온보딩 완료 여부 */
  isOnboarded: boolean;
  /** 개별 동의 항목 (FR4) */
  consentItems: ConsentItems;
  /** 필수 동의 완료 여부 */
  hasConsented: boolean;
  /** 동의 일시 */
  consentedAt: string | null;
}

/**
 * 사용자 스토어 액션 타입
 */
interface UserActions {
  /** 프로필 설정 */
  setProfile: (profile: UserProfile) => void;
  /** 프로필 업데이트 (부분) */
  updateProfile: (updates: Partial<UserProfile>) => void;
  /** 프로필 삭제 (FR25) */
  clearProfile: () => void;
  /** 개별 동의 항목 업데이트 (FR4) */
  updateConsentItem: (key: keyof ConsentItems, value: boolean) => void;
  /** 전체 동의 설정 (FR4) */
  setAllConsent: (value: boolean) => void;
  /** 온보딩 완료 처리 */
  completeOnboarding: () => void;
}

type UserStore = UserState & UserActions;

/**
 * 사용자 스토어
 * - 프로필 정보 관리 (FR1, FR2)
 * - 개인정보 동의 관리 (FR4)
 * - MMKV persist로 로컬 저장
 */
/**
 * 필수 동의 항목 모두 체크 여부 확인
 */
const checkRequiredConsent = (items: ConsentItems): boolean => {
  return items.termsOfService && items.privacyPolicy;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      profile: null,
      isOnboarded: false,
      consentItems: { ...DEFAULT_CONSENT_ITEMS },
      hasConsented: false,
      consentedAt: null,

      // Actions
      setProfile: (profile) =>
        set({
          profile,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates } as UserProfile,
        })),

      clearProfile: () =>
        set({
          profile: null,
          isOnboarded: false,
          consentItems: { ...DEFAULT_CONSENT_ITEMS },
          hasConsented: false,
          consentedAt: null,
        }),

      updateConsentItem: (key, value) =>
        set((state) => {
          const newItems = { ...state.consentItems, [key]: value };
          const hasConsented = checkRequiredConsent(newItems);
          return {
            consentItems: newItems,
            hasConsented,
            consentedAt: hasConsented && !state.hasConsented
              ? new Date().toISOString()
              : state.consentedAt,
          };
        }),

      setAllConsent: (value) =>
        set((state) => {
          const newItems: ConsentItems = {
            termsOfService: value,
            privacyPolicy: value,
            marketingNotifications: value,
          };
          const hasConsented = checkRequiredConsent(newItems);
          return {
            consentItems: newItems,
            hasConsented,
            consentedAt: hasConsented && !state.hasConsented
              ? new Date().toISOString()
              : state.consentedAt,
          };
        }),

      completeOnboarding: () =>
        set({
          isOnboarded: true,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
