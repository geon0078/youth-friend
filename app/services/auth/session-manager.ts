/**
 * Session Manager Service
 *
 * 세션 타임아웃 관리:
 * - 30분 미사용 시 자동 로그아웃 (NFR8)
 * - 앱 백그라운드 진입 시 타이머 시작
 * - 포그라운드 복귀 시 경과 시간 체크
 */

import { AppState, AppStateStatus } from 'react-native';

import { mmkv as storage } from '../storage/mmkv-storage';

// 30분 (1800000ms) 타임아웃
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Storage keys
const KEYS = {
  LAST_ACTIVE_TIME: 'session_last_active_time',
  IS_SESSION_LOCKED: 'session_is_locked',
} as const;

export interface SessionState {
  isSessionLocked: boolean;
  lastActiveTime: number | null;
  timeRemaining: number | null;
}

type SessionCallback = (isLocked: boolean) => void;

class SessionManager {
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private callbacks: Set<SessionCallback> = new Set();
  private isInitialized = false;

  /**
   * 세션 매니저 초기화
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );

    this.isInitialized = true;
  }

  /**
   * 세션 매니저 정리
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.callbacks.clear();
    this.isInitialized = false;
  }

  /**
   * 세션 상태 변경 리스너 등록
   */
  addListener(callback: SessionCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * 앱 상태 변경 핸들러
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // 백그라운드로 전환 시 현재 시간 저장
      this.recordLastActiveTime();
    } else if (nextAppState === 'active') {
      // 포그라운드 복귀 시 세션 체크
      this.checkSessionTimeout();
    }
  }

  /**
   * 마지막 활성 시간 기록
   */
  recordLastActiveTime(): void {
    const now = Date.now();
    storage.set(KEYS.LAST_ACTIVE_TIME, now);
  }

  /**
   * 사용자 활동 시 타이머 리셋
   */
  resetSessionTimer(): void {
    storage.set(KEYS.LAST_ACTIVE_TIME, Date.now());
    storage.set(KEYS.IS_SESSION_LOCKED, false);
  }

  /**
   * 세션 타임아웃 체크
   */
  checkSessionTimeout(): boolean {
    const lastActiveTime = storage.getNumber(KEYS.LAST_ACTIVE_TIME);

    if (!lastActiveTime) {
      // 첫 실행 또는 데이터 없음 - 타임아웃 아님
      return false;
    }

    const now = Date.now();
    const elapsed = now - lastActiveTime;

    if (elapsed >= SESSION_TIMEOUT_MS) {
      // 세션 타임아웃 - 잠금 처리
      this.lockSession();
      return true;
    }

    return false;
  }

  /**
   * 세션 잠금
   */
  lockSession(): void {
    storage.set(KEYS.IS_SESSION_LOCKED, true);
    this.notifyListeners(true);
  }

  /**
   * 세션 잠금 해제
   */
  unlockSession(): void {
    storage.set(KEYS.IS_SESSION_LOCKED, false);
    storage.set(KEYS.LAST_ACTIVE_TIME, Date.now());
    this.notifyListeners(false);
  }

  /**
   * 세션 잠금 상태 확인
   */
  isSessionLocked(): boolean {
    return storage.getBoolean(KEYS.IS_SESSION_LOCKED) ?? false;
  }

  /**
   * 세션 상태 조회
   */
  getSessionState(): SessionState {
    const lastActiveTime = storage.getNumber(KEYS.LAST_ACTIVE_TIME) ?? null;
    const isSessionLocked = this.isSessionLocked();

    let timeRemaining: number | null = null;
    if (lastActiveTime && !isSessionLocked) {
      const elapsed = Date.now() - lastActiveTime;
      timeRemaining = Math.max(0, SESSION_TIMEOUT_MS - elapsed);
    }

    return {
      isSessionLocked,
      lastActiveTime,
      timeRemaining,
    };
  }

  /**
   * 세션 데이터 초기화
   */
  clearSessionData(): void {
    storage.remove(KEYS.LAST_ACTIVE_TIME);
    storage.remove(KEYS.IS_SESSION_LOCKED);
  }

  /**
   * 리스너들에게 상태 변경 알림
   */
  private notifyListeners(isLocked: boolean): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(isLocked);
      } catch {
        // 콜백 에러 무시
      }
    });
  }
}

export const sessionManager = new SessionManager();
