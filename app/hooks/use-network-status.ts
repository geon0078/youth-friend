/**
 * 네트워크 상태 감지 훅
 * 오프라인 모드 감지 및 상태 제공
 */
import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

/**
 * 네트워크 상태 정보
 */
export interface NetworkStatus {
  /** 네트워크 연결 여부 */
  isConnected: boolean;
  /** 인터넷 접근 가능 여부 (실제 인터넷 연결 확인) */
  isInternetReachable: boolean | null;
  /** 네트워크 타입 (wifi, cellular, etc.) */
  type: string | null;
  /** 상태 로딩 중 여부 */
  isLoading: boolean;
}

/**
 * 네트워크 상태 감지 훅
 * @returns NetworkStatus 객체
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, isInternetReachable } = useNetworkStatus();
 *
 *   if (!isConnected) {
 *     return <OfflineBanner />;
 *   }
 *
 *   return <OnlineContent />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // 낙관적 초기값
    isInternetReachable: null,
    type: null,
    isLoading: true,
  });

  useEffect(() => {
    let subscription: NetInfoSubscription | null = null;

    // 초기 상태 가져오기
    const fetchInitialState = async () => {
      try {
        const state = await NetInfo.fetch();
        setStatus({
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          isLoading: false,
        });
      } catch {
        // 에러 시 연결된 것으로 가정
        setStatus((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchInitialState();

    // 네트워크 상태 변경 구독
    subscription = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isLoading: false,
      });
    });

    return () => {
      subscription?.();
    };
  }, []);

  return status;
}

/**
 * 오프라인 여부만 반환하는 간단한 훅
 * @returns 오프라인 여부 (true = 오프라인)
 */
export function useIsOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  // isInternetReachable이 null이면 isConnected만 확인
  if (isInternetReachable === null) {
    return !isConnected;
  }

  // 둘 다 확인
  return !isConnected || !isInternetReachable;
}

/**
 * 네트워크 상태 수동 새로고침 훅
 * @returns 새로고침 함수와 로딩 상태
 */
export function useRefreshNetworkStatus(): {
  refresh: () => Promise<NetworkStatus>;
  isRefreshing: boolean;
} {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async (): Promise<NetworkStatus> => {
    setIsRefreshing(true);
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isLoading: false,
      };
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { refresh, isRefreshing };
}
